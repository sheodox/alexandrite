<style>
	h1,
	p {
		margin: 0;
	}
</style>

<Stack dir="c" gap={4}>
	<div class="card">
		<Post postView={data.postView} readOnly />
	</div>

	<h1>Delete Post</h1>

	<p>Are you sure you want to delete this post?</p>

	<Stack dir="r" gap={2}>
		<form use:enhance method="POST" action="?/deletePost" on:submit={() => (submitting = true)}>
			<button class="danger f-row gap-2" disabled={submitting}>
				{#if submitting}
					<Spinner />
				{/if}
				Delete</button
			>
		</form>
		{#if !submitting}
			<a class="button tertiary" href="/post/{data.postView.post.id}">Cancel</a>
		{/if}
	</Stack>
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import Post from '$lib/feeds/posts/Post.svelte';
	import Spinner from '$lib/Spinner.svelte';
	import { enhance } from '$app/forms';

	export let data;

	let submitting = false;
</script>
