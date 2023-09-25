<style lang="scss">
	.feed-avatar :global(img) {
		height: 6rem;
		width: 6rem;
		border-radius: 100rem;
		object-fit: cover;
	}
	.feed-header {
		background: var(--sx-gray-800);
	}
	.feed-avatar {
		// don't let the image get squished
		flex-shrink: 0;
	}

	@media (max-width: 600px) {
		.feed-avatar :global(img) {
			height: 4rem;
			width: 4rem;
		}
	}
</style>

<section class="{narrow ? 'p-3' : 'p-8'} feed-header">
	<Stack gap={2} dir="c">
		<Stack dir="r" gap={narrow ? 3 : 6} align="center">
			{#if icon}
				<div class="feed-avatar">
					<Image src={icon} />
				</div>
			{/if}
			<Stack dir="c" gap={2} cl="f-1">
				<h1 class="mb-2"><slot name="name" /></h1>
				<Stack dir="r" align="center" cl="f-1">
					<slot name="actions" />
				</Stack>
				<Stack gap={2} dir="r" align="center">
					<span class="sx-badge-gray"
						><Icon icon="cake-candles" /> Since {dateFormatter.format(parseDate(published))}</span
					>

					<slot name="badges" />
				</Stack>
			</Stack>
		</Stack>
	</Stack>
</section>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import Image from '$lib/Image.svelte';
	import { getAppContext } from '$lib/app-context';
	import { parseDate } from '$lib/utils';

	const dateFormatter = new Intl.DateTimeFormat('en', {
		dateStyle: 'medium'
	});

	const { screenDimensions } = getAppContext();

	export let published: string;
	export let icon: string;

	$: narrow = $screenDimensions.width < 600;
</script>
