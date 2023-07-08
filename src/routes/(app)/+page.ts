import { getLemmySettings } from '$lib/lemmy-settings';
import type { PageLoad } from './$types';

export const load = (async ({ url }) => {
	const ls = getLemmySettings();
	return {
		query: {
			sort: url.searchParams.get('sort') ?? ls?.default_sort_type ?? 'Hot',
			listing: url.searchParams.get('listing') ?? ls?.default_listing_type ?? 'Local',
			type: url.searchParams.get('type') ?? 'Posts'
		}
	};
}) satisfies PageLoad;
