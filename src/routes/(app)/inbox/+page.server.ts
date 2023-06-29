import type { Actions, PageServerLoad } from './$types';
import type { CommentSortType } from 'lemmy-js-client';

export const load = (async ({ url, locals }) => {
	const query = {
		type: url.searchParams.get('type') || 'Unread',
		listing: url.searchParams.get('listing') || 'All',
		sort: url.searchParams.get('sort') || 'New'
	};

	const form = {
		auth: locals.jwt,
		sort: query.sort as CommentSortType,
		unread_only: query.type === 'Unread',
		page: Number(url.searchParams.get('page') || '1'),
		limit: 20
	};

	const isListing = (listing: string) => query.listing === listing || query.listing === 'All';

	return {
		query,
		replies: isListing('Replies') ? locals.client.getReplies(form).then((c) => c.replies) : [],
		mentions: isListing('Mentions') ? locals.client.getPersonMentions(form).then((c) => c.mentions) : [],
		messages: isListing('Messages') ? locals.client.getPrivateMessages(form).then((c) => c.private_messages) : []
	};
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
