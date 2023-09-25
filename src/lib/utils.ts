import { goto } from '$app/navigation';
import { readable, writable, type Writable } from 'svelte/store';
import { getCtrlBasedHotkeys } from './app-context';
import { parseISO } from 'date-fns';

export function safeUrl(url: string | null) {
	if (!url) {
		return null;
	}
	try {
		return new URL(url);
	} catch (e) {
		return null;
	}
}

// a wrapper for things in a MenuButton, used by ExtraActions.svelte
export interface ExtraAction {
	text: string;
	href?: string;
	icon: string;
	click?: () => unknown;
	variant?: 'regular' | 'solid';
	// disable the button, switch icon to spinner
	busy?: boolean;
	// disable the button
	disabled?: boolean;
	// don't render the button at all
	hidden?: boolean;
}

export const localStorageSet = <T>(key: string, value?: T) => {
	if (typeof localStorage === 'undefined') {
		return;
	}
	if (value === undefined || value === null) {
		localStorage.removeItem(key);
	}
	localStorage.setItem(key, JSON.stringify(value));
};

export const localStorageGet = <T>(key: string, defaultValue: T) => {
	try {
		const val = localStorage?.getItem(key) ?? null;

		if (val === null) {
			return defaultValue;
		}

		return JSON.parse(val) as T;
	} catch (e) {
		return defaultValue;
	}
};

export const localStorageBackedStore = <T>(
	lsKey: string,
	defaultValue: T,
	opts?: { schemaVersion?: number; setAlways?: boolean }
): Writable<T> => {
	const schemaVersion = opts?.schemaVersion ?? 0;
	const setAlways = opts?.setAlways ?? false;

	const key = `alexandrite-setting-${lsKey}-v${schemaVersion}`;
	let value = defaultValue;

	try {
		const item = localStorage.getItem(key);
		if (item !== null) {
			value = JSON.parse(item);
		}
	} catch (e) {
		// ignore, use default, but if they want the value always set, set it.
		// this is used to set the default instance if one isn't set, so following
		// a link from a friend will keep you on that instance next time unless changed
		if (setAlways && defaultValue && typeof localStorage !== 'undefined') {
			localStorage.setItem(key, JSON.stringify(defaultValue));
		}
	}

	const store = writable<T>(value, (set) => {
		if (typeof window === 'undefined') {
			return;
		}

		// sync the store's value to changes on other tabs, this event is fired when
		// local/sessionStorage is changed in another browser tab. this lets us coordinate
		// things between tabs, so things like the unreadCount always match in other tabs
		function onStorage(e: StorageEvent) {
			if (e.storageArea === localStorage && e.key === key) {
				const newVal = localStorageGet<T>(key, defaultValue);

				set(newVal);
			}
		}

		window.addEventListener('storage', onStorage);

		return () => {
			window.removeEventListener('storage', onStorage);
		};
	});

	return {
		...store,
		// wrap 'set' so we can listen to changes without a subscriber
		set: (val) => {
			try {
				localStorage.setItem(key, JSON.stringify(val));
			} catch (e) {
				/* sveltekit tooling in dev throws on localStorage */
			}

			store.set(val);
		}
	};
};

export class Throttler {
	timeout: ReturnType<typeof setTimeout> | null = null;

	constructor(
		private callback: () => unknown,
		private throttleMS: number = 200,
		private debounce = false
	) {}

	run() {
		if (this.timeout && !this.debounce) {
			return;
		}

		// if debouncing instead of throttling we need to clear the timeout
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}

		this.timeout = setTimeout(() => {
			this.timeout = null;
			this.callback();
		}, this.throttleMS);
	}
}

// wrapper for doing things with forms/api methods
export type ActionFn = (body: Record<string, FormDataEntryValue>) => Promise<unknown>;

interface StatefulFormState {
	busy: boolean;
	error: boolean;
}
interface StatefulFormOptions {
	autoReset?: boolean;
}

