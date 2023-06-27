import type { PageServerLoad } from './$types';
import type { ApiPostsRes } from './api/posts/+server';

export const load = (async ({ fetch, url, locals }) => {
	const postId = url.searchParams.get('postId');
	const selectedType = url.searchParams.get('type') || '';
	const selectedListing = url.searchParams.get('listing') || '';
	const selectedSort = url.searchParams.get('sort') || '';

	const { posts, query }: ApiPostsRes = await fetch(
		`/api/posts?page=1&type=${selectedType}&listing=${selectedListing}&sort=${selectedSort}`
	).then((res) => res.json());

	return {
		posts,
		query,
		post: postId ? locals.client.getPost({ id: +postId, auth: locals.jwt }) : null
	};
}) satisfies PageServerLoad;
