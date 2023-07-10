import { getLemmyClient } from '$lib/lemmy-client';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	const { client, jwt } = getLemmyClient();

	return {
		personView: await client
			.getPersonDetails({
				person_id: Number(params.recipientId),
				auth: jwt
			})
			.then((d) => d.person_view)
	};
}) satisfies PageLoad;
