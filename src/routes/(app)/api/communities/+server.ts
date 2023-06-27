import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CommunityView, ListingType, SortType } from 'lemmy-js-client';

export interface ApiCommunitiesRes {
	communities: CommunityView[];
	query: {
		listing: string;
		sort: string;
	};
}

export const GET = (async ({ url, locals }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const selectedListing: ListingType = (url.searchParams.get('listing') as ListingType) || 'Local'; // default 'local';
	const selectedSort: SortType = (url.searchParams.get('sort') as SortType) || 'Hot'; // default 'Hot';

	const query = {
		listing: selectedListing,
		sort: selectedSort
	};

	const { communities } = await locals.client.listCommunities({
		auth: locals.jwt,
		page,
		limit: 50,
		type_: selectedListing,
		sort: selectedSort
	});

	return json({
		query,
		communities
	});
}) satisfies RequestHandler;
