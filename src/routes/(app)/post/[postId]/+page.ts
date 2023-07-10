import type { PageLoad } from './$types';
import { getLemmyClient } from '$lib/lemmy-client';

export const load = (async ({ params }) => {
	const { client, jwt } = getLemmyClient();

	return {
		postView: params.postId
			? client.getPost({ id: +params.postId, auth: jwt }).then(({ post_view }) => post_view)
			: null
	};
}) satisfies PageLoad;
