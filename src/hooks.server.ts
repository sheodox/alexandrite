import { redirect, type Handle, error } from '@sveltejs/kit';
import { LemmyHttp } from 'lemmy-js-client';

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

	event.locals.client = new LemmyHttp(event.locals.settings.instanceUrl, {
		fetchFunction: async (input: URL | RequestInfo, init?: RequestInit | undefined) => {
			const res = await fetch(input, init);
			if (!res.ok) {
				const text = await res.text();
				throw error(res.status, {
					message: 'Lemmy Error: ' + res.statusText + ':\n' + text
				});
			}
			return res;
		}
	});

	const response = await resolve(event);
	return response;
}) satisfies Handle;
