<style>
	.community-avatar :global(img) {
		height: 2rem;
		width: 2rem;
		border-radius: 10rem;
	}
</style>

<Tooltip>
	<div slot="tooltip">
		<Stack gap={2} dir="r" align="center">
			{#if community.icon}
				<div class="community-avatar">
					<Image src={community.icon} />
				</div>
			{/if}
			<h1 class="sx-font-size-4 m-0">
				{communityName}
			</h1>
		</Stack>
	</div>
	<a href="/c/{communityName}" class="inline-link">{communityName}</a>
</Tooltip>

<script lang="ts">
	import { Stack, Tooltip } from 'sheodox-ui';
	import Image from './Image.svelte';
	import { nameAtInstance } from './nav-utils';
	import type { Community } from 'lemmy-js-client';

	export let community: Community;
	const communityName = nameAtInstance(community);
</script>
