import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	return {
		personView: await locals.client
			.getPersonDetails({
				person_id: Number(params.recipientId),
				auth: locals.jwt
			})
			.then((d) => d.person_view)
	};
}) satisfies PageServerLoad;
