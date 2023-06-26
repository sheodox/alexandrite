<style>
	hr {
		border-color: var(--sx-gray-transparent-light);
	}
	#scroll-more {
		position: relative;
		top: -750px;
	}
	.end-of-feed {
		height: 20rem;
		background: var(--sx-gray-800);
	}
</style>

<div class="py-1">
	<Stack dir="column" gap={1}>
		<form method="GET" action="">
			<section>
				<Stack gap={4} align="center" cl="p-4" dir="r">
					<ToggleGroup options={typeOptions} bind:selected={selectedType} name="type" />
					<ToggleGroup options={sourceOptions} bind:selected={selectedListing} name="listing" />
					<select aria-label="Post Sort" bind:value={selectedSort} name="sort">
						{#each sortOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>

					<button class="tertiary">Go <Icon icon="chevron-right" variant="icon-only" /></button>
				</Stack>
			</section>
		</form>

		{#if selectedType === 'Posts'}
			{#each postViews as pv, i (pv.post.id)}
				<Post postView={pv} on:overlay />
				{#if i + 1 < postViews.length}
					<hr class="w-100" />
				{/if}
			{/each}
		{:else}
			<p>Comment listing coming soon</p>
		{/if}
	</Stack>
</div>

<div bind:this={scrollMore} id="scroll-more" />
{#if endOfFeed}
	<section class="end-of-feed f-row justify-content-center">
		<Stack dir="c" align="center" justify="center" cl="f-1">
			<p class="m-0 sx-font-size-12"><Icon icon="file-circle-xmark" variant="icon-only" /></p>
			<p class="m-0 sx-font-size-6">No more posts!</p>
		</Stack>
	</section>
{/if}

<script lang="ts">
	import { enhance } from '$app/forms';
	import { Stack, Icon } from 'sheodox-ui';
	import Post from './Post.svelte';
	import CommentTree from '$lib/CommentTree.svelte';
	import type { PostView } from 'lemmy-js-client';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	const dispatch = createEventDispatcher<{ more: void }>();

	export let postViews: PostView[];
	export let endOfFeed: boolean;

	let scrollMore: HTMLElement;
	let observer: IntersectionObserver | null;
	export let selectedType: string; // default  'Posts';
	export let selectedListing: string; // default 'Local';
	export let selectedSort: string; // default 'Hot';

	const typeOptions = [
			{
				value: 'Posts',
				label: 'Posts'
			},
			{
				value: 'Comments',
				label: 'Comments'
			}
		],
		sourceOptions = [
			{
				value: 'Subscribed',
				label: 'Subscribed'
			},
			{
				value: 'Local',
				label: 'Local'
			},
			{
				value: 'All',
				label: 'All'
			}
		],
		sortOptions = [
			{
				value: 'Hot',
				label: 'Hot',
				hidden: false
			},
			{
				value: 'Active',
				label: 'Active',
				hidden: false
			},
			{
				value: 'New',
				label: 'New',
				hidden: false
			},
			{
				value: 'Old',
				label: 'Old',
				hidden: false
			},
			{
				value: 'MostComments',
				label: 'Most Comments',
				hidden: false
			},
			{
				value: 'NewComments',
				label: 'New Comments',
				hidden: false
			},
			{
				value: 'TopDay',
				label: 'Top Day',
				hidden: false
			},
			{
				value: 'TopWeek',
				label: 'Top Week',
				hidden: false
			},
			{
				value: 'TopMonth',
				label: 'Top Month',
				hidden: false
			},
			{
				value: 'TopYear',
				label: 'Top Year'
			},
			{
				value: 'TopAll',
				label: 'Top All Time',
				hidden: false
			}
		];

	function maybeMore(entries: IntersectionObserverEntry[]) {
		if (endOfFeed) {
			observer?.disconnect();
			observer = null;
			return;
		}
		for (const entry of entries) {
			if (entry.isIntersecting) {
				dispatch('more');
				return;
			}
		}
	}

	onMount(() => {
		observer = new IntersectionObserver(maybeMore, {
			threshold: [0.01, 0.9]
		});
		observer.observe(scrollMore);
	});

	onDestroy(() => {
		observer?.disconnect();
	});
</script>
