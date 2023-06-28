import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	logout: async ({ cookies }) => {
		cookies.delete('instance');
		cookies.delete('jwt');
		cookies.delete('username');

		throw redirect(303, '/');
	}
} satisfies Actions;
