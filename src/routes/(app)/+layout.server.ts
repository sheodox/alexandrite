import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	return {
		settings: locals.settings,
		loggedIn: !!locals.jwt,
		site: locals.client.getSite({
			auth: locals.jwt
		})
	};
}) satisfies LayoutServerLoad;
