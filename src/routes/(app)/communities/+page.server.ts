import type { PageServerLoad } from './$types';
import type { ApiCommunitiesRes } from '../api/communities/+server';

export const load = (async ({ url, fetch }) => {
	const selectedListing = url.searchParams.get('listing') || '';
	const selectedSort = url.searchParams.get('sort') || '';

	const { communities, query }: ApiCommunitiesRes = await fetch(
		`/api/communities?page=1&listing=${selectedListing}&sort=${selectedSort}`
	).then((res) => res.json());

	return {
		query,
		communities
	};
}) satisfies PageServerLoad;
