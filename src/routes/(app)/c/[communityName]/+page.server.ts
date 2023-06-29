import type { PageServerLoad } from './$types';
import { loadFeedData } from '$lib/feed-query';

export const load = (async ({ cookies, url, locals, params }) => {
	const cv = await locals.client.getCommunity({
		name: params.communityName,
		auth: locals.jwt
	});

	return {
		...(await loadFeedData({
			auth: locals.jwt,
			searchParams: url.searchParams,
			communityName: params.communityName,
			client: locals.client,
			cookies
		})),
		communityName: params.communityName,
		communityView: cv.community_view,
		moderators: cv.moderators
	};
}) satisfies PageServerLoad;
