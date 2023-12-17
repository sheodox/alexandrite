import { fail } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';

export const load = (async ({ params }) => {
	const { client } = get(profile);

	const { comments } = await client.getComments({
			parent_id: +params.commentId,
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
		postView: client.getPost({ id: postId }).then(({ post_view }) => post_view)
	};
}) satisfies PageLoad;
