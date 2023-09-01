<FeedHeader icon={community.icon ?? ''} published={community.published}>
	<NameAtInstance place={community} displayName={community.title} prefix="" slot="name" />
	<Stack dir="r" gap={2} align="center" slot="actions" cl="f-1">
		{#if !readOnly}
			<CommunityJoin {communityView} />
			<ChainButtons {actions} cl="tertiary" />
		{/if}
	</Stack>
	<div slot="badges">
		<CommunityBadges {community} extended />
	</div>
</FeedHeader>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import FeedHeader from './FeedHeader.svelte';
	import CommunityBadges from './CommunityBadges.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import ChainButtons from '$lib/ChainButtons.svelte';
	import CommunityJoin from '$lib/CommunityJoin.svelte';
	import { nameAtInstance } from '$lib/nav-utils';
	import { createStatefulAction, type ExtraAction } from '$lib/utils';
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

	let actions: ExtraAction[];
	$: actions = [
		{
			text: 'Post',
			icon: 'plus',
			href: `/${$profile.instance}/create/post?community=${nameAtInstance(community)}`
		},
		{
			text: 'Search',
			icon: 'magnifying-glass',
			href: `/${$profile.instance}/search?community=${nameAtInstance(community)}`
		},
		...($profile.loggedIn
			? [
					{
						text: !communityView.blocked ? 'Block' : 'Unblock',
						click: () => $blockState.submit(!communityView.blocked),
						icon: !communityView.blocked ? 'ban' : 'circle-check'
					}
			  ]
			: [])
	];
</script>
