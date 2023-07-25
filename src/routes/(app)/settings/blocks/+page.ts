import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { profile } from '$lib/profiles/profiles';

export const load = (async () => {
	const { client, jwt } = get(profile);

	// reload siteMeta instead of using context so it updates with new blocks
	return {
		siteMeta: client.getSite({
			auth: jwt
		})
	};
}) satisfies PageLoad;
