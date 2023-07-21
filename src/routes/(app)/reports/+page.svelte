<form method="GET" use:navigateOnChange>
	<section>
		<Stack gap={4} align="center" cl="py-4" dir="r" justify="between">
			<Stack gap={4} align="center" cl="f-wrap" dir="r">
				<ToggleGroup options={ReportFeedStateOptions} bind:selected={selectedState} name="state" />
				<ToggleGroup options={ReportFeedTypeOptions} bind:selected={selectedType} name="type" />
			</Stack>
			<BusyButton on:click={$refreshState.submit} busy={$refreshState.busy} cl="tertiary">Refresh</BusyButton>
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
			feedEndMessage="No more reports!"
			loading={loadingContent}
			loadMoreFailed={loadingContentFailed}
		>
			<svelte:fragment let:index>
				{@const content = $cvStore[index]}
				{#if content.type === 'post-report'}
					<ReportedPost
						view={content.view}
						bannedFromCommunity={$bannedUsers.get(content.view.post_creator.id) ?? false}
					/>
				{:else if content.type === 'comment-report'}
					<ReportedComment
						view={content.view}
						bannedFromCommunity={$bannedUsers.get(content.view.comment_creator.id) ?? false}
					/>
				{/if}
				{#if index + 1 < $cvStore.length}
					<hr class="w-100 my-6" />
				{/if}
			</svelte:fragment>
		</VirtualFeed>
	</ContentViewProvider>
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import { ReportFeedStateOptions, ReportFeedTypeOptions } from '$lib/feed-filters.js';
	import { getAppContext } from '$lib/app-context.js';
	import { getLemmyClient } from '$lib/lemmy-client.js';
	import {
		commentReportViewToContentView,
		createContentViewStore,
		postReportViewToContentView
	} from '$lib/content-views.js';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';
	import VirtualFeed from '$lib/VirtualFeed.svelte';
	import BusyButton from '$lib/BusyButton.svelte';
	import { createStatefulAction, navigateOnChange } from '$lib/utils.js';
	import type { PageData } from './$types';
	import { feedLoader } from '$lib/post-loader';
	import { parseISO } from 'date-fns';
	import ReportedPost from './ReportedPost.svelte';
	import ReportedComment from './ReportedComment.svelte';
	import { writable } from 'svelte/store';
	import { setBannedUsers } from './banned-users-context';

	export let data;

	let selectedState = data.query.state;
	let selectedType = data.query.type;

	const { checkUnreadReports } = getAppContext();
	const { client, jwt } = getLemmyClient();
	const cvStore = createContentViewStore();
	const bannedUsers = writable(new Map<number, boolean>());

	setBannedUsers(bannedUsers);

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false,
		loader: ReturnType<typeof initFeed>;

	$: refreshState = createStatefulAction(async () => {
		checkUnreadReports();
		loader = initFeed(data);
		cvStore.clear();
		await more();
	});

	$: {
		checkUnreadReports();
		loader = initFeed(data);
		// load the first page of data
		more();
	}

	type RepordsData = Awaited<ReturnType<typeof fetchReportsPage>>;

	function initFeed(data: PageData) {
		const newLoader = feedLoader<RepordsData>(
			async (page) => {
				return await fetchReportsPage(page, data);
			},
			(res) => (res ? res.posts.length + res.comments.length : 0)
		);

		loadingContent = false;
		loadingContentFailed = false;
		endOfFeed = false;
		cvStore.clear();

		return newLoader;
	}

	async function fetchReportsPage(page: number, data: PageData) {
		if (!jwt) {
			return;
		}

		const form = {
			auth: jwt,
			unresolved_only: data.query.state === 'Unread',
			page,
			limit: 20
		};

		const isType = (type: string) => data.query.type === type || data.query.type === 'All';

		const [posts, comments] = await Promise.all([
			isType('Posts') ? client.listPostReports(form).then((c) => c.post_reports) : [],
			isType('Comments') ? client.listCommentReports(form).then((c) => c.comment_reports) : []
		]);

		[
			...posts.map((p) => ({ view: p, creatorId: p.post_creator.id })),
			...comments.map((c) => ({ view: c, creatorId: c.comment_creator.id }))
		].forEach(({ view, creatorId }) => {
			bannedUsers.update((b) => {
				b.set(creatorId, view.creator_banned_from_community);
				return b;
			});
		});

		return {
			posts,
			comments
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

	function getContentViews(reportsData: RepordsData) {
		if (!reportsData) {
			return [];
		}

		const posts = reportsData.posts.map(postReportViewToContentView),
			comments = reportsData.comments.map(commentReportViewToContentView);

		if (data.query.type === 'All') {
			return [...posts, ...comments].sort((a, b) => {
				const aPublished = parseISO(a.published + 'Z').getTime(),
					bPublished = parseISO(b.published + 'Z').getTime();

				// oldest first, probably the most visible thing?
				return aPublished - bPublished;
			});
		}

		switch (data.query.type) {
			case 'Posts':
				return posts;
			case 'Comments':
				return comments;
		}

		return [];
	}
</script>
