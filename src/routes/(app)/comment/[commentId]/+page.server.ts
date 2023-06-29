import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ params, locals }) => {
	const { comments } = await locals.client.getComments({
			parent_id: +params.commentId,
			auth: locals.jwt,
			max_depth: 8
		}),
		postId = comments.at(0)?.post.id;

	if (!comments || !postId) {
		throw fail(404);
	}

	return {
		commentViews: comments,
		commentId: +params.commentId,
		postView: locals.client.getPost({ id: postId, auth: locals.jwt }).then(({ post_view }) => post_view)
	};
}) satisfies PageServerLoad;
