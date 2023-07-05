import { endpoint } from '$lib/utils';
import type { ApiInboxRes } from '../api/inbox/+server';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ url, fetch }) => {
	const data: ApiInboxRes = await fetch(
		endpoint(`/api/inbox`, {
			// subsequent pages use this api endpoint, no need for page here
			page: 1,
			type: url.searchParams.get('type'),
			listing: url.searchParams.get('listing'),
			sort: url.searchParams.get('sort')
		})
	).then((res) => res.json());

	return data;
}) satisfies PageServerLoad;

export const actions = {
	markAllAsRead: async ({ locals }) => {
		await locals.client.markAllAsRead({
			auth: locals.jwt
		});
	},
	markRead: async ({ locals, request }) => {
		const body = Object.fromEntries(await request.formData()),
			id = Number(body.id),
			// reverse 'read', so this can mark read or unread based on current state
			read = body.read !== 'true';

		switch (body.type as string) {
			case 'reply':
				await locals.client.markCommentReplyAsRead({
					auth: locals.jwt,
					comment_reply_id: id,
					read
				});
				return;
			case 'mention':
				await locals.client.markPersonMentionAsRead({
					auth: locals.jwt,
					person_mention_id: id,
					read
				});
				return;
			case 'message':
				await locals.client.markPrivateMessageAsRead({
					auth: locals.jwt,
					private_message_id: id,
					read
				});
				return;
		}
	}
} satisfies Actions;
