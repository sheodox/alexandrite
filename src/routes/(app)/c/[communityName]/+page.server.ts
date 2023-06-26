import type { PageServerLoad } from './$types';
import type { ApiPostsRes } from '../../api/posts/+server';

export const load = (async ({ fetch, params, url, locals }) => {
	const community = params.communityName;
	const selectedType = url.searchParams.get('type') || '';
	const selectedListing = url.searchParams.get('listing') || '';
	const selectedSort = url.searchParams.get('sort') || '';

	const { posts, query }: ApiPostsRes = await fetch(
		`/api/posts?page=1&communityName=${community}&type=${selectedType}&listing=${selectedListing}&sort=${selectedSort}`
	).then((res) => res.json());
	return {
		posts,
		query,
		communityName: params.communityName,
		communityView: locals.client
			.getCommunity({
				name: community
			})
			.then(({ community_view }) => community_view)
	};
}) satisfies PageServerLoad;
