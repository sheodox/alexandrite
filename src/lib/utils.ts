import { readable } from 'svelte/store';

export class Throttler {
	timeout: ReturnType<typeof setTimeout> | null = null;

	constructor(private callback: () => unknown, private throttleMS: number = 200) {}

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

export const endpoint = (pathname: string, queryParams: Record<string, string | number | null | undefined>) => {
	const url = pathname,
		query = [];

	// sort alphabetically for consistent ordering
	const params = Object.entries(queryParams).sort((a, b) => a[0].localeCompare(b[0]));

	for (const [name, value] of params) {
		if (value !== undefined && value !== null && value !== '') {
			query.push(`${name}=${encodeURIComponent(value)}`);
		}
	}
	return url + (query.length ? '?' + query.join('&') : '');
};

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
					form!.reset();
				}
			} catch (e) {
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
