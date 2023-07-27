<Title title="Post" />

<Breadcrumbs {links} />
<h1>Post</h1>
<form bind:this={formElement}>
	<PostCompose errorMessage={errMsg} submitting={$postState.busy} communityId={data.communityView.community.id} />
</form>

<script lang="ts">
	import PostCompose from '$lib/PostCompose.svelte';
	import { Breadcrumbs } from 'sheodox-ui';
	import Title from '$lib/Title.svelte';
	import { createStatefulForm } from '$lib/utils.js';
	import { goto } from '$app/navigation';
	import { profile } from '$lib/profiles/profiles';

	$: client = $profile.client;
	$: jwt = $profile.jwt;

	export let data;
	let errMsg = '';

	let formElement: HTMLFormElement;

	$: postState = createStatefulForm(formElement, async (body) => {
		const title = body.title as string,
			honeypot = body.honeypot as string;

		if (honeypot || !jwt) {
			return;
		}

		if (!title) {
			errMsg = 'Missing title';
			return;
		}

		// treat both Subscribed and Pending as the same
		const postRes = await client.createPost({
			auth: jwt,
			// tricks bots by submitting an empty string, just doing what lemmy-ui is doing
			honeypot,
			community_id: Number(body.communityId),
			name: title,
			body: body.content as string,
			url: (body.url as string) ? (body.url as string) : undefined,
			nsfw: body.nsfw === 'on',
			language_id: body.languageId ? Number(body.languageId) : undefined
		});

		goto(`/${$profile.instance}/post/${postRes.post_view.post.id}`);
	});

	$: links = [
		{
			text: 'Home',
			href: '/'
		},
		{
			text: data.communityName,
			href: `/c/${data.communityName}/`
		},
		{
			text: 'Post'
		}
	];
</script>
