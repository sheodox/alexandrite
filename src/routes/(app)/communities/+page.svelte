<Title title="Communities" />
<Layout size="medium">
	<h1>Communities</h1>

	<form method="GET" data-sveltekit-replacestate>
		<section>
			<Stack gap={4} align="center" cl="p-4" dir="r">
				<ToggleGroup options={ListingOptions(!!data.settings.username)} selected={data.query.listing} name="listing" />
				<select aria-label="Post Sort" value={data.query.sort} name="sort" required>
					{#each PostSortOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>

				<button class="tertiary">Go <Icon icon="chevron-right" variant="icon-only" /></button>
			</Stack>
		</section>
	</form>

	<VirtualFeed
		on:more={more}
		feedSize={communities.length}
		{endOfFeed}
		loadMoreFailed={loadingContentFailed}
		loading={loadingContent}
		feedEndMessage="No more communities"
		feedEndIcon="users-slash"
	>
		<svelte:fragment let:index>
			{@const cv = communities[index]}
			<CommunityCard communityView={cv} />
		</svelte:fragment>
	</VirtualFeed>
</Layout>

<script lang="ts">
	import { Stack, Icon, Layout } from 'sheodox-ui';
	import CommunityCard from './CommunityCard.svelte';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import { ListingOptions, PostSortOptions } from '$lib/feed-filters';
	import VirtualFeed from '$lib/VirtualFeed.svelte';
	import type { CommunityView } from 'lemmy-js-client';
	import { feedLoader } from '$lib/post-loader';
	import type { PageData } from './$types';
	import Title from '$lib/Title.svelte';

	export let data;

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false,
		communities: CommunityView[];
	$: loader = initFeed(data);

	function initFeed(data: PageData) {
		const newLoader = feedLoader<CommunityView>(
			`/api/communities?listing=${data.query.listing}&sort=${data.query.sort}`,
			'communities'
		);

		loadingContent = false;
		loadingContentFailed = false;
		endOfFeed = false;
		communities = [...data.communities];

		return newLoader;
	}

	async function more() {
		if (endOfFeed || loadingContent) {
			return;
		}
		loadingContent = true;

		const more = (await loader.next()).value;
		loadingContentFailed = more.error;
		endOfFeed = more.endOfFeed;

		communities = [
			...communities,
			...more.items.filter((p) => !communities.some((p2) => p2.community.id === p.community.id))
		];

		loadingContent = false;
	}
</script>
