import { getLemmyClient } from '$lib/lemmy-client';
import type { PageLoad } from './$types';

export const load = (async ({ params, url }) => {
	const username = params.username;
	const { client, jwt } = getLemmyClient();

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
		}
	};
}) satisfies PageLoad;
