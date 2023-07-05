import type { CommentReplyView, CommentSortType, PersonMentionView, PrivateMessageView } from 'lemmy-js-client';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export interface ApiInboxRes {
	query: {
		type: string;
		listing: string;
		sort: string;
	};
	replies: CommentReplyView[];
	mentions: PersonMentionView[];
	messages: PrivateMessageView[];
}

export const GET = (async ({ locals, url }) => {
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

	const [replies, mentions, messages] = await Promise.all([
		isListing('Replies') ? locals.client.getReplies(form).then((c) => c.replies) : [],
		isListing('Mentions') ? locals.client.getPersonMentions(form).then((c) => c.mentions) : [],
		isListing('Messages') ? locals.client.getPrivateMessages(form).then((c) => c.private_messages) : []
	]);

	return json({
		query,
		replies,
		mentions,
		messages
	});
}) satisfies RequestHandler;
