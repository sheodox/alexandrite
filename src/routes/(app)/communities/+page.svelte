<Title title="Communities" />
<Layout size="medium">
	<h1 class="px-2 mb-0">Communities</h1>

	<Stack dir="r" justify="between" align="center">
		<form method="GET" data-sveltekit-replacestate>
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

					<button class="tertiary">Go <Icon icon="chevron-right" variant="icon-only" /></button>
				</Stack>
			</section>
		</form>
		<a href="/search?type=Communities" class="inline-link">Search Communities</a>
	</Stack>

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
			{#key cv.community.actor_id}
				<CommunityCard communityView={cv} on:update-community={onUpdateCommunity} />
			{/key}
		</svelte:fragment>
	</VirtualFeed>
</Layout>

<script lang="ts">
	import { Stack, Icon, Layout } from 'sheodox-ui';
	import CommunityCard from '$lib/CommunityCard.svelte';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import { ListingOptions, PostSortOptions } from '$lib/feed-filters';
	import VirtualFeed from '$lib/VirtualFeed.svelte';
	import type { CommunityView } from 'lemmy-js-client';
	import { feedLoader } from '$lib/post-loader';
	import type { PageData } from './$types';
	import Title from '$lib/Title.svelte';
	import { getLemmyClient } from '$lib/lemmy-client';

	const { client, jwt } = getLemmyClient();

	export let data;

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false,
		communities: CommunityView[],
		loader: ReturnType<typeof initFeed>;

	$: {
		loader = initFeed(data);
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
		communities = [];

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

		if (more.response) {
			communities = [
				...communities,
				...more.response.filter((p) => !communities.some((p2) => p2.community.id === p.community.id))
			];
		}
		loadingContent = false;
	}

	function onUpdateCommunity(e: CustomEvent<CommunityView>) {
		communities = communities.map((c) => (c.community.id === e.detail.community.id ? e.detail : c));
	}
</script>
