<Title title={data.personUsername} />

{#key data}
	<ContentViewProvider store={cvStore}>
		<PostsPage
			on:more={() => more(data.query.type)}
			feedType="user"
			personView={data.personView}
			{endOfFeed}
			selectedType={data.query.type}
			selectedListing={data.query.listing}
			selectedSort={data.query.sort}
			{loadingContent}
			{loadingContentFailed}
		>
			<div slot="sidebar">
				<article>
					<h1>Stats</h1>
					<UserCounts personView={data.personView} />

					{#if data.personView.person.bio}
						<Fieldset legend="Bio" fieldsetClasses="m-0 mt-3">
							<Markdown md={data.personView.person.bio} />
						</Fieldset>
					{/if}
				</article>
				{#if data.moderates && data.moderates.length}
					<article>
						<h2 class="mb-0">Moderates</h2>
						<Stack dir="c" gap={2}>
							{#each data.moderates as mod}
								<CommunityLink community={mod.community} />
							{/each}
						</Stack>
					</article>
				{/if}

				<hr class="my-8" />
			</div>
		</PostsPage>
	</ContentViewProvider>
{/key}

<script lang="ts">
	import { Stack, Fieldset } from 'sheodox-ui';
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';
	import UserCounts from '$lib/UserCounts.svelte';
	import Markdown from '$lib/Markdown.svelte';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';
	import { userFeedLoader } from '$lib/post-loader.js';
	import Title from '$lib/Title.svelte';
	import { loadFeedData } from '$lib/feed-query.js';
	import type { PageData } from './$types';
	import { createContentViewStore, type ContentView } from '$lib/content-views';

	export let data;

	const cvStore = createContentViewStore();

	let loader: ReturnType<typeof initFeed>;
	$: {
		loader = initFeed(data);
		// load the first page of data
		cvStore.clear();
		endOfFeed = false;
		loadingContent = false;
		loadingContentFailed = false;
		more(data.query.type);
	}

	function initFeed(data: PageData) {
		return userFeedLoader({
			sort: data.query.sort,
			type: data.query.type,
			queryFn: async (page: number) => {
				return await loadFeedData({
					page,
					listing: data.query.listing,
					sort: data.query.sort,
					type: data.query.type,
					username: data.personUsername
				});
			}
		});
	}

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false;

	function filterContentType(cv: ContentView[], type: string) {
		// overview shows both types
		if (type === 'Overview' || type === 'Saved') {
			return cv;
		} else if (type === 'Comments') {
			return cv.filter((content) => content.type === 'comment');
		} else {
			// post and saved only shows posts
			return cv.filter((content) => content.type === 'post');
		}
	}

	async function more(cvType: string) {
		if (endOfFeed || loadingContent) {
			return;
		}
		loadingContent = true;

		const qs = location.search;
		const more = (await loader.next()).value;
		if (qs === location.search) {
			loadingContentFailed = more.error;
			cvStore.append(filterContentType(more.contentViews, cvType));
			endOfFeed = more.endOfFeed;

			loadingContent = false;
		}
	}
</script>
