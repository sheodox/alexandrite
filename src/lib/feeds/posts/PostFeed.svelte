<div class="post-feed f-1">
	<Stack dir="column" gap={1}>
		<div class="toolbar f-row justify-content-between align-items-center gap-4 p-4">
			<form method="GET" use:navigateOnChange>
				<section>
					<Stack gap={4} align="center" cl="f-wrap" dir="r">
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
			<MiniPostLayoutSelector />
		</div>

		<div class="p-2" class:layout-card={$postPreviewLayout === 'CARD'}>
			<!-- use this as a key so the feed resets when changing the view type, as
			all of the virtual feed sizing is invalid after the feed type changes -->
			{#key $postPreviewLayout}
				<VirtualFeed
					feedSize={$cvStore.length}
					on:more
					{endOfFeed}
					feedEndIcon="file-circle-xmark"
					feedEndMessage="No more posts!"
					loading={loadingContent}
					loadMoreFailed={loadingContentFailed}
					bind:viewportTopIndex
					bind:api={virtualFeedApi}
				>
					<svelte:fragment let:index>
						{@const contentView = $cvStore[index]}
						{@const lastOfList = index + 1 === $cvStore.length}
						{#if contentView.type === 'post'}
							<PostLayout
								postView={contentView.view}
								on:overlay
								on:expand-content={onPostExpandContent}
								expandPostContent={postsWithInlineExpandedContent.has(contentView.view.post.id)}
								{lastOfList}
								bind:api={postLayoutAPIs[index]}
							/>
						{:else if contentView.type === 'comment'}
							<CommentLayout {lastOfList}>
								<Comment {contentView} showPost postOP="" postLocked={contentView.view.post.locked} />
							</CommentLayout>
						{/if}
					</svelte:fragment>
				</VirtualFeed>
			{/key}
		</div>
	</Stack>
	<FeedNav />
</div>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
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
	import MiniPostLayoutSelector from './MiniPostLayoutSelector.svelte';
	import Comment from '$lib/comments/Comment.svelte';
	import { getContentViewStore } from '$lib/content-views';
	import { navigateOnChange } from '$lib/utils';
	import { profile } from '$lib/profiles/profiles';
	import PostLayout from './PostLayout.svelte';
	import { getSettingsContext } from '$lib/settings-context';
	import CommentLayout from './CommentLayout.svelte';
	import type { VirtualFeedAPI } from '$lib/virtual-feed';
	import type { PostLayoutAPI } from './post-utils';

	export let isMyFeed = false;
	export let feedType: FeedType;
	export let loadingContent: boolean;
	export let loadingContentFailed: boolean;
	export let endOfFeed: boolean;
	export let selectedType: string;
	export let selectedListing: string;
	export let selectedSort: string;

	const cvStore = getContentViewStore();
	const { postPreviewLayout } = getSettingsContext();
	// which filters should be shown for this type of content
	$: typeOptions = getTypeOptions(feedType);
	$: listingOptions = getListingOptions(feedType);
	$: sortOptions = getSortOptions(feedType, selectedType);

	// forward up a couple things from the VirtualFeed, so PostsPage can handle hotkeys
	export let viewportTopIndex: number;
	export let virtualFeedApi: VirtualFeedAPI;
	// all APIs for each post, export back up!
	export let postLayoutAPIs: PostLayoutAPI[];

	// cach which posts are expanded, so when they go out of the viewport,
	// we can restore the expanded state, and keep a consistent height if scroll back to
	const postsWithInlineExpandedContent = new Set<number>();

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
				return ListingOptions($profile.loggedIn);

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
