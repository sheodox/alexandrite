import type { PageServerLoad } from './$types';
import { loadFeedData } from '$lib/feed-query';

export const load = (async ({ url, locals, cookies }) => {
	return await loadFeedData({
		auth: locals.jwt,
		searchParams: url.searchParams,
		client: locals.client,
		cookies
	});
}) satisfies PageServerLoad;
