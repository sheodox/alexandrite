<FeedHeader icon={community.icon ?? ''} published={community.published}>
	<NameAtInstance place={community} displayName={community.title} prefix="" slot="name" />
	<Stack dir="r" gap={2} align="center" slot="actions">
		{#if !readOnly}
			<CommunityJoin {communityView} />
			<a href="/{$profile.instance}/create/post?community={nameAtInstance(community)}" class="button tertiary">
				<Icon icon="plus" /> Post
			</a>
			<a href="/{$profile.instance}/search?community={nameAtInstance(community)}" class="button tertiary">
				<Icon icon="magnifying-glass" /> Search
			</a>
			{#if $profile.loggedIn}
				<BusyButton
					on:click={() => $blockState.submit(!communityView.blocked)}
					busy={$blockState.busy}
					cl={communityView.blocked ? 'danger' : 'tertiary'}
				>
					{#if !communityView.blocked}
						<Icon icon="ban" />
						Block
					{:else}
						<Icon icon="circle-check" variant="regular" />
						Unblock
					{/if}
				</BusyButton>
			{/if}
		{/if}
	</Stack>
	<div slot="badges">
		<CommunityBadges {community} extended />
	</div>
</FeedHeader>

<script lang="ts">
	import { Icon, Stack } from 'sheodox-ui';
	import FeedHeader from './FeedHeader.svelte';
	import BusyButton from '$lib/BusyButton.svelte';
	import CommunityBadges from './CommunityBadges.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import CommunityJoin from '$lib/CommunityJoin.svelte';
	import { nameAtInstance } from '$lib/nav-utils';
	import { createStatefulAction } from '$lib/utils';
	import { invalidateAll } from '$app/navigation';
	import { communityViewToContentView, getContentViewStore, type ContentViewCommunity } from '$lib/content-views';
	import { profile } from '$lib/profiles/profiles';

	export let contentView: ContentViewCommunity;
	export let readOnly = false;
	$: client = $profile.client;
	$: jwt = $profile.jwt;

	const cvStore = !readOnly ? getContentViewStore() : null;
	$: communityView = contentView.view;
	$: community = communityView.community;

	$: blockState = createStatefulAction<boolean>(async (block) => {
		if (!jwt) {
			return;
		}
		const res = await client.blockCommunity({
			auth: jwt,
			community_id: community.id,
			block
		});

		if (!block) {
			// reload the page to update what's in the feed if they just unblocked,
			// not reloading if they just blocked because they're probably going to go
			// somewhere else so it'd be a useless page load
			invalidateAll();
		}
		cvStore?.updateView(communityViewToContentView(res.community_view));
	});
</script>
