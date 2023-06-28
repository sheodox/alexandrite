<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	div :global(i) {
		animation: spin 0.5s linear infinite;
	}
</style>

<div>
	<Icon icon="circle-notch" variant="icon-only" />
</div>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
</script>
