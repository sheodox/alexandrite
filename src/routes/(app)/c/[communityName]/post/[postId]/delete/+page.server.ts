import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	if (!params.postId) {
		throw error(400, 'Missing Post ID');
	}

	const postView = locals.client.getPost({ id: +params.postId, auth: locals.jwt }).then(({ post_view }) => post_view);

	// TODO redirect if it's not your post

	return {
		postView
	};
}) satisfies PageServerLoad;

export const actions = {
	deletePost: async ({ locals, params }) => {
		await locals.client.deletePost({
			auth: locals.jwt,
			post_id: Number(params.postId),
			// todo support un-deleting? comments can be undeleted, but
			// it seems you can't view a deleted post so not sure how you'd undelete a post
			deleted: true
		});

		throw redirect(303, `/c/${params.communityName}`);
	}
} satisfies Actions;
