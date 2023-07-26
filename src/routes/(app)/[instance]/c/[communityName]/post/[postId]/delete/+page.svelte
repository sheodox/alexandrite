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
		<BusyButton cl="danger" busy={$deleteState.busy} on:click={$deleteState.submit}>Delete</BusyButton>
		{#if !$deleteState.busy}
			<a class="button tertiary" href="/{$profile.instance}/post/{data.postView.post.id}">Cancel</a>
		{/if}
	</Stack>
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import Post from '$lib/feeds/posts/Post.svelte';
	import BusyButton from '$lib/BusyButton.svelte';
	import { createStatefulAction } from '$lib/utils.js';
	import { goto } from '$app/navigation';
	import type { HttpError } from '@sveltejs/kit';
	import { profile } from '$lib/profiles/profiles';

	$: client = $profile.client;
	$: jwt = $profile.jwt;

	export let data;

	$: deleteState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		try {
			await client.deletePost({
				auth: jwt,
				post_id: data.postView.post.id,
				// todo support un-deleting? comments can be undeleted, but
				// it seems you can't view a deleted post so not sure how you'd undelete a post
				deleted: true
			});
		} catch (e) {
			const status = (e as HttpError)?.status;
			// for some reason, a successful post delete gets a 404 (maybe because other APIs return
			// the updated data, but this is now gone thus 404?) so that is considered successful
			if (status && status !== 404) {
				// rethrow unexpected errors
				throw e;
			}
		}

		goto(`/${$profile.instance}/c/${data.communityName}`);
	});
</script>
