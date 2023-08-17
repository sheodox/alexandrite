import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load = (async ({ params }) => {
	const { client, jwt } = get(profile);

	const communityName = params.communityName;

	const cv = await client.getCommunity({
		name: communityName,
		auth: jwt
	});

	return {
		communityName: communityName,
		communityView: cv?.community_view
	};
}) satisfies LayoutLoad;
