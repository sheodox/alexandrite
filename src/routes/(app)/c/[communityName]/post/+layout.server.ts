import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const community = params.communityName;

	const cv = await locals.client.getCommunity({
		name: community,
		auth: locals.jwt
	});

	return {
		communityName: params.communityName,
		communityView: cv.community_view
	};
}) satisfies PageServerLoad;
