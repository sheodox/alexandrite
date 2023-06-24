<h1 class="m-0">{name}<slot name="name" /></h1>
<Stack dir="r" gap={3}>
	{#each details as detail}
		<Tooltip>
			<span slot="tooltip">{detail.label}</span>
			<span class="muted">
				<Icon icon={detail.icon} />
			</span>
			<strong>{detail.value.toLocaleString()}</strong>
		</Tooltip>
	{/each}
</Stack>

<p class="has-inline-links">
	<Markdown md={description || ''} />
</p>

<script lang="ts">
	import { Stack, Tooltip, Icon } from 'sheodox-ui';
	import Markdown from '$lib/Markdown.svelte';

	export let view: { counts: { users: number; posts: number; comments: number } } | undefined = undefined;
	export let name = '';
	export let description: string;

	$: details = view?.counts
		? [
				{
					label: 'Users',
					icon: 'users',
					value: view.counts.users
				},
				{
					label: 'Posts',
					icon: 'file-lines',
					value: view.counts.posts
				},
				{
					label: 'Comments',
					icon: 'comments',
					value: view.counts.comments
				}
		  ]
		: [];
</script>
