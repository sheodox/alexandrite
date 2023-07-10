<Title title="Edit Post" />

<Breadcrumbs {links} linkifyLast />
<h1>Edit Post</h1>
<form bind:this={editForm}>
	<PostCompose
		errorMessage={form?.errMsg}
		submitting={$editState.busy}
		communityId={data.communityView.community.id}
		title={data.postView.post.name}
		content={data.postView.post.body}
		url={data.postView.post.url}
		postButtonText="Update"
	/>
</form>

<script lang="ts">
	import PostCompose from '$lib/PostCompose.svelte';
	import { Breadcrumbs } from 'sheodox-ui';
	import Title from '$lib/Title.svelte';
	import { createStatefulForm } from '$lib/utils.js';
	import { getLemmyClient } from '$lib/lemmy-client.js';
	import { goto } from '$app/navigation';

	const { client, jwt } = getLemmyClient();

	export let data;
	export let form;

	let editForm: HTMLFormElement;
	let errMsg = '';

	$: editState = createStatefulForm(editForm, async (body) => {
		const title = body.title as string,
			honeypot = body.honeypot as string;

		if (honeypot || !jwt) {
			return;
		}

		if (!title) {
			errMsg = 'Missing title';
			return;
		}

		const formFields = {
			name: title,
			body: body.content as string,
			url: (body.url as string) ? (body.url as string) : undefined,
			nsfw: body.nsfw === 'on',
			language_id: body.languageId ? Number(body.languageId) : undefined
		};

		try {
			// treat both Subscribed and Pending as the same
			await client.editPost({
				auth: jwt,
				post_id: Number(data.postView.post.id),
				...formFields
			});
		} catch (e) {
			errMsg = 'Error editing post:' + e;
			return;
		}

		goto(`/post/${data.postView.post.id}`);
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
			text: data.postView.post.name,
			href: `/post/${data.postView.post.id}`
		}
	];
</script>
