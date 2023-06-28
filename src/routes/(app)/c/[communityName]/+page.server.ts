import type { PageServerLoad } from './$types';
import type { ApiPostsRes } from '../../api/posts/+server';
import type { Actions } from './$types';

export const load = (async ({ fetch, params, url, locals }) => {
	const community = params.communityName;
	const selectedType = url.searchParams.get('type') || '';
	const selectedListing = url.searchParams.get('listing') || '';
	const selectedSort = url.searchParams.get('sort') || '';

	const { posts, query }: ApiPostsRes = await fetch(
		`/api/posts?page=1&communityName=${community}&type=${selectedType}&listing=${selectedListing}&sort=${selectedSort}`
	).then((res) => res.json());

	const cv = await locals.client.getCommunity({
		name: community,
		auth: locals.jwt
	});

	return {
		posts,
		query,
		communityName: params.communityName,
		communityView: cv.community_view,
		moderators: cv.moderators
	};
}) satisfies PageServerLoad;

export const actions = {
	subscription: async ({ locals, request, params }) => {
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
