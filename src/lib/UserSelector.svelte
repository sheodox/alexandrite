<style>
	.card :global(.users-list) {
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
		{:else if userList.length}
			<Stack cl="users-list sx-list" dir="c">
				{#each userList as user (user.id)}
					<div class="sx-list-item action">
						<UserLink
							{user}
							variant="button"
							showAvatarFallback
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
	import { profile } from './profiles/profiles';
	import { Throttler, createStatefulAction } from './utils';
	import type { Person } from 'lemmy-js-client';
	import Spinner from './Spinner.svelte';
	import UserLink from './UserLink.svelte';
	import { createEventDispatcher } from 'svelte';
	import { getAppContext } from './app-context';

	export let placeholder = '';
	export let clearOnSelect = false;

	const dispatch = createEventDispatcher<{
		select: Person;
	}>();

	const { siteMeta } = getAppContext();

	$: client = $profile.client;

	let searchText = '';
	let searchResults: Person[] = [];

	$: userList =
		searchText === '' ? [] : searchResults.filter((p) => p.id !== $siteMeta.my_user?.local_user_view.person.id);

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
		if (!searchText) {
			searchResults = [];
			return;
		}

		// eliminate race conditions by caching what was searched so we can ignore search results if the query has changed by the time we get the results
		let searched = searchText;

		if (/.@./.test(searchText)) {
			try {
				const instanceName = searchText.split('@')[1]?.trim();

				//  make sure the instance name looks kinda valid
				if (!instanceName || !/.\../.test(instanceName)) {
					return;
				}

				const res = await client.getPersonDetails({
					username: searchText,
					limit: 1
				});

				if (searched === searchText && res.person_view) {
					searchResults = [res.person_view.person];
				}
			} catch (e) {
				console.log('user direct search caught', e);
			}
		} else {
			const userSearch = await client.search({
				type_: 'Users',
				q: searchText,
				limit: 50,
				sort: 'TopAll'
			});

			// don't give results for the wrong search if it's changed by now
			if (searched !== searchText) {
				return;
			}

			searchResults = userSearch.users.map((pv) => pv.person);
		}
	});
</script>
