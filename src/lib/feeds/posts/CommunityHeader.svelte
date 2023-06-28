<FeedHeader icon={communityView.community.icon ?? ''} published={communityView.community.published}>
	<NameAtInstance place={communityView.community} prefix="!" slot="name" />
	<Stack dir="r" gap={2} align="center" slot="actions">
		{#if !readonly}
			<CommunityJoin {communityView} />
			<a href="/c/{nameAtInstance(communityView.community)}/post" class="button secondary">
				<Icon icon="plus" /> Post
			</a>
		{/if}
	</Stack>
	<div slot="badges">
		<CommunityBadges community={communityView.community} extended />
	</div>
</FeedHeader>

<script lang="ts">
	import { Icon, Stack } from 'sheodox-ui';
	import type { CommunityView } from 'lemmy-js-client';
	import FeedHeader from './FeedHeader.svelte';
	import CommunityBadges from './CommunityBadges.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import CommunityJoin from '$lib/CommunityJoin.svelte';
	import { nameAtInstance } from '$lib/nav-utils';

	export let communityView: CommunityView;
	export let readonly = false;
</script>
