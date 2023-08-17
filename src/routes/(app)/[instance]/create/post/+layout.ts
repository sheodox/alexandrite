import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load = (async ({ url }) => {
	const { client, jwt } = get(profile);

	const communityName = url.searchParams.get('community');

	const cv = communityName
		? await client.getCommunity({
				name: communityName,
				auth: jwt
		  })
		: null;

	return {
		communityName: communityName,
		communityView: cv?.community_view
	};
}) satisfies LayoutLoad;
