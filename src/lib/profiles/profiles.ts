import { get, writable, type Writable } from 'svelte/store';
import type { LemmyHttp, ListingType, LocalUser, Person, SortType } from 'lemmy-js-client';
import { localStorageBackedStore, localStorageGet, localStorageSet } from '$lib/utils';
import { createLemmyClient } from '$lib/lemmy-client';
import { getInstanceFromRoute } from './profile-utils';
import { migrate } from './migrate';
import { goto } from '$app/navigation';

migrate.toProfiles();

const lsKeys = {
	defaultInstance: 'profiles-default-instance',
	profiles: 'profiles-list',
	instanceDefault: (instance: string) => `profiles-instance-default-${instance}`
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

export function generateProfileID(instance: string, person?: { name: string }) {
	return `profile:${person?.name ?? ''}@${instance}`;
}

export const profiles = writable(localStorageGet<Profile[]>(lsKeys.profiles, []));

profiles.subscribe((val) => {
	localStorageSet(lsKeys.profiles, val);
});

export const defaultInstance = localStorageBackedStore<string>(lsKeys.defaultInstance, getDefaultInstance(), 0, true);
export const instance = writable(getRouteInstance());

// set the instance and go to it, used when selecting a profile on the login screen so the account
// switcher knows what instance you're on!
export async function gotoInstance(inst: string) {
	instance.set(inst);
	await goto(`/${inst}`);
}

export async function handleExpiredProfile() {
	// redirect to the login page, they tried doing something
	// that required auth with an invalid session.
	// using a full page redirect to clear everything out
	// as I saw it continue trying to load a ton of stuff in the
	// feed after redirecting away without this.
	location.href = `/instance?expired=${get(profile).id}`;
}

export function getFallbackProfile(): Profile {
	const inst = get(instance);
	return {
		instance: inst,
		id: generateProfileID(inst),
		settings: {
			show_scores: true,
			show_avatars: true,
			default_listing_type: 'Local' as const,
			default_sort_type: 'Hot' as const
		}
	};
}

export function switchInstance(inst: string) {
	instance.set(inst);
	switchToInstanceDefaultProfile();
}

export function getDefaultProfile(): Profile {
	const inst = get(instance),
		fallbackProfile = getFallbackProfile(),
		defaultId = inst
			? localStorageGet(lsKeys.instanceDefault(inst), null)
			: localStorageGet(lsKeys.instanceDefault(get(defaultInstance)), null);

	if (defaultId === null) {
		return fallbackProfile;
	}

	const profile = get(profiles).find((profile) => {
		return profile.id === defaultId;
	});

	return profile && profile.instance === inst ? profile : fallbackProfile;
}

const defaultProfile = getDefaultProfile();
export const profile = writable(profileToStoreValue(defaultProfile));

// if the current profile is removed, we need to re-init with a new default profile
export function switchToInstanceDefaultProfile() {
	profile.set(profileToStoreValue(getDefaultProfile()));
}

function getRouteInstance() {
	if (typeof location === 'undefined') {
		return get(defaultInstance);
	}

	return getInstanceFromRoute(location.pathname) ?? get(defaultInstance);
}

export const instanceDefaultProfileId = writable(getDefaultProfile().id);
instanceDefaultProfileId.subscribe((val) => {
	localStorageSet(lsKeys.instanceDefault(get(instance)), val);
});

export type ProfileContextStore = Writable<
	Profile & {
		client: LemmyHttp;
	}
>;

export function getDefaultInstance() {
	const routeInstance = getInstanceFromRoute(typeof location === 'undefined' ? '' : location.pathname),
		instance =
			routeInstance ??
			// need to safety check this, even though ssr is disabled it still gets run for some reason, at least in dev
			import.meta.env.ALEXANDRITE_DEFAULT_INSTANCE ??
			'lemmy.world';

	return instance;
}

export function setDefaultProfile(id: string) {
	localStorageSet(lsKeys.defaultInstance, id);
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

function getSettingsFromLocalUser(user?: Partial<LocalUser>) {
	return {
		show_avatars: user?.show_avatars ?? true,
		show_scores: user?.show_scores ?? true,
		default_sort_type: user?.default_sort_type ?? 'Hot',
		default_listing_type: user?.default_listing_type ?? 'All'
	};
}

export function addProfile(instance: string, person?: Person, jwt?: string, user?: Partial<LocalUser>) {
	const profileId = generateProfileID(instance, person);
	let isFirstForInstance = false,
		isOnlyProfile = false;

	profiles.update((profiles) => {
		isFirstForInstance = !profiles.some((p) => p.instance === instance);
		isOnlyProfile = !profiles.length;

		const newProfile: Profile = {
				instance,
				id: profileId,
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

		profile.set(profileToStoreValue(newProfile));
		return profiles;
	});

	if (isFirstForInstance) {
		localStorageSet(lsKeys.instanceDefault(instance), profileId);
	}

	if (isOnlyProfile) {
		defaultInstance.set(instance);
	}
}

export function updateProfileSettings(id: string, user: Partial<LocalUser>) {
	profiles.update((profiles) => {
		const settings = getSettingsFromLocalUser(user);

		if (get(profile).id === id) {
			profile.update((p) => {
				return { ...p, settings };
			});
		}

		return profiles.map((p) => {
			return p.id !== id
				? p
				: {
						...p,
						settings
				  };
		});
	});
}

export function logoutProfile(id: string) {
	profiles.update((profiles) => {
		return profiles.filter((p) => p.id !== id);
	});
}
