import { get, writable, type Writable } from 'svelte/store';
import type { LemmyHttp, ListingType, LocalUser, Person, SortType } from 'lemmy-js-client';
import { localStorageGet, localStorageSet } from '$lib/utils';
import { createLemmyClient } from '$lib/lemmy-client';

const lsKeys = {
	default: 'profiles-default',
	profiles: 'profiles-list'
};

export interface Profile {
	// some generated ID to uniquely identify this instance/user pairing
	id: string;
	instance: string;
	username?: string;
	avatar?: string;
	jwt?: string;
	settings: {
		default_listing_type: ListingType;
		default_sort_type: SortType;
		show_avatars: boolean;
		show_scores: boolean;
	};
}

export interface ProfileAPI {
	setDefault: (id: string) => void;
}

export function generateProfileID(instance: string, person?: Person) {
	return `profile:${person?.name ?? ''}@${instance}`;
}

export function getProfilesFromStorage() {
	return localStorageGet<Profile[]>(lsKeys.profiles, []);
}

export type ProfileContextStore = Writable<
	Profile & {
		client: LemmyHttp;
	}
>;

export function getDefaultProfile(): Profile {
	const instance = import.meta.env.ALEXANDRITE_DEFAULT_INSTANCE ?? 'lemmy.world',
		fallbackProfile = {
			instance,
			id: generateProfileID(instance),
			settings: {
				show_scores: true,
				show_avatars: true,
				default_listing_type: 'Local' as const,
				default_sort_type: 'Hot' as const
			}
		},
		defaultId = localStorageGet(lsKeys.default, null);

	if (defaultId === null) {
		return fallbackProfile;
	}

	const profile = getProfilesFromStorage().find((profile) => {
		return profile.id === defaultId;
	});

	return profile ?? fallbackProfile;
}

export function setDefaultProfile(id: string) {
	localStorageSet(lsKeys.default, id);
}

function profileToStoreValue(profile: Profile) {
	return {
		...profile,
		client: createLemmyClient(`https://${profile.instance}`),
		loggedIn: !!profile.jwt
	};
}

export function setProfile(p: Profile) {
	profile.set(profileToStoreValue(p));
}

const defaultProfile = getDefaultProfile();
export const profile = writable(profileToStoreValue(defaultProfile));

function getSettingsFromLocalUser(user?: Partial<LocalUser>) {
	return {
		show_avatars: user?.show_avatars ?? true,
		show_scores: user?.show_scores ?? true,
		default_sort_type: user?.default_sort_type ?? 'Hot',
		default_listing_type: user?.default_listing_type ?? 'All'
	};
}

export function addProfile(instance: string, person?: Person, jwt?: string, user?: Partial<LocalUser>) {
	const profiles = getProfilesFromStorage(),
		newProfile: Profile = {
			instance,
			id: generateProfileID(instance, person),
			username: person?.name,
			avatar: person?.avatar,
			jwt,
			settings: getSettingsFromLocalUser(user)
		},
		existingIndex = profiles.findIndex((profile) => profile.id === newProfile.id);

	if (existingIndex === -1) {
		profiles.push(newProfile);
	} else {
		profiles[existingIndex] = newProfile;
	}

	localStorageSet(lsKeys.profiles, profiles);
	localStorageSet(lsKeys.default, newProfile.id);

	profile.set(profileToStoreValue(newProfile));
}

export function updateProfileSettings(id: string, user: Partial<LocalUser>) {
	const settings = getSettingsFromLocalUser(user),
		profiles = getProfilesFromStorage().map((p) => {
			return p.id !== id
				? p
				: {
						...p,
						settings
				  };
		});

	if (get(profile).id === id) {
		profile.update((p) => {
			return { ...p, settings };
		});
	}

	localStorageSet(lsKeys.profiles, profiles);
}

export function logoutProfile(id: string) {
	const profiles = getProfilesFromStorage().filter((p) => p.id !== id);

	localStorageSet(lsKeys.profiles, profiles);
}
