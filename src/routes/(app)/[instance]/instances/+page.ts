import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { profile } from '$lib/profiles/profiles';

export const load = (async () => {
	const { client } = get(profile);

	return {
		federatedInstances: client.getFederatedInstances()
	};
}) satisfies PageLoad;
