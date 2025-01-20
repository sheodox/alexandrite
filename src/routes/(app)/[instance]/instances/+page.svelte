<Layout>
	<h1 class="mb-0">Instances</h1>

	<p>
		Below are the other sites in the fediverse and how <strong><em>{$profile.instance}</em></strong> is connected with them.
	</p>

	<TabList bind:selectedTab {tabs} />

	{#if selectedList}
		<Tab tabId={selectedTab} {selectedTab}>
			<table class="mt-4">
				<thead>
					<tr>
						<th>Domain</th>
						<th>Software</th>
						<th>Version</th>
					</tr>
				</thead>
				<tbody>
					{#each selectedList as item}
						<tr class="sx-list-item">
							<td>
								{#if selectedTab === 'blocked'}
									{item.domain}
								{:else}
									<ExternalLink href={`https://${item.domain}`} cl="inline-link">{item.domain}</ExternalLink>
								{/if}
							</td>
							<td>{item.software ?? ''}</td>
							<td>{item.version ?? ''}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Tab>
	{/if}
</Layout>

<script lang="ts">
	import { ExternalLink, TabList, Tab, Layout } from 'sheodox-ui';
	import { profile } from '$lib/profiles/profiles';
	export let data;

	const { allowed, linked, blocked } = data.federatedInstances.federated_instances ?? {};

	const tabs = [
		{ list: allowed ?? [], title: `Allowed (${allowed?.length ?? 0})`, id: 'allowed' },
		{ list: linked ?? [], title: `Linked (${linked?.length ?? 0})`, id: 'linked' },
		{ list: blocked ?? [], title: `Blocked (${blocked?.length ?? 0})`, id: 'blocked' }
	].filter((tab) => tab.list.length > 0);

	let selectedTab = tabs[0]?.id;

	$: selectedList = tabs.find((tab) => tab.id === selectedTab)?.list ?? [];
</script>
