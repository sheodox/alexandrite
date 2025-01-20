<style>
	.sidebar :global(img) {
		border-radius: 10px;
	}
	h1 {
		font-size: var(--sx-font-size-4);
		margin: 0;
		color: var(--sx-gray-100);
	}
	h2 {
		font-size: var(--sx-font-size-7);
		margin-top: 0;
	}
</style>

<article class="sidebar">
	{#if bannerImageSrc}
		<Image src={bannerImageSrc} />
	{/if}
	<h1>{context}</h1>
	<h2><slot name="name" /></h2>

	{#if counts}
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
	{/if}
	<slot name="actions" />

	{#if description}
		<p class="has-inline-links">
			<Accordion bind:open={descriptionOpen}>
				<span slot="title"><Icon icon="info-circle" /> Description</span>
				<Markdown md={description || ''} />
				{#if sidebar}
					<p class="has-inline-links">
						<Markdown md={sidebar || ''} />
					</p>
				{/if}
			</Accordion>
		</p>
	{/if}

	<slot name="end" />
</article>

<script lang="ts">
	import { Stack, Tooltip, Icon, Accordion } from 'sheodox-ui';
	import Markdown from '$lib/Markdown.svelte';
	import Image from './Image.svelte';

	export let counts: { label: string; icon: string; value: number | string }[] = [];
	export let description: string;
	export let sidebar = '';
	export let bannerImageSrc = '';
	// the kind of sidebar this is, to make it more obvious if the community/instance
	// name isn't descriptive enough
	export let context: string;

	export let descriptionOpen = true;
</script>
