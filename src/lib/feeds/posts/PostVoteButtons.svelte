<VoteButtons
	vote={postView.my_vote}
	upvotes={postView.counts.upvotes}
	downvotes={postView.counts.downvotes}
	score={postView.counts.score}
	{dir}
	{small}
	on:vote={(e) => $voteState.submit(e.detail)}
	votePending={$voteState.busy}
/>

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import VoteButtons from '$lib/VoteButtons.svelte';
	import type { createStatefulAction } from '$lib/utils';

	export let dir: 'row' | 'column' = 'column';
	export let postView: PostView;
	export let voteState: ReturnType<typeof createStatefulAction<number>>;
	export let small = false;
</script>
