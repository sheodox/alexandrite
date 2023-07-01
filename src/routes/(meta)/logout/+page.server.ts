import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { logout } from './logout';

export const actions = {
	logout: async ({ cookies }) => {
		logout(cookies);
		throw redirect(303, '/');
	}
} satisfies Actions;