export const createStatefulForm = (
	form: HTMLFormElement | undefined,
	actionFn: ActionFn,
	opts: StatefulFormOptions = {}
) => {
	let data: StatefulFormState = { busy: false, error: false };

	if (!form) {
		return readable(data);
	}

	return readable(data, (set) => {
		function update(partialData: Partial<StatefulFormState>) {
			return set((data = { ...data, ...partialData }));
		}

		async function submitFn(e: Event) {
			e.preventDefault();
			const formData = Object.fromEntries(new FormData(form));

			update({ busy: true, error: false });
			try {
				await actionFn(formData);
				update({ busy: false });
				if (opts.autoReset) {
					form?.reset();
				}
			} catch (e) {
				console.error(e);
				update({ busy: false, error: true });
			}
		}

		form.addEventListener('submit', submitFn);
		return () => {
			form.removeEventListener('submit', submitFn);
		};
	});
};

interface StatefulActionState<T> {
	busy: boolean;
	error: boolean;
	submit: (val: T) => Promise<unknown>;
}

export const createStatefulAction = <T>(submitFn: (val: T) => Promise<unknown>) => {
	let data: StatefulActionState<T> = { busy: false, error: false, submit: () => Promise.resolve() };

	function createSubmit(set: (p: Partial<StatefulActionState<T>>) => unknown) {
		return async function (val: T) {
			set({ busy: true, error: false });
			try {
				await submitFn(val);

				set({ busy: false });
			} catch (e) {
				set({ busy: false, error: true });
			}
		};
	}

	return readable(data, (set) => {
		function update(partialData: Partial<StatefulActionState<T>>) {
			return set((data = { ...data, ...partialData }));
		}

		update({
			submit: createSubmit(update)
		});
		return;
	});
};

// navigate to a new URL with query parameters based on form fields.
// this is just like having a form with a method="GET" but done whenever
// a field changes. this is used for instantly applying filters on feeds
export function navigateOnChange(el: HTMLFormElement) {
	// cache the base URL this page was on, we'll need it to change sorts
	// without going anywhere unexpected if the page URL was changed, like
	// when viewing a post in the overlay
	const basePath = location.pathname;

	function onChange() {
		const formData = new FormData(el);
		const query = [];

		for (const [name, value] of formData) {
			if (value) {
				query.push(`${name}=${encodeURIComponent(value as string)}`);
			}
		}

		goto(basePath + (query.length ? '?' + query.join('&') : ''));
	}

	el.addEventListener('change', onChange);

	return {
		destroy: () => el.removeEventListener('change', onChange)
	};
}

export function isInteractiveElementBetween(container: HTMLElement, eventTarget: HTMLElement) {
	// Check if there's an element matching a selector somewhere between
	// 'el' (our container) and the 'clicked' element. Necessary because
	// if you click on a 'span' within an 'a', we need ignore this event,
	// because it'll be handled by that 'a' (or button).
	function within(selector: string) {
		const closestEl = eventTarget.closest(selector);
		return closestEl && container.contains(closestEl);
	}

	// if they clicked something inside of an interactive element, let that
	// element handle it instead
	return within('button') || within('a');
}

// Turns the passed element into a "button", so any clicks/enter on the element that aren't otherwise
// handled by another element will trigget your onClick handler. This is used to make post cards clickable anywhere
export function weakOnClick(el: HTMLElement, opts: { onClick: () => unknown; enabled?: boolean }) {
	el.setAttribute('role', 'button');
	el.setAttribute('tabindex', '0');

	const enabled = opts.enabled ?? true;

	function callbackIfContained(target: HTMLElement) {
		if (!enabled || isInteractiveElementBetween(el, target)) {
			return;
		}

		opts.onClick();
	}

	function onContainerClick(e: MouseEvent) {
		callbackIfContained(e.target as HTMLElement);
	}

	function onContainerKeyDown(e: KeyboardEvent) {
		if (e.key !== 'Enter' || isElementEditable(e.target as HTMLElement)) {
			return;
		}
		callbackIfContained(e.target as HTMLElement);
	}

	el.addEventListener('click', onContainerClick);
	el.addEventListener('keydown', onContainerKeyDown);

	return {
		destroy: () => {
			el.removeEventListener('click', onContainerClick);
			el.removeEventListener('keydown', onContainerKeyDown);
		}
	};
}

