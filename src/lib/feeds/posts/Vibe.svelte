<style lang="scss">
	.vibes {
		font-weight: bold;
	}
	.vibes.good {
		color: var(--sx-green-400);
	}
	.vibes.bad {
		color: var(--sx-red-400);
	}
</style>

<span class="vibes" class:good class:bad>{score}</span>

<script lang="ts">
	export let score: number;

	$: good = score > 0;
	$: bad = score <= 0;
</script>
