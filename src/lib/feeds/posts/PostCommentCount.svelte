<span class:muted={postView.counts.comments === 0} class="ws-nowrap">
	<Icon icon="comments" variant="regular" />
	{postView.counts.comments}
	{#if postView.unread_comments > 0 && postView.unread_comments < postView.counts.comments}
		<span class="sx-badge-orange">+{postView.unread_comments}</span>
	{/if}
</span>
<span class="sr-only">Comments</span>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import type { PostView } from 'lemmy-js-client';
	export let postView: PostView;
</script>
