import { getLemmySettings, setLemmySettings } from '$lib/lemmy-settings';
import { redirect } from '@sveltejs/kit';
import { logout } from '../(meta)/logout/logout';
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

	if (!localUser && locals.jwt) {
		// the user was logged out, redirect to login form, they're not actually logged in,
		// even if some of the content loads.
		logout(cookies);
		throw redirect(303, '/instance?expired=true');
	}

	return {
		settings: locals.settings,
		loggedIn: !!locals.jwt,
		site,
		lemmySettings: getLemmySettings(cookies)
	};
}) satisfies LayoutServerLoad;
