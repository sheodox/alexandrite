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
</style>

<Tooltip>
	<div slot="tooltip">
		<Stack gap={2} dir="r" align="center">
			{#if user.avatar}
				<div class="user-avatar">
					<Image src={user.avatar} />
				</div>
			{/if}
			<h1 class="sx-font-size-4 m-0">
				{user.display_name ?? user.name}
			</h1>
		</Stack>
		<span> {creatorName}</span>
	</div>
	<a href="/u/{creatorName}" class="inline-link f-row gap-1" data-sveltekit-preload-data="off">
		{#if user.avatar}
			<div class="user-avatar inline">
				<Image src={user.avatar} />
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

	export let user: Person;
	$: creatorName = nameAtInstance(user);
</script>
