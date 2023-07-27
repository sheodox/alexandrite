import { profile } from '$lib/profiles/profiles';
import { redirect, type Handle } from '@sveltejs/kit';
import { get } from 'svelte/store';

export const handle = (async ({ event, resolve }) => {
	const { instance } = get(profile);

	if ((event.url.pathname === '/' || event.route.id?.startsWith('/(app)')) && !instance) {
		throw redirect(303, '/instance');
	} else if (event.url.pathname === '/') {
		throw redirect(303, `/${instance}/`);
	}

	const response = await resolve(event);
	return response;
}) satisfies Handle;
