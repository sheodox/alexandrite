<style>
	.card :global(.communities-list) {
		max-height: 50rem;
		overflow: auto;
	}
</style>

<div class="card">
	<h2 class="card-title">Select a Community</h2>
	<Stack cl="card-body" dir="c" gap={2}>
		<Search bind:value={searchText} />
		<Stack cl="communities-list" dir="c" gap={2}>
			{#if searchText && $searchState.busy}
				<div>
					<Spinner />
				</div>
			{/if}
			{#each postableCommunities as com (com.id)}
				<CommunityLink
					href={`/${$profile.instance}/create/post?community=${encodeURIComponent(nameAtInstance(com))}${extraQuery}`}
					community={com}
					inlineLink={false}
				/>
			{/each}
		</Stack>
	</Stack>
</div>

<script lang="ts">
	import { Search, Stack } from 'sheodox-ui';
	import { getAppContext } from './app-context';
	import CommunityLink from './CommunityLink.svelte';
	import { profile } from './profiles/profiles';
	import { nameAtInstance } from './nav-utils';
	import { Throttler, createStatefulAction } from './utils';
	import type { Community } from 'lemmy-js-client';
	import Spinner from './Spinner.svelte';

	const { siteMeta } = getAppContext();

	$: client = $profile.client;

	let searchText = '';

	const crossPostId = new URL(location.href).searchParams.get('crosspost');
	const extraQuery = crossPostId && /^\d+$/.test(crossPostId) ? `&crosspost=${crossPostId}` : '';

	let searchResults: Community[] = [];

	$: communities = searchText ? searchResults : $siteMeta.my_user?.follows.map((f) => f.community) || [];

	$: postableCommunities = communities.filter((com) => {
		// only let the user select communities that they can actually post in
		return (
			!com.posting_restricted_to_mods ||
			$siteMeta.my_user?.moderates?.some((mod) => {
				return mod.community.id === com.id;
			})
		);
	});

	$: searchText ? onSearchChange() : null;

	const searchThrottled = new Throttler(() => $searchState.submit(), 1000, true);

	function onSearchChange() {
		if (searchText) {
			searchThrottled.run();
		} else {
			searchResults = [];
		}
	}

	const searchState = createStatefulAction<void>(async function searchCommunities() {
		if (!searchText) {
			searchResults = [];
		}

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
				console.log('caught', e);
			}
		} else {
			const comms = await client.search({
				type_: 'Communities',
				q: searchText,
				limit: 50
			});

			// don't give results for the wrong search if it's changed by now
			if (searched !== searchText) {
				return;
			}

			searchResults = comms.communities.map((cv) => cv.community);
		}
	});
</script>
