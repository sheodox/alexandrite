{#if mode === 'list' && $postListLayoutContentPreview}
	<PostEmbed {postView} preview reflectRead />
	<PostBody {postView} preview reflectRead dedupeEmbed />
{/if}

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import PostEmbed from '../PostEmbed.svelte';
	import PostBody from './PostBody.svelte';
	import { getSettingsContext } from '$lib/settings-context';

	export let mode: 'show' | 'list' = 'list';
	export let postView: PostView;

	const { postListLayoutContentPreview } = getSettingsContext();
</script>
