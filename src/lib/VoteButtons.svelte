<style>
	button {
		color: var(--sx-gray-200);
	}
	.vote-up:enabled:hover {
		color: var(--sx-pink-500);
	}
	.vote-up[aria-pressed='true'] {
		color: var(--sx-pink-400);
	}
	.vote-down:enabled:hover {
		color: var(--sx-blue-500);
	}
	.vote-down[aria-pressed='true'] {
		color: var(--sx-blue-400);
	}
	.vote-counter {
		height: 1.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 3em;
	}
	.icon {
		width: 1em;
	}
</style>

<div class="{dir === 'row' ? 'f-row' : 'f-column'} align-items-center">
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
			<span class="vote-counter sx-badge-{counterColor} text-align-center align-self-center responsive-text">
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

	$: counterColor = {
		'-1': 'blue',
		'0': 'gray',
		'1': 'pink'
	}[vote ?? 0];

	function voteAs(clickedVote: number) {
		const newVote = vote === clickedVote ? 0 : clickedVote;
		dispatch('vote', newVote);
	}
</script>
