<FeedHeader icon={communityView.community.icon ?? ''} published={communityView.community.published}>
	<NameAtInstance place={communityView.community} prefix="!" slot="name" />
	<div slot="badges">
		<CommunityBadges community={communityView.community} extended />
	</div>
</FeedHeader>

<script lang="ts">
	import type { CommunityView } from 'lemmy-js-client';
	import FeedHeader from './FeedHeader.svelte';
	import CommunityBadges from './CommunityBadges.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';

	export let communityView: CommunityView;
</script>
