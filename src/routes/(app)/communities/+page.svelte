<Title title="Communities" />
<Layout size="medium">
	<h1 class="px-2 mb-0">Communities</h1>

	<Stack dir="r" justify="between" align="center">
		<form method="GET" use:navigateOnChange>
			<section>
				<Stack gap={4} align="center" cl="p-4" dir="r">
					<ToggleGroup
						options={ListingOptions(!!data.settings.username)}
						selected={data.query.listing}
						name="listing"
					/>
					<select aria-label="Post Sort" value={data.query.sort} name="sort" required>
						{#each PostSortOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</Stack>
			</section>
		</form>
		<a href="/search?type=Communities" class="inline-link">Search Communities</a>
	</Stack>

	<ContentViewProvider store={cvStore}>
		<VirtualFeed
			on:more={more}
			feedSize={$cvStore.length}
			{endOfFeed}
			loadMoreFailed={loadingContentFailed}
			loading={loadingContent}
			feedEndMessage="No more communities"
			feedEndIcon="users-slash"
		>
			<svelte:fragment let:index>
				{@const cv = $cvStore[index]}
				{#if cv.type === 'community'}
					{#key cv.view.community.actor_id}
						<CommunityCard communityView={cv.view} />
					{/key}
				{/if}
			</svelte:fragment>
		</VirtualFeed>
	</ContentViewProvider>
</Layout>

<script lang="ts">
	import { Stack, Layout } from 'sheodox-ui';
	import CommunityCard from '$lib/CommunityCard.svelte';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import { ListingOptions, PostSortOptions } from '$lib/feed-filters';
	import VirtualFeed from '$lib/VirtualFeed.svelte';
	import type { CommunityView } from 'lemmy-js-client';
	import { feedLoader } from '$lib/post-loader';
	import type { PageData } from './$types';
	import Title from '$lib/Title.svelte';
	import { getLemmyClient } from '$lib/lemmy-client';
	import { communityViewToContentView, createContentViewStore } from '$lib/content-views';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';
	import { navigateOnChange } from '$lib/utils';

	const { client, jwt } = getLemmyClient();

	export let data;

	const cvStore = createContentViewStore();

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false,
		loader: ReturnType<typeof initFeed>;

	$: {
		loader = initFeed(data);
		cvStore.clear();
		// load the first page of data
		more();
	}

	function initFeed(data: PageData) {
		const newLoader = feedLoader<CommunityView[]>(
			async (page) => {
				return await client
					.listCommunities({
						auth: jwt,
						page,
						limit: 50,
						type_: data.query.listing,
						sort: data.query.sort
					})
					.then((res) => res.communities);
			},
			(res) => res.length
		);

		loadingContent = false;
		loadingContentFailed = false;
		endOfFeed = false;

		return newLoader;
	}

	const loadedCommunityIds = new Set<number>();

	async function more() {
		if (endOfFeed || loadingContent) {
			return;
		}
		loadingContent = true;

		const qs = location.search;
		const more = (await loader.next()).value;
		if (qs === location.search) {
			loadingContentFailed = more.error;
			endOfFeed = more.endOfFeed;

			if (more.response) {
				const newPage = more.response.filter((com) => {
					return !loadedCommunityIds.has(com.community.id);
				});
				cvStore.append(newPage.map(communityViewToContentView));
			}
			loadingContent = false;
		}
	}
</script>
