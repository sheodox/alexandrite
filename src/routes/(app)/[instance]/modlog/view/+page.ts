import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { modlogToContentView } from '$lib/content-views';
import type { ModlogActionType } from 'lemmy-js-client';

const id = (idStr: string | null) => (idStr ? +idStr : undefined);

export const load = (async ({ url }) => {
	const { client, jwt } = get(profile),
		communityId = id(url.searchParams.get('community')),
		moderatorId = id(url.searchParams.get('moderator')),
		targetId = id(url.searchParams.get('target')),
		page = url.searchParams.get('page'),
		pageNum = page ? +page : 1,
		action = (url.searchParams.get('action') as ModlogActionType) || 'All',
		limit = 20;

	return {
		query: {
			action,
			user: url.searchParams.get('number'),
			communityId,
			moderatorId,
			targetId,
			page: pageNum,
			limit
		},
		targetUser: targetId
			? client.getPersonDetails({
					person_id: targetId,
					limit: 0
			  })
			: null,
		modlogs: client
			.getModlog({
				auth: jwt,
				community_id: communityId,
				mod_person_id: moderatorId,
				other_person_id: targetId,
				page: pageNum,
				limit,
				type_: action
			})
			.then(modlogToContentView)
	};
}) satisfies PageLoad;
