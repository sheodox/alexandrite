import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { profile } from '$lib/profiles/profiles';

export const load = (async ({ params }) => {
	const { client, jwt } = get(profile);

	return {
		personView: await client
			.getPersonDetails({
				person_id: Number(params.recipientId),
				auth: jwt
			})
			.then((d) => d.person_view)
	};
}) satisfies PageLoad;
