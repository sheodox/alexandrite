import type { Writable } from 'svelte/store';
import { getContext } from 'svelte';

// please don't use this directly, use `getVirtualFeedBuffer`
export const _BUFFER_CONTEXT_KEY = '__VF_BUFFER__';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VirtualFeedBuffer = Writable<Record<string, any>>;

// VirtualFeed has a store in context for any temp data that needs to be
// restored when re-rendering things, so data isn't lost by scrolling,
// like reply text for a comment. keys should be unique enough there is no
// collision, use IDs and stuff in the keys.
export const getVirtualFeedBuffer = () => {
	return getContext<VirtualFeedBuffer>(_BUFFER_CONTEXT_KEY);
};

export interface VirtualFeedAPI {
	scrollToIndex: (index: number) => void;
}

export const getVirtualFeedScrollableElement = (el: HTMLElement) =>
	el.closest<HTMLElement>('.virtual-feed-scroll-container');
