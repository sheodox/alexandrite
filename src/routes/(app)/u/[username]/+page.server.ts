import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, params, url, locals }) => {
	const username = params.username;

	return {
		...(await locals.client.getPersonDetails({
			username
		}))
	};
}) satisfies PageServerLoad;
