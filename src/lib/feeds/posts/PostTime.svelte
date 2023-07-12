<RelativeTime date={postView.post.published} />
{#if postView.post.updated && postView.post.updated !== postView.post.published}
	<RelativeTime date={postView.post.updated} variant="icon" icon="edit" verb="Edited" />
{/if}

<script lang="ts">
	import RelativeTime from '$lib/RelativeTime.svelte';
	import type { PostView } from 'lemmy-js-client';

	export let postView: PostView;
</script>
