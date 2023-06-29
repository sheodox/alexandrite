import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadFeedData } from '$lib/feed-query';

export const GET = (async ({ url, locals, cookies }) => {
	return json(
		await loadFeedData({
			auth: locals.jwt,
			searchParams: url.searchParams,
			client: locals.client,
			communityName: url.searchParams.get('communityName') ?? undefined,
			username: url.searchParams.get('username') ?? undefined,
			cookies
		})
	);
}) satisfies RequestHandler;
