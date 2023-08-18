<style>
	.card {
		border: 1px solid var(--sx-gray-transparent);
	}
	.preview {
		max-height: 10rem;
		overflow: hidden;
	}
	div.read {
		color: var(--sx-muted);
	}
</style>

{#if hasEmbedText}
	<div class="m-0 card embed-preview responsive-text" class:read={read && reflectRead} class:preview>
		<Stack dir="c" gap={1} cl="card-body">
			{#if title}
				<span class="muted fw-bold embed-title-hint">
					<span class="muted">
						<Icon icon="quote-left" />
					</span>
					{title}
				</span>
			{/if}
			{#if externalLink}
				<PrettyExternalLink href={externalLink} />
			{/if}
			{description ?? ''}
			<slot />
		</Stack>
	</div>
{/if}

<script lang="ts">
	import { Icon, Stack } from 'sheodox-ui';
	import PrettyExternalLink from '$lib/PrettyExternalLink.svelte';

	export let title: string | undefined = undefined;
	export let description: string | undefined = undefined;
	export let externalLink: string | undefined = undefined;
	export let read = false;
	// if the text should be dimmed if the post has been read
	export let reflectRead = false;
	// if this is meant to just be a preview of the embed content, sets a max height
	export let preview = false;

	$: hasEmbedText = title || description;
</script>
