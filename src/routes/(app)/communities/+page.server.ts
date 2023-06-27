import type { ListingType, SortType } from 'lemmy-js-client';
import type { PageServerLoad } from './$types';
import type { ApiCommunitiesRes } from '../api/communities/+server';

export const load = (async ({ url, fetch }) => {
	const selectedListing: ListingType = (url.searchParams.get('listing') as ListingType) || 'Local'; // default 'local';
	const selectedSort: SortType = (url.searchParams.get('sort') as SortType) || 'Hot'; // default 'Hot';

	const { communities, query }: ApiCommunitiesRes = await fetch(
		`/api/communities?page=1&listing=${selectedListing}&sort=${selectedSort}`
	).then((res) => res.json());

	return {
		query,
		communities
	};
}) satisfies PageServerLoad;
