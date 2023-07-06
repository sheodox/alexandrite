<Title title="Search" />

{#if data.communityView}
	<CommunityHeader communityView={data.communityView} readOnly />
{/if}
{#if data.personView}
	<UserHeader personView={data.personView} readOnly />
{/if}

<h1 class="mb-0">Search</h1>

<form method="GET" data-sveltekit-replacestate>
	<section>
		<Stack gap={4} align="center" cl="py-4" dir="r">
			<TextInput value={data.search.query.q} name="q">Search</TextInput>

			<select aria-label="Type" name="type" required value={data.search.query.type}>
				{#each SearchTypeOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>

			<ToggleGroup options={ListingOptions(loggedIn)} name="listing" selected={data.search.query.listing} />

			<select aria-label="Post Sort" name="sort" required value={data.search.query.sort}>
				{#each SearchSortOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>

			{#if data.search.query.community}
				<input type="hidden" name="community" value={data.search.query.community} />
			{/if}
			{#if data.search.query.creator}
				<input type="hidden" name="creator" value={data.search.query.creator} />
			{/if}

			<button class="tertiary">Go <Icon icon="chevron-right" variant="icon-only" /></button>
		</Stack>
	</section>
</form>
{#if data.search.query.q}
	<Stack dir="c" gap={2}>
		<VirtualFeed
			feedSize={contentViews.length}
			on:more={more}
			{endOfFeed}
			feedEndIcon="file-circle-xmark"
			feedEndMessage="No more results!"
			loading={loadingContent}
			loadMoreFailed={loadingContentFailed}
		>
			<svelte:fragment let:index>
				{@const contentView = contentViews[index]}
				<!-- {#each contentViews as contentView, i} -->
				{#if contentView.type === 'post'}
					<Post postView={contentView.view} on:overlay on:update-post-view supportsOverlay={false} />
				{:else if contentView.type === 'comment'}
					<Comment commentView={contentView.view} showPost postOP="" />
				{:else if contentView.type === 'community'}
					<CommunityCard communityView={contentView.view} />
				{:else if contentView.type === 'user'}
					<PersonCard personView={contentView.view} />
				{/if}
				{#if index + 1 < contentViews.length}
					<hr class="w-100" />
				{/if}
			</svelte:fragment>
		</VirtualFeed>
	</Stack>
{:else}
	<Alert variant="info">Enter a search query to see results.</Alert>
{/if}

<script lang="ts">
	import { Alert, Stack, Icon, TextInput } from 'sheodox-ui';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import PersonCard from '$lib/PersonCard.svelte';
	import CommunityHeader from '$lib/feeds/posts/CommunityHeader.svelte';
	import UserHeader from '$lib/feeds/posts/UserHeader.svelte';
	import { SearchTypeOptions, ListingOptions, SearchSortOptions } from '$lib/feed-filters';
	import Comment from '$lib/Comment.svelte';
	import CommunityCard from '$lib/CommunityCard.svelte';
	import type { PageData } from './$types';
	import { parseISO } from 'date-fns';
	import { getAppContext } from '$lib/app-context';
	import Title from '$lib/Title.svelte';
	import VirtualFeed from '$lib/VirtualFeed.svelte';
	import { feedLoader } from '$lib/post-loader';
	import { endpoint } from '$lib/utils';
	import Post from '$lib/feeds/posts/Post.svelte';
	import type { ApiSearchRes } from '../api/search/+server';

	export let data;

	const { loggedIn } = getAppContext();

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false,
		contentViews: ReturnType<typeof getContentViews> = [];

	$: loader = initFeed(data);

	function initFeed(data: PageData) {
		const newLoader = feedLoader<{}, ApiSearchRes>(
			endpoint('/api/search', {
				q: data.search.query.q,
				type: data.search.query.type,
				listing: data.search.query.listing,
				sort: data.search.query.sort,
				community: data.search.query.community,
				creator: data.search.query.creator
			}),
			false
		);

		loadingContent = false;
		loadingContentFailed = false;
		endOfFeed = false;
		contentViews = getContentViews(data.search);

		return newLoader;
	}

	async function more() {
		if (endOfFeed || loadingContent) {
			return;
		}
		loadingContent = true;

		const feedData = (await loader.next()).value;
		loadingContentFailed = feedData.error;
		endOfFeed = feedData.endOfFeed;
		if (!feedData.error) {
			contentViews = contentViews.concat(getContentViews(feedData.response!));
		}

		loadingContent = false;
	}

	function getContentViews(data: ApiSearchRes) {
		const posts = data.posts.map((view) => ({
				type: 'post' as const,
				view,
				id: view.post.id,
				published: view.post.published
			})),
			comments = data.comments.map((view) => ({
				type: 'comment' as const,
				view,
				id: view.comment.id,
				published: view.comment.published
			})),
			communities = data.communities.map((view) => ({
				type: 'community' as const,
				view,
				id: view.community.id,
				published: view.community.published
			})),
			users = data.users.map((view) => ({
				type: 'user' as const,
				view,
				id: view.person.id,
				published: view.person.published
			}));

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
