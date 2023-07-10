import { getLemmyClient } from '$lib/lemmy-client';
import type { LayoutLoad } from './$types';

export const load = (async ({ params }) => {
	const { client, jwt } = getLemmyClient();

	const community = params.communityName;

	const cv = await client.getCommunity({
		name: community,
		auth: jwt
	});

	return {
		communityName: params.communityName,
		communityView: cv.community_view
	};
}) satisfies LayoutLoad;
