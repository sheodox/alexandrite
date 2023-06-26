<PostsPage
	settings={data.settings}
	on:more={more}
	feedType="user"
	postViews={data.posts}
	siteView={data.site.site_view}
	personView={data.person_view}
	{endOfFeed}
	selectedType={data.query.type}
	selectedListing={data.query.listing}
	selectedSort={data.query.sort}
	{loadingPosts}
	{loadingPostsFailed}
>
	<div slot="sidebar">
		<article>
			<h1>Stats</h1>
			<Stack dir="c" gap={3}>
				{#each counts as count}
					<Stack dir="r" gap={1} align="center">
						<span class="muted">{count.label}:</span>
						<strong>{count.count.toLocaleString()}</strong>
						<Icon icon={count.icon} variant="icon-only" />
						<span class="muted">&centerdot;</span>
						<strong>{count.score.toLocaleString()}</strong>
						<Icon icon="trophy" variant="icon-only" />
					</Stack>
				{/each}
			</Stack>
		</article>
		{#if data.moderates && data.moderates.length}
			<article>
				<h1>Moderates</h1>
				{#each data.moderates as mod}
					<div />
					<CommunityLink community={mod.community} />
				{/each}
			</article>
			<hr class="my-8" />
		{/if}
	</div>
</PostsPage>

<script lang="ts">
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';
	import { Stack, Icon } from 'sheodox-ui';
	import type { PostView } from 'lemmy-js-client';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import { postLoader } from '$lib/post-loader.js';

	export let data;

	const loader = postLoader<PostView>(
		`/api/posts?username=${data.person_view.person.name}&type=${data.query.type}&listing=${data.query.listing}&sort=${data.query.sort}`,
		'posts'
	);
	let loadingPosts = false,
		loadingPostsFailed = false,
		endOfFeed = false;

	async function more() {
		if (endOfFeed || loadingPosts) {
			return;
		}
		loadingPosts = true;

		const more = (await loader.next()).value;
		loadingPostsFailed = more.error;
		endOfFeed = more.endOfFeed;

		data.posts = [...data.posts, ...more.items.filter((p) => !data.posts.some((p2) => p2.post.id === p.post.id))];

		loadingPosts = false;
	}

	const counts = [
		{
			label: 'Posts',
			score: data.person_view.counts.post_score,
			count: data.person_view.counts.post_count,
			icon: 'file-lines'
		},
		{
			label: 'Comments',
			score: data.person_view.counts.comment_score,
			count: data.person_view.counts.comment_count,
			icon: 'comments'
		}
	];
</script>
