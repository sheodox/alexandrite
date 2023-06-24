import type { PageServerLoad } from './$types';
import type { ApiPostsRes } from './api/posts/+server';

export const load = (async ({ fetch, url, locals }) => {
	const postId = url.searchParams.get('postId');
	const { posts }: ApiPostsRes = await fetch('/api/posts?page=1').then((res) => res.json());
	return {
		posts,
		post: postId ? locals.client.getPost({ id: +postId }) : null
	};
}) satisfies PageServerLoad;
