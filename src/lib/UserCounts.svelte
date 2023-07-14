<Stack dir="c" gap={2}>
	{#each counts as count}
		<Stack dir="r" gap={2} align="center">
			<strong>{count.count.toLocaleString()}</strong>
			<span class="muted">{count.label}</span>
			<strong>{count.score.toLocaleString()}</strong>
			<Icon icon="trophy" />
		</Stack>
	{/each}
</Stack>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import type { PersonView } from 'lemmy-js-client';

	export let personView: PersonView;

	$: counts = [
		{
			label: personView.counts.post_count === 1 ? 'Post' : 'Posts',
			score: personView.counts.post_score,
			count: personView.counts.post_count,
			icon: 'file-lines'
		},
		{
			label: personView.counts.comment_count === 1 ? 'Comment' : 'Comments',
			score: personView.counts.comment_score,
			count: personView.counts.comment_count,
			icon: 'comments'
		}
	];
</script>
