import { getLemmyClient } from '$lib/lemmy-client';
import { getLemmySettings, setLemmySettings } from '$lib/lemmy-settings';
import type { LayoutLoad } from './$types';

export const load = (async () => {
	const { client, jwt, instance, instanceUrl, username } = getLemmyClient();
	const site = await client.getSite({
		auth: jwt
	});

	const localUser = site.my_user?.local_user_view.local_user;
	if (localUser) {
		// update lemmy settings, this is initially set when setting the instance
		// but since we requested the site anyway, should update in case it changed
		setLemmySettings(localUser);
	}

	return {
		settings: {
			username,
			instance,
			instanceUrl
		},
		loggedIn: !!jwt,
		site,
		lemmySettings: getLemmySettings()
	};
}) satisfies LayoutLoad;
