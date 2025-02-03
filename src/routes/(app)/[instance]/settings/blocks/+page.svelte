<style lang="scss">
	.block-row {
		display: flex;
		gap: var(--sx-spacing-4);
	}
</style>

<Stack dir="c" gap={4} align="start">
	<Blocks typeName="Communities">
		<CommunitySelector
			showFollowed={false}
			gatePostable={false}
			placeholder="Search communities to block..."
			variant="button"
			on:select={onBlockCommunity}
			clearOnSelect
		/>
		<Accordion>
			<span slot="title"><Icon icon="users" /> Blocked Communities ({communityBlocks?.length ?? 0})</span>
			{#if communityBlocksSorted}
				<div class="sx-list">
					{#each communityBlocksSorted as community}
						<div class="block-row sx-list-item">
							<CommunityBlock {community} on:unblock={onUnblockCommunity} on:select={onBlockCommunity} />
						</div>
					{:else}
						<p class="m-0 sx-list-item">You haven't blocked any communities.</p>
					{/each}
				</div>
			{/if}
		</Accordion>
	</Blocks>

	<Blocks typeName="Users">
		<UserSelector placeholder={'Search users to block...'} on:select={onBlockPerson} clearOnSelect />
		<Accordion>
			<span slot="title"><Icon icon="user" /> Blocked Users ({personBlocks?.length ?? 0})</span>
			{#if personBlocksSorted}
				<div class="sx-list">
					{#each personBlocksSorted as person}
						<div class="block-row sx-list-item f-row align-items-center">
							<PersonBlock {person} on:unblock={onUnblockPerson} />
						</div>
					{:else}
						<p class="m-0 sx-list-item">You haven't blocked any users.</p>
					{/each}
				</div>
			{/if}
		</Accordion>
	</Blocks>

	<Blocks typeName="Instances">
		<InstanceSelector placeholder="Search instances to block..." on:select={onBlockInstance} clearOnSelect />
		<Accordion>
			<span slot="title"><Icon icon="circle-nodes" /> Blocked Instances ({instanceBlocks?.length ?? 0})</span>
			{#if instanceBlocksSorted}
				<div class="sx-list">
					{#each instanceBlocksSorted as instance}
						<div class="block-row sx-list-item">
							<InstanceBlock {instance} on:unblock={onUnblockInstance} />
						</div>
					{:else}
						<p class="m-0 sx-list-item">You haven't blocked any instances.</p>
					{/each}
				</div>
			{/if}
		</Accordion>
	</Blocks>
</Stack>

<script lang="ts">
	import { Icon, Stack, Accordion } from 'sheodox-ui';
	import Blocks from './Blocks.svelte';
	import CommunityBlock from './CommunityBlock.svelte';
	import PersonBlock from './PersonBlock.svelte';
	import InstanceBlock from './InstanceBlock.svelte';
	import CommunitySelector from '$lib/CommunitySelector.svelte';
	import UserSelector from '$lib/UserSelector.svelte';
	import type { Community, Instance, Person } from 'lemmy-js-client';
	import { createStatefulAction } from '$lib/utils';
	import { profile } from '$lib/profiles/profiles';
	import InstanceSelector from '$lib/InstanceSelector.svelte';

	export let data;

	let communityBlocks = data.siteMeta.my_user?.community_blocks.map(({ community }) => community) ?? [];

	$: communityBlocksSorted = [...communityBlocks].sort((a, b) => {
		return (a.title || a.name).localeCompare(b.title || b.name);
	});

	let personBlocks = data.siteMeta.my_user?.person_blocks.map(({ target }) => target) ?? [];

	$: personBlocksSorted = [...personBlocks].sort((a, b) => {
		return a.name.localeCompare(b.name);
	});

	let instanceBlocks = data.siteMeta.my_user?.instance_blocks.map(({ instance }) => instance) ?? [];

	$: instanceBlocksSorted = [...instanceBlocks].sort((a, b) => {
		return a.domain.localeCompare(b.domain);
	});

	$: client = $profile.client;
	$: jwt = $profile.jwt;

	const communityBlockState = createStatefulAction<Community>(async (community) => {
		if (!jwt) {
			return;
		}

		// don't block a blocked community
		if (communityBlocks.some((com) => com.id === community.id)) {
			return;
		}

		await client.blockCommunity({
			community_id: community.id,
			block: true
		});

		communityBlocks = [...communityBlocks, community];
	});

	const personBlockState = createStatefulAction<Person>(async (person) => {
		if (!jwt) {
			return;
		}

		// don't block a blocked person
		if (personBlocks.some((p) => p.id === person.id)) {
			return;
		}

		await client.blockPerson({
			person_id: person.id,
			block: true
		});

		personBlocks = [...personBlocks, person];
	});

	const instanceBlockState = createStatefulAction<Instance>(async (instance) => {
		if (!jwt) {
			return;
		}

		// don't block a blocked instance
		if (instanceBlocks.some((p) => p.id === instance.id)) {
			return;
		}

		await client.blockInstance({
			instance_id: instance.id,
			block: true
		});

		instanceBlocks = [...instanceBlocks, instance];
	});
	function onBlockCommunity(e: CustomEvent<Community>) {
		$communityBlockState.submit(e.detail);
	}

	function onBlockPerson(e: CustomEvent<Person>) {
		$personBlockState.submit(e.detail);
	}

	function onBlockInstance(e: CustomEvent<Instance>) {
		$instanceBlockState.submit(e.detail);
	}

	function onUnblockCommunity(e: CustomEvent<number>) {
		communityBlocks = communityBlocks?.filter((community) => community.id !== e.detail);
	}

	function onUnblockPerson(e: CustomEvent<number>) {
		personBlocks = personBlocks?.filter((person) => person.id !== e.detail);
	}

	function onUnblockInstance(e: CustomEvent<number>) {
		instanceBlocks = instanceBlocks?.filter((instance) => instance.id !== e.detail);
	}
</script>
