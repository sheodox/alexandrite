<style>
	.container {
		width: 50rem;
		max-width: 100%;
		margin: 0 auto;
	}
	.card {
		border: 1px solid var(--sx-gray-transparent);
	}
</style>

{#if $postPreviewLayout === 'CARD'}
	<div class="container pb-4">
		<div class="card comment-card mx-2 p-2">
			<slot />
		</div>
	</div>
{:else}
	<slot />
{/if}
{#if !lastOfList && $postPreviewLayout !== 'CARD'}
	<hr class="w-100" />
{/if}

<script lang="ts">
	import { getSettingsContext } from '$lib/settings-context';

	export let lastOfList: boolean;

	const { postPreviewLayout } = getSettingsContext();
</script>
