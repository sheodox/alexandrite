<svelte:head>
	<title>{fullTitle}</title>
</svelte:head>

<script lang="ts">
	import { writable } from 'svelte/store';
	import { getAppContext } from './app-context';
	import { profile } from '$lib/profiles/profiles';

	export let title = '';

	const appName = 'Alexandrite';
	// this is used sometimes where we don't have an app context, need a fallback
	const { unreadCount } = getAppContext() || { loggedIn: false, unreadCount: writable(0) };

	$: fullTitle = (function () {
		const segments = [];
		if ($profile.loggedIn && $unreadCount > 0) {
			segments.push(`(${$unreadCount})`);
		}

		if (title) {
			segments.push(title);
		}

		segments.push(appName);
		return segments.join(' - ');
	})();
</script>
