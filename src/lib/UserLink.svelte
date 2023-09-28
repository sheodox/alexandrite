<style lang="scss">
	.op {
		color: var(--sx-peach-300) !important;
	}
</style>

<Tooltip>
	<div slot="tooltip">
		<Stack gap={2} dir="r" align="center">
			{#if user.avatar && showAvatar}
				<div class="user-avatar">
					<Avatar src={user.avatar} icon="user" size="3rem" />
				</div>
			{/if}
			<h1 class="sx-font-size-4 m-0">
				{user.display_name ?? user.name}
			</h1>
		</Stack>
		<span> {creatorName}</span>
	</div>
	<a
		href="/{$profile.instance}/u/{creatorName}"
		class="inline-link f-row gap-1 align-items-center"
		data-sveltekit-preload-data="off"
		class:op={isOP}
	>
		{#if (user.avatar && showAvatar) || showAvatarFallback}
			<div class="user-avatar inline">
				<Avatar src={user.avatar} size="1em" icon="user" />
			</div>
		{/if}
		<span>
			<NameAtInstance place={user} displayName={user.display_name} prefix="" />
		</span>
	</a>
</Tooltip>

<script lang="ts">
	import { Stack, Tooltip } from 'sheodox-ui';
	import Avatar from './Avatar.svelte';
	import NameAtInstance from './NameAtInstance.svelte';
	import type { Person } from 'lemmy-js-client';
	import { nameAtInstance } from './nav-utils';
	import { profile } from './profiles/profiles';

	export let user: Person;
	export let isOP = false;
	export let showAvatarFallback = false;

	$: creatorName = nameAtInstance(user);

	$: showAvatar = $profile.settings.show_avatars && user.avatar && !user.deleted && !user.banned;
</script>
