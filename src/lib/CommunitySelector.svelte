<style>
	.card :global(.communities-list) {
		max-height: 50rem;
		overflow: auto;
	}
</style>

<div class="card">
	<Stack cl="card-body" dir="c" gap={2}>
		<Search bind:value={searchText} {placeholder} />
		{#if $searchState.busy}
			<div class="sx-font-size-8 f-column align-items-center">
				<Spinner />
			</div>
		{:else if postableCommunities.length}
			<Stack cl="communities-list sx-list" dir="c">
				{#each postableCommunities as com (com.id)}
					<div class="sx-list-item action">
						<CommunityLink
							href={href(com)}
							community={com}
							inlineLink={false}
							showBadges
							{variant}
							cl={variant === 'button' ? 'p-1' : ''}
							on:select={(e) => {
								dispatch('select', e.detail);
								if (clearOnSelect) {
									searchText = '';
									searchResults = [];
								}
							}}
						/>
					</div>
				{/each}
			</Stack>
		{/if}
	</Stack>
</div>

<script lang="ts">
	import { Search, Stack } from 'sheodox-ui';
	import { getAppContext } from './app-context';
	import CommunityLink from './CommunityLink.svelte';
	import { profile } from './profiles/profiles';
	import { Throttler, createStatefulAction } from './utils';
	import type { Community } from 'lemmy-js-client';
	import Spinner from './Spinner.svelte';
	import { createEventDispatcher } from 'svelte';

	// whether the user's followed communities should be shown when there's no search text
	export let showFollowed = true;
	// whether a community should be filtered out if the user can't post there
	export let gatePostable = true;
	export let placeholder = '';
	export let href: (community: Community) => string = () => '';
	export let variant: 'a' | 'button' = 'a';
	export let clearOnSelect = false;

	const dispatch = createEventDispatcher<{
		select: Community;
	}>();

	const { siteMeta } = getAppContext();

	$: client = $profile.client;

	let searchText = '';

	let searchResults: Community[] = [];

	$: communities =
		// when we don't want to show followed, we're ok with zero matches to an empty query
		searchText || !showFollowed
			? searchResults
			: $siteMeta.my_user?.follows
					.map((f) => f.community)
					.sort((a, b) => {
						return (a.title || a.name).toLowerCase().localeCompare((b.title || b.name).toLowerCase());
					}) || [];

	$: postableCommunities =
		!showFollowed && !searchText
			? []
			: communities.filter((com) => {
					// only let the user select communities that they can actually post in
					return (
						!gatePostable ||
						!com.posting_restricted_to_mods ||
						$siteMeta.my_user?.moderates?.some((mod) => {
							return mod.community.id === com.id;
						})
					);
			  });

	$: onSearchChange(searchText);

	const searchThrottled = new Throttler(() => $searchState.submit(), 1000, true);

	function onSearchChange(searchText: string) {
		if (searchText) {
			searchThrottled.run();
		} else {
			searchResults = [];
		}
	}

	const searchState = createStatefulAction<void>(async function searchCommunities() {
		searchResults = [];
		if (!searchText) {
			return;
		}

		// eliminate race conditions by caching what was searched so we can ignore search results if the query has changed by the time we get the results
		let searched = searchText;

		if (/.@./.test(searchText)) {
			try {
				const communityName = searchText.replace(/^!/, ''),
					instanceName = searchText.split('@')[1]?.trim();

				//  make sure the instance name looks kinda valid
				if (!instanceName || !/.\../.test(instanceName)) {
					return;
				}

				const res = await client.getCommunity({
					name: communityName
				});

				if (searched === searchText && res.community_view) {
					communities = [res.community_view.community];
				}
			} catch (e) {
				console.log('community direct search caught', e);
			}
		} else {
			const comms = await client.search({
				type_: 'Communities',
				q: searchText,
				limit: 50,
				sort: 'TopAll'
			});

			// don't give results for the wrong search if it's changed by now
			if (searched !== searchText) {
				return;
			}

			searchResults = comms.communities.map((cv) => cv.community);
		}
	});
</script>
