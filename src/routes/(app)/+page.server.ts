import type { PageServerLoad } from './$types';
import { loadFeedData } from '$lib/feed-query';
import { error } from '@sveltejs/kit';

export const load = (async ({ url, locals, cookies }) => {
	try {
		return await loadFeedData({
			auth: locals.jwt,
			searchParams: url.searchParams,
			client: locals.client,
			cookies
		});
	} catch (e) {
		throw error(500, {
			message: 'Error fetching feed.'
		});
	}
}) satisfies PageServerLoad;
