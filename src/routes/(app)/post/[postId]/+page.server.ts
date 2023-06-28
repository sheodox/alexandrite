import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ params, locals }) => {
	if (!params.postId) {
		throw error(400, 'Missing Post ID');
	}
	return {
		postView: params.postId
			? locals.client.getPost({ id: +params.postId, auth: locals.jwt }).then(({ post_view }) => post_view)
			: null
	};
}) satisfies PageServerLoad;

export const actions = {
	postComment: async ({ request, locals, params }) => {
		const body = Object.fromEntries(await request.formData()),
			parent_id = body.parentId ? Number(body.parentId) : undefined;

		if (locals.jwt) {
			const res = await locals.client.createComment({
				content: body.content as string,
				auth: locals.jwt,
				post_id: +params.postId,
				parent_id,
				language_id: body.languageId ? Number(body.languageId) : undefined
			});

			return {
				commentView: res.comment_view
			};
		}
	},
	editComment: async ({ request, locals }) => {
		const body = Object.fromEntries(await request.formData()),
			commentId = Number(body.commentId);

		if (locals.jwt) {
			const res = await locals.client.editComment({
				content: body.content as string,
				auth: locals.jwt,
				comment_id: commentId,
				language_id: body.languageId ? Number(body.languageId) : undefined
			});

			return {
				commentView: res.comment_view
			};
		}
	}
} satisfies Actions;
