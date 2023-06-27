import { it, describe, expect } from 'vitest';
import { lemmySettings } from './lemmy-settings';
import type { LocalUser } from 'lemmy-js-client';

const localUser = {
	show_nsfw: false,
	theme: 'browser',
	default_sort_type: 'Active',
	default_listing_type: 'Local',
	interface_language: 'browser',
	show_avatars: true,
	send_notifications_to_email: false,
	validator_time: '2023-06-26T23:23:51.322164',
	show_scores: true,
	show_bot_accounts: true,
	show_read_posts: true,
	show_new_post_notifs: false,
	email_verified: false,
	accepted_application: true
} as LocalUser;

const localUserImportantSettings = {
	show_nsfw: false,
	default_sort_type: 'Active',
	default_listing_type: 'Local',
	show_avatars: true,
	send_notifications_to_email: false,
	show_scores: true,
	show_bot_accounts: true,
	show_read_posts: true,
	show_new_post_notifs: false,
	email_verified: false,
	accepted_application: true
} as LocalUser;

describe('lemmy-settings', () => {
	it('should serialize and deserialize', () => {
		expect(typeof lemmySettings.serialize(localUser)).toBe('string');
		expect(lemmySettings.serialize(localUser)).toBe('s1v|010111001|Local,Active');
		expect(lemmySettings.deserialize(lemmySettings.serialize(localUser))).toStrictEqual(localUserImportantSettings);
	});
});
