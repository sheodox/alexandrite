import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { profile, updateProfileSettings } from '$lib/profiles/profiles';

export const load = (async () => {
	const { client, jwt, id } = get(profile);

	const site = await client.getSite({
		auth: jwt
	});

	if (!site.my_user) {
		throw error(403, "Couldn't get user settings");
	}

	updateProfileSettings(id, site.my_user.local_user_view.local_user);

	return {
		localUser: site.my_user.local_user_view.local_user,
		person: site.my_user.local_user_view.person,
		discussionLanguages: site.my_user.discussion_languages,
		languages: site.all_languages.filter((lang) => site.discussion_languages.includes(lang.id))
	};
}) satisfies PageLoad;
