import { config } from '$lib/config';
import { createLemmyClient } from '$lib/lemmy-client';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	const instance = config.forcedInstance || params.instance,
		instanceUrl = 'https://' + instance,
		client = createLemmyClient(instanceUrl, {});

	if (config.forcedInstance && params.instance !== config.forcedInstance) {
		throw redirect(303, `/instance/signup/${config.forcedInstance}`);
	}

	return {
		siteMeta: client.getSite(),
		client,
		instanceUrl,
		instance: params.instance
	};
}) satisfies PageLoad;
