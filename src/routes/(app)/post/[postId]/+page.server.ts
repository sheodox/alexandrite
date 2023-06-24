import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	if (!params.postId) {
		throw error(400, 'Missing Post ID');
	}
	return {
		postView: params.postId ? locals.client.getPost({ id: +params.postId }).then(({ post_view }) => post_view) : null
	};
}) satisfies PageServerLoad;
