import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { PostView } from 'lemmy-js-client';

export interface ApiPostsRes {
	posts: PostView[];
}

export const GET = (async ({ url, locals }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const communityName = url.searchParams.get('communityName');
	const username = url.searchParams.get('username');

	// can't filter posts by username, have to get them from a different api
	if (username) {
		const posts = {
			posts: await locals.client
				.getPersonDetails({
					auth: locals.jwt,
					username: username,
					limit: 20,
					page
				})
				.then(({ posts }) => posts)
		};

		return json(posts);
	}

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
