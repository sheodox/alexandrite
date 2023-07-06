import type { PageServerLoad } from './$types';
import { endpoint } from '$lib/utils';
import type { ApiSearchRes } from '../api/search/+server';

export const load = (async ({ url, fetch, locals }) => {
	const searchArgs = {
			q: url.searchParams.get('q'),
			page: url.searchParams.get('page'),
			sort: url.searchParams.get('sort'),
			type: url.searchParams.get('type'),
			listing: url.searchParams.get('listing'),
			community: url.searchParams.get('community'),
			creator: url.searchParams.get('creator')
		},
		data: ApiSearchRes = await fetch(endpoint(`/api/search`, searchArgs)).then((res) => res.json());

	return {
		search: data,
		communityView: searchArgs.community
			? locals.client
					.getCommunity({
						auth: locals.jwt,
						name: searchArgs.community
					})
					.then(({ community_view }) => community_view)
			: null,
		personView: searchArgs.creator
			? locals.client
					.getPersonDetails({
						auth: locals.jwt,
						person_id: Number(searchArgs.creator)
					})
					.then(({ person_view }) => person_view)
			: null
	};
}) satisfies PageServerLoad;
