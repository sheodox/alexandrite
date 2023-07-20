<style lang="scss">
	hr {
		border-color: var(--sx-gray-transparent-light);
	}
</style>

<div class="post-feed f-1">
	<Stack dir="column" gap={1}>
		<div class="toolbar">
			<form method="GET" use:navigateOnChange>
				<section>
					<Stack gap={4} align="center" cl="p-4 f-wrap" dir="r">
						{#if typeOptions}
							<ToggleGroup options={typeOptions} bind:selected={selectedType} name="type" />
						{/if}
						{#if listingOptions}
							<ToggleGroup options={listingOptions} bind:selected={selectedListing} name="listing" />
						{/if}
						{#if sortOptions}
							<select aria-label="Post Sort" bind:value={selectedSort} name="sort" required>
								{#each sortOptions as opt}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
						{/if}
					</Stack>
				</section>
			</form>
		</div>

		<Stack dir="c" gap={2} cl="p-4">
			<VirtualFeed
				feedSize={$cvStore.length}
				on:more
				{endOfFeed}
				feedEndIcon="file-circle-xmark"
				feedEndMessage="No more posts!"
				loading={loadingContent}
				loadMoreFailed={loadingContentFailed}
			>
				<svelte:fragment let:index>
					{@const contentView = $cvStore[index]}
					{#if contentView.type === 'post'}
						<Post
							postView={contentView.view}
							on:overlay
							on:expand-content={onPostExpandContent}
							expandPostContent={postsWithInlineExpandedContent.has(contentView.view.post.id)}
						/>
					{:else if contentView.type === 'comment'}
						<Comment {contentView} showPost postOP="" />
					{/if}
					{#if index + 1 < $cvStore.length}
						<hr class="w-100" />
					{/if}
				</svelte:fragment>
			</VirtualFeed>
		</Stack>
	</Stack>
	<FeedNav />
</div>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import Post from './Post.svelte';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import FeedNav from '$lib/FeedNav.svelte';
	import {
		NormalFeedTypeOptions,
		type FeedType,
		UserFeedTypeOptions,
		ListingOptions,
		PostSortOptions,
		UserSortOptions
	} from '$lib/feed-filters';
	import VirtualFeed from '$lib/VirtualFeed.svelte';
	import Comment from '$lib/Comment.svelte';
	import { getAppContext } from '$lib/app-context';
	import { getContentViewStore } from '$lib/content-views';
	import { navigateOnChange } from '$lib/utils';

	export let isMyFeed = false;
	export let feedType: FeedType;
	export let loadingContent: boolean;
	export let loadingContentFailed: boolean;
	export let endOfFeed: boolean;
	export let selectedType: string;
	export let selectedListing: string;
	export let selectedSort: string;

	const cvStore = getContentViewStore();
	// which filters should be shown for this type of content
	$: typeOptions = getTypeOptions(feedType);
	$: listingOptions = getListingOptions(feedType);
	$: sortOptions = getSortOptions(feedType, selectedType);

	// cach which posts are expanded, so when they go out of the viewport,
	// we can restore the expanded state, and keep a consistent height if scroll back to
	const postsWithInlineExpandedContent = new Set<number>();

	const { loggedIn } = getAppContext();

	function onPostExpandContent(e: CustomEvent<{ id: number; expanded: boolean }>) {
		e.detail.expanded
			? postsWithInlineExpandedContent.add(e.detail.id)
			: postsWithInlineExpandedContent.delete(e.detail.id);
	}

	function getTypeOptions(feedType: FeedType) {
		switch (feedType) {
			case 'user':
				return UserFeedTypeOptions(isMyFeed);

			default:
				return NormalFeedTypeOptions;
		}
	}

	function getListingOptions(feedType: FeedType) {
		switch (feedType) {
			case 'top':
				return ListingOptions(loggedIn);

			default:
				return null;
		}
	}

	function getSortOptions(feedType: FeedType, selectedType: string) {
		if (feedType === 'user') {
			return UserSortOptions;
		}
		switch (selectedType) {
			// case 'Comments':
			// 	return CommentSortOptions;
			default:
				return PostSortOptions;
		}
	}
</script>
