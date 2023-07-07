<svelte:head>
	<title>{fullTitle}</title>
</svelte:head>

<script lang="ts">
	import { getAppContext } from './app-context';

	export let title = '';

	const appName = 'Alexandrite';
	const { loggedIn, unreadCount } = getAppContext();

	$: fullTitle = (function () {
		const segments = [];
		if (loggedIn && $unreadCount > 0) {
			segments.push(`(${$unreadCount})`);
		}

		if (title) {
			segments.push(title);
		}

		segments.push(appName);
		return segments.join(' - ');
	})();
</script>
