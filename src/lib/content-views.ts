import { writable, type Writable } from 'svelte/store';
import type {
	AdminPurgeCommentView,
	AdminPurgeCommunityView,
	AdminPurgePersonView,
	AdminPurgePostView,
	Comment,
	CommentReplyView,
	CommentReportView,
	CommentView,
	Community,
	CommunityView,
	GetModlogResponse,
	ModAddCommunityView,
	ModAddView,
	ModBanFromCommunityView,
	ModBanView,
	ModFeaturePostView,
	ModHideCommunityView,
	ModLockPostView,
	ModRemoveCommentView,
	ModRemoveCommunityView,
	ModRemovePostView,
	ModTransferCommunityView,
	Person,
	PersonMentionView,
	PersonView,
	Post,
	PostReportView,
	PostView,
	PrivateMessageView
} from 'lemmy-js-client';
import { getContext } from 'svelte';
import { profile } from './profiles/profiles';
import { nameAtInstance } from './nav-utils';

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

export type ContentViewModlog =
	| ContentViewModRemovePost
	| ContentViewModLockPost
	| ContentViewModFeaturePost
	| ContentViewModRemoveComment
	| ContentViewModRemoveCommunity
	| ContentViewModBanFromCommunity
	| ContentViewModBan
	| ContentViewModAddCommunity
	| ContentViewModTransferCommunity
	| ContentViewModAdd
	| ContentViewAdminPurgePerson
	| ContentViewAdminPurgeCommunity
	| ContentViewAdminPurgePost
	| ContentViewAdminPurgeComment
	| ContentViewModHideCommunity;

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

export const modlogToContentView = (modlogs: GetModlogResponse): ContentViewModlog[] => {
	return [
		modlogs.removed_posts.map(modRemovePostViewToContentView),
		modlogs.locked_posts.map(modLockPostViewToContentView),
		modlogs.featured_posts.map(modFeaturePostViewToContentView),
		modlogs.removed_comments.map(modRemoveCommentViewToContentView),
		modlogs.removed_communities.map(modRemovedCommunitiesViewToContentView),
		modlogs.banned_from_community.map(modBannedFromCommunityViewToContentView),
		modlogs.banned.map(modBanViewToContentView),
		modlogs.added_to_community.map(modAddCommunityViewToContentView),
		modlogs.transferred_to_community.map(modTransferCommunityViewToContentView),
		modlogs.added.map(modAddViewToContentView),
		modlogs.admin_purged_persons.map(adminPurgePersonViewToContentView),
		modlogs.admin_purged_communities.map(adminPurgeCommunityViewToContentView),
		modlogs.admin_purged_posts.map(adminPurgePostViewToContentView),
		modlogs.admin_purged_comments.map(adminPurgeCommentViewToContentView),
		modlogs.hidden_communities.map(modHideCommunityViewToContentView)
	]
		.flat()
		.sort((a, b) => b.when.localeCompare(a.when));
};

interface ModerationTarget {
	icon?: string;
	text: string;
	href?: string;
}

interface ModLogContentView {
	id: number;
	moderator?: Person;
	target: ModerationTarget;
	when: string;
	reason?: string;
	expires?: string;
	removed?: boolean;
	locked?: boolean;
	featured?: boolean;
	featureType?: 'community' | 'instance';
	bannedInstance?: boolean;
	bannedCommunity?: boolean;
	community?: Community;
}

