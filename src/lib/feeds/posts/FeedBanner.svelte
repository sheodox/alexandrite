<style>
	.feed-banner {
		height: 20rem;
	}
</style>

<section class="feed-banner f-row justify-content-center">
	<Stack dir="c" align="center" justify="center" cl="f-1">
		<p class="m-0 sx-font-size-12"><Icon {icon} variant="icon-only" /></p>
		<p class="m-0 sx-font-size-6">{message}</p>
		<slot />
	</Stack>
</section>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	export let message: string;
	export let icon: string;
</script>
