<FloatingNavContainer justify="end">
	<FloatingNav>
		<slot name="top" slot="top" />
		<slot name="prepend" slot="prepend" />
		<IconButton text="Refresh" icon="arrows-rotate" cl="tertiary" on:click={() => dispatch('refresh')} />
		<slot name="append" slot="append" />
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
