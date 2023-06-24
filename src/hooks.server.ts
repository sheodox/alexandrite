import { redirect, type Handle } from '@sveltejs/kit';
import { LemmyHttp } from 'lemmy-js-client';

export const handle = (async ({ event, resolve }) => {
	event.locals.instance = event.cookies.get('instance') ?? '';
	event.locals.jwt = event.cookies.get('jwt') ?? '';

	if (event.url.pathname === '/' && !event.locals.instance) {
		throw redirect(303, '/instance');
	}

	event.locals.instanceUrl = 'https://' + event.locals.instance;

	event.locals.client = new LemmyHttp(event.locals.instanceUrl);

	const response = await resolve(event);
	return response;
}) satisfies Handle;
