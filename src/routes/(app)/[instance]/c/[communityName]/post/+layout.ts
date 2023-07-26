import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load = (async ({ params }) => {
	const { client, jwt } = get(profile);

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
