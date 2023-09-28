<style>
	.reason {
		border-radius: 10px;
		background: var(--sx-gray-transparent);
		padding: var(--sx-spacing-1);
	}
	.target {
		max-width: 30rem;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
</style>

<tr>
	<td>
		<RelativeTime date={modlog.when} />
	</td>
	<td>
		<span class="sx-badge-{action.color || 'gray'} ws-nowrap">
			<Icon icon={action.icon} />
			{action.text}
		</span>
	</td>
	{#if modlog.moderator}
		<td>
			<Stack dir="c" gap={1}>
				{#if censorMods}
					<span>{censorModerator(modlog.moderator)}</span>
				{:else}
					<UserLink user={modlog.moderator} />
					<UserBadges user={modlog.moderator} />
				{/if}
			</Stack>
		</td>
	{/if}
	<td>
		<Stack dir="c" gap={1}>
			{#if modlog.target}
				<div class="target">
					{#if modlog.target.href}
						<a href={modlog.target.href} class="inline-link" title={modlog.target.text}>
							{#if modlog.target.icon}
								<Icon icon={modlog.target.icon} />
							{/if}
							{modlog.target.text}</a
						>
					{:else}
						<span>
							{#if modlog.target.icon}
								<Icon icon={modlog.target.icon} />
							{/if}
							{modlog.target.text}</span
						>
					{/if}
				</div>
			{/if}

			{#if modlog.reason}
				<div class="reason">
					<span class="muted fw-bold">Reason:</span>
					{modlog.reason}
				</div>
			{/if}
			{#if modlog.expires}
				<p class="f-row gap-1 m-0">Expires: <RelativeTime date={modlog.expires} /></p>
			{/if}
		</Stack>
	</td>

	{#if showCommunity}
		<td>
			{#if modlog.community}
				<Stack dir="c" gap={1}>
					<CommunityLink community={modlog.community} showBadges={false} />
					<CommunityBadges community={modlog.community} />
				</Stack>
			{/if}
		</td>
	{/if}
</tr>

<script lang="ts">
	import type { ContentViewModlog } from '$lib/content-views';
	import { Icon, Stack } from 'sheodox-ui';
	import UserLink from '$lib/UserLink.svelte';
	import RelativeTime from '$lib/RelativeTime.svelte';
	import CommunityBadges from '$lib/feeds/posts/CommunityBadges.svelte';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import UserBadges from '$lib/feeds/posts/UserBadges.svelte';
	import type { Person } from 'lemmy-js-client';
	import { getAppContext } from '$lib/app-context';

	export let modlog: ContentViewModlog;
	export let showCommunity: boolean;
	export let censorMods: boolean;

	const { siteMeta } = getAppContext();

	$: action = getAction(modlog);

	function censorModerator(mod: Person) {
		return $siteMeta.admins.some((admin) => admin.person.id === mod.id) ? 'Admin' : 'Mod';
	}

	function getAction(modlog: ContentViewModlog) {
		if (modlog.type === 'mod-ban') {
			return modlog.bannedInstance
				? {
						color: 'orange',
						icon: 'ban',
						text: 'Banned (Instance)'
				  }
				: {
						color: 'blue',
						icon: 'check',
						text: 'Unbanned (Instance)'
				  };
		} else if (modlog.type === 'mod-add') {
			return modlog.removed
				? {
						color: 'red',
						icon: 'user-minus',
						text: 'Admin Removed'
				  }
				: {
						color: 'orange',
						icon: 'user-plus',
						text: 'Admin Added'
				  };
		} else if (modlog.type === 'mod-lock-post') {
			return modlog.locked
				? {
						color: 'green',
						icon: 'lock',
						text: 'Locked'
				  }
				: {
						color: 'green',
						icon: 'lock-open',
						text: 'Unlocked'
				  };
		} else if (modlog.type === 'mod-remove-post') {
			return modlog.removed
				? {
						color: 'red',
						icon: 'trash-can',
						text: 'Post Removed'
				  }
				: {
						color: 'blue',
						icon: 'recycle',
						text: 'Post Restored'
				  };
		} else if (modlog.type === 'mod-feature-post') {
			const isCom = modlog.featureType === 'community';
			let loc = modlog.featureType ?? 'unknown';
			loc = loc.substring(0, 1).toUpperCase() + loc.substring(1);

			return {
				color: isCom ? 'green' : 'orange',
				icon: 'thumbtack',
				text: modlog.featured ? `Pinned (${loc})` : `Unpinned (${loc})`
			};
		} else if (modlog.type === 'admin-purge-post') {
			return {
				color: 'orange',
				icon: 'fire',
				text: 'Post Purged'
			};
		} else if (modlog.type === 'mod-ban-community') {
			return modlog.bannedCommunity
				? {
						color: 'red',
						icon: 'ban',
						text: 'Banned (Community)'
				  }
				: {
						color: 'blue',
						icon: 'check',
						text: 'Unbanned (Community)'
				  };
		} else if (modlog.type === 'mod-add-community') {
			return modlog.removed
				? {
						color: 'red',
						icon: 'user-minus',
						text: 'Mod Removed'
				  }
				: {
						color: 'green',
						icon: 'user-plus',
						text: 'Mod Added'
				  };
		} else if (modlog.type === 'mod-remove-comment') {
			return modlog.removed
				? {
						color: 'red',
						icon: 'trash-can',
						text: 'Comment Removed'
				  }
				: {
						color: 'blue',
						icon: 'recycle',
						text: 'Comment Restored'
				  };
		} else if (modlog.type === 'admin-purge-person') {
			return {
				color: 'orange',
				icon: 'fire',
				text: 'Person Purged'
			};
		} else if (modlog.type === 'admin-purge-comment') {
			return {
				color: 'orange',
				icon: 'fire',
				text: 'Comment Purged'
			};
		} else if (modlog.type === 'mod-remove-community') {
			return modlog.removed
				? {
						color: 'red',
						icon: 'users-slash',
						text: 'Community Removed'
				  }
				: {
						color: 'blue',
						icon: 'users',
						text: 'Community Restored'
				  };
		} else if (modlog.type === 'admin-purge-community') {
			return {
				color: 'orange',
				icon: 'fire',
				text: 'Community Purged'
			};
		} else if (modlog.type === 'mod-transfer-community') {
			return {
				icon: 'transfer',
				text: 'Community Transferred'
			};
		} else if (modlog.type === 'admin-mod-hide-community') {
			return modlog.removed
				? {
						color: 'orange',
						icon: 'eye-slash',
						text: 'Community Hidden'
				  }
				: {
						color: 'orange',
						icon: 'eye',
						text: 'Community Unhidden'
				  };
		}

		return {
			icon: 'question-circle',
			text: 'Unknown'
		};
	}
</script>
