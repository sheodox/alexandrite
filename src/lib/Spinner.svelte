<style>
	@keyframes border-pulse {
		0% {
			border-top-color: transparent;
			border-right-color: transparent;
			border-bottom-color: transparent;
			border-left-color: transparent;
			border-left-color: currentColor;
		}
		25% {
			border-top-color: transparent;
			border-right-color: transparent;
			border-bottom-color: transparent;
			border-left-color: transparent;
			border-bottom-color: currentColor;
		}
		50% {
			border-top-color: transparent;
			border-right-color: transparent;
			border-bottom-color: transparent;
			border-left-color: transparent;
			border-right-color: currentColor;
		}
		75% {
			border-top-color: transparent;
			border-right-color: transparent;
			border-bottom-color: transparent;
			border-left-color: transparent;
			border-top-color: currentColor;
		}
		100% {
			border-top-color: transparent;
			border-right-color: transparent;
			border-bottom-color: transparent;
			border-left-color: transparent;
			border-left-color: currentColor;
		}
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	div {
		animation: border-pulse 1s linear infinite, spin 8s linear infinite;
		border: 0.15em solid transparent;
		height: 1em;
		width: 1em;
		content: ' ';
		border-radius: 100%;
	}
</style>

<div />

<script lang="ts">
	import { Icon } from 'sheodox-ui';
</script>
