<Title title="Inbox" />

<BusyButton
	cl="tertiary"
	busy={$markAllReadState.busy}
	on:click={$markAllReadState.submit}
	disabled={$unreadCount === 0}>Mark All As Read</BusyButton
>

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
	<VirtualFeed
		feedSize={contentViews.length}
		on:more={more}
		{endOfFeed}
		feedEndIcon="file-circle-xmark"
		feedEndMessage="No more messages!"
		loading={loadingContent}
		loadMoreFailed={loadingContentFailed}
	>
		<svelte:fragment let:index>
			{@const content = contentViews[index]}
			{#if content.type !== 'message'}
				<Comment commentView={content.view} postOP="" showPost>
					<InboxReadButton {content} slot="actions-start" on:read={(e) => markedRead(content, e.detail)} />
				</Comment>
			{:else}
				<PrivateMessage privateMessageView={content.view}>
					<svelte:fragment slot="actions-start" let:toMe>
						{#if toMe}
							<InboxReadButton {content} on:read={(e) => markedRead(content, e.detail)} />
						{/if}
					</svelte:fragment>
				</PrivateMessage>
			{/if}
			{#if index + 1 < contentViews.length}
				<hr class="w-100" />
			{/if}
		</svelte:fragment>
	</VirtualFeed>
</Stack>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import { InboxListings, InboxSortOptions, InboxTypes } from '$lib/feed-filters';
	import Comment from '$lib/Comment.svelte';
	import PrivateMessage from '$lib/PrivateMessage.svelte';
	import BusyButton from '$lib/BusyButton.svelte';
	import InboxReadButton from '$lib/InboxReadButton.svelte';
	import type { PageData } from './$types';
	import { parseISO } from 'date-fns';
	import { getAppContext } from '$lib/app-context';
	import Title from '$lib/Title.svelte';
	import VirtualFeed from '$lib/VirtualFeed.svelte';
	import { feedLoader, type ContentView } from '$lib/post-loader';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { tick } from 'svelte';
	import type { CommentSortType } from 'lemmy-js-client';
	import { getLemmyClient } from '$lib/lemmy-client';
	import { createStatefulAction } from '$lib/utils';
	import { invalidateAll } from '$app/navigation';

	export let data;

	const { unreadCount, checkUnread } = getAppContext();
	const { client, jwt } = getLemmyClient();

	let loadingContent = false,
		markingAllRead = false,
		loadingContentFailed = false,
		endOfFeed = false,
		contentViews: ReturnType<typeof getContentViews> = [],
		loader: ReturnType<typeof initFeed>;

	$: markAllReadState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		await client.markAllAsRead({
			auth: jwt
		});
		invalidateAll();
		checkUnread();
	});

	$: {
		loader = initFeed(data);
		// load the first page of data
		more();
	}

	type InboxData = Awaited<ReturnType<typeof fetchInboxPage>>;

	function initFeed(data: PageData) {
		const newLoader = feedLoader<InboxData>(
			async (page) => {
				return await fetchInboxPage(page);
			},
			(res) => (res ? res.replies.length + res.mentions.length + res.messages.length : 0)
		);

		loadingContent = false;
		loadingContentFailed = false;
		endOfFeed = false;
		contentViews = [];

		return newLoader;
	}

	function markedRead(contentView: ReturnType<typeof getContentViews>[number], read: boolean) {
		contentView.read = read;
		contentViews = contentViews;
	}

	async function fetchInboxPage(page: number) {
		if (!jwt) {
			return;
		}

		const form = {
			auth: jwt,
			sort: data.query.sort as CommentSortType,
			unread_only: data.query.type === 'Unread',
			page,
			limit: 20
		};

		const isListing = (listing: string) => data.query.listing === listing || data.query.listing === 'All';

		const [replies, mentions, messages] = await Promise.all([
			isListing('Replies') ? client.getReplies(form).then((c) => c.replies) : [],
			isListing('Mentions') ? client.getPersonMentions(form).then((c) => c.mentions) : [],
			isListing('Messages') ? client.getPrivateMessages(form).then((c) => c.private_messages) : []
		]);

		return {
			replies,
			mentions,
			messages
		};
	}

	async function more() {
		if (endOfFeed || loadingContent) {
			return;
		}
		loadingContent = true;

		const feedData = (await loader.next()).value;
		loadingContentFailed = feedData.error;
		endOfFeed = feedData.endOfFeed;
		if (!feedData.error && feedData.response) {
			contentViews = contentViews.concat(getContentViews(feedData.response));
		}

		loadingContent = false;
	}

	function getContentViews(inboxData: InboxData) {
		if (!inboxData) {
			return [];
		}

		const replies = inboxData.replies.map((view) => ({
				type: 'reply' as const,
				view,
				id: view.comment_reply.id,
				read: view.comment_reply.read,
				published: view.comment_reply.published
			})),
			mentions = inboxData.mentions.map((view) => ({
				type: 'mention' as const,
				view,
				id: view.person_mention.id,
				read: view.person_mention.read,
				published: view.person_mention.published
			})),
			messages = inboxData.messages.map((view) => ({
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

	const markAllSubmitFn: SubmitFunction = () => {
		return async ({ update, result }) => {
			await update();
			if (result.type === 'success') {
				markingAllRead = false;

				// no clue why, but if I don't wait a tick the unread count's style updates, but not the count inside
				await tick();
				$unreadCount = 0;
			}
		};
	};
</script>
