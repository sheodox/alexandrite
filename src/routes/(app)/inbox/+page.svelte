<form method="POST" action="?/markAllAsRead" use:enhance>
	<button class="tertiary">Mark All As Read</button>
</form>

<form method="GET" data-sveltekit-replacestate>
	<section>
		<Stack gap={4} align="center" cl="py-4" dir="r">
			<ToggleGroup options={InboxTypes} name="type" selected={data.query.type} />
			<ToggleGroup options={InboxListings} name="listing" selected={data.query.listing} />
			<select aria-label="Post Sort" name="sort" required value={data.query.sort}>
				{#each InboxSortOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>

			<button class="tertiary">Go <Icon icon="chevron-right" variant="icon-only" /></button>
		</Stack>
	</section>
</form>

<Stack dir="c" gap={2}>
	{#each contentViews as content, i}
		{#if content.type !== 'message'}
			<Comment commentView={content.view} postOP="" showPost>
				<InboxReadButton {content} slot="actions-start" />
			</Comment>
		{:else}
			<PrivateMessage privateMessageView={content.view}>
				<InboxReadButton {content} slot="actions-start" />
			</PrivateMessage>
		{/if}
		{#if i + 1 < contentViews.length}
			<hr class="w-100" />
		{/if}
	{:else}
		<FeedBanner icon="comments" message="No content" />
	{/each}
</Stack>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import { InboxListings, InboxSortOptions, InboxTypes } from '$lib/feed-filters';
	import Comment from '$lib/Comment.svelte';
	import IconButton from '$lib/IconButton.svelte';
	import PrivateMessage from '$lib/PrivateMessage.svelte';
	import FeedBanner from '$lib/feeds/posts/FeedBanner.svelte';
	import { enhance } from '$app/forms';
	import InboxReadButton from '$lib/InboxReadButton.svelte';
	import type { PageData } from './$types';
	import { parseISO } from 'date-fns';

	export let data;

	$: contentViews = getContentViews(data);

	function getContentViews(data: PageData) {
		const replies = data.replies.map((view) => ({
				type: 'reply' as const,
				view,
				id: view.comment_reply.id,
				read: view.comment_reply.read,
				published: view.comment_reply.published
			})),
			mentions = data.mentions.map((view) => ({
				type: 'mention' as const,
				view,
				id: view.person_mention.id,
				read: view.person_mention.read,
				published: view.person_mention.published
			})),
			messages = data.messages.map((view) => ({
				type: 'message' as const,
				view,
				id: view.private_message.id,
				read: view.private_message.read,
				published: view.private_message.published
			}));

		if (data.query.listing === 'All') {
			return [...replies, ...mentions, ...messages].sort((a, b) => {
				const aPublished = parseISO(a.published + 'Z').getTime(),
					bPublished = parseISO(b.published + 'Z').getTime();

				if (data.query.sort === 'New') {
					return bPublished - aPublished;
				} else if (data.query.sort === 'Old') {
					return aPublished - bPublished;
				} else {
					return b.id - a.id;
				}
			});
		}

		switch (data.query.listing) {
			case 'Replies':
				return replies;
			case 'Mentions':
				return replies;
			case 'Messages':
				return messages;
		}

		return [];
	}
</script>
