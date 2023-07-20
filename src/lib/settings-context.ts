import { getContext, setContext } from 'svelte';
import type { Writable } from 'svelte/store';

export type NSFWImageHandling = 'HIDE' | 'SHOW' | 'BLUR';

export const NSFWHandlingOptions: { value: NSFWImageHandling; label: string; description: string }[] = [
	{
		value: 'HIDE',
		label: 'Hide',
		description: "NSFW thumbnails won't load unless clicked, and by default hides NSFW post contents."
	},
	{
		value: 'BLUR',
		label: 'Blur',
		description: 'Blur NSFW thumbnails and images unless hovered, and by default hides NSFW post contents.'
	},
	{ value: 'SHOW', label: 'Show', description: 'Always show NSFW images' }
];

export type FeedLayout = 'AUTO' | 'OVERLAY' | 'COLUMNS';

export const FeedLayoutOptions: { value: FeedLayout; label: string; description: string }[] = [
	{
		value: 'AUTO',
		label: 'Auto',
		description: 'Your feed layout is automatically chosen based on your screen size.'
	},
	{
		value: 'OVERLAY',
		label: 'Overlay',
		description: 'You can view posts in an overlay that shows over the feed. Good for narrow screens.'
	},
	{
		value: 'COLUMNS',
		label: 'Columns',
		description: 'View the feed and a post side by side. Lets you multitask.'
	}
];

export interface AlexandriteSettings {
	themeHue: number;
	nsfwImageHandling: NSFWImageHandling;
	sidebarVisible: boolean;
	navSidebarDocked: boolean;
	feedLayout: FeedLayout;
}

export const AlexandriteSettingsDefaults: AlexandriteSettings = {
	themeHue: 280,
	nsfwImageHandling: 'HIDE',
	sidebarVisible: true,
	navSidebarDocked: false,
	// todo check if this is a good breakpoint
	feedLayout: 'AUTO'
};

export type AlexandriteSettingsStores = {
	[K in keyof AlexandriteSettings]: Writable<AlexandriteSettings[K]>;
};

export const SETTINGS_CONTEXT_KEY = '__SX_SETTINGS_CONTEXT__';

export const getSettingsContext = () => {
	return getContext<AlexandriteSettingsStores>(SETTINGS_CONTEXT_KEY);
};

export const setSettingsContext = (ctx: AlexandriteSettingsStores) => {
	return setContext<AlexandriteSettingsStores>(SETTINGS_CONTEXT_KEY, ctx);
};
