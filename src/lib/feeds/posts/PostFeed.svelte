<style lang="scss">
	.vibe-check-list {
		max-height: 20rem;
		overflow: auto;
	}
	.useless-vibe {
		opacity: 0.2;
	}
</style>

<div class="post-feed f-1">
	<Stack dir="column" gap={1}>
		<div class="toolbar f-row justify-content-between align-items-center gap-4 p-4 f-wrap">
			<form method="GET" use:navigateOnChange>
				<section>
					<Stack gap={4} align="center" cl="f-wrap" dir="r">
						{#if typeOptions}
							<Select bind:value={selectedType} label="Type" name="type">
								{#each typeOptions as opt}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</Select>
						{/if}
						{#if listingOptions}
							<Select bind:value={selectedListing} label="Listing" name="listing">
								{#each listingOptions as opt}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</Select>
						{/if}
						{#if sortOptions}
							<Select label="Post Sort" bind:value={selectedSort} name="sort" required>
								{#each sortOptions as opt}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</Select>
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
	<FeedNav on:refresh>
		<div slot="top" class="m-0 p-0" class:d-none={!vibesVisible}>
			{#if vibesVisible}
				<Accordion>
					<span slot="title">Vibe Check </span>
					<ul class="sx-list vibe-check-list">
						<li class="sx-list-item two-columns">
							<span class="column" class:useless-vibe={posts.length === 0}>
								Posts ({posts.length})
								<Vibe score={vibeScorePosts} />
							</span>
							<span class="column" class:useless-vibe={comments.length === 0}>
								Comments ({comments.length})
								<Vibe score={vibeScoreComments} />
							</span>
						</li>
						{#each vibeCommunitiesByScore as com}
							{@const communityName = nameAtInstance(com.community)}
							<li class="sx-list-item two-columns">
								<span class="column"
									><CommunityLink community={com.community} href="/{$profile.instance}/c/{communityName}" />
								</span>
								<span class="column"><Vibe score={com.score} /></span>
							</li>
						{/each}
					</ul>
				</Accordion>
			{/if}
		</div>
	</FeedNav>
</div>

<script lang="ts">
	import { Accordion, Stack, Select } from 'sheodox-ui';
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
	import type { ContentViewComment, ContentViewPost } from '$lib/content-views';
	import { navigateOnChange } from '$lib/utils';
	import { profile } from '$lib/profiles/profiles';
	import PostLayout from './PostLayout.svelte';
	import { getSettingsContext } from '$lib/settings-context';
	import CommentLayout from './CommentLayout.svelte';
	import type { VirtualFeedAPI } from '$lib/virtual-feed';
	import type { PostLayoutAPI } from './post-utils';
	import { getAppContext } from '$lib/app-context';
	import Vibe from './Vibe.svelte';
	import type { Community } from 'lemmy-js-client';
	import { nameAtInstance } from '$lib/nav-utils';
	import CommunityLink from '$lib/CommunityLink.svelte';

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
	const { siteMeta } = getAppContext();
	// which filters should be shown for this type of content
	$: typeOptions = getTypeOptions(feedType);
	$: listingOptions = getListingOptions(feedType);
	$: sortOptions = getSortOptions(feedType, selectedType);

	$: posts = $cvStore.filter((cv) => cv.type === 'post');
	$: comments = $cvStore.filter((cv) => cv.type === 'comment');
	$: vibeScorePosts = posts.reduce((total, cv) => {
		return total + cv.score;
	}, 0);

	$: vibeScoreComments = comments.reduce((total, cv) => {
		return total + cv.score;
	}, 0);

	$: iAmAMod = ($siteMeta.my_user?.moderates?.length ?? 0) > 0;
	$: vibesVisible = feedType === 'user' && iAmAMod;

	$: vibeCommunitiesByScore = Array.from(
		([...posts, ...comments] as (ContentViewPost | ContentViewComment)[])
			.reduce((done, cv) => {
				const communityId = cv.view.community.id;
				const current = done.get(communityId);
				if (current) {
					done.set(communityId, {
						...current,
						score: current.score + cv.score
					});
				} else {
					done.set(communityId, { score: 1, community: cv.view.community });
				}
				return done;
			}, new Map<number, { community: Community; score: number }>())
			.values()
	).sort((a, b) => {
		return b.score - a.score;
	});

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
				return ListingOptions($profile.loggedIn, ($siteMeta.my_user?.moderates?.length ?? 0) > 0);

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
