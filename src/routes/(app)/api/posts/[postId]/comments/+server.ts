import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CommentSortType, PostView } from 'lemmy-js-client';

export interface ApiPostsRes {
	posts: PostView[];
}

export const GET = (async ({ url, params, locals }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const parentId = Number(url.searchParams.get('parentId')) ?? undefined;
	const sort = (url.searchParams.get('sort') as CommentSortType) ?? 'Hot';

	const { comments } = await locals.client.getComments({
		auth: locals.jwt,
		post_id: +params.postId,
		limit: 100,
		page,
		parent_id: parentId,
		max_depth: 3,
		sort
	});

	return json({ comments });
}) satisfies RequestHandler;
