<style>
	svg {
		width: var(--logo-size);
		height: var(--logo-size);
	}
	svg.tiny {
		--logo-size: 1.5em;
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
	export let size: 'tiny' | 'small' | 'medium' | 'large' = 'small';
</script>
