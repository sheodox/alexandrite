import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ListingType, PostView, SortType } from 'lemmy-js-client';
import { getLemmySettings } from '$lib/lemmy-settings';

export interface ApiPostsRes {
	posts: PostView[];
	query: {
		type: string;
		listing: string;
		sort: string;
	};
}

export const GET = (async ({ url, locals, cookies }) => {
	const ls = getLemmySettings(cookies);
	const page = Number(url.searchParams.get('page') ?? '1');
	const communityName = url.searchParams.get('communityName');
	const username = url.searchParams.get('username');
	const selectedType = url.searchParams.get('type') || 'Posts';
	const selectedListing: ListingType =
		(url.searchParams.get('listing') as ListingType) || ls?.default_listing_type || 'Local'; // default 'local';
	const selectedSort: SortType = (url.searchParams.get('sort') as SortType) || ls?.default_sort_type || 'Hot'; // default 'Hot';
	const query = {
		type: selectedType,
		listing: selectedListing,
		sort: selectedSort
	};

	// can't filter posts by username, have to get them from a different api
	if (username) {
		const posts = {
			query,
			posts: await locals.client
				.getPersonDetails({
					auth: locals.jwt,
					username: username,
					limit: 20,
					page
				})
				.then(({ posts }) => posts)
		};

		return json(posts);
	}

	const posts =
		selectedType === 'Posts'
			? await locals.client
					.getPosts({
						auth: locals.jwt,
						limit: 20,
						page,
						community_name: communityName ?? undefined,
						sort: selectedSort,
						type_: selectedListing
					})
					.then(({ posts }) => posts)
			: await locals.client
					.getComments({
						auth: locals.jwt,
						limit: 20,
						page,
						community_name: communityName ?? undefined,
						//@ts-expect-error 'sort' type is incomplete compared to SortType for comments
						sort: selectedSort,
						type_: selectedListing
					})
					.then(({ comments }) => comments);

	return json({
		query,
		posts
	});
}) satisfies RequestHandler;
