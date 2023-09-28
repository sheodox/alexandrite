import type { CommentView, PostView } from 'lemmy-js-client';
import type { ApiFeedLoad } from './feed-query';
import { postViewToContentView, type ContentView, commentViewToContentView } from './content-views';
import { parseDate } from './utils';

interface MorePage<T> {
	error: boolean;
	endOfFeed: boolean;
	response?: T;
}
export const getContentViews = (postViews: PostView[], commentViews: CommentView[], type?: string, sort?: string) => {
	const content = [...postViews.map(postViewToContentView), ...commentViews.map(commentViewToContentView)];

	// for the "Overview" type (on user pages), we need to sort things ourselves as we need
	// to merge in both types of content and show them in some reasonable order
	if (type === 'Overview' && sort) {
		content.sort((a, b) => {
			const aPublished = parseDate(a.published).getTime(),
				bPublished = parseDate(b.published).getTime();

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

export async function* feedLoader<T>(
	queryFn: (pageNum: number) => Promise<T>,
	countResultsFn: (res: T) => number
): AsyncIterator<MorePage<T>, MorePage<T>> {
	let pageNum = 1,
		endOfFeed = false;

	while (!endOfFeed) {
		try {
			const res = await queryFn(pageNum++);

			// if `viewKey` is false, we need to ask the caller to count the results,
			// because we don't know what in the results they wanted
			if (countResultsFn(res) === 0) {
				endOfFeed = true;
			}

			yield {
				error: false,
				endOfFeed,
				response: res
			};
		} catch (e) {
			console.error('FeedLoader Error: ', e);

			// decrement so retrying tries the same page, probably an
			// intermittent failure
			pageNum--;
			yield {
				error: true,
				endOfFeed
			};

			continue;
		}
	}

	return {
		endOfFeed: true,
		error: false
	};
}

interface PostCommentFeedLoaderOpts {
	type: string;
	queryFn: (pageNumber: number) => Promise<ApiFeedLoad>;
}
interface PostCommentFeed {
	contentViews: ContentView[];
	error: boolean;
	endOfFeed: boolean;
}
export async function* postCommentFeedLoader(opts: PostCommentFeedLoaderOpts): AsyncGenerator<PostCommentFeed> {
	// filter out already loaded items so subsequent pages don't show duplicates of pages changed
	// since the last page load
	const loadedIds = new Set<number>();

	const postLoader = feedLoader<ApiFeedLoad>(opts.queryFn, (res) => res.postViews.length),
		commentLoader = feedLoader<ApiFeedLoad>(opts.queryFn, (res) => res.commentViews.length);

	let endOfFeed = false;

	while (!endOfFeed) {
		if (opts.type === 'Posts') {
			const more = (await postLoader.next()).value,
				newItems = more.response?.postViews.filter((p) => !loadedIds.has(p.post.id)) || [];
			endOfFeed = more.endOfFeed;

			newItems.forEach((pv) => loadedIds.add(pv.post.id));

			yield {
				contentViews: getContentViews(newItems, []),
				error: more.error,
				endOfFeed
			};
		} else {
			const more = (await commentLoader.next()).value,
				newItems = more.response?.commentViews.filter((p) => !loadedIds.has(p.comment.id)) || [];
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
	error: boolean;
	endOfFeed: boolean;
}
export async function* userFeedLoader(opts: PostCommentFeedLoaderOpts & { sort: string }): AsyncGenerator<UserFeed> {
	// filter out already loaded items so subsequent pages don't show duplicates of pages changed
	// since the last page load
	const loadedIds = new Set<number>();

	const userDataLoader = feedLoader<ApiFeedLoad>(opts.queryFn, (res: ApiFeedLoad) => {
		return res.postViews.length + res.commentViews.length;
	});

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
			endOfFeed
		};
	}

	return {
		contentViews: [],
		error: false,
		endOfFeed: true
	};
}
