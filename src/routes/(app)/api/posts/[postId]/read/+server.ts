import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST = (async ({ locals, params }) => {
	// there is a 'markPostAsRead' API, but it doesn't clear `unread_count`
	// (the number of unread comments). so instead we will get the post
	// which does both it seems. this would have already happened when
	// viewing a post directly, but on the overlay we already have the post
	const postView = await locals.client
		.getPost({ id: +params.postId, auth: locals.jwt })
		.then(({ post_view }) => post_view);

	return json({
		postView
	});
}) satisfies RequestHandler;
