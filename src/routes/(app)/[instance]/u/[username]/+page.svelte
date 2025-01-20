<style lang="scss">
	.bio {
		background: var(--sx-gray-transparent);
		border-radius: 10px;
		overflow: hidden;
	}
</style>

<Title title={data.personUsername} />

{#key data}
	<ContentViewProvider store={cvStore}>
		<PostsPage
			on:more={() => more(data.query.type)}
			on:refresh={() => refresh(data)}
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
				<h1>
					<NameAtInstance place={data.personView.person} displayName={data.personView.person.display_name} prefix="@" />
				</h1>
				<Stack dir="c" gap={2}>
					<article class="f-column gap-4">
						{#if data.personView.person.bio}
							<div>
								<h2 class="m-0">Bio</h2>
								<div class="bio p-2">
									<Markdown md={data.personView.person.bio} />
								</div>
							</div>
						{/if}

						<div>
							<h2 class="m-0">Stats</h2>
							<ul class="sx-list">
								<UserCounts personView={data.personView} />

								<li class="sx-list-item">
									<ModlogLink
										highlight={false}
										highlightColor={'gray'}
										warn={$showModlogWarning}
										label="Modlog (actions on this user)"
										targetId={data.personView.person.id}
									/>
								</li>
								<!-- probably unnecessary to check this, but just in case -->
								{#if data.personView.person.actor_id.startsWith('http')}
									<li class="sx-list-item">
										<ExternalLink href={data.personView.person.actor_id} cl="inline-link"
											><Icon icon="arrow-up-right-from-square" /> Original Profile</ExternalLink
										>
									</li>
								{/if}
							</ul>
						</div>
					</article>

					{#if data.moderates && data.moderates.length}
						<article>
							<h2 class="mb-0">Moderates</h2>
							<ul class="sx-list">
								{#each data.moderates as mod}
									<li class="sx-list-item">
										<CommunityLink community={mod.community} />
									</li>
								{/each}
							</ul>
						</article>
					{/if}
				</Stack>

				<hr class="my-8" />
			</div>
		</PostsPage>
	</ContentViewProvider>
{/key}

<script lang="ts">
	import { Stack, ExternalLink, Icon } from 'sheodox-ui';
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';
	import UserCounts from '$lib/UserCounts.svelte';
	import Markdown from '$lib/Markdown.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';
	import { userFeedLoader } from '$lib/post-loader.js';
	import Title from '$lib/Title.svelte';
	import { loadFeedData } from '$lib/feed-query.js';
	import type { PageData } from './$types';
	import { createContentViewStore, type ContentView } from '$lib/content-views';
	import ModlogLink from '$lib/ModlogLink.svelte';
	import { getSettingsContext } from '$lib/settings-context';

	export let data;

	const { showModlogWarning } = getSettingsContext();
	const cvStore = createContentViewStore();

	let loader: ReturnType<typeof initFeed>;
	$: {
		refresh(data);
	}

	function refresh(data: PageData) {
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
