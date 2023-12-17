import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { profile } from '$lib/profiles/profiles';

export const load = (async ({ url }) => {
	const { client, settings } = get(profile);

	const searchArgs = {
		q: url.searchParams.get('q') ?? '',
		page: url.searchParams.get('page') || 1,
		sort: url.searchParams.get('sort') || 'TopAll',
		type: url.searchParams.get('type') || 'All',
		listing: url.searchParams.get('listing') || settings.default_listing_type,
		community: url.searchParams.get('community'),
		creator: url.searchParams.get('creator')
	};

	return {
		query: searchArgs,
		communityView: searchArgs.community
			? client
					.getCommunity({
						name: searchArgs.community
					})
					.then(({ community_view }) => community_view)
			: null,
		personView: searchArgs.creator
			? client
					.getPersonDetails({
						person_id: Number(searchArgs.creator)
					})
					.then(({ person_view }) => person_view)
			: null
	};
}) satisfies PageLoad;
