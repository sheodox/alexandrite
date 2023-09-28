import { getContext, setContext } from 'svelte';
import type { GetSiteResponse } from 'lemmy-js-client';
import type { Writable } from 'svelte/store';
import type { Readable } from 'svelte/motion';

export const APP_CONTEXT_KEY = '__SX_APP_CONTEXT__';

export interface AppContext {
	// the logged in user's ID
	userId: Readable<number | null>;
	ctrlBasedHotkeys: boolean;
	siteMeta: Writable<GetSiteResponse>;
	unreadCount: Writable<number>;
	navSidebarOpen: Writable<boolean>;
	unreadReportCount: Writable<number>;
	checkUnread: () => Promise<void>;
	checkUnreadReports: () => Promise<void>;
	screenDimensions: Readable<{ height: number; width: number }>;
}

export function getCtrlBasedHotkeys() {
	return !navigator.userAgent.toLowerCase().includes('macintosh');
}

export const getAppContext = () => {
	return getContext<AppContext>(APP_CONTEXT_KEY);
};

export const setAppContext = (ctx: AppContext) => {
	return setContext<AppContext>(APP_CONTEXT_KEY, ctx);
};
