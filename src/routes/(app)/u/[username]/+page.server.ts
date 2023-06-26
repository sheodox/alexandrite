import type { PageServerLoad } from './$types';

export const load = (async ({ params, url, locals }) => {
	const username = params.username;
	const selectedType = url.searchParams.get('type') || 'Posts';
	const selectedSort = url.searchParams.get('sort') || 'New';

	return {
		query: {
			type: selectedType,
			// no listing when viewing a single user
			listing: '',
			sort: selectedSort
		},
		...(await locals.client.getPersonDetails({
			username
		}))
	};
}) satisfies PageServerLoad;
