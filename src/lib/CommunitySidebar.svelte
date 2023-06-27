<article>
	<Sidebar description={community.description ?? ''} bannerImageSrc={community.banner}>
		<span slot="name">
			<NameAtInstance place={community} prefix="!" />
			<ExternalLink href={community.actor_id}>
				<Icon icon="arrow-up-right-from-square" />
			</ExternalLink>
		</span>

		<div slot="actions">
			{#if communityView}
				<CommunityCounts {communityView} />
			{/if}
		</div>
	</Sidebar>
</article>

<script lang="ts">
	import { Icon, ExternalLink } from 'sheodox-ui';
	import Sidebar from '$lib/Sidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import CommunityCounts from './CommunityCounts.svelte';
	import type { CommunityView, Community } from 'lemmy-js-client';

	export let community: Community;
	export let communityView: CommunityView | null = null;
</script>
