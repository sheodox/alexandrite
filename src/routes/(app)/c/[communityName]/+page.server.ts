import type { PageServerLoad } from './$types';
import type { ApiPostsRes } from '../../api/posts/+server';

export const load = (async ({ fetch, params, url, locals }) => {
	const community = params.communityName;

	const { posts }: ApiPostsRes = await fetch(`/api/posts?page=1&communityName=${community}`).then((res) => res.json());
	return {
		posts,
		communityName: params.communityName,
		communityView: locals.client
			.getCommunity({
				name: community
			})
			.then(({ community_view }) => community_view)
	};
}) satisfies PageServerLoad;
