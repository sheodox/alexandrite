import type { PageLoad } from './$types';
import type { ListingType, SortType } from 'lemmy-js-client';
import { getLemmySettings } from '$lib/lemmy-settings';

export const load = (async ({ url }) => {
	const ls = getLemmySettings();
	const selectedListing: ListingType =
		(url.searchParams.get('listing') as ListingType) || ls?.default_listing_type || 'Local'; // default 'local';
	const selectedSort: SortType = (url.searchParams.get('sort') as SortType) || ls?.default_sort_type || 'Hot'; // default 'Hot';

	return {
		query: {
			listing: selectedListing,
			sort: selectedSort
		}
	};
}) satisfies PageLoad;
