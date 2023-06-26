<style>
	.sidebar :global(img) {
		border-radius: 10px;
	}
</style>

<article class="sidebar">
	{#if bannerImageSrc}
		<Image src={bannerImageSrc} />
	{/if}
	<h1><slot name="name" /></h1>

	<Stack dir="r" gap={3}>
		{#each counts as count}
			<Tooltip>
				<span slot="tooltip">{count.label}</span>
				<span class="muted">
					<Icon icon={count.icon} />
				</span>
				<strong>{count.value.toLocaleString()}</strong>
			</Tooltip>
		{/each}
	</Stack>

	{#if description}
		<p class="has-inline-links">
			<Markdown md={description || ''} />
		</p>
	{/if}

	{#if sidebar}
		<p class="has-inline-links">
			<Markdown md={sidebar || ''} />
		</p>
	{/if}
</article>

<script lang="ts">
	import { Stack, Tooltip, Icon } from 'sheodox-ui';
	import Markdown from '$lib/Markdown.svelte';
	import Image from './Image.svelte';

	export let counts: { label: string; icon: string; value: number }[] = [];
	export let description: string;
	export let sidebar = '';
	export let bannerImageSrc = '';
</script>
