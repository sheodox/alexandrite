import { writable, type Writable } from 'svelte/store';
import type {
	CommentReplyView,
	CommentReportView,
	CommentView,
	CommunityView,
	PersonMentionView,
	PersonView,
	PostReportView,
	PostView,
	PrivateMessageView
} from 'lemmy-js-client';
import { getContext } from 'svelte';

/*
 * ContentViewProvider should be used to store and manage data shown in a feed.
 * It makes it easier to update data when something happens from a very nested
 * component. It should be the parent of VirtualFeed.
 *
 * Most Lemmy API calls will return the updated View that it mutatated,
 * for example voting on a comment will return an updated CommentView with your
 * votes, and blocking a community will return the update CommunityView.
 *
 * Without ContentViewProvider and the store it saves in context you'd need to have
 * an event like `on:update-post-view` that'd send the updated view up the tree,
 * making sure every intermediate component passes that along until it gets to
 * the +page.svelte the data comes from, then each +page.svelte needs to handle
 * every kind of content view update. It creates a lot of duplicate code.
 */

export const __CONTENT_VIEW_CONTEXT_KEY__ = '__CONTENT_VIEW_CONTEXT__';
interface CV {
	id: number;
	score: number;
	published: string;
}
export interface ContentViewPost extends CV {
	type: 'post';
	view: PostView;
	communityId: number;
}
export interface ContentViewPostReport extends CV {
	type: 'post-report';
	view: PostReportView;
}

export interface ContentViewComment extends CV {
	type: 'comment';
	view: CommentView;
	communityId: number;
}

export interface ContentViewCommentReport extends CV {
	type: 'comment-report';
	view: CommentReportView;
}

export interface ContentViewCommunity extends CV {
	type: 'community';
	view: CommunityView;
}

export interface ContentViewPerson extends CV {
	type: 'person';
	view: PersonView;
}

export interface ContentViewMention extends CV {
	type: 'mention';
	view: PersonMentionView;
	read: boolean;
	communityId: number;
}

export interface ContentViewReply extends CV {
	type: 'reply';
	view: CommentReplyView;
	read: boolean;
	communityId: number;
}

export interface ContentViewMessage extends CV {
	type: 'message';
	view: PrivateMessageView;
	read: boolean;
}

export type ContentView =
	| ContentViewPost
	| ContentViewPostReport
	| ContentViewComment
	| ContentViewCommentReport
	| ContentViewCommunity
	| ContentViewPerson
	| ContentViewMention
	| ContentViewReply
	| ContentViewMessage;

export type ContentViewType = ContentView['type'];

export const postViewToContentView = (view: PostView): ContentViewPost => {
	return {
		type: 'post',
		view,
		id: view.post.id,
		score: view.counts.score,
		published: view.post.published,
		communityId: view.community.id
	};
};

export const postReportViewToContentView = (view: PostReportView): ContentViewPostReport => {
	return {
		type: 'post-report',
		view,
		id: view.post_report.id,
		score: view.counts.score,
		published: view.post.published
	};
};

export const commentViewToContentView = (view: CommentView): ContentViewComment => {
	return {
		type: 'comment',
		view,
		id: view.comment.id,
		score: view.counts.score,
		published: view.comment.published,
		communityId: view.community.id
	};
};

export const commentReportViewToContentView = (view: CommentReportView): ContentViewCommentReport => {
	return {
		type: 'comment-report',
		view,
		id: view.comment_report.id,
		score: view.counts.score,
		published: view.comment.published
	};
};

export const communityViewToContentView = (view: CommunityView): ContentViewCommunity => {
	return {
		type: 'community',
		view,
		id: view.community.id,
		score: 0,
		published: view.community.published
	};
};

export const personViewToContentView = (view: PersonView): ContentViewPerson => {
	return {
		type: 'person',
		view,
		id: view.person.id,
		score: 0,
		published: view.person.published
	};
};

export const mentionViewToContentView = (view: PersonMentionView): ContentViewMention => {
	return {
		type: 'mention',
		view,
		id: view.person_mention.id,
		score: 0,
		published: view.person_mention.published,
		communityId: view.community.id,
		read: view.person_mention.read
	};
};

export const replyViewToContentView = (view: CommentReplyView): ContentViewReply => {
	return {
		type: 'reply',
		view,
		id: view.comment_reply.id,
		score: 0,
		published: view.comment_reply.published,
		communityId: view.community.id,
		read: view.comment_reply.read
	};
};

export const messageViewToContentView = (view: PrivateMessageView): ContentViewMessage => {
	return {
		type: 'message',
		view,
		id: view.private_message.id,
		score: 0,
		published: view.private_message.published,
		read: view.private_message.read
	};
};

export interface ContentViewStore {
	subscribe: Writable<ContentView[]>['subscribe'];
	set: (views: ContentView[]) => void;
	clear: () => void;
	// remove a single item from the store
	remove: (id: number) => void;
	// used to add a new page of data to the end
	append: (views: ContentView[]) => void;
	// used to put some stuff at the top of the views (like when posting a comment on a post)
	prepend: (views: ContentView[]) => void;
	// whenever something happens to change a view, this lets you update it from a nested component
	updateView: (newView: ContentView) => void;
	updateViews: (updateFn: (views: ContentView[]) => ContentView[]) => void;
	blockCommunity: (communityId: number) => void;
}

export const createContentViewStore = (): ContentViewStore => {
	const store = writable<ContentView[]>([]);

	const blockCommunity = (communityId: number) => {
		// filter out anything from the blocked community
		store.update((views) =>
			views.filter((view) => (view.type !== 'post' && view.type !== 'comment') || view.communityId !== communityId)
		);
	};
	const updateView = (view: ContentView) => {
		store.update((views) => {
			return views.map((v) => {
				// replace the view!
				return v.type === view.type && v.id === view.id ? view : v;
			});
		});
	};
	const updateViews = (updateFn: (views: ContentView[]) => ContentView[]) => {
		store.update(updateFn);
	};
	const append = (views: ContentView[]) => {
		store.update((vs) => vs.concat(views));
	};
	const prepend = (views: ContentView[]) => {
		store.update((vs) => views.concat(vs));
	};
	const clear = () => store.set([]);
	const remove = (id: number) => {
		store.update((vs) => vs.filter((v) => v.id !== id));
	};

	return {
		subscribe: store.subscribe,
		set: store.set,
		clear,
		remove,
		append,
		prepend,
		updateView,
		updateViews,
		blockCommunity
	};
};

export const getContentViewStore = () => {
	const ctx = getContext<ContentViewStore>(__CONTENT_VIEW_CONTEXT_KEY__);

	if (!ctx) {
		throw new Error('Missing content view context!');
	}

	return ctx;
};
