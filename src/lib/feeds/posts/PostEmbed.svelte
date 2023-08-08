<style>
	.card {
		border: 1px solid var(--sx-gray-transparent);
	}
</style>

{#if hasEmbedText}
	<div class="card p-2 f-column gap-2">
		<h2 class="m-0 sx-font-size-5">
			{postView.post.embed_title}
		</h2>
		<p class="m-0">
			{#if postView.post.url}
				<PrettyExternalLink href={postView.post.url} />
			{/if}
		</p>
		{#if postView.post.embed_description}
			<p class="m-0">
				<span class="muted">
					<Icon icon="quote-left" />
				</span>
				{postView.post.embed_description}
			</p>
		{/if}
	</div>
{/if}

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import type { PostView } from 'lemmy-js-client';
	import PrettyExternalLink from '$lib/PrettyExternalLink.svelte';

	export let postView: PostView;

	$: hasEmbedText = !!postView.post.embed_title;
</script>
