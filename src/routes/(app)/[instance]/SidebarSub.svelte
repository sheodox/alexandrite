<style lang="scss">
	.community-item {
		border-radius: 5px;
		min-height: 2.6rem;

		&:not(:hover) .favorite {
			opacity: 0;
		}

		&:hover {
			background: var(--sx-gray-transparent);
			a {
				background: none;
			}
			.icon {
				opacity: 0.2;
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
			position: absolute;
			transition: opacity 0.2s;
		}
		.favorite {
			position: relative;
		}
	}
	a {
		line-height: 1;
	}
</style>

<div class="f-row gap-2 align-items-center community-item">
	<div class="avatar-icon">
		<div class="icon">
			<Avatar src={community.icon} size="2rem" icon="users" />
		</div>
		<div class="favorite">
			<IconButton
				text={favorited ? 'Unfavorite' : 'Favorite'}
				variant={favorited ? 'solid' : 'regular'}
				pressed={favorited}
				icon="star"
				placement="right"
				cl="favorite-community m-0 pill"
				on:click={onFavoriteToggle}
			/>
		</div>
	</div>
	<a href="/{$profile.instance}/c/{nameAtInstance(community)}" class="f-1 m-0">
		<NameAtInstance place={community} displayName={community.title} prefix="" />
	</a>
</div>

<script lang="ts">
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import IconButton from '$lib/IconButton.svelte';
	import Avatar from '$lib/Avatar.svelte';
	import { nameAtInstance } from '$lib/nav-utils';
	import { createEventDispatcher } from 'svelte';
	import { profile } from '$lib/profiles/profiles';
	import type { Community } from 'lemmy-js-client';

	const dispatch = createEventDispatcher<{
		favorite: { communityId: number; favorite: boolean };
	}>();

	export let favorited: boolean;
	export let community: Community;

	function onFavoriteToggle(e: MouseEvent) {
		e.stopPropagation();
		dispatch('favorite', { communityId: community.id, favorite: !favorited });
	}
</script>
