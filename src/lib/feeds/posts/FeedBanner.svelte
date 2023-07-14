<style>
	.feed-banner {
		height: 20rem;
	}
</style>

<section class="feed-banner f-row justify-content-center">
	<Stack dir="c" align="center" justify="center" cl="f-1">
		<p class="m-0 sx-font-size-12">
			{#if loading}
				<Spinner />
			{:else}
				<Icon {icon} />
			{/if}
		</p>
		<p class="m-0 sx-font-size-6">{message}</p>
		<slot />
	</Stack>
</section>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import Spinner from '$lib/Spinner.svelte';

	export let message: string;
	export let icon: string;
	export let loading = false;
</script>
