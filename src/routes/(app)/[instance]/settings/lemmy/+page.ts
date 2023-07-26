import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { profile, updateProfileSettings } from '$lib/profiles/profiles';

export const load = (async () => {
	const { client, jwt, id } = get(profile);

	const localUser = await client
		.getSite({
			auth: jwt
		})
		.then((r) => r.my_user?.local_user_view);

	if (!localUser) {
		throw error(403, "Couldn't get user settings");
	}

	updateProfileSettings(id, localUser.local_user);

	return {
		localUser: localUser.local_user,
		person: localUser.person
	};
}) satisfies PageLoad;
