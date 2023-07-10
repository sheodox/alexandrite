import { clearLemmySettings } from '$lib/lemmy-settings';

export const logout = () => {
	localStorage.removeItem('instance');
	localStorage.removeItem('jwt');
	localStorage.removeItem('username');
	clearLemmySettings();
};
