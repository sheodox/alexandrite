import type { PageLoad } from './$types';
import { getLemmyClient } from '$lib/lemmy-client';
import { getLemmySettings } from '$lib/lemmy-settings';

export const load = (async ({ url }) => {
	const { client, jwt } = getLemmyClient();
	const ls = getLemmySettings();

	const searchArgs = {
		q: url.searchParams.get('q') ?? '',
		page: url.searchParams.get('page') || 1,
		sort: url.searchParams.get('sort') || 'TopAll',
		type: url.searchParams.get('type') || 'All',
		listing: url.searchParams.get('listing') || ls?.default_listing_type || 'Local',
		community: url.searchParams.get('community'),
		creator: url.searchParams.get('creator')
	};

	return {
		query: searchArgs,
		communityView: searchArgs.community
			? client
					.getCommunity({
						auth: jwt,
						name: searchArgs.community
					})
					.then(({ community_view }) => community_view)
			: null,
		personView: searchArgs.creator
			? client
					.getPersonDetails({
						auth: jwt,
						person_id: Number(searchArgs.creator)
					})
					.then(({ person_view }) => person_view)
			: null
	};
}) satisfies PageLoad;
