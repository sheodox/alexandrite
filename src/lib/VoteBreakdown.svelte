<style lang="scss">
	.votes-up,
	.positive {
		:global(.sx-theme-dark) & {
			color: hsl(var(--upvote-hue), 85%, 70%) !important;
		}
		:global(.sx-theme-light) & {
			color: hsl(var(--upvote-hue), 85%, 50%) !important;
		}
	}
	.votes-down,
	.negative {
		:global(.sx-theme-dark) & {
			color: hsl(var(--downvote-hue), 85%, 70%) !important;
		}
		:global(.sx-theme-light) & {
			color: hsl(var(--downvote-hue), 85%, 50%) !important;
		}
	}
</style>

<Tooltip>
	<Stack dir="c" gap={1} slot="tooltip">
		<span class="sx-badge-gray m-0 votes-up">
			<Icon icon="arrow-up" />
			{upvotes}
			<span class="sr-only">Upvotes</span>
		</span>
		<span class="sx-badge-gray m-0 votes-down">
			<Icon icon="arrow-down" />
			{downvotes}
			<span class="sr-only">Downvotes</span>
		</span>
	</Stack>

	<!-- add a sign for positive numbers -->
	<span class="sx-badge-gray {score > 0 ? 'positive' : 'negative'}"
		>{score > 0 ? '+' : ''}{score}
		<Icon icon={reaction} />
	</span>
</Tooltip>

<script lang="ts">
	import { Stack, Icon, Tooltip } from 'sheodox-ui';
	export let score: number;
	export let upvotes: number;
	export let downvotes: number;

	$: reaction = (function () {
		if (score === 0) {
			return 'face-meh';
		}
		if (score < 0) {
			return 'arrow-down';
		}

		return 'arrow-up';
	})();
</script>
