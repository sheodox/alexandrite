import { HttpError, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { GetSiteResponse, Login } from 'lemmy-js-client';
import { setLemmySettings } from '$lib/lemmy-settings';
import { logout } from '../logout/logout';
import { createLemmyClient } from '$lib/lemmy-client';

export const actions = {
	setInstance: async ({ request, cookies }) => {
		const body = Object.fromEntries(await request.formData()),
			instance = ('' + body.instance).trim().replace(/^https:\/\//, ''),
			username = ('' + body.username).trim();

		if (!instance) {
			return fail(400, {
				errorMsg: 'You must specify a Lemmy instance!',
				instance,
				username
			});
		}

		// logout of previous user
		logout(cookies);

		const baseUrl = 'https://' + instance;

		const client = createLemmyClient(baseUrl);
		let site: GetSiteResponse;

		try {
			site = await client.getSite({});
		} catch (e) {
			const httpErr = e as HttpError;
			return fail(400, {
				errorMsg: 'Error fetching site metadata: ' + httpErr,
				instance,
				username
			});
		}

		if (site.version.startsWith('0.17.') || site.version.startsWith('0.16.')) {
			return fail(400, {
				errorMsg: `Server version (${site.version}) is too low!`,
				instance,
				username
			});
		}

		cookies.set('instance', instance);

		if (username) {
			const loginForm: Login = {
				username_or_email: username,
				password: body.password + '',
				totp_2fa_token: (body.totp_2fa_token as string) || undefined
			};

			let jwt = '';
			try {
				jwt = (await client.login(loginForm)).jwt ?? '';
			} catch (e) {
				console.log(e);
				return fail(401, {
					errorMsg: 'Username or password incorrect.',
					instance,
					username
				});
			}

			const site = await client.getSite({
				auth: jwt
			});

			cookies.set('jwt', jwt);

			const user = site.my_user?.local_user_view;
			if (user) {
				// store settings in the cookie doing some home grown de/serialization stuff so the settings are tiny in the cookie
				setLemmySettings(cookies, user.local_user);
				cookies.set('username', user.person.name);
			}
		}

		throw redirect(303, '/');
	}
} satisfies Actions;
