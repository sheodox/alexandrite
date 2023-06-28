import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE = (async ({ locals, params, request }) => {
	const body = await request.json();

	const res = await locals.client.deleteComment({
		auth: locals.jwt,
		comment_id: +params.commentId,
		deleted: body.deleted as boolean
	});

	return json({
		commentView: res.comment_view
	});
}) satisfies RequestHandler;
