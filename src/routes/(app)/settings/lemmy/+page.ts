import { getLemmyClient } from '$lib/lemmy-client';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { setLemmySettings } from '$lib/lemmy-settings';

export const load = (async () => {
	const { client, jwt } = getLemmyClient();

	const localUser = await client
		.getSite({
			auth: jwt
		})
		.then((r) => r.my_user?.local_user_view);

	if (!localUser) {
		throw error(403, "Couldn't get user settings");
	}

	setLemmySettings(localUser.local_user);

	return {
		localUser: localUser.local_user,
		person: localUser.person
	};
}) satisfies PageLoad;
