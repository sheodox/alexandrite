import { parseISO } from 'date-fns';
import type { CommentView, PostView } from 'lemmy-js-client';

export type ContentView = ({ type: 'post'; postView: PostView } | { type: 'comment'; commentView: CommentView }) & {
	score: number;
	published: string;
};

interface MorePage<T, U> {
	items: T[];
	error: boolean;
	endOfFeed: boolean;
	response?: U;
}

export const postViewToContentView = (postView: PostView) => {
	return {
		type: 'post' as const,
		postView,
		score: postView.counts.score,
		published: postView.post.published
	};
};
export const commentViewToContentView = (commentView: CommentView) => {
	return {
		type: 'comment' as const,
		commentView,
		score: commentView.counts.score,
		published: commentView.comment.published
	};
};

export const getContentViews = (postViews: PostView[], commentViews: CommentView[], type?: string, sort?: string) => {
	const content = [...postViews.map(postViewToContentView), ...commentViews.map(commentViewToContentView)];

	// for the "Overview" type (on user pages), we need to sort things ourselves as we need
	// to merge in both types of content and show them in some reasonable order
	if (type === 'Overview' && sort) {
		content.sort((a, b) => {
			const aPublished = parseISO(a.published + 'Z').getTime(),
				bPublished = parseISO(b.published + 'Z').getTime();

			if (sort === 'New') {
				return bPublished - aPublished;
			} else if (sort === 'Old') {
				return aPublished - bPublished;
			} else {
				return b.score - a.score;
			}
		});
	}

	return content;
};

export async function* feedLoader<T = {}, U = {}>(
	resourceUrl: string,
	viewKey: string | false
): AsyncIterator<MorePage<T, U>, MorePage<T, U>> {
	const u = new URL(location.origin + resourceUrl);
	// assume the first page has already loaded with the page, and this is just used for additional pages.
	// only the comments under a post start with nothing loaded, it doesn't use this loader
	let pageNum = 2,
		endOfFeed = false;

	while (!endOfFeed) {
		u.searchParams.set('page', '' + pageNum++);

		const res = await fetch(u);

		if (!res.ok) {
			// decrement so retrying tries the same page, probably an
			// intermittent failure
			pageNum--;
			yield {
				error: true,
				items: [],
				endOfFeed
			};

			continue;
		}

		const resJson = await res.json(),
			items = viewKey ? resJson[viewKey] : [];

		if (items.length === 0) {
			endOfFeed = true;
		}

		yield {
			items,
			error: false,
			endOfFeed,
			response: resJson
		};
	}

	return {
		endOfFeed: true,
		items: [],
		error: false
	};
}

interface PostCommentFeedLoaderOpts {
	type: string;
	queryUrlBase: string;
	postViews: PostView[];
	commentViews: CommentView[];
}
interface PostCommentFeed {
	contentViews: ContentView[];
	error: boolean;
	endOfFeed: boolean;
}
export async function* postCommentFeedLoader(opts: PostCommentFeedLoaderOpts): AsyncGenerator<PostCommentFeed> {
	const u = new URL(location.origin + opts.queryUrlBase);
	u.searchParams.set('type', opts.type);
	const typeUrlBase = u.pathname + u.search;
	// filter out already loaded items so subsequent pages don't show duplicates of pages changed
	// since the last page load
	const loadedIds = new Set<number>();

	let postViews = [...opts.postViews],
		commentViews = [...opts.commentViews];

	const postLoader = feedLoader<PostView>(typeUrlBase, 'postViews'),
		commentLoader = feedLoader<CommentView>(typeUrlBase, 'commentViews');

	// store the first page of IDs for both types of content
	postViews.forEach((pv) => loadedIds.add(pv.post.id));
	commentViews.forEach((pv) => loadedIds.add(pv.comment.id));

	let endOfFeed = false;

	while (!endOfFeed) {
		if (opts.type === 'Posts') {
			const more = (await postLoader.next()).value,
				newItems = more.items.filter((p) => !loadedIds.has(p.post.id));
			endOfFeed = more.endOfFeed;

			newItems.forEach((pv) => loadedIds.add(pv.post.id));

			yield {
				contentViews: getContentViews(newItems, []),
				error: more.error,
				endOfFeed
			};
		} else {
			const more = (await commentLoader.next()).value,
				newItems = more.items.filter((p) => !loadedIds.has(p.comment.id));
			endOfFeed = more.endOfFeed;

			newItems.forEach((pv) => loadedIds.add(pv.post.id));

			yield {
				contentViews: getContentViews([], newItems),
				error: more.error,
				endOfFeed
			};
		}
	}

	return {
		postViews: [],
		commentViews: [],
		error: false,
		endOfFeed: true
	};
}

interface UserFeed {
	contentViews: ContentView[];
	postViews: PostView[];
	commentViews: CommentView[];
	error: boolean;
	endOfFeed: boolean;
}
export async function* userFeedLoader(opts: PostCommentFeedLoaderOpts & { sort: string }): AsyncGenerator<UserFeed> {
	const u = new URL(location.origin + opts.queryUrlBase);
	u.searchParams.set('type', opts.type);
	const typeUrlBase = u.pathname + u.search;
	// filter out already loaded items so subsequent pages don't show duplicates of pages changed
	// since the last page load
	const loadedIds = new Set<number>();

	let postViews = [...opts.postViews],
		commentViews = [...opts.commentViews];
	const userDataLoader = feedLoader<{}, { postViews: PostView[]; commentViews: CommentView[] }>(typeUrlBase, false);

	// store the first page of IDs for both types of content
	postViews.forEach((pv) => loadedIds.add(pv.post.id));
	commentViews.forEach((pv) => loadedIds.add(pv.comment.id));

	let endOfFeed = false;

	while (!endOfFeed) {
		const more = (await userDataLoader.next()).value,
			newPosts = more.response?.postViews.filter((p) => !loadedIds.has(p.post.id)),
			newComments = more.response?.commentViews.filter((p) => !loadedIds.has(p.comment.id));
		endOfFeed = more.endOfFeed;

		newPosts?.forEach((pv) => loadedIds.add(pv.post.id));
		newComments?.forEach((pv) => loadedIds.add(pv.comment.id));

		yield {
			contentViews: getContentViews(newPosts || [], newComments || [], opts.type, opts.sort),
			error: more.error,
			endOfFeed,
			postViews,
			commentViews
		};
	}

	return {
		contentViews: [],
		error: false,
		endOfFeed: true,
		postViews,
		commentViews
	};
}
