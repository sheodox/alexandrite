<style>
	svg {
		width: var(--logo-size);
		height: var(--logo-size);
	}
	svg.small {
		--logo-size: 2rem;
	}
	svg.medium {
		--logo-size: 3rem;
	}
	svg.large {
		--logo-size: 5rem;
	}
</style>

<svg viewBox="0 0 100 100" class={size}>
	<image xlink:href="/logo.svg" />
</svg>

<script lang="ts">
	export let size: 'small' | 'medium' | 'large' = 'small';
</script>
