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
	.fr {
		float: right;
	}
</style>

{#if postAssertions.has.body && (!dedupeEmbed || postView.post.body !== postView.post.embed_description)}
	<div class="card m-0">
		<div class="card-body embed-preview responsive-text" class:read={postView.read && reflectRead} class:preview>
			{#if !preview}
				<div class="fr">
					<IconButton
						on:click={() => (viewSource = !viewSource)}
						small
						icon="code"
						text={(viewSource ? 'Hide' : 'View') + ' Source'}
						cl="tertiary"
					/>
				</div>
			{/if}
			<Markdown noImages={preview} md={postView.post.body ?? ''} {viewSource} />
		</div>
	</div>
{/if}

<script lang="ts">
	import IconButton from '$lib/IconButton.svelte';
	import Markdown from '$lib/Markdown.svelte';
	import type { PostView } from 'lemmy-js-client';
	import { makePostAssertions } from '../post-utils';

	export let postView: PostView;
	export let preview = false;
	// if the post body matches the embed description, don't show the post body
	export let dedupeEmbed = false;
	// if the text should be dimmed if the post has been read
	export let reflectRead = false;

	let viewSource = false;

	$: postAssertions = makePostAssertions(postView);
</script>
