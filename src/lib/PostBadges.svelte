{#if badges.length}
	<span class="sx-font-size-2 f-row">
		{#each badges as b}
			<Tooltip>
				<span slot="tooltip">{b.text}</span>
				<span class="sx-badge-{b.color} ws-nowrap">
					{#if b.icon}
						<Icon icon={b.icon} />
					{/if}
					<span class:sr-only={!!b.icon}>{b.text}</span>
				</span>
			</Tooltip>
		{/each}
	</span>
{/if}

<script lang="ts">
	import { Icon, Tooltip } from 'sheodox-ui';
	import type { PostView } from 'lemmy-js-client';

	export let postView: PostView;

	$: badges = getBadges(postView);

	function getBadges(postView: PostView) {
		const badges = [];
		const post = postView.post;

		if (post.nsfw) {
			badges.push({ color: 'red', text: 'NSFW' });
		}
		if (post.locked) {
			badges.push({ color: 'orange', text: 'Locked', icon: 'lock' });
		}
		if (post.deleted) {
			badges.push({ color: 'red', text: 'Deleted', icon: 'trash' });
		}
		if (post.featured_local) {
			badges.push({ color: 'orange', text: 'Featured in Local', icon: 'thumbtack' });
		}
		if (post.featured_community) {
			badges.push({ color: 'green', text: 'Featured in Community', icon: 'thumbtack' });
		}
		return badges;
	}
</script>
