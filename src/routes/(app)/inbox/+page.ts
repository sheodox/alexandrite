import type { PageLoad } from './$types';

export const load = (async ({ url }) => {
	return {
		query: {
			type: url.searchParams.get('type') || 'Unread',
			listing: url.searchParams.get('listing') || 'All',
			sort: url.searchParams.get('sort') || 'New'
		}
	};
}) satisfies PageLoad;
