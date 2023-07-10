import type { PageLoad } from './$types';
import { getLemmySettings } from '$lib/lemmy-settings';
import { getLemmyClient } from '$lib/lemmy-client';

export const load = (async ({ url, params }) => {
	const { client, jwt } = getLemmyClient();
	const ls = getLemmySettings();
	const cv = await client.getCommunity({
		name: params.communityName,
		auth: jwt
	});

	return {
		query: {
			sort: url.searchParams.get('sort') ?? ls?.default_sort_type ?? 'Hot',
			// doesn't really matter for this, we're already somewhere, just make the downstream components happy
			listing: 'All',
			type: url.searchParams.get('type') ?? 'Posts'
		},
		communityName: params.communityName,
		communityView: cv.community_view,
		moderators: cv.moderators
	};
}) satisfies PageLoad;
