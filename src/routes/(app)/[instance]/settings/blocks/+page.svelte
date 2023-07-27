<Stack dir="c" gap={4} align="start">
	<h2 class="m-0">Communities</h2>
	{#if communityBlocks?.length}
		<Blocks on:unblock={onUnblockCommunity}>
			{#each communityBlocks as community}
				<CommunityBlock {community} on:unblock={onUnblockCommunity} />
			{/each}
		</Blocks>
	{:else}
		<p class="m-0">You haven't blocked any communities.</p>
	{/if}

	<h2 class="m-0">Users</h2>
	{#if personBlocks?.length}
		<Blocks on:unblock={onUnblockPerson}>
			{#each personBlocks as person}
				<PersonBlock {person} on:unblock={onUnblockPerson} />
			{/each}
		</Blocks>
	{:else}
		<p class="m-0">You haven't blocked any users.</p>
	{/if}
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import Blocks from './Blocks.svelte';
	import CommunityBlock from './CommunityBlock.svelte';
	import PersonBlock from './PersonBlock.svelte';

	export let data;

	let communityBlocks = data.siteMeta.my_user?.community_blocks
		.map(({ community }) => community)
		.sort((a, b) => {
			return (a.title || a.name).localeCompare(b.title || b.name);
		});

	let personBlocks = data.siteMeta.my_user?.person_blocks
		.map(({ target }) => target)
		.sort((a, b) => {
			return a.name.localeCompare(b.name);
		});

	function onUnblockCommunity(e: CustomEvent<number>) {
		communityBlocks = communityBlocks?.filter((community) => community.id !== e.detail);
	}

	function onUnblockPerson(e: CustomEvent<number>) {
		personBlocks = personBlocks?.filter((person) => person.id !== e.detail);
	}
</script>
