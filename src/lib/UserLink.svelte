<style lang="scss">
	.user-avatar {
		height: 3rem;
		width: 3rem;
		:global(img) {
			object-fit: cover;
			border-radius: 10rem;
			height: 100%;
			width: 100%;
		}
	}
	.user-avatar.inline {
		height: 1em;
		width: 1em;
	}
	.op {
		color: var(--sx-peach-300) !important;
	}
</style>

<Tooltip>
	<div slot="tooltip">
		<Stack gap={2} dir="r" align="center">
			{#if user.avatar && ls.show_avatars}
				<div class="user-avatar">
					<Image src={user.avatar} mode="thumbnail" />
				</div>
			{/if}
			<h1 class="sx-font-size-4 m-0">
				{user.display_name ?? user.name}
			</h1>
		</Stack>
		<span> {creatorName}</span>
	</div>
	<a href="/u/{creatorName}" class="inline-link f-row gap-1" data-sveltekit-preload-data="off" class:op={isOP}>
		{#if user.avatar && ls.show_avatars}
			<div class="user-avatar inline">
				<Image src={user.avatar} mode="thumbnail" thumbnailResolution={16} />
			</div>
		{/if}
		<span>
			<NameAtInstance place={user} displayName={user.display_name} prefix="" />
		</span>
	</a>
</Tooltip>

<script lang="ts">
	import { Stack, Tooltip } from 'sheodox-ui';
	import Image from './Image.svelte';
	import NameAtInstance from './NameAtInstance.svelte';
	import type { Person } from 'lemmy-js-client';
	import { nameAtInstance } from './nav-utils';
	import { getLemmySettings } from './lemmy-settings';

	export let user: Person;
	export let isOP = false;

	$: creatorName = nameAtInstance(user);

	const ls = getLemmySettings();
</script>
