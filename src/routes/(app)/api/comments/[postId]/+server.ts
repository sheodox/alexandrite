import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { PostView } from 'lemmy-js-client';

export interface ApiPostsRes {
	posts: PostView[];
}

export const GET = (async ({ params, locals }) => {
	const { comments } = await locals.client.getComments({
		auth: locals.jwt,
		post_id: +params.postId,
		max_depth: 100
	});

	return json({ comments });
}) satisfies RequestHandler;
