import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST = (async ({ locals, request }) => {
	const body = Object.fromEntries(await request.formData()),
		// if pending or subbed, follow must be false to unfollow
		follow = body.subscribed === 'NotSubscribed';

	// treat both Subscribed and Pending as the same
	const res = await locals.client.followCommunity({
		auth: locals.jwt,
		follow,
		community_id: +body.communityId
	});

	return json({
		communityView: res.community_view
	});
}) satisfies RequestHandler;
