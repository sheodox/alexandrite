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
		<Stack gap={1} dir="r" align="center">
			<Tooltip>
				<span slot="tooltip">{collapseMsg}</span>
				<button on:click={() => dispatch('collapse')} class="tertiary small m-0 mr-1">
					<Icon icon={collapsed ? 'chevron-right' : 'chevron-down'} variant="icon-only" />
					<span class="sr-only">{collapseMsg}</span>
				</button>
			</Tooltip>
			<UserLink user={commentView.creator} />
			<UserBadges user={commentView.creator} {postOP} />
			<span class="muted"> &centerdot; </span>
			<RelativeTime date={commentView.comment.published} />
		</Stack>
		{#if !collapsed}
			<div class="comment-content">
				<Markdown md={commentView.comment.content} />
			</div>
			<VoteButtons
				vote={commentView.my_vote}
				score={commentView.counts.score}
				dir="row"
				small
				on:vote={vote}
				{votePending}
			/>
		{/if}
	</Stack>
</section>

<script lang="ts">
	import { Stack, Tooltip, Icon } from 'sheodox-ui';
	import UserLink from './UserLink.svelte';
	import Markdown from './Markdown.svelte';
	import VoteButtons from './VoteButtons.svelte';
	import RelativeTime from './RelativeTime.svelte';
	import UserBadges from './feeds/posts/UserBadges.svelte';
	import type { CommentView } from 'lemmy-js-client';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		collapse: void;
	}>();

	export let commentView: CommentView;
	export let postOP: string;
	export let collapsed = false;
	let votePending = false;

	$: collapseMsg = collapsed ? 'Show comment' : 'Hide comment';

	async function vote(e: CustomEvent<number>) {
		votePending = true;
		const res = await fetch(`/api/comments/${commentView.comment.id}/vote`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				score: e.detail
			})
		});

		if (res.ok) {
			commentView = (await res.json()).commentView;
		}
		votePending = false;
	}
</script>
