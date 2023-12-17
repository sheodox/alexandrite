import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load = (async ({ params }) => {
	const { client } = get(profile);

	const cv = await client.getCommunity({
		name: params.communityName
	});

	return {
		communityName: params.communityName,
		communityView: cv.community_view
	};
}) satisfies LayoutLoad;
