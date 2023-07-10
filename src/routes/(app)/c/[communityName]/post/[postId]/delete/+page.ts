import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getLemmyClient } from '$lib/lemmy-client';

export const load = (async ({ params }) => {
	const { client, jwt } = getLemmyClient();

	if (!params.postId) {
		throw error(400, 'Missing Post ID');
	}

	const postView = client.getPost({ id: +params.postId, auth: jwt }).then(({ post_view }) => post_view);

	// TODO redirect if it's not your post

	return {
		postView
	};
}) satisfies PageLoad;
