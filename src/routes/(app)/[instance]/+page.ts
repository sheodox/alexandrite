import { get } from 'svelte/store';
import { profile } from '$lib/profiles/profiles';
import type { PageLoad } from './$types';

export const load = (async ({ url }) => {
	const { settings } = get(profile);
	return {
		query: {
			sort: url.searchParams.get('sort') ?? settings.default_sort_type,
			listing: url.searchParams.get('listing') ?? settings.default_listing_type,
			type: url.searchParams.get('type') ?? 'Posts'
		},
		pageBaseUrl: url.pathname + url.search
	};
}) satisfies PageLoad;
