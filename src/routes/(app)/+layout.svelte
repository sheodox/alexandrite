<Header appName="sx-lemmy" href="/" showMenuTrigger={true} bind:menuOpen>
	<div slot="headerEnd" class="f-row align-items-center">
		<Tooltip placement="bottom">
			<span slot="tooltip">Your Home Instance</span>
			<span class="sx-badge-cyan">
				{instanceText}
			</span></Tooltip
		>
		<Tooltip placement="bottom-end">
			<span slot="tooltip">Change Instance</span>
			<a href="/instance" class="button">
				<Icon icon="edit" variant="icon-only" />
				<span class="sr-only">Change Instance</span>
			</a>
		</Tooltip>
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

<script lang="ts">
	import { Sidebar, Header, Icon, Tooltip } from 'sheodox-ui';
	import AppSidebar from './AppSidebar.svelte';
	import { setAppContext } from '$lib/app-context';
	export let data;

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
</script>
