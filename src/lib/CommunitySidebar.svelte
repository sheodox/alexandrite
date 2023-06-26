<article>
	<Sidebar counts={communityCounts} description={communityView.community.description ?? ''}>
		<span slot="name">
			<NameAtInstance place={communityView.community} prefix="!" />
			<ExternalLink href={communityView.community.actor_id}>
				<Icon icon="arrow-up-right-from-square" />
			</ExternalLink>
		</span></Sidebar
	>
</article>

<script lang="ts">
	import { Icon, ExternalLink } from 'sheodox-ui';
	import Sidebar from '$lib/Sidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import type { CommunityView } from 'lemmy-js-client';

	export let communityView: CommunityView;

	$: communityCounts = communityView?.counts
		? [
				{
					label: 'Users',
					icon: 'users',
					value: communityView.counts.subscribers
				},
				{
					label: 'Posts',
					icon: 'file-lines',
					value: communityView.counts.posts
				},
				{
					label: 'Comments',
					icon: 'comments',
					value: communityView.counts.comments
				}
		  ]
		: [];
</script>