interface ContentViewModRemovePost extends ModLogContentView {
	type: 'mod-remove-post';
	view: ModRemovePostView;
}
interface ContentViewModLockPost extends ModLogContentView {
	type: 'mod-lock-post';
	view: ModLockPostView;
}
interface ContentViewModFeaturePost extends ModLogContentView {
	type: 'mod-feature-post';
	view: ModFeaturePostView;
}
interface ContentViewModRemoveComment extends ModLogContentView {
	type: 'mod-remove-comment';
	view: ModRemoveCommentView;
}
interface ContentViewModRemoveCommunity extends ModLogContentView {
	type: 'mod-remove-community';
	view: ModRemoveCommunityView;
}
interface ContentViewModBanFromCommunity extends ModLogContentView {
	type: 'mod-ban-community';
	view: ModBanFromCommunityView;
}
interface ContentViewModBan extends ModLogContentView {
	type: 'mod-ban';
	view: ModBanView;
}
interface ContentViewModAddCommunity extends ModLogContentView {
	type: 'mod-add-community';
	view: ModAddCommunityView;
}
interface ContentViewModTransferCommunity extends ModLogContentView {
	type: 'mod-transfer-community';
	view: ModTransferCommunityView;
}
interface ContentViewModAdd extends ModLogContentView {
	type: 'mod-add';
	view: ModAddView;
}
interface ContentViewAdminPurgePerson extends ModLogContentView {
	type: 'admin-purge-person';
	view: AdminPurgePersonView;
}
interface ContentViewAdminPurgeCommunity extends ModLogContentView {
	type: 'admin-purge-community';
	view: AdminPurgeCommunityView;
}
interface ContentViewAdminPurgePost extends ModLogContentView {
	type: 'admin-purge-post';
	view: AdminPurgePostView;
}
interface ContentViewAdminPurgeComment extends ModLogContentView {
	type: 'admin-purge-comment';
	view: AdminPurgeCommentView;
}
interface ContentViewModHideCommunity extends ModLogContentView {
	type: 'admin-mod-hide-community';
	view: ModHideCommunityView;
}

let inst = '';
profile.subscribe((prof) => {
	inst = prof.instance;
});

function makePostTarget(post: Post) {
	return {
		icon: 'file',
		text: 'Post: ' + post.name,
		href: `/${inst}/post/${post.id}`
	};
}

export function modRemovePostViewToContentView(view: ModRemovePostView): ContentViewModRemovePost {
	return {
		type: 'mod-remove-post',
		id: view.mod_remove_post.id,
		view,
		moderator: view.moderator,
		when: view.mod_remove_post.when_,
		reason: view.mod_remove_post.reason,
		removed: view.mod_remove_post.removed,
		target: makePostTarget(view.post),
		community: view.community
	};
}
export function modLockPostViewToContentView(view: ModLockPostView): ContentViewModLockPost {
	return {
		type: 'mod-lock-post',
		id: view.mod_lock_post.id,
		view,
		moderator: view.moderator,
		locked: view.mod_lock_post.locked,
		when: view.mod_lock_post.when_,
		target: makePostTarget(view.post),
		community: view.community
	};
}
export function modFeaturePostViewToContentView(view: ModFeaturePostView): ContentViewModFeaturePost {
	return {
		type: 'mod-feature-post',
		id: view.mod_feature_post.id,
		view,
		featureType: view.mod_feature_post.is_featured_community ? 'community' : 'instance',
		moderator: view.moderator,
		when: view.mod_feature_post.when_,
		featured: view.mod_feature_post.featured,
		target: makePostTarget(view.post),
		community: view.community
	};
}

function makeCommentTarget(comment: Comment) {
	return {
		icon: 'comments',
		text: 'Comment: ' + comment.content,
		href: `/${inst}/comment/${comment.id}`
	};
}
export function modRemoveCommentViewToContentView(view: ModRemoveCommentView): ContentViewModRemoveComment {
	return {
		type: 'mod-remove-comment',
		id: view.mod_remove_comment.id,
		view,
		moderator: view.moderator,
		when: view.mod_remove_comment.when_,
		removed: view.mod_remove_comment.removed,
		reason: view.mod_remove_comment.reason,
		target: makeCommentTarget(view.comment),
		community: view.community
	};
}

function makeCommunityTarget(community: Community) {
	return {
		icon: 'users',
		text: '/c/' + (community.title || community.name),
		href: `/${inst}/c/${nameAtInstance(community)}`
	};
}
export function modRemovedCommunitiesViewToContentView(view: ModRemoveCommunityView): ContentViewModRemoveCommunity {
	return {
		type: 'mod-remove-community',
		id: view.mod_remove_community.id,
		view,
		moderator: view.moderator,
		when: view.mod_remove_community.when_,
		removed: view.mod_remove_community.removed,
		reason: view.mod_remove_community.reason,
		target: makeCommunityTarget(view.community),
		community: view.community
	};
}

