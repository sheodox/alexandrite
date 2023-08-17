import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load = (async ({ url }) => {
	const { client, jwt } = get(profile);
	const crossPostId = url.searchParams.get('crosspost');

	return {
		crossPost: crossPostId
			? client.getPost({
					auth: jwt,
					id: +crossPostId
			  })
			: null
	};
}) satisfies PageLoad;
