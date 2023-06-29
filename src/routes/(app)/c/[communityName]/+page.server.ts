import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
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

export const actions = {
	subscription: async ({ locals, request }) => {
		const body = Object.fromEntries(await request.formData()),
			// if pending or subbed, follow must be false to unfollow
			follow = body.subscribed === 'NotSubscribed';

		// treat both Subscribed and Pending as the same
		await locals.client.followCommunity({
			auth: locals.jwt,
			follow,
			community_id: +body.communityId
		});
	}
} satisfies Actions;
