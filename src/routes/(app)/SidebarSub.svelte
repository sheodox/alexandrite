<style lang="scss">
	.community-item {
		border-radius: 5px;
		min-height: 2.6rem;

		&:not(:hover) :global(button) {
			opacity: 0;
			transition: opacity 0.2s;
		}

		&:hover {
			background: var(--sx-gray-transparent);
			a {
				background: none;
			}
		}
	}
	.avatar-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		position: relative;
		line-height: 1;

		div {
			position: relative;
			inset: 0;
		}
	}
	a {
		line-height: 1;
	}
</style>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="f-row gap-2 align-items-center community-item">
	<div class="avatar-icon" on:mouseenter={() => (hovered = true)} on:mouseleave={() => (hovered = false)}>
		{#if hovered}
			<div>
				<IconButton
					text={favorited ? 'Unfavorite' : 'Favorite'}
					variant={favorited ? 'solid' : 'regular'}
					pressed={favorited}
					icon="star"
					placement="right"
					cl="favorite-community m-0 pill"
					on:click={() => dispatch('favorite', { communityId: community.id, favorite: !favorited })}
				/>
			</div>
		{:else}
			<div>
				<Avatar src={community.icon} size="2rem" icon="users" />
			</div>
		{/if}
	</div>
	<a href="/c/{nameAtInstance(community)}" class="f-1 m-0">
		<NameAtInstance place={community} displayName={community.title} prefix="" />
	</a>
</div>

<script lang="ts">
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import IconButton from '$lib/IconButton.svelte';
	import Avatar from '$lib/Avatar.svelte';
	import { nameAtInstance } from '$lib/nav-utils';
	import { createEventDispatcher } from 'svelte';
	import type { Community } from 'lemmy-js-client';

	let hovered = false;

	const dispatch = createEventDispatcher<{
		favorite: { communityId: number; favorite: boolean };
	}>();

	export let favorited: boolean;
	export let community: Community;
</script>
