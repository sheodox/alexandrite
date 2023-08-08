import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { profile } from '$lib/profiles/profiles';

export const load = (async ({ params, url }) => {
	const username = params.username;
	const { client, jwt } = get(profile);

	const details = await client.getPersonDetails({
		username,
		auth: jwt
	});
	return {
		personView: details.person_view,
		personUsername: username,
		moderates: details.moderates,
		query: {
			sort: url.searchParams.get('sort') ?? 'New',
			listing: url.searchParams.get('listing') ?? 'Local',
			type: url.searchParams.get('type') ?? 'Overview'
		},
		pageBaseUrl: url.pathname + url.search
	};
}) satisfies PageLoad;
