import { logoutProfile, profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';

export const logout = () => {
	const profileId = get(profile).id;
	logoutProfile(profileId);
};
