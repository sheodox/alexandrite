import { instance } from '$lib/profiles/profiles';
import { redirect, type Handle } from '@sveltejs/kit';
import { get } from 'svelte/store';

export const handle = (async ({ event, resolve }) => {
	if ((event.url.pathname === '/' || event.route.id?.startsWith('/(app)')) && !instance) {
		throw redirect(303, '/instance');
	} else if (event.url.pathname === '/') {
		throw redirect(303, `/${get(instance)}/`);
	}

	const response = await resolve(event);
	return response;
}) satisfies Handle;
