import { getLemmySettings, setLemmySettings } from '$lib/lemmy-settings';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, cookies }) => {
	const site = await locals.client.getSite({
		auth: locals.jwt
	});

	const localUser = site.my_user?.local_user_view.local_user;
	if (localUser) {
		// update lemmy settings, this is initially set when setting the instance
		// but since we requested the site anyway, should update in case it changed
		setLemmySettings(cookies, localUser);
	}

	return {
		settings: locals.settings,
		loggedIn: !!locals.jwt,
		site,
		lemmySettings: getLemmySettings(cookies)
	};
}) satisfies LayoutServerLoad;
