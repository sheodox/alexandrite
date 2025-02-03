<style>
	.card :global(.instances-list) {
		max-height: 50rem;
		overflow: auto;
	}
</style>

<div class="card">
	<Stack cl="card-body" dir="c" gap={2}>
		<Search bind:value={searchText} {placeholder} />
		{#if searchResults.length}
			<Stack cl="instances-list sx-list" dir="c">
				{#if $searchState.busy}
					<div>
						<Spinner />
					</div>
				{:else}
					{#each searchResults as instance (instance.id)}
						<div class="sx-list-item action">
							<button
								class="text-align-left"
								on:click={() => {
									dispatch('select', instance);
									if (clearOnSelect) {
										searchText = '';
										searchResults = [];
									}
								}}
								>{instance.domain}
							</button>
						</div>
					{/each}
				{/if}
			</Stack>
		{/if}
	</Stack>
</div>

<script lang="ts">
	import { Search, Stack } from 'sheodox-ui';
	import { profile } from './profiles/profiles';
	import { Throttler, createStatefulAction, safeUrl } from './utils';
	import type { Instance } from 'lemmy-js-client';
	import Spinner from './Spinner.svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	export let placeholder = '';
	export let clearOnSelect = false;

	const dispatch = createEventDispatcher<{
		select: Instance;
	}>();

	$: client = $profile.client;

	let fullInstanceList: Instance[] = [];
	let searchText = '';
	let searchResults: Instance[] = [];

	$: onSearchChange(searchText);

	const searchThrottled = new Throttler(() => $searchState.submit(), 1000, true);

	function onSearchChange(searchText: string) {
		if (searchText) {
			searchThrottled.run();
		} else {
			searchResults = [];
		}
	}

	onMount(async () => {
		const res = await client.getFederatedInstances();

		const toMap = (instance: Instance): [number, Instance] => [instance.id, instance];

		fullInstanceList = Array.from(
			new Map([
				// combine, but de-dupe instances, don't know if an instance could be in both
				...(res.federated_instances?.allowed.map(toMap) ?? []),
				...(res.federated_instances?.linked.map(toMap) ?? [])
			]).values()
		).sort((a, b) => {
			return a.domain.localeCompare(b.domain);
		});
	});

	const searchState = createStatefulAction<void>(async function searchCommunities() {
		searchResults = [];
		if (!searchText) {
			return;
		}

		// if they paste a url, grab just the hostname part
		const cleanSearchText = safeUrl(searchText)?.hostname ?? searchText;

		searchResults = fullInstanceList.filter((inst) => {
			return inst.domain.includes(cleanSearchText);
		});
	});
</script>
