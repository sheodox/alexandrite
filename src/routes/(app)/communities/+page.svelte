<Layout size="medium">
	<h1>Communities</h1>

	<form method="GET" bind:this={filterForm} data-sveltekit-replacestate>
		<section>
			<Stack gap={4} align="center" cl="p-4" dir="r">
				<ToggleGroup
					options={ListingOptions(!!data.settings.username)}
					bind:selected={selectedListing}
					name="listing"
					on:change={submitForm}
				/>
				<select aria-label="Post Sort" bind:value={selectedSort} name="sort" required on:change={submitForm}>
					{#each PostSortOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>

				<button class="tertiary">Go <Icon icon="chevron-right" variant="icon-only" /></button>
			</Stack>
		</section>
	</form>

	<Grid gap={2} basis="22rem">
		{#each data.communities as cv}
			<CommunityCard communityView={cv} />
		{/each}
	</Grid>

	<InfiniteFeed
		on:more={more}
		{endOfFeed}
		{loadMoreFailed}
		{loading}
		feedEndMessage="No more communities"
		feedEndIcon="users-slash"
	/>
</Layout>

<script lang="ts">
	import { Stack, Icon, Grid, Layout } from 'sheodox-ui';
	import CommunityCard from './CommunityCard.svelte';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import { ListingOptions, PostSortOptions } from '$lib/feed-filters';
	import InfiniteFeed from '$lib/feeds/posts/InfiniteFeed.svelte';
	import type { CommunityView } from 'lemmy-js-client';
	import { postLoader } from '$lib/post-loader';

	export let data;

	const loader = postLoader<CommunityView>(
		`/api/communities?listing=${data.query.listing}&sort=${data.query.sort}`,
		'communities'
	);

	let filterForm: HTMLFormElement;
	let selectedListing = data.query.listing,
		selectedSort = data.query.sort,
		endOfFeed = false,
		loading = false,
		loadMoreFailed = false;

	function submitForm() {
		if (selectedListing && selectedSort) {
			filterForm.submit();
		}
	}

	async function more() {
		if (endOfFeed || loading) {
			return;
		}
		loading = true;

		const more = (await loader.next()).value;
		loadMoreFailed = more.error;
		endOfFeed = more.endOfFeed;

		data.communities = [
			...data.communities,
			...more.items.filter((p) => !data.communities.some((p2) => p2.community.id === p.community.id))
		];

		loading = false;
	}
</script>
