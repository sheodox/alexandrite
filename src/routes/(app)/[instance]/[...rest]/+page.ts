import { redirect } from '@sveltejs/kit';
import type { PageLoad } from '../$types';
import { defaultInstance } from '$lib/profiles/profiles';
import { get } from 'svelte/store';

export const load = (async ({ params, url }) => {
	// if the user is directly going to a page without an instance param, try redirecting them to the default instance
	if (isInstancelessInstanceRoute(params.instance)) {
		const instance = get(defaultInstance);
		throw redirect(303, `/${instance}${url.pathname}${url.search}`);
	}
}) satisfies PageLoad;

function isInstancelessInstanceRoute(instanceParam: string) {
	return ['c', 'comment', 'communities', 'inbox', 'message', 'post', 'reports', 'search', 'settings', 'u'].some(
		(instanceRouteFirstPart) => {
			return instanceParam === instanceRouteFirstPart;
		}
	);
}
