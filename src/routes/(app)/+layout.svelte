<style lang="scss">
	ul {
		list-style: none;
		padding: 0;
	}
	.loading-overlay {
		position: fixed;
		z-index: 1000000;
		inset: 0;
		background: var(--sx-gray-transparent-dark);
	}
</style>

<Header appName="sx-lemmy" href="/" showMenuTrigger={true} bind:menuOpen>
	<div slot="headerEnd" class="f-row align-items-center">
		{#if data.loggedIn}
			<IconLink
				text="Unread"
				{placement}
				icon="bell"
				cl="{$unreadCount > 0 ? 'sx-badge-orange' : ''} p-2"
				href="/inbox"
			>
				{$unreadCount}
			</IconLink>
		{/if}

		<Tooltip placement="bottom">
			<div slot="tooltip">
				{#if lemmySettings}
					<p class="m-0 fw-bold">Lemmy Settings</p>
					<ul class="m-0">
						{#each lemmySettings as setting}
							<li><span class="muted">{setting.label}:</span> <strong>{setting.value}</strong></li>
						{/each}
					</ul>
				{/if}
			</div>
			<span class="sx-badge-gray">
				{instanceText}
			</span>
		</Tooltip>
		<Tooltip {placement}>
			<span slot="tooltip">Change Instance</span>
			<a href="/instance" class="button">
				<Icon icon="edit" variant="icon-only" />
				<span class="sr-only">Change Instance</span>
			</a>
		</Tooltip>
		<LogButton on:click={() => console.log(data)} text="Log Layout Data" small={false} {placement} />
		<form action="/logout?/logout" method="POST">
			<Tooltip {placement}>
				<span slot="tooltip">Logout</span>
				<button
					><Icon icon="right-from-bracket" />
					<span class="sr-only">Logout</span>
				</button>
			</Tooltip>
		</form>
	</div>
</Header>

<div class="f-row f-1">
	<Sidebar bind:menuOpen docked>
		<div slot="header" class="f-row align-items-center">
			<!-- <Logo /> -->
			<h1 class="ml-2">sx-lemmy</h1>
		</div>

		{#if data.site.my_user}
			<AppSidebar subscriptions={data.site.my_user.follows} />
		{/if}
	</Sidebar>

	<main class="f-column f-1">
		<slot />
	</main>
</div>

{#if loading}
	<div class="loading-overlay sx-font-size-10 f-row align-items-center justify-content-center">
		<Spinner />
	</div>
{/if}

<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { Sidebar, Header, Icon, Tooltip } from 'sheodox-ui';
	import { onDestroy, onMount } from 'svelte';
	import AppSidebar from './AppSidebar.svelte';
	import { setAppContext } from '$lib/app-context';
	import LogButton from '$lib/LogButton.svelte';
	import Spinner from '$lib/Spinner.svelte';
	import type { GetUnreadCountResponse } from 'lemmy-js-client';
	import IconLink from '$lib/IconLink.svelte';
	import { writable } from 'svelte/store';

	export let data;

	const placement = 'bottom-end',
		unreadCount = writable(0);

	let loading = false;

	beforeNavigate(() => {
		loading = true;
	});

	afterNavigate(() => {
		loading = false;
	});

	setAppContext({
		username: data.settings.username,
		loggedIn: data.loggedIn,
		instance: data.settings.instance,
		instanceUrl: data.settings.instanceUrl,
		siteMeta: data.site,
		unreadCount
	});

	let menuOpen = false;

	$: instanceText = data.settings.username
		? `${data.settings.username}@${data.settings.instance}`
		: data.settings.instance;

	$: lemmySettings =
		data.lemmySettings &&
		Object.entries(data.lemmySettings).map(([label, value]) => {
			return { label: label.replaceAll('_', ' '), value };
		});

	const unreadPollMS = 1000 * 60 * 15;
	let unreadPollInterval: ReturnType<typeof setInterval>;

	onMount(async () => {
		if (!data.loggedIn) {
			return;
		}

		async function pollUnread() {
			const res = await fetch('/api/me/unread');

			if (res.ok) {
				const unread: GetUnreadCountResponse = await res.json();
				$unreadCount = unread.replies + unread.mentions + unread.private_messages;
			}
		}
		pollUnread();

		unreadPollInterval = setInterval(pollUnread, unreadPollMS);
	});

	onDestroy(() => {
		clearInterval(unreadPollInterval);
	});
</script>
