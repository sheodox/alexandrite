import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { defaultInstance } from '$lib/profiles/profiles';

export const load = (async () => {
	const instance = get(defaultInstance);
	throw redirect(303, `/${instance}`);
}) satisfies PageLoad;
