<Title title="Inbox" />

<BusyButton
	cl="tertiary"
	busy={$markAllReadState.busy}
	on:click={$markAllReadState.submit}
	disabled={$unreadCount === 0}>Mark All As Read</BusyButton
>

<form method="GET" use:navigateOnChange>
	<section>
		<Stack gap={4} align="center" cl="py-4" dir="r" justify="between">
			<Stack gap={4} align="center" dir="r">
				<ToggleGroup options={InboxTypes} name="type" selected={data.query.type} />
				<ToggleGroup options={InboxListings} name="listing" selected={data.query.listing} />
				<select aria-label="Post Sort" name="sort" required value={data.query.sort}>
					{#each InboxSortOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</Stack>
			<BusyButton on:click={$refreshState.submit} busy={$refreshState.busy} cl="tertiary" type="button"
				>Refresh</BusyButton
			>
		</Stack>
	</section>
</form>

<Stack dir="c" gap={2}>
	<ContentViewProvider store={cvStore}>
		<VirtualFeed
			feedSize={$cvStore.length}
			on:more={more}
			{endOfFeed}
			feedEndIcon="file-circle-xmark"
			feedEndMessage="No more messages!"
			loading={loadingContent}
			loadMoreFailed={loadingContentFailed}
		>
			<svelte:fragment let:index>
				{@const content = $cvStore[index]}
				{#if content.type === 'mention' || content.type === 'reply'}
					<Comment contentView={content} postOP="" showPost>
						<InboxReadButton {content} slot="actions-start" />
					</Comment>
				{:else if content.type === 'message'}
					<PrivateMessage privateMessageView={content.view}>
						<svelte:fragment slot="actions-start" let:toMe>
							{#if toMe}
								<InboxReadButton {content} />
							{/if}
						</svelte:fragment>
					</PrivateMessage>
				{/if}
				{#if index + 1 < $cvStore.length}
					<hr class="w-100" />
				{/if}
			</svelte:fragment>
		</VirtualFeed>
	</ContentViewProvider>
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import { InboxListings, InboxSortOptions, InboxTypes } from '$lib/feed-filters';
	import Comment from '$lib/Comment.svelte';
	import PrivateMessage from '$lib/PrivateMessage.svelte';
	import BusyButton from '$lib/BusyButton.svelte';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';
	import InboxReadButton from '$lib/InboxReadButton.svelte';
	import type { PageData } from './$types';
	import { parseISO } from 'date-fns';
	import { getAppContext } from '$lib/app-context';
	import Title from '$lib/Title.svelte';
	import VirtualFeed from '$lib/VirtualFeed.svelte';
	import { feedLoader } from '$lib/post-loader';
	import type { CommentSortType } from 'lemmy-js-client';
	import { getLemmyClient } from '$lib/lemmy-client';
	import { createStatefulAction, navigateOnChange } from '$lib/utils';
	import { invalidateAll } from '$app/navigation';
	import {
		createContentViewStore,
		mentionViewToContentView,
		messageViewToContentView,
		replyViewToContentView
	} from '$lib/content-views';

	export let data;

	const { unreadCount, checkUnread } = getAppContext();
	const { client, jwt } = getLemmyClient();
	const cvStore = createContentViewStore();

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false,
		loader: ReturnType<typeof initFeed>;

	$: refreshState = createStatefulAction(async () => {
		checkUnread();
		loader = initFeed(data);
		cvStore.clear();
		await more();
	});

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
		checkUnread();
		loader = initFeed(data);
		// load the first page of data
		more();
	}

	type InboxData = Awaited<ReturnType<typeof fetchInboxPage>>;

	function initFeed(data: PageData) {
		const newLoader = feedLoader<InboxData>(
			async (page) => {
				return await fetchInboxPage(page, data);
			},
			(res) => (res ? res.replies.length + res.mentions.length + res.messages.length : 0)
		);

		loadingContent = false;
		loadingContentFailed = false;
		endOfFeed = false;
		cvStore.clear();

		return newLoader;
	}

	async function fetchInboxPage(page: number, data: PageData) {
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

		const qs = location.search;
		const feedData = (await loader.next()).value;
		if (qs === location.search) {
			loadingContentFailed = feedData.error;
			endOfFeed = feedData.endOfFeed;
			if (!feedData.error && feedData.response) {
				cvStore.append(getContentViews(feedData.response));
			}

			loadingContent = false;
		}
	}

	function getContentViews(inboxData: InboxData) {
		if (!inboxData) {
			return [];
		}

		const replies = inboxData.replies.map(replyViewToContentView),
			mentions = inboxData.mentions.map(mentionViewToContentView),
			messages = inboxData.messages.map(messageViewToContentView);

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
				return mentions;
			case 'Messages':
				return messages;
		}

		return [];
	}
</script>
