import { getLemmySettings } from '$lib/lemmy-settings';
import type {
	CommentView,
	CommunityView,
	ListingType,
	PersonView,
	PostView,
	SearchType,
	SortType
} from 'lemmy-js-client';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export interface ApiSearchRes {
	query: {
		q: string;
		page: number;
		sort: string;
		listing: string;
		type: string;
		community: string | null;
		creator: number | null;
	};
	comments: CommentView[];
	posts: PostView[];
	users: PersonView[];
	communities: CommunityView[];
}

export const GET = (async ({ cookies, url, locals }) => {
	const { searchParams } = url,
		ls = getLemmySettings(cookies),
		creator = searchParams.get('creator'),
		query = {
			q: searchParams.get('q') ?? '',
			page: Number(searchParams.get('page') ?? '1'),
			sort: searchParams.get('sort') ?? 'TopAll',
			listing: (searchParams.get('listing') as ListingType) || ls?.default_listing_type || 'Local',
			type: searchParams.get('type') ?? 'All',
			community: searchParams.get('community'),
			creator: creator ? Number(creator) : null
		};

	// can't search for nothing, but don't let that stop us from returning the default query values
	if (!query.q) {
		const blankResponse: ApiSearchRes = {
			query,
			comments: [],
			posts: [],
			users: [],
			communities: []
		};
		return json(blankResponse);
	}

	const searchRes = await locals.client.search({
		auth: locals.jwt,
		limit: 50,
		page: query.page,
		sort: query.sort as SortType,
		type_: query.type as SearchType,
		listing_type: query.listing,
		community_name: query.community ?? undefined,
		creator_id: query.creator ?? undefined,
		q: query.q
	});

	const data: ApiSearchRes = {
		query,
		comments: searchRes.comments,
		posts: searchRes.posts,
		users: searchRes.users,
		communities: searchRes.communities
	};
	return json(data);
}) satisfies RequestHandler;
