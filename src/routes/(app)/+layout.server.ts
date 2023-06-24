import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	return {
		homeInstance: locals.instance,
		site: locals.client.getSite({
			auth: locals.jwt
		})
	};
}) satisfies LayoutServerLoad;
