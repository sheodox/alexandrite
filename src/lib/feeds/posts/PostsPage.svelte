<style lang="scss">
	aside {
		background-color: var(--sx-gray-800);
		width: 30rem;
		padding: 1rem;
		overflow: auto;

		> article {
			position: sticky;
			top: 0;
		}
	}
	.community-avatar :global(img) {
		height: 6rem;
		width: 6rem;
		border-radius: 100rem;
		border: 3px solid var(--sx-gray-200);
	}
	.community-header {
		background: var(--sx-gray-800);
	}
</style>

<div class="f-row f-1">
	<div class="f-1">
		{#if communityView}
			<section class="p-8 community-header">
				<Stack gap={2} dir="c">
					<Stack dir="r" gap={6} align="center">
						{#if communityView.community.icon}
							<div class="community-avatar">
								<Image src={communityView.community.icon} />
							</div>
						{/if}
						<Stack dir="c" gap={2}>
							<h1 class="mb-2">
								<NameAtInstance place={communityView.community} prefix="!" />
							</h1>
							<div>
								<span class="sx-badge-gray"
									>Since {dateFormatter.format(parseISO(communityView.community.published + 'Z'))}</span
								>
							</div>
						</Stack>
					</Stack>
				</Stack>
			</section>
		{/if}
		{#if personView}
			<section class="p-8 community-header">
				<Stack gap={2} dir="c">
					<Stack dir="r" gap={6} align="center">
						{#if personView.person.avatar}
							<div class="community-avatar">
								<Image src={personView.person.avatar} />
							</div>
						{/if}
						<Stack dir="c" gap={2}>
							<h1 class="mb-2">
								<NameAtInstance place={personView.person} prefix="@" />
							</h1>
							<div>
								<span class="sx-badge-gray"
									><Icon icon="cake-candles" />Since {dateFormatter.format(
										parseISO(personView.person.published + 'Z')
									)}</span
								>
							</div>
						</Stack>
					</Stack>
				</Stack>
			</section>
		{/if}
		<PostFeed
			{settings}
			{postViews}
			on:more
			on:overlay={onOverlay}
			{endOfFeed}
			{selectedSort}
			{selectedListing}
			{selectedType}
			showListingFilter
		/>
	</div>

	<aside>
		{#if communityView}
			<CommunitySidebar {communityView} />

			<hr class="my-8" />
		{/if}
		<article>
			<InstanceSidebar {siteView} />
		</article>
	</aside>
</div>

{#if overlayPost}
	<OverlayPost postView={overlayPost} on:close={closeOverlay} />
{/if}

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import PostFeed from '$lib/feeds/posts/PostFeed.svelte';
	import InstanceSidebar from '$lib/instance/InstanceSidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import OverlayPost from '$lib/OverlayPost.svelte';
	import Image from '$lib/Image.svelte';
	import type { CommunityView, PersonView, PostView, SiteView } from 'lemmy-js-client';
	import { parseISO } from 'date-fns';
	import CommunitySidebar from '$lib/CommunitySidebar.svelte';
	import type { Settings } from '../../../app';

	export let postViews: PostView[];
	export let siteView: SiteView;
	export let settings: Settings;
	export let communityView: CommunityView | null = null;
	export let personView: PersonView | null = null;
	export let endOfFeed: boolean;
	export let selectedType: string; // default  'posts';
	export let selectedListing: string; // default 'local';
	export let selectedSort: string; // default 'Hot';
	export let showListingFilter: boolean;

	const dateFormatter = new Intl.DateTimeFormat('en', {
		dateStyle: 'medium'
	});

	console.log({ communityView });

	let overlayPost: null | PostView;

	async function onOverlay(e: CustomEvent<number>) {
		overlayPost = postViews.find((p) => p.post.id === e.detail) ?? null;
	}

	function closeOverlay() {
		overlayPost = null;
	}
</script>
