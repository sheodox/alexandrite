import { fail } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getLemmyClient } from '$lib/lemmy-client';

export const load = (async ({ params }) => {
	const { client, jwt } = getLemmyClient();

	const { comments } = await client.getComments({
			parent_id: +params.commentId,
			auth: jwt,
			max_depth: 8,
			type_: 'All',
			sort: 'Hot'
		}),
		postId = comments.at(0)?.post.id;

	if (!comments || !postId) {
		throw fail(404);
	}

	return {
		commentViews: comments,
		commentId: +params.commentId,
		postView: client.getPost({ id: postId, auth: jwt }).then(({ post_view }) => post_view)
	};
}) satisfies PageLoad;
