import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';
import type { GetCommunityResponse } from 'lemmy-js-client';
import { nameAtInstance } from '$lib/nav-utils';

export const load = (async ({ url }) => {
	const { client } = get(profile),
		communityId = url.searchParams.get('community');

	let cv: GetCommunityResponse | null = null;

	if (communityId) {
		cv = await client.getCommunity({
			id: +communityId
		});
	}

	return {
		communityName: cv ? nameAtInstance(cv.community_view.community) : null,
		communityView: cv?.community_view,
		communityModerators: cv?.moderators.map((m) => m.moderator)
	};
}) satisfies LayoutLoad;
