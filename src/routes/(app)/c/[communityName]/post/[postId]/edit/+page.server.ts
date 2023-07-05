import { HttpError, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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

import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	editPost: async ({ locals, request, params }) => {
		const body = Object.fromEntries(await request.formData()),
			title = body.title as string,
			honeypot = body.honeypot as string;

		if (honeypot) {
			return fail(400);
		}

		if (!title) {
			return fail(400, { errMsg: 'Missing title' });
		}

		const formFields = {
			name: title,
			body: body.content as string,
			url: (body.url as string) ? (body.url as string) : undefined,
			nsfw: body.nsfw === 'on',
			language_id: body.languageId ? Number(body.languageId) : undefined
		};

		try {
			// treat both Subscribed and Pending as the same
			await locals.client.editPost({
				auth: locals.jwt,
				post_id: Number(params.postId),
				...formFields
			});
		} catch (e) {
			return fail(400, {
				errMsg: 'Error editing post:' + e,
				...formFields
			});
		}

		throw redirect(303, `/post/${params.postId}`);
	}
} satisfies Actions;
