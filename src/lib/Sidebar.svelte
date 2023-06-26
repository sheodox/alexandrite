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

<p class="has-inline-links">
	<Markdown md={description || ''} />
</p>

<script lang="ts">
	import { Stack, Tooltip, Icon } from 'sheodox-ui';
	import Markdown from '$lib/Markdown.svelte';

	export let counts: { label: string; icon: string; value: number }[] = [];
	export let description: string;
</script>
