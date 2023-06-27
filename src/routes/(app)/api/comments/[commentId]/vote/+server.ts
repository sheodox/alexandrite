import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST = (async ({ locals, request, params }) => {
	const body = await request.json();

	const commentView = await locals.client
		.likeComment({
			auth: locals.jwt,
			comment_id: +params.commentId,
			score: body.score
		})
		.then((r) => r.comment_view);

	return json({
		commentView
	});
}) satisfies RequestHandler;
