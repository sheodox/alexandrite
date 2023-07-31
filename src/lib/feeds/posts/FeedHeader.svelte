<style>
	.feed-avatar :global(img) {
		height: 6rem;
		width: 6rem;
		border-radius: 100rem;
		object-fit: cover;
	}
	.feed-header {
		background: var(--sx-gray-800);
	}
</style>

<section class="p-8 feed-header">
	<Stack gap={2} dir="c">
		<Stack dir="r" gap={6} align="center">
			{#if icon}
				<div class="feed-avatar">
					<Image src={icon} />
				</div>
			{/if}
			<Stack dir="c" gap={2}>
				<h1 class="mb-2"><slot name="name" /></h1>
				<Stack dir="r" align="center">
					<slot name="actions" />
				</Stack>
				<Stack gap={2} dir="r" align="center">
					<span class="sx-badge-gray"
						><Icon icon="cake-candles" /> Since {dateFormatter.format(parseISO(published + 'Z'))}</span
					>

					<slot name="badges" />
				</Stack>
			</Stack>
		</Stack>
	</Stack>
</section>

<script lang="ts">
	import { parseISO } from 'date-fns';
	import { Stack, Icon } from 'sheodox-ui';
	import Image from '$lib/Image.svelte';

	const dateFormatter = new Intl.DateTimeFormat('en', {
		dateStyle: 'medium'
	});

	export let published: string;
	export let icon: string;
</script>