function makePersonTarget(person: Person) {
	return {
		icon: 'user',
		text: '/u/' + (person.display_name || person.name),
		href: `/${inst}/u/${nameAtInstance(person)}`
	};
}

export function modBannedFromCommunityViewToContentView(view: ModBanFromCommunityView): ContentViewModBanFromCommunity {
	return {
		type: 'mod-ban-community',
		id: view.mod_ban_from_community.id,
		view,
		moderator: view.moderator,
		when: view.mod_ban_from_community.when_,
		reason: view.mod_ban_from_community.reason,
		expires: view.mod_ban_from_community.expires,
		bannedCommunity: view.mod_ban_from_community.banned,
		target: makePersonTarget(view.banned_person),
		community: view.community
	};
}
export function modBanViewToContentView(view: ModBanView): ContentViewModBan {
	return {
		type: 'mod-ban',
		id: view.mod_ban.id,
		view,
		moderator: view.moderator,
		when: view.mod_ban.when_,
		reason: view.mod_ban.reason,
		bannedInstance: view.mod_ban.banned,
		target: makePersonTarget(view.banned_person)
	};
}
export function modAddCommunityViewToContentView(view: ModAddCommunityView): ContentViewModAddCommunity {
	return {
		type: 'mod-add-community',
		id: view.mod_add_community.id,
		view,
		moderator: view.moderator,
		when: view.mod_add_community.when_,
		removed: view.mod_add_community.removed,
		target: makePersonTarget(view.modded_person),
		community: view.community
	};
}
export function modTransferCommunityViewToContentView(view: ModTransferCommunityView): ContentViewModTransferCommunity {
	return {
		type: 'mod-transfer-community',
		id: view.mod_transfer_community.id,
		view,
		moderator: view.moderator,
		when: view.mod_transfer_community.when_,
		target: makePersonTarget(view.modded_person),
		community: view.community
	};
}
export function modAddViewToContentView(view: ModAddView): ContentViewModAdd {
	return {
		type: 'mod-add',
		id: view.mod_add.id,
		view,
		moderator: view.moderator,
		when: view.mod_add.when_,
		removed: view.mod_add.removed,
		target: makePersonTarget(view.modded_person)
	};
}
export function adminPurgePersonViewToContentView(view: AdminPurgePersonView): ContentViewAdminPurgePerson {
	return {
		type: 'admin-purge-person',
		id: view.admin_purge_person.id,
		view,
		moderator: view.admin,
		when: view.admin_purge_person.when_,
		reason: view.admin_purge_person.reason,
		target: {
			text: 'Purged a user'
		}
	};
}
export function adminPurgeCommunityViewToContentView(view: AdminPurgeCommunityView): ContentViewAdminPurgeCommunity {
	return {
		type: 'admin-purge-community',
		id: view.admin_purge_community.id,
		view,
		moderator: view.admin,
		when: view.admin_purge_community.when_,
		reason: view.admin_purge_community.reason,
		target: {
			text: 'Purged a community'
		}
	};
}
export function adminPurgePostViewToContentView(view: AdminPurgePostView): ContentViewAdminPurgePost {
	return {
		type: 'admin-purge-post',
		id: view.admin_purge_post.id,
		view,
		moderator: view.admin,
		when: view.admin_purge_post.when_,
		reason: view.admin_purge_post.reason,
		target: {
			text: 'Purged a post'
		},
		community: view.community
	};
}
export function adminPurgeCommentViewToContentView(view: AdminPurgeCommentView): ContentViewAdminPurgeComment {
	return {
		type: 'admin-purge-comment',
		id: view.admin_purge_comment.id,
		view,
		moderator: view.admin,
		when: view.admin_purge_comment.when_,
		reason: view.admin_purge_comment.reason,
		target: {
			text: 'Purged a comment'
		}
	};
}
export function modHideCommunityViewToContentView(view: ModHideCommunityView): ContentViewModHideCommunity {
	return {
		type: 'admin-mod-hide-community',
		id: view.mod_hide_community.id,
		view,
		moderator: view.admin,
		when: view.mod_hide_community.when_,
		reason: view.mod_hide_community.reason,
		removed: view.mod_hide_community.hidden,
		target: makeCommunityTarget(view.community),
		community: view.community
	};
}
