import { get } from 'svelte/store';
import { profile } from '$lib/profiles/profiles';
import type { PageLoad } from './$types';
import type { ListingType, SortType } from 'lemmy-js-client';

export const load = (async ({ url }) => {
	const { settings } = get(profile);
	const selectedListing: ListingType =
		(url.searchParams.get('listing') as ListingType) || settings.default_listing_type;
	const selectedSort: SortType = (url.searchParams.get('sort') as SortType) || settings.default_sort_type;

	return {
		query: {
			listing: selectedListing,
			sort: selectedSort
		}
	};
}) satisfies PageLoad;
