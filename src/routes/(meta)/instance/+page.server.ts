import { HttpError, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { LemmyHttp, type GetSiteResponse, type Login } from 'lemmy-js-client';
import { setLemmySettings } from '$lib/lemmy-settings';
import { logout } from '../logout/logout';

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

		const client: LemmyHttp = new LemmyHttp(baseUrl);
		let site: GetSiteResponse;

		try {
			site = await client.getSite({});
		} catch (e) {
			console.log('site workednt');
			return fail((e as HttpError).status, {
				errorMsg: 'Error fetching site metadata: ' + (e as HttpError) + ' - ' + (e as HttpError).body.message,
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
				password: body.password + ''
			};

			let jwt = '';
			try {
				jwt = (await client.login(loginForm)).jwt ?? '';
			} catch (e) {
				return fail(401, {
					errorMsg: 'Username or password incorrect.'
				});
			}

			cookies.set('jwt', jwt);
			cookies.set('username', username);

			const site = await client.getSite({
				auth: jwt
			});

			const localUser = site.my_user?.local_user_view.local_user;
			if (localUser) {
				// store settings in the cookie doing some home grown de/serialization stuff so the settings are tiny in the cookie
				setLemmySettings(cookies, localUser);
			}
		}

		throw redirect(303, '/');
	}
} satisfies Actions;
