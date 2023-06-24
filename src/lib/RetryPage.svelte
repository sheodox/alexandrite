<Stack align="center" dir="c" justify="center" cl="f-1	">
	<p class="sx-font-size-12">
		<Icon icon="bug" />
	</p>
	<p class="sx-font-size-6">
		{message?.text || `Error: Status ${$page.status}`}
	</p>
	{#if message?.retry}
		<button class="primary" on:click={() => invalidateAll()}>
			<Icon icon="circle-arrow" />
			Retry
		</button>
	{/if}
</Stack>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';

	$: message = {
		'404': { text: 'Page not found.', retry: false },
		'500': { text: 'Page not found.', retry: true }
	}[$page.status];
</script>
