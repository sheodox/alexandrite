import { getLemmySettings } from '$lib/lemmy-settings';
import type { CommentSortType, ListingType, CommentView, PostView, SortType } from 'lemmy-js-client';
import { getLemmyClient } from './lemmy-client';

export interface ApiFeedLoad {
	postViews: PostView[];
	commentViews: CommentView[];
	query: {
		type: string;
		sort: string;
		listing: string;
	};
}

const validCommentSortTypes = ['Hot', 'Top', 'New', 'Old'],
	commentSortFallback = 'Hot';

function getCommentSort(sort: string): CommentSortType {
	// if the comment sort type isn't valid for comments, default to something that works
	if (!sort || !validCommentSortTypes.includes(sort)) {
		return commentSortFallback;
	}
	return sort as CommentSortType;
}

interface FeedDataQuery {
	username?: string;
	communityName?: string;
	page?: number;
	type?: string;
	sort?: string;
	listing?: string;
}

export const loadFeedData = async (filters: FeedDataQuery): Promise<ApiFeedLoad> => {
	const ls = getLemmySettings(),
		{ client, jwt } = getLemmyClient(),
		page = Number(filters.page ?? '1'),
		selectedType = filters.type ?? (filters.username ? 'Overview' : 'Posts'),
		selectedListing = filters.listing,
		selectedSort = filters.sort,
		defaultNonUserSort = ls?.default_sort_type || 'Hot',
		postQuery = {
			sort:
				(selectedSort as SortType) ||
				// user queries don't have a 'Hot' sort, so the default shouldn't be used
				(filters.username ? 'New' : defaultNonUserSort),
			listing: (selectedListing as ListingType) || ls?.default_listing_type || 'Local',
			type: selectedType
		},
		typePosts = selectedType === 'Posts',
		typeSaved = selectedType === 'Saved';

	// can't filter posts by username, have to get them from a different api,
	// but when filtering saved posts we just want to use the normal post query
	if (filters.username) {
		const userDetails = await client.getPersonDetails({
			sort: postQuery.sort,
			auth: jwt,
			username: filters.username,
			limit: 50,
			page,
			saved_only: typeSaved
		});

		return {
			query: postQuery,
			postViews: userDetails.posts,
			commentViews: userDetails.comments
		};
	}

	if (typePosts || typeSaved) {
		const postViews = await client
			.getPosts({
				auth: jwt,
				limit: 50,
				page,
				community_name: filters.communityName ?? undefined,
				sort: postQuery.sort,
				type_: postQuery.listing
			})
			.then(({ posts }) => posts);

		return {
			postViews,
			query: postQuery,
			commentViews: []
		};
	} else {
		const query = {
			type: selectedType,
			listing: (selectedListing as ListingType) || ls?.default_listing_type || 'Local',
			sort: getCommentSort(selectedSort as CommentSortType)
		};

		return {
			postViews: [],
			query,
			commentViews: await client
				.getComments({
					auth: jwt,
					page,
					sort: query.sort,
					type_: query.listing,
					community_name: filters.communityName ?? undefined
				})
				.then(({ comments }) => comments)
		};
	}
};
