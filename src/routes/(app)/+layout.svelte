<style>
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
			<span class="sx-badge-cyan">
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
	import AppSidebar from './AppSidebar.svelte';
	import { setAppContext } from '$lib/app-context';
	import LogButton from '$lib/LogButton.svelte';
	import Spinner from '$lib/Spinner.svelte';
	export let data;

	const placement = 'bottom-end';

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
		instanceUrl: data.settings.instanceUrl
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
</script>
