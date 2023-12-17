import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	const { client } = get(profile);

	const res = await client.getPost({ id: +params.postId });

	return {
		postView: res.post_view,
		crossPosts: res.cross_posts
	};
}) satisfies PageLoad;
