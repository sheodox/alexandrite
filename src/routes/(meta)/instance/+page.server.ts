import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { LemmyHttp, type Login } from 'lemmy-js-client';
import { lemmySettings } from '$lib/lemmy-settings';

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

		cookies.set('instance', instance);

		if (username) {
			const baseUrl = 'https://' + instance;

			const client: LemmyHttp = new LemmyHttp(baseUrl);
			const loginForm: Login = {
				username_or_email: username,
				password: body.password + ''
			};
			const jwt = (await client.login(loginForm)).jwt;

			cookies.set('jwt', jwt ?? '');
			cookies.set('username', username);

			const site = await client.getSite({
				auth: jwt
			});
			const localUser = site.my_user?.local_user_view.local_user;
			if (localUser) {
				// store settings in the cookie doing some home grown de/serialization stuff so the settings are tiny in the cookie
				cookies.set('lemmy-settings', lemmySettings.serialize(localUser));
			}
		}

		throw redirect(303, '/');
	}
} satisfies Actions;
