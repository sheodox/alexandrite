import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { profile } from '$lib/profiles/profiles';

export const load = (async ({ params }) => {
	const { client } = get(profile);

	return {
		personView: await client
			.getPersonDetails({
				person_id: Number(params.recipientId)
			})
			.then((d) => d.person_view)
	};
}) satisfies PageLoad;
