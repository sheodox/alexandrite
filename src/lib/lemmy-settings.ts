import type { Cookies } from '@sveltejs/kit';
import type { LocalUser } from 'lemmy-js-client';

const SCHEMA_VERSION = 1,
	SCHEMA_HEADER = 's' + SCHEMA_VERSION + 'v',
	boolProps: (keyof LocalUser)[] = [
		'show_nsfw',
		'show_avatars',
		'send_notifications_to_email',
		'show_scores',
		'show_bot_accounts',
		'show_read_posts',
		'show_new_post_notifs',
		'email_verified',
		'accepted_application'
	],
	strProps: (keyof LocalUser)[] = ['default_listing_type', 'default_sort_type'];

export const lemmySettings = {
	serialize: (user: LocalUser) => {
		return [
			SCHEMA_HEADER,
			boolProps.map((prop) => (user[prop] ? '1' : '0')).join(''),
			strProps.map((prop) => user[prop]).join(',')
		].join('|');
	},
	deserialize: (str?: string): LocalUser | null => {
		if (!str || !str.startsWith(SCHEMA_HEADER)) {
			return null;
		}

		const localUser: Record<string, boolean | string> = {};

		// skip the version header
		const [_, bools, strs] = str.split('|'),
			strsArr = strs.split(',');

		for (let i = 0; i < boolProps.length; i++) {
			localUser[boolProps[i] as keyof LocalUser] = bools.at(i) === '1';
		}

		for (let i = 0; i < strProps.length; i++) {
			localUser[strProps[i] as keyof LocalUser] = strsArr.at(i) ?? '';
		}

		return localUser as unknown as LocalUser;
	}
};

const COOKIE_KEY = 'lemmy-settings';

export const getLemmySettings = (cookies: Cookies) => {
	return lemmySettings.deserialize(cookies.get(COOKIE_KEY));
};

export const clearLemmySettings = (cookies: Cookies) => {
	return cookies.delete(COOKIE_KEY);
};

export const setLemmySettings = (cookies: Cookies, localUser: LocalUser) => {
	cookies.set(COOKIE_KEY, lemmySettings.serialize(localUser), {
		path: '/'
	});
};
