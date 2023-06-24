import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { LemmyHttp, type Login } from 'lemmy-js-client';

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

		const baseUrl = 'https://' + instance;

		const client: LemmyHttp = new LemmyHttp(baseUrl);
		const loginForm: Login = {
			username_or_email: username,
			password: body.password + ''
		};
		const jwt = (await client.login(loginForm)).jwt;

		cookies.set('jwt', jwt ?? '');

		throw redirect(303, '/');
	}
} satisfies Actions;
