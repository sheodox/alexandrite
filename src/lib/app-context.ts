import { getContext, setContext } from 'svelte';
import type { GetSiteResponse } from 'lemmy-js-client';

export const APP_CONTEXT_KEY = '__SX_APP_CONTEXT__';

export interface AppContext {
	username: string;
	instance: string;
	instanceUrl: string;
	loggedIn: boolean;
	siteMeta: GetSiteResponse;
}

export const getAppContext = () => {
	return getContext<AppContext>(APP_CONTEXT_KEY);
};

export const setAppContext = (ctx: AppContext) => {
	return setContext<AppContext>(APP_CONTEXT_KEY, ctx);
};
