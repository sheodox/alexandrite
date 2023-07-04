<svelte:head>
	<title>{fullTitle}</title>
</svelte:head>

<script lang="ts">
	export let title = '';

	const appName = 'Alexandrite';

	$: fullTitle = title ? title + ' - ' + appName : appName;
</script>
