import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { instance } from '$lib/profiles/profiles';

export const load = (async () => {
	const inst = get(instance);
	throw redirect(303, `/${inst}`);
}) satisfies PageLoad;
