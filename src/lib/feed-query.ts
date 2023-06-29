import { getLemmySettings } from '$lib/lemmy-settings';
import type { CommentSortType, ListingType, CommentView, PostView, LemmyHttp, SortType } from 'lemmy-js-client';
import type { Cookies } from '@sveltejs/kit';

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
	searchParams: URLSearchParams;
	username?: string;
	communityName?: string;
	cookies: Cookies;
	client: LemmyHttp;
	auth: string;
}

export const loadFeedData = async ({
	communityName,
	username,
	cookies,
	searchParams,
	client,
	auth
}: FeedDataQuery): Promise<ApiFeedLoad> => {
	const ls = getLemmySettings(cookies),
		page = Number(searchParams.get('page') ?? '1'),
		selectedType = searchParams.get('type') ?? (username ? 'Overview' : 'Posts'),
		selectedListing = searchParams.get('listing'),
		selectedSort = searchParams.get('sort'),
		defaultNonUserSort = ls?.default_sort_type || 'Hot',
		postQuery = {
			sort:
				(selectedSort as SortType) ||
				// user queries don't have a 'Hot' sort, so the default shouldn't be used
				(username ? 'New' : defaultNonUserSort),
			listing: (selectedListing as ListingType) || ls?.default_listing_type || 'Local',
			type: selectedType
		},
		typePosts = selectedType === 'Posts',
		typeSaved = selectedType === 'Saved';

	// can't filter posts by username, have to get them from a different api,
	// but when filtering saved posts we just want to use the normal post query
	if (username) {
		const userDetails = await client.getPersonDetails({
			sort: postQuery.sort,
			auth,
			username,
			limit: 20,
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
				auth,
				limit: 20,
				page,
				community_name: communityName ?? undefined,
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
					auth,
					page,
					sort: query.sort,
					type_: query.listing,
					community_name: communityName ?? undefined
				})
				.then(({ comments }) => comments)
		};
	}
};
