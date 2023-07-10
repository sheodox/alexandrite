import { getLemmyClient } from '$lib/lemmy-client';
import { getLemmySettings, setLemmySettings } from '$lib/lemmy-settings';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { logout } from '$lib/settings/auth';

export const load = (async () => {
	const { client, jwt, instance, instanceUrl, username } = getLemmyClient();
	if (!instance) {
		throw redirect(303, '/instance');
	}

	const site = await client.getSite({
		auth: jwt
	});

	const localUser = site.my_user?.local_user_view.local_user;
	if (localUser) {
		// update lemmy settings, this is initially set when setting the instance
		// but since we requested the site anyway, should update in case it changed
		setLemmySettings(localUser);
	}

	if (!localUser && jwt) {
		// the user was logged out, redirect to login form, they're not actually logged in,
		// even if some of the content loads.
		logout();
		throw redirect(303, '/instance?expired=true');
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
