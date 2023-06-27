<style>
	.user-avatar :global(img) {
		height: 2rem;
		width: 2rem;
		border-radius: 10rem;
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
		<span>{creatorName}</span>
	</div>
	<a href="/u/{creatorName}" class="inline-link" data-sveltekit-preload-data="off"
		><NameAtInstance place={user} prefix="" /></a
	>
</Tooltip>

<script lang="ts">
	import { Stack, Tooltip } from 'sheodox-ui';
	import Image from './Image.svelte';
	import NameAtInstance from './NameAtInstance.svelte';
	import type { Person } from 'lemmy-js-client';
	import { nameAtInstance } from './nav-utils';

	export let user: Person;
	const creatorName = nameAtInstance(user);
</script>
