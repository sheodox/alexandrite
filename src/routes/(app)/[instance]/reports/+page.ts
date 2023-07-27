import type { PageLoad } from './$types';

export const load = (async ({ url }) => {
	return {
		query: {
			state: url.searchParams.get('state') || 'Unread',
			type: url.searchParams.get('type') || 'All'
		}
	};
}) satisfies PageLoad;
