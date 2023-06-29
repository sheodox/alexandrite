import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = (async ({ locals }) => {
	const x = await locals.client.getUnreadCount({
		auth: locals.jwt
	});

	return json(x);
}) satisfies RequestHandler;
