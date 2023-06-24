<style>
	.comment-content :global(:not(:last-of-type)) {
		margin-top: 0;
		margin-bottom: 0.4rem;
	}
	.comment-content :global(:last-child) {
		margin: 0;
	}
	.comment-content {
		max-width: 60rem;
	}
	section :global(img) {
		max-width: 100%;
	}
</style>

<section>
	<Stack gap={2} dir="c">
		<Stack gap={2} dir="r" align="center">
			<UserLink user={commentView.creator} />
			<UserBadges user={commentView.creator} {postOP} />
			<span class="muted">
				&centerdot;
				<RelativeTime date={commentView.comment.published} />
			</span>
		</Stack>
		<div class="comment-content">
			<Markdown md={commentView.comment.content} />
		</div>
		<VoteButtons vote={commentView.my_vote} score={commentView.counts.score} dir="row" small />
	</Stack>
</section>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import UserLink from './UserLink.svelte';
	import Markdown from './Markdown.svelte';
	import VoteButtons from './VoteButtons.svelte';
	import RelativeTime from './RelativeTime.svelte';
	import UserBadges from './feeds/posts/UserBadges.svelte';
	import type { CommentView } from 'lemmy-js-client';

	export let commentView: CommentView;
	export let postOP: string;

	console.log(commentView);
</script>
