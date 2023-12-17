<Stack dir="c" gap={2}>
	{#each counts as count}
		<Stack dir="r" gap={2} align="center">
			<strong>{count.count.toLocaleString()}</strong>
			<span class="muted">{count.label}</span>
		</Stack>
	{/each}
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import type { PersonView } from 'lemmy-js-client';

	export let personView: PersonView;

	$: counts = [
		{
			label: personView.counts.post_count === 1 ? 'Post' : 'Posts',
			count: personView.counts.post_count,
			icon: 'file-lines'
		},
		{
			label: personView.counts.comment_count === 1 ? 'Comment' : 'Comments',
			count: personView.counts.comment_count,
			icon: 'comments'
		}
	];
</script>
