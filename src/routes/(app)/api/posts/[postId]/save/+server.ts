import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST = (async ({ locals, params, request }) => {
	const body = await request.json();

	const postView = await locals.client
		.savePost({
			post_id: +params.postId,
			auth: locals.jwt,
			save: body.save
		})
		.then(({ post_view }) => post_view);

	return json({
		postView
	});
}) satisfies RequestHandler;