// hotkeys without modifiers (like j/k for scrolling between things in a feed)
// need to not run their hotkey handlers if the element they're fired from
// is editable text, otherwise every time you type a `j` in a comment it'd
// try and scroll you to the next comment
export function isElementEditable(el: HTMLElement) {
	const nodeName = el.nodeName.toLowerCase();

	return ['input', 'textarea', 'select'].includes(nodeName);
}

export function submitOnHardEnter(formEl: HTMLFormElement) {
	// make a button that can trigger a proper form submit.
	// we need a button that would trigger submitting a form if
	// clicked, so formEl.requestSubmit works. and
	// formEL.submit() is unusable because it doesn't run handlers
	// and does an unwanted full page navigation
	const submitEl = document.createElement('button');
	submitEl.style.display = 'none';
	submitEl.classList.add('hard-enter-submit-button');

	formEl.appendChild(submitEl);
	function onKeydown(e: KeyboardEvent) {
		const ctrl = getCtrlBasedHotkeys() ? e.ctrlKey : e.metaKey;

		if (e.key === 'Enter' && ctrl) {
			formEl.requestSubmit(submitEl);
		}
	}

	formEl.addEventListener('keydown', onKeydown);
	return {
		destroy: () => {
			formEl.addEventListener('keydown', onKeydown);
		}
	};
}

// lemmy dates are missing the 'Z', but this will be fixed at some point,
// utility function to handle both cases
export function parseDate(isoStr: string) {
	if (!isoStr.includes('Z')) {
		isoStr += 'Z';
	}
	return parseISO(isoStr);
}

// all the different valid types of message that the message bus can handle
export enum CrossTabMessageTypes {
	Test = 'test',
	Test2 = 'test2'
}

interface CrossTabMessage {
	type: CrossTabMessageTypes;
	value: ReturnType<typeof JSON.parse>;
}

class CrossTabMessageBus {
	key = 'alexandrite-tab-message-bus';
	listeners = new Map<string, CrossTabMessage['value']>();
	destroyFns: (() => void)[] = [];

	constructor() {
		if (typeof window === 'undefined') {
			return;
		}

		const onStorage = (e: StorageEvent) => {
			if (e.storageArea === localStorage && e.key === this.key && e.newValue) {
				const msg: CrossTabMessage = JSON.parse(e.newValue);
				const listeners = this.listeners.get(msg.type) ?? [];

				for (const listener of listeners) {
					listener(msg.value);
				}
			}
		};
		window.addEventListener('storage', onStorage);

		this.destroyFns.push(() => window.removeEventListener('storage', onStorage));
	}
	on<T>(type: CrossTabMessageTypes, fn: (val: T) => unknown) {
		const listeners = this.listeners.get(type) ?? [];
		listeners.push(fn);
		this.listeners.set(type, listeners);
	}
	off<T>(type: CrossTabMessageTypes, fn: (val: T) => unknown) {
		const listeners = this.listeners.get(type) || [],
			index = listeners.indexOf(fn);

		if (index > -1) {
			index.splice(index, 1);
		}

		this.listeners.set(type, listeners);
	}
	emit(type: CrossTabMessageTypes, value: CrossTabMessage['value']) {
		if (typeof window === 'undefined') {
			return;
		}
		localStorage.setItem(this.key, JSON.stringify({ type, value }));
	}
	destroy() {
		for (const fn of this.destroyFns) {
			fn();
		}

		this.destroyFns = [];
	}
}

export const crossTabEventBus = new CrossTabMessageBus();

// crossTabEventBus.on(CrossTabMessageTypes.Test, (val) => {
// 	console.log(val);
// });
//
// for (let i = 0; i < 100; i++) {
// 	crossTabEventBus.emit(CrossTabMessageTypes.Test, 'hello!!! ' + i);
// }
