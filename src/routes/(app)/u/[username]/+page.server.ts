import { loadFeedData } from '$lib/feed-query';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, url, locals, cookies }) => {
	const username = params.username;

	const details = await locals.client.getPersonDetails({
		username,
		auth: locals.jwt
	});
	return {
		personView: details.person_view,
		moderates: details.moderates,
		...(await loadFeedData({
			cookies,
			username,
			searchParams: url.searchParams,
			client: locals.client,
			auth: locals.jwt
		}))
	};
}) satisfies PageServerLoad;
