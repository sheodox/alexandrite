<style>
	.community-header {
		border-radius: 20px;
		overflow: hidden;
	}
	.dn {
		display: none;
	}
	button {
		width: 8rem;
	}
</style>

<Title title="Post" />

<Layout size="medium">
	<div class="community-header my-2">
		<CommunityHeader communityView={data.communityView} readonly />
	</div>
	<Breadcrumbs {links} />
	<h1>Post</h1>
	<form method="POST" action="?/post" use:enhance on:submit={() => (submitting = true)}>
		<Stack dir="c" gap={2}>
			{#if form?.errMsg}
				<Alert variant="error">{form.errMsg}</Alert>
			{/if}
			<input name="communityId" value={data.communityView.community.id} type="hidden" />
			<input name="honeypot" value="" class="dn" />
			<TextInput name="title" bind:value={title}>Title</TextInput>
			<TextInput name="url" value="">URL</TextInput>
			<div class="ml-1">
				<Checkbox name="nsfw" {disabled}>NSFW</Checkbox>
			</div>
			<Stack dir="c" cl="mt-2">
				<CommentEditor {submitting} label="Body" showSubmit={false} />
			</Stack>

			<Stack dir="r" justify="end">
				<button class="primary" disabled={!title}>Post</button>
			</Stack>
		</Stack>
	</form>
</Layout>

<script>
	import { enhance } from '$app/forms';
	import CommunityHeader from '$lib/feeds/posts/CommunityHeader.svelte';
	import CommentEditor from '$lib/CommentEditor.svelte';
	import { Alert, Layout, Stack, Breadcrumbs, Checkbox, TextInput } from 'sheodox-ui';
	import Title from '$lib/Title.svelte';

	export let data;
	export let form;

	let submitting = false,
		title = '';
	$: disabled = submitting;

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
