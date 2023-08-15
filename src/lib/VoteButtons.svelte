<style lang="scss">
	button {
		color: var(--sx-gray-200);
	}
	.vote-up:enabled {
		&:hover,
		&[aria-pressed='true'] {
			:global(.sx-theme-dark) & {
				color: hsl(var(--upvote-hue), 85%, 70%);
			}
			:global(.sx-theme-light) & {
				color: hsl(var(--upvote-hue), 85%, 50%);
			}
		}
	}
	.vote-down:enabled {
		&:hover,
		&[aria-pressed='true'] {
			:global(.sx-theme-dark) & {
				color: hsl(var(--downvote-hue), 85%, 70%);
			}
			:global(.sx-theme-light) & {
				color: hsl(var(--downvote-hue), 85%, 50%);
			}
		}
	}
	.vote-counter {
		height: 1.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 3em;
		border-radius: 5px;

		.voted--1 & {
			color: hsl(var(--downvote-hue), 85%, 70%);
		}
		.voted-1 & {
			color: hsl(var(--upvote-hue), 85%, 70%);
		}
	}
	.icon {
		width: 1em;
	}
</style>

<div class="vote-buttons {dir === 'row' ? 'f-row' : 'f-column'} align-items-center voted-{vote}">
	<button
		aria-pressed={votedUp}
		class="vote-up"
		class:small
		on:click={() => voteAs(1)}
		disabled={!loggedIn || votePending}
		use:ripple
	>
		<span class="sr-only">Vote up</span>
		<div class="icon">
			<Icon icon="arrow-up" />
		</div>
	</button>
	{#if $profile.settings.show_scores}
		<Tooltip>
			<span slot="tooltip">
				<Icon icon="arrow-up" /><span class="sr-only">Up:</span>
				{upvotes}
				<Icon icon="arrow-down" /><span class="sr-only">Down:</span>
				{downvotes}
			</span>
			<span class="vote-counter text-align-center align-self-center responsive-text fw-bold">
				{#if votePending}
					<Spinner />
				{:else}
					{score}
					<span class="sr-only">score</span>
				{/if}
			</span>
		</Tooltip>
	{/if}
	{#if $siteMeta.site_view.local_site.enable_downvotes}
		<button
			aria-pressed={votedDown}
			class="vote-down"
			class:small
			on:click={() => voteAs(-1)}
			disabled={!loggedIn || votePending}
			use:ripple
		>
			<span class="sr-only">Vote up</span>
			<div class="icon">
				<Icon icon="arrow-down" />
			</div>
		</button>
	{/if}
</div>

<script lang="ts">
	import { Icon, Tooltip, ripple } from 'sheodox-ui';
	import { createEventDispatcher } from 'svelte';
	import Spinner from './Spinner.svelte';
	import { profile } from './profiles/profiles';
	import { getAppContext } from './app-context';

	const dispatch = createEventDispatcher<{
		vote: number;
	}>();

	$: loggedIn = $profile.loggedIn;
	const { siteMeta } = getAppContext();

	export let vote = 0;
	export let score = 0;
	export let upvotes = 0;
	export let downvotes = 0;
	export let small = false;
	export let dir: 'row' | 'column' = 'row';
	export let votePending = false;

	$: votedUp = vote === 1;
	// no vote is 0
	$: votedDown = vote === -1;

	function voteAs(clickedVote: number) {
		const newVote = vote === clickedVote ? 0 : clickedVote;
		dispatch('vote', newVote);
	}
</script>
