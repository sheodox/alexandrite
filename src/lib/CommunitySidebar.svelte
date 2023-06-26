<article>
	<Sidebar counts={communityCounts} description={community.description ?? ''} bannerImageSrc={community.banner}>
		<span slot="name">
			<NameAtInstance place={community} prefix="!" />
			<ExternalLink href={community.actor_id}>
				<Icon icon="arrow-up-right-from-square" />
			</ExternalLink>
		</span>
	</Sidebar>
</article>

<script lang="ts">
	import { Icon, ExternalLink } from 'sheodox-ui';
	import Sidebar from '$lib/Sidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import type { CommunityView, Community } from 'lemmy-js-client';

	export let community: Community;
	export let counts: CommunityView['counts'] | null = null;

	$: communityCounts = counts
		? [
				{
					label: 'Users',
					icon: 'users',
					value: counts.subscribers
				},
				{
					label: 'Posts',
					icon: 'file-lines',
					value: counts.posts
				},
				{
					label: 'Comments',
					icon: 'comments',
					value: counts.comments
				}
		  ]
		: [];
</script>
