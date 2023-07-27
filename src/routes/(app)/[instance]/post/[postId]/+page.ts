import { profile } from '$lib/profiles/profiles';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	const { client, jwt } = get(profile);

	return {
		postView: params.postId
			? client.getPost({ id: +params.postId, auth: jwt }).then(({ post_view }) => post_view)
			: null
	};
}) satisfies PageLoad;
