<style>
	.search-header {
		border-radius: 20px;
		overflow: hidden;
	}
</style>

<Title title="Search" />

<div class="search-header my-2">
	{#if data.communityView}
		<CommunityHeader contentView={communityViewToContentView(data.communityView)} readOnly />
	{/if}
	{#if data.personView}
		<UserHeader contentView={personViewToContentView(data.personView)} readOnly />
	{/if}
</div>

<h1 class="mb-0">Search</h1>

<form method="GET" use:navigateOnChange>
	<section>
		<Stack gap={4} align="center" cl="py-4" dir="r">
			<TextInput value={data.query.q} name="q">Search</TextInput>

			<select aria-label="Type" name="type" required value={data.query.type}>
				{#each SearchTypeOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>

			<ToggleGroup options={ListingOptions(loggedIn)} name="listing" selected={data.query.listing} />

			<select aria-label="Post Sort" name="sort" required value={data.query.sort}>
				{#each SearchSortOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>

			{#if data.query.community}
				<input type="hidden" name="community" value={data.query.community} />
			{/if}
			{#if data.query.creator}
				<input type="hidden" name="creator" value={data.query.creator} />
			{/if}
		</Stack>
	</section>
</form>
{#if data.query.q}
	<ContentViewProvider store={cvStore}>
		<Stack dir="c" gap={2}>
			<VirtualFeed
				feedSize={$cvStore.length}
				on:more={more}
				{endOfFeed}
				feedEndIcon="file-circle-xmark"
				feedEndMessage="No more results!"
				loading={loadingContent}
				loadMoreFailed={loadingContentFailed}
			>
				<svelte:fragment let:index>
					{@const contentView = $cvStore[index]}
					{#if contentView.type === 'post'}
						<Post postView={contentView.view} on:overlay supportsOverlay={false} />
					{:else if contentView.type === 'comment'}
						<Comment {contentView} showPost postOP="" />
					{:else if contentView.type === 'community'}
						<CommunityCard communityView={contentView.view} />
					{:else if contentView.type === 'person'}
						<PersonCard personView={contentView.view} />
					{/if}
					{#if index + 1 < $cvStore.length}
						<hr class="w-100" />
					{/if}
				</svelte:fragment>
			</VirtualFeed>
		</Stack>
	</ContentViewProvider>
{:else}
	<Alert variant="info">Enter a search query to see results.</Alert>
{/if}

<script lang="ts">
	import { Alert, Stack, Icon, TextInput } from 'sheodox-ui';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import PersonCard from '$lib/PersonCard.svelte';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';
	import CommunityHeader from '$lib/feeds/posts/CommunityHeader.svelte';
	import UserHeader from '$lib/feeds/posts/UserHeader.svelte';
	import { SearchTypeOptions, ListingOptions, SearchSortOptions } from '$lib/feed-filters';
	import Comment from '$lib/comments/Comment.svelte';
	import CommunityCard from '$lib/CommunityCard.svelte';
	import type { PageData } from './$types';
	import { parseISO } from 'date-fns';
	import { getAppContext } from '$lib/app-context';
	import Title from '$lib/Title.svelte';
	import VirtualFeed from '$lib/VirtualFeed.svelte';
	import { feedLoader } from '$lib/post-loader';
	import Post from '$lib/feeds/posts/Post.svelte';
	import type {
		CommentView,
		CommunityView,
		ListingType,
		PersonView,
		PostView,
		SearchType,
		SortType
	} from 'lemmy-js-client';
	import { getLemmyClient } from '$lib/lemmy-client';
	import {
		commentViewToContentView,
		communityViewToContentView,
		createContentViewStore,
		personViewToContentView,
		postViewToContentView
	} from '$lib/content-views';
	import { navigateOnChange } from '$lib/utils';

	export let data;

	const { loggedIn } = getAppContext();
	const { client, jwt } = getLemmyClient();
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

	interface ApiSearchRes {
		query: {
			q: string;
			page: number;
			sort: string;
			listing: string;
			type: string;
			community: string | null;
			creator: number | null;
		};
		comments: CommentView[];
		posts: PostView[];
		users: PersonView[];
		communities: CommunityView[];
	}
	function initFeed(data: PageData) {
		const newLoader = feedLoader<ApiSearchRes>(
			async (page: number) => {
				const creator = data.query.creator,
					query = {
						q: data.query.q ?? '',
						page,
						sort: data.query.sort,
						listing: data.query.listing,
						type: data.query.type,
						community: data.query.community,
						creator: creator ? Number(creator) : null
					};

				// can't search for nothing, but don't let that stop us from returning the default query values
				if (!query.q) {
					const blankResponse: ApiSearchRes = {
						query,
						comments: [],
						posts: [],
						users: [],
						communities: []
					};
					return blankResponse;
				}

				const searchRes = await client.search({
					auth: jwt,
					limit: 50,
					page: query.page,
					sort: query.sort as SortType,
					type_: query.type as SearchType,
					listing_type: query.listing as ListingType,
					community_name: query.community ?? undefined,
					creator_id: query.creator ?? undefined,
					q: query.q
				});

				return {
					query,
					comments: searchRes.comments,
					posts: searchRes.posts,
					users: searchRes.users,
					communities: searchRes.communities
				};
			},
			(res) => res.communities.length + res.posts.length + res.comments.length + res.users.length
		);

		loadingContent = false;
		loadingContentFailed = false;
		endOfFeed = false;

		return newLoader;
	}

	async function more() {
		if (endOfFeed || loadingContent) {
			return;
		}
		loadingContent = true;

		const qs = location.search;
		const feedData = (await loader.next()).value;
		if (qs === location.search) {
			loadingContentFailed = feedData.error;
			endOfFeed = feedData.endOfFeed;
			if (!feedData.error && feedData.response) {
				cvStore.append(getContentViews(feedData.response));
			}

			loadingContent = false;
		}
	}

	function getContentViews(data: ApiSearchRes) {
		const posts = data.posts.map(postViewToContentView),
			comments = data.comments.map(commentViewToContentView),
			communities = data.communities.map(communityViewToContentView),
			users = data.users.map(personViewToContentView);

		return [...posts, ...comments, ...communities, ...users].sort((a, b) => {
			const aPublished = parseISO(a.published + 'Z').getTime(),
				bPublished = parseISO(b.published + 'Z').getTime();

			if (data.query.sort === 'New') {
				return bPublished - aPublished;
			} else if (data.query.sort === 'Old') {
				return aPublished - bPublished;
			} else {
				return b.id - a.id;
			}
		});
	}
</script>
