import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load = (async ({ params, locals }) => {
	const community = params.communityName;

	const cv = await locals.client.getCommunity({
		name: community,
		auth: locals.jwt
	});

	return {
		communityName: params.communityName,
		communityView: cv.community_view
	};
}) satisfies PageServerLoad;

export const actions = {
	post: async ({ locals, request, params }) => {
		const body = Object.fromEntries(await request.formData()),
			title = body.title as string,
			honeypot = body.honeypot as string;

		if (honeypot) {
			return fail(400);
		}

		if (!title) {
			return fail(400, { errMsg: 'Missing title' });
		}

		// treat both Subscribed and Pending as the same
		const postRes = await locals.client.createPost({
			auth: locals.jwt,
			// tricks bots by submitting an empty string, just doing what lemmy-ui is doing
			honeypot,
			community_id: Number(body.communityId),
			name: title,
			body: body.content as string,
			url: (body.url as string) ? (body.url as string) : undefined,
			nsfw: body.nsfw === 'on',
			language_id: body.languageId ? Number(body.languageId) : undefined
		});

		throw redirect(303, `/post/${postRes.post_view.post.id}`);
	}
} satisfies Actions;
