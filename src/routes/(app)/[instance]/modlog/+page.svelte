<style>
	a,
	button {
		min-width: 6rem;
		text-align: center;
	}
</style>

<Layout size="narrow">
	<Stack dir="c" gap={4}>
		<h1 class="mb-0">Modlog</h1>

		<Alert variant="warning">
			Are you sure you want to view the modlog{#if data.communityName}
				{' '}for <strong>/c/{data.communityName}</strong>{/if}? Some deleted posts may contain disturbing or adult
			material. Proceed with caution.
		</Alert>
		<Stack dir="r" gap={2} justify="center">
			<button class="tertiary" on:click={() => history.back()}>No</button>
			<a class="button danger" href="/{$profile.instance}/modlog/view{location.search}">Yes</a>
		</Stack>
		<p class="m-0 text-align-center">
			You can disable this warning in the <a href="/{$profile.instance}/settings" class="inline-link">settings</a>.
		</p>
	</Stack>
</Layout>

<script lang="ts">
	import { Alert, Layout, Stack } from 'sheodox-ui';
	import { profile } from '$lib/profiles/profiles';
	export let data;
</script>
