<style>
	hr {
		border-color: var(--sx-gray-transparent-light);
	}
</style>

<div class="py-1">
	<Stack dir="column" gap={1}>
		<form method="GET" bind:this={filterForm} data-sveltekit-replacestate>
			<section>
				<Stack gap={4} align="center" cl="p-4" dir="r">
					{#if typeOptions}
						<ToggleGroup options={typeOptions} bind:selected={selectedType} name="type" on:change={submitForm} />
					{/if}
					{#if listingOptions}
						<ToggleGroup
							options={listingOptions}
							bind:selected={selectedListing}
							name="listing"
							on:change={submitForm}
						/>
					{/if}
					{#if sortOptions}
						<select aria-label="Post Sort" bind:value={selectedSort} name="sort" required on:change={submitForm}>
							{#each sortOptions as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					{/if}

					<button class="tertiary">Go <Icon icon="chevron-right" variant="icon-only" /></button>
				</Stack>
			</section>
		</form>

		{#if selectedType === 'Posts'}
			{#each postViews as pv, i (pv.post.id)}
				<Post postView={pv} on:overlay on:update-post-view />
				{#if i + 1 < postViews.length}
					<hr class="w-100" />
				{/if}
			{/each}
		{:else}
			<p>Comment listing coming soon</p>
		{/if}
	</Stack>
</div>

<InfiniteFeed
	on:more
	{endOfFeed}
	feedEndIcon="file-circle-xmark"
	feedEndMessage="No more posts!"
	loading={loadingPosts}
	loadMoreFailed={loadingPostsFailed}
/>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import Post from './Post.svelte';
	import type { PostView } from 'lemmy-js-client';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import InfiniteFeed from './InfiniteFeed.svelte';
	import {
		NormalFeedTypeOptions,
		type FeedType,
		UserFeedTypeOptions,
		ListingOptions,
		CommentSortOptions,
		PostSortOptions,
		UserSortOptions
	} from '$lib/feed-filters';
	import type { Settings } from '../../../app';

	let filterForm: HTMLFormElement;

	function submitForm() {
		if (selectedType && selectedListing && selectedSort) {
			filterForm.submit();
		}
	}

	export let feedType: FeedType;
	export let settings: Settings;
	export let postViews: PostView[];
	export let loadingPosts: boolean;
	export let loadingPostsFailed: boolean;
	export let endOfFeed: boolean;
	export let selectedType: string;
	export let selectedListing: string;
	export let selectedSort: string;
	// which filters should be shown for this type of content
	$: typeOptions = getTypeOptions(feedType);
	$: listingOptions = getListingOptions(feedType);
	$: sortOptions = getSortOptions(feedType, selectedType);

	function getTypeOptions(feedType: FeedType) {
		switch (feedType) {
			case 'user':
				return UserFeedTypeOptions;

			default:
				return NormalFeedTypeOptions;
		}
	}

	function getListingOptions(feedType: FeedType) {
		switch (feedType) {
			case 'top':
				return ListingOptions(!!settings.username);

			default:
				return null;
		}
	}

	function getSortOptions(feedType: FeedType, selectedType: string) {
		if (feedType === 'user') {
			return UserSortOptions;
		}
		switch (selectedType) {
			case 'Comments':
				return CommentSortOptions;

			default:
				return PostSortOptions;
		}
	}
</script>
