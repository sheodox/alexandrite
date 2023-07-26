import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { logout } from '$lib/settings/auth';
import { get } from 'svelte/store';
import { profile, updateProfileSettings } from '$lib/profiles/profiles';

export const load = (async ({ params }) => {
	const { client, jwt, instance, id } = get(profile);
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
		updateProfileSettings(id, localUser);
	}

	if (!localUser && jwt) {
		// the user was logged out, redirect to login form, they're not actually logged in,
		// even if some of the content loads.
		logout();
		throw redirect(303, '/instance?expired=true');
	}

	return {
		loggedIn: !!jwt,
		site,
		routeInstance: params.instance
	};
}) satisfies LayoutLoad;
