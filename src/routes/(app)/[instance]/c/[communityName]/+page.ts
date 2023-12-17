import type { PageLoad } from './$types';
import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';

export const load = (async ({ url, params }) => {
	const { client, settings } = get(profile);
	const cv = await client.getCommunity({
		name: params.communityName
	});

	return {
		query: {
			sort: url.searchParams.get('sort') ?? settings.default_sort_type,
			// doesn't really matter for this, we're already somewhere, just make the downstream components happy
			listing: 'All',
			type: url.searchParams.get('type') ?? 'Posts'
		},
		communityName: params.communityName,
		communityRes: cv,
		pageBaseUrl: url.pathname + url.search
	};
}) satisfies PageLoad;
