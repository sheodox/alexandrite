{#if hasEmbedText}
	<div class="card m-0 p-2">
		<h2 class="card-title m-0">
			{postView.post.embed_title}
		</h2>
		<div class="card-body">
			{#if postView.post.url}
				<PrettyExternalLink href={postView.post.url} />
			{/if}
			<p>
				{postView.post.embed_description ?? ''}
			</p>
		</div>
	</div>
{/if}

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import PrettyExternalLink from '$lib/PrettyExternalLink.svelte';

	export let postView: PostView;

	$: hasEmbedText = !!postView.post.embed_title;
</script>
