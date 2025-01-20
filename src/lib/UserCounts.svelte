{#each counts as count}
	<li class="sx-list-item two-columns">
		<span class="column">{count.label}</span>
		<strong class="column text-align-right">{count.count.toLocaleString()}</strong>
	</li>
{/each}

<script lang="ts">
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
