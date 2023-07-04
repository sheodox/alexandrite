import { createLemmyClient } from '$lib/lemmy-client';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	const instance = event.cookies.get('instance') ?? '';
	event.locals.settings = {
		instance,
		username: event.cookies.get('username') ?? '',
		instanceUrl: 'https://' + instance
	};

	event.locals.jwt = event.cookies.get('jwt') ?? '';

	if ((event.url.pathname === '/' || event.route.id?.startsWith('/(app)')) && !instance) {
		throw redirect(303, '/instance');
	}

	event.locals.client = createLemmyClient(event.locals.settings.instanceUrl);

	const response = await resolve(event);
	return response;
}) satisfies Handle;
