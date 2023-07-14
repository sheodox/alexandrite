import { getLemmyClient } from '$lib/lemmy-client';
import type { PageLoad } from './$types';

export const load = (async () => {
	const { client, jwt } = getLemmyClient();

	// reload siteMeta instead of using context so it updates with new blocks
	return {
		siteMeta: client.getSite({
			auth: jwt
		})
	};
}) satisfies PageLoad;
