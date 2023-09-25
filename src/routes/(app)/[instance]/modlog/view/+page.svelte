<style lang="scss">
	table :global(td) {
		border-top: 1px solid var(--sx-gray-transparent-lighter);
		height: 4rem;
	}
</style>

<Layout size="medium" cl="my-4">
	<Stack dir="c" gap={4}>
		<h1 class="m-0 sx-font-size-{showSecondaryHeader ? 5 : 8}">Modlog</h1>
		{#if showSecondaryHeader}
			<h2 class="m-0 sx-font-size-8 f-row gap-0">
				{#if data.communityView}
					/c/{data.communityView.community.title}
				{/if}
				{#if data.communityView && data.targetUser}
					&centerdot;
				{/if}
				{#if data.targetUser}
					Actions on /u/<NameAtInstance place={data.targetUser.person_view.person} />
				{/if}
			</h2>
		{/if}

		<form use:navigateOnChange>
			{#if data.query.communityId}
				<input type="hidden" name="community" value={data.query.communityId} />
			{/if}
			{#if data.query.targetId}
				<input type="hidden" name="target" value={data.query.targetId} />
			{/if}
			<Stack dir="r" gap={2} align="center">
				<label>
					Filter by action
					<br />
					<select value={data.query.action} name="action">
						{#each actionTypes as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</label>

				{#if data.communityModerators && !censorMods}
					<label>
						Filter by moderator
						<br />
						<select name="moderator" value={data.query.moderatorId}>
							<option value=""></option>
							{#each data.communityModerators as mod}
								<option value={mod.id}>{nameAtInstance(mod, mod.display_name)}</option>
							{/each}
						</select>
					</label>
				{/if}
			</Stack>
		</form>

		<table>
			<thead>
				<tr>
					<th>Time</th>
					<th>Action</th>
					{#if !$siteMeta.site_view.local_site.hide_modlog_mod_names}
						<th>Mod</th>
					{/if}
					<th>Details</th>
					{#if showCommunity}
						<th>Community</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each data.modlogs as modlog}
					<ModlogAction {modlog} {showCommunity} {censorMods} />
				{:else}
					<tr>
						<td colspan="100"> No more logs </td>
					</tr>
				{/each}
			</tbody>
		</table>

		<Pagination
			page={data.query.page}
			max={data.query.page + (data.query.limit > data.modlogs.length ? 0 : 1)}
			makeHref={makePageHref}
			as="a"
		/>
	</Stack>
</Layout>

<script lang="ts">
	import { Layout, Stack, Pagination } from 'sheodox-ui';
	import ModlogAction from './ModlogAction.svelte';
	import { getAppContext } from '$lib/app-context';
	import type { ModlogActionType } from 'lemmy-js-client';
	import { navigateOnChange } from '$lib/utils';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import { nameAtInstance } from '$lib/nav-utils';

	export let data;

	const { siteMeta } = getAppContext();
	$: isCommunityModerator =
		data.communityModerators?.some((mod) => mod.id === $siteMeta.my_user?.local_user_view.local_user.person_id) ??
		false;
	$: censorMods = !$siteMeta.my_user?.local_user_view.person.admin && !isCommunityModerator;

	$: showCommunity = data.communityName === null;
	$: showSecondaryHeader = showCommunity || data.targetUser;

	function makePageHref(page: number) {
		const u = new URL(location.href);
		u.searchParams.set('page', '' + page);

		return u.pathname + u.search;
	}

	const actionTypes: { value: ModlogActionType; label: string }[] = [
		{ value: 'All', label: 'All' },
		{ value: 'ModRemovePost', label: 'Post Removal' },
		{ value: 'ModLockPost', label: 'Post Locking' },
		{ value: 'ModFeaturePost', label: 'Post Pinning' },
		{ value: 'ModRemoveComment', label: 'Comment Removal' },
		{ value: 'ModRemoveCommunity', label: 'Community Removal' },
		{ value: 'ModBanFromCommunity', label: 'Community Bans' },
		{ value: 'ModAddCommunity', label: 'Mod Team' },
		{ value: 'ModTransferCommunity', label: 'Community Transfers' },
		{ value: 'ModAdd', label: 'Admin Team' },
		{ value: 'ModBan', label: 'Instance Bans' },
		// TODO: this seems to be an admin only thing, need to test some time
		// { value: 'ModHideCommunity', label: 'Community Hiding' },
		{ value: 'AdminPurgePerson', label: 'Admin Person Purging' },
		{ value: 'AdminPurgeCommunity', label: 'Admin Community Purging' },
		{ value: 'AdminPurgePost', label: 'Admin Post Purging' },
		{ value: 'AdminPurgeComment', label: 'Admin Comment Purging' }
	];
</script>
