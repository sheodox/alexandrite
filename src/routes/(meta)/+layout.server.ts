import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	return {
		settings: locals.settings
	};
}) satisfies LayoutServerLoad;
