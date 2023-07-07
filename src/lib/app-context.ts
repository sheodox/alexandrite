import { getContext, setContext } from 'svelte';
import type { GetSiteResponse } from 'lemmy-js-client';
import { writable, type Writable } from 'svelte/store';

export const APP_CONTEXT_KEY = '__SX_APP_CONTEXT__';

export const localStorageBackedStore = <T>(lsKey: string, defaultValue: T, schemaVersion = 0) => {
	if (!globalThis.localStorage) {
		return writable(defaultValue);
	}

	const key = `alexandrite-setting-${lsKey}-v${schemaVersion}`;
	let value = defaultValue;

	try {
		// @ts-expect-error - want this to throw if it's invalid!
		value = JSON.parse(localStorage.getItem(key));
	} catch (e) {
		/* ignore, use default */
	}

	const store = writable<T>(value);
	// whenever the value changes, write it to local storage
	// TODO listen to storage events and update from other tabs!
	store.subscribe((val) => {
		localStorage.setItem(key, JSON.stringify(val));
	});

	return store;
};

export interface AppContext {
	username: string;
	instance: string;
	instanceUrl: string;
	loggedIn: boolean;
	siteMeta: GetSiteResponse;
	unreadCount: Writable<number>;
	sidebarVisible: Writable<boolean>;
}

export const getAppContext = () => {
	return getContext<AppContext>(APP_CONTEXT_KEY);
};

export const setAppContext = (ctx: AppContext) => {
	return setContext<AppContext>(APP_CONTEXT_KEY, ctx);
};
