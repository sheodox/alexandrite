import { localStorageSet } from '$lib/utils';
import { generateProfileID, type Profile } from './profiles';

const lsg = typeof localStorage !== 'undefined' ? localStorage.getItem.bind(localStorage) : () => {};
const lsr = typeof localStorage !== 'undefined' ? localStorage.removeItem.bind(localStorage) : () => {};

export const migrate = {
	// before profiles the single logged in user's instance/jwt/username were stored as normal strings (not JSON.stringified)
	// but they need to be in the profile format which is a couple IDs, default instance, and all login info in an array all stringified.
	toProfiles() {
		const instance = lsg('instance'),
			username = lsg('username') ?? undefined;
		if (instance) {
			const id = generateProfileID(instance, { name: username ?? '' }),
				prof: Profile = {
					instance,
					id,
					username,
					jwt: lsg('jwt') ?? undefined,
					settings: {
						show_avatars: true,
						show_scores: true,
						default_sort_type: 'Active',
						default_listing_type: 'Local'
					}
				};

			localStorageSet(`profiles-instance-default-${instance}`, id);
			localStorageSet(`profiles-list`, [prof]);
			localStorageSet(`alexandrite-setting-profiles-default-instance-v0`, instance);

			lsr('instance');
			lsr('username');
			lsr('jwt');
		}
	}
};
