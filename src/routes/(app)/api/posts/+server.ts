import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { PostView } from 'lemmy-js-client';

export interface ApiPostsRes {
	posts: PostView[];
}

export const GET = (async ({ url, locals }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const communityName = url.searchParams.get('communityName');

	console.log({ communityName });
	const posts = {
		posts: await locals.client
			.getPosts({
				auth: locals.jwt,
				limit: 20,
				page,
				community_name: communityName ?? undefined
			})
			.then(({ posts }) => posts)
	};

	return json(posts);
}) satisfies RequestHandler;
