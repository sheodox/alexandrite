import { clearLemmySettings } from '$lib/lemmy-settings';
import type { Cookies } from '@sveltejs/kit';

export function logout(cookies: Cookies) {
	cookies.delete('instance');
	cookies.delete('jwt');
	cookies.delete('username');
	clearLemmySettings(cookies);
}
