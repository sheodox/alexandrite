import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load = (async ({ url }) => {
	const { client } = get(profile);

	const communityName = url.searchParams.get('community');

	const cv = communityName
		? await client.getCommunity({
				name: communityName
		  })
		: null;

	return {
		communityName: communityName,
		communityView: cv?.community_view
	};
}) satisfies LayoutLoad;
