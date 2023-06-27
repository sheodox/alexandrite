import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST = (async ({ locals, request, params }) => {
	const body = await request.json();

	const postView = await locals.client
		.likePost({
			auth: locals.jwt,
			post_id: +params.postId,
			score: body.score
		})
		.then((r) => r.post_view);

	return json({
		postView
	});
}) satisfies RequestHandler;
