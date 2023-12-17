import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { get } from 'svelte/store';
import { profile, updateProfileSettings } from '$lib/profiles/profiles';

export const load = (async () => {
	const { client, jwt, instance, id } = get(profile);
	if (!instance) {
		throw redirect(303, '/instance');
	}

	const site = await client.getSite();

	const localUser = site.my_user?.local_user_view.local_user;
	if (localUser) {
		// update lemmy settings, this is initially set when setting the instance
		// but since we requested the site anyway, should update in case it changed
		updateProfileSettings(id, localUser);
	}

	if (!localUser && jwt) {
		// redirect to the login page, they tried doing something
		// that required auth with an invalid session.
		// using a full page redirect to clear everything out
		// as I saw it continue trying to load a ton of stuff in the
		// feed after redirecting away without this.
		throw redirect(303, `/instance?expired=${id}`);
	}

	return {
		loggedIn: !!jwt,
		site
	};
}) satisfies LayoutLoad;
