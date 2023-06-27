<Stack dir="r" gap={3}>
	{#each counts as count}
		<Tooltip>
			<span slot="tooltip">{count.label}</span>
			<span class="muted">
				<Icon icon={count.icon} />
			</span>
			<strong>{count.value.toLocaleString()}</strong>
		</Tooltip>
	{/each}
</Stack>

<script lang="ts">
	import { Stack, Tooltip, Icon } from 'sheodox-ui';
	import type { CommunityView } from 'lemmy-js-client';

	export let communityView: CommunityView;
	$: counts = [
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
	];
</script>
