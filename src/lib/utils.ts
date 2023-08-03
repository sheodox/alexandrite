import { goto } from '$app/navigation';
import { readable, writable } from 'svelte/store';

// a wrapper for things in a MenuButton, used by ExtraActions.svelte
export interface ExtraAction {
	text: string;
	href?: string;
	icon: string;
	click?: () => unknown;
	variant?: 'regular' | 'solid';
	busy?: boolean;
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

export const localStorageBackedStore = <T>(lsKey: string, defaultValue: T, schemaVersion = 0, setAlways = false) => {
	const key = `alexandrite-setting-${lsKey}-v${schemaVersion}`;
	let value = defaultValue;

	try {
		const item = localStorage.getItem(key);
		if (item !== null) {
			value = JSON.parse(item);
		}
	} catch (e) {
		/* ignore, use default */
	}

	const store = writable<T>(value);
	// whenever the value changes, write it to local storage
	// TODO listen to storage events and update from other tabs!
	let initialized = setAlways;
	store.subscribe((val) => {
		// don't do it on the first subscribe callback, the value hasn't changed
		if (!initialized) {
			initialized = true;
			return;
		}
		try {
			localStorage.setItem(key, JSON.stringify(val));
		} catch (e) {
			/* sveltekit tooling in dev throws on localStorage */
		}
	});

	return store;
};

export class Throttler {
	timeout: ReturnType<typeof setTimeout> | null = null;

	constructor(
		private callback: () => unknown,
		private throttleMS: number = 200
	) {}

	run() {
		if (this.timeout) {
			return;
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
