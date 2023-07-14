<Stack align="center" dir="c" justify="center" cl="f-1	">
	<p class="sx-font-size-12 m-0">
		<Icon icon="bug" />
	</p>
	<p class="sx-font-size-6">
		{$page.error?.message}
	</p>
	<button class="primary" on:click={() => invalidateAll()}>
		<Icon icon="rotate" />
		Reload
	</button>
</Stack>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
</script>
