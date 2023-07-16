import type { LocalUser } from 'lemmy-js-client';

const SCHEMA_VERSION = 1,
	SCHEMA_HEADER = 's' + SCHEMA_VERSION + 'v',
	boolProps = [
		'show_nsfw',
		'show_avatars',
		'send_notifications_to_email',
		'show_scores',
		'show_bot_accounts',
		'show_read_posts',
		'show_new_post_notifs',
		'email_verified',
		'accepted_application'
	] as const,
	strProps = ['default_listing_type', 'default_sort_type'] as const,
	defaultSettings: LemmySettings = {
		show_nsfw: false,
		show_avatars: true,
		send_notifications_to_email: false,
		show_scores: true,
		show_bot_accounts: true,
		show_read_posts: true,
		show_new_post_notifs: false,
		// todo, use defaults from the instance
		default_listing_type: 'Local',
		default_sort_type: 'Hot',
		// todo probably don't need to care about these yet
		email_verified: false,
		accepted_application: false
	} as const;

export type LemmySettings = Pick<LocalUser, (typeof boolProps)[number] | (typeof strProps)[number]>;

export const lemmySettings = {
	serialize: (user: LocalUser) => {
		return [
			SCHEMA_HEADER,
			boolProps.map((prop) => (user[prop] ? '1' : '0')).join(''),
			strProps.map((prop) => user[prop]).join(',')
		].join('|');
	},
	deserialize: (str?: string | null): LemmySettings | null => {
		if (!str || !str.startsWith(SCHEMA_HEADER)) {
			return defaultSettings;
		}

		const localUser: Record<string, boolean | string> = {};

		// skip the version header
		const [bools, strs] = str.split('|').slice(1),
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

const SETTINGS_KEY = 'lemmy-settings';

export const getLemmySettings = () => {
	const settings = lemmySettings.deserialize(localStorage.getItem(SETTINGS_KEY));

	return {
		...defaultSettings,
		...settings
	};
};

export const clearLemmySettings = () => {
	localStorage.removeItem(SETTINGS_KEY);
};

export const setLemmySettings = (localUser: LocalUser) => {
	localStorage.setItem(SETTINGS_KEY, lemmySettings.serialize(localUser));
};
