<FloatingNavContainer justify="end">
	<FloatingNav>
		<IconButton text="Refresh" icon="arrows-rotate" cl="tertiary" on:click={() => dispatch('refresh')} />
	</FloatingNav>
</FloatingNavContainer>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import FloatingNav from './FloatingNav.svelte';
	import FloatingNavContainer from './FloatingNavContainer.svelte';
	import IconButton from './IconButton.svelte';

	const dispatch = createEventDispatcher<{
		refresh: void;
	}>();
</script>
