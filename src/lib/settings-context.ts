import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

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

export type PostPreviewLayout = 'LIST' | 'COMPACT' | 'CARD';

export const PostPreviewLayoutOptions: {
	value: PostPreviewLayout;
	label: string;
	description: string;
	icon: string;
}[] = [
	{
		value: 'LIST',
		label: 'List',
		description: 'Small thumbnails with all the posts in a list',
		icon: 'list'
	},
	{
		value: 'COMPACT',
		label: 'Compact',
		description: 'Like the list style, but more dense.',
		icon: 'compress'
	},
	{
		value: 'CARD',
		label: 'Cards',
		description: 'Large images and post text previews, get the gist without opening the post.',
		icon: 'rectangle-list'
	}
];

export interface AlexandriteSettings {
	//theme options
	colorScheme: 'light' | 'dark' | null;
	themeHue: number;
	linkHue: number;
	upvoteHue: number;
	downvoteHue: number;
	themeSaturation: number;
	//other options
	nsfwImageHandling: NSFWImageHandling;
	sidebarVisible: boolean;
	navSidebarDocked: boolean;
	loadImagesAsWebp: boolean;
	feedLayout: FeedLayout;
	postPreviewLayout: PostPreviewLayout;
	postListLayoutContentPreview: boolean;
}

const probablyMobile = window.innerWidth < 800;

export const AlexandriteSettingsDefaults: AlexandriteSettings = {
	// null uses the system default
	colorScheme: null,
	themeHue: 280,
	linkHue: 197,
	upvoteHue: 298,
	downvoteHue: 212,
	themeSaturation: 1,
	nsfwImageHandling: 'HIDE',
	sidebarVisible: !probablyMobile,
	navSidebarDocked: false,
	loadImagesAsWebp: true,
	// todo check if this is a good breakpoint
	feedLayout: 'AUTO',
	postPreviewLayout: probablyMobile ? 'CARD' : 'LIST',
	postListLayoutContentPreview: false
};

export type AlexandriteSettingsStores = {
	[K in keyof AlexandriteSettings]: Writable<AlexandriteSettings[K]>;
};

export const SETTINGS_CONTEXT_KEY = '__SX_SETTINGS_CONTEXT__';

// default settings, when used outside of a valid context, like on `/(meta)`
const defaultSettingsStore: AlexandriteSettingsStores = Object.entries(AlexandriteSettingsDefaults).reduce(
	(stores, v) => {
		const [key, val] = v;
		stores[key as keyof AlexandriteSettingsStores] = writable(val);
		return stores;
	},
	{} as AlexandriteSettingsStores
);

export const getSettingsContext = () => {
	return getContext<AlexandriteSettingsStores>(SETTINGS_CONTEXT_KEY) ?? defaultSettingsStore;
};

export const setSettingsContext = (ctx: AlexandriteSettingsStores) => {
	return setContext<AlexandriteSettingsStores>(SETTINGS_CONTEXT_KEY, ctx);
};
