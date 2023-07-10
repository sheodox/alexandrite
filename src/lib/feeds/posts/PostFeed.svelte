<style>
	hr {
		border-color: var(--sx-gray-transparent-light);
	}
	.post-feed {
		background-color: var(--sx-gray-700);
	}
</style>

<div class="post-feed py-1">
	<Stack dir="column" gap={1}>
		<form method="GET" data-sveltekit-replacestate>
			<section>
				<Stack gap={4} align="center" cl="p-4" dir="r">
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

					<button class="tertiary">Go <Icon icon="chevron-right" variant="icon-only" /></button>
				</Stack>
			</section>
		</form>

		<Stack dir="c" gap={2} cl="p-4">
			<VirtualFeed
				feedSize={contentViews.length}
				on:more
				{endOfFeed}
				feedEndIcon="file-circle-xmark"
				feedEndMessage="No more posts!"
				loading={loadingContent}
				loadMoreFailed={loadingContentFailed}
			>
				<svelte:fragment let:index>
					{@const contentView = contentViews[index]}
					<!-- {#each contentViews as contentView, i} -->
					{#if contentView.type === 'post'}
						<Post postView={contentView.postView} on:overlay on:update-post-view />
					{:else if contentView.type === 'comment'}
						<Comment commentView={contentView.commentView} showPost postOP="" />
					{/if}
					{#if index + 1 < contentViews.length}
						<hr class="w-100" />
					{/if}
					<!-- {/each} -->
				</svelte:fragment>
			</VirtualFeed>
		</Stack>
	</Stack>
</div>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import Post from './Post.svelte';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
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
	import type { ContentView } from '$lib/post-loader';
	import { getAppContext } from '$lib/app-context';

	export let isMyFeed = false;
	export let feedType: FeedType;
	export let contentViews: ContentView[];
	export let loadingContent: boolean;
	export let loadingContentFailed: boolean;
	export let endOfFeed: boolean;
	export let selectedType: string;
	export let selectedListing: string;
	export let selectedSort: string;
	// which filters should be shown for this type of content
	$: typeOptions = getTypeOptions(feedType);
	$: listingOptions = getListingOptions(feedType);
	$: sortOptions = getSortOptions(feedType, selectedType);

	const { loggedIn } = getAppContext();

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
