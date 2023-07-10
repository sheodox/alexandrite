import { redirect, type Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	const instance = localStorage.getItem('instance');

	if ((event.url.pathname === '/' || event.route.id?.startsWith('/(app)')) && !instance) {
		throw redirect(303, '/instance');
	}

	const response = await resolve(event);
	return response;
}) satisfies Handle;
