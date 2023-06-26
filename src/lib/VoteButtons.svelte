<style>
	button {
		color: var(--sx-gray-200);
	}
	.vote-up:hover {
		color: var(--sx-pink-500);
	}
	.vote-up[aria-pressed='true'] {
		color: var(--sx-pink-400);
	}
	.vote-down:hover {
		color: var(--sx-blue-500);
	}
	.vote-down[aria-pressed='true'] {
		color: var(--sx-blue-400);
	}
</style>

<div class={dir === 'row' ? 'f-row' : 'f-column'}>
	<button aria-pressed={votedUp} class="vote-up" class:small>
		<span class="sr-only">Vote up</span>
		<Icon icon="arrow-up" variant="icon-only" />
	</button>
	<span class="sx-badge-{counterColor} text-align-center align-self-center">
		{score}
		<span class="sr-only">score</span>
	</span>
	<button aria-pressed={votedDown} class="vote-down" class:small>
		<span class="sr-only">Vote up</span>
		<Icon icon="arrow-down" variant="icon-only" />
	</button>
</div>

<script lang="ts">
	import { Icon } from 'sheodox-ui';

	export let vote = 0;
	export let score = 0;
	export let small = false;
	export let dir: 'row' | 'column' = 'row';

	$: votedUp = vote === 1;
	// no vote is 0
	$: votedDown = vote === -1;

	$: counterColor = {
		'-1': 'blue',
		'0': 'gray',
		'1': 'pink'
	}[vote ?? 0];
</script>
