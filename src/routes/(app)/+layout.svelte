<style lang="scss">
	main {
		max-width: 100vw;
	}
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
	.root-layout-content {
		margin-top: var(--app-header-height);
	}
</style>

<Header appName="Alexandrite" href="/" showMenuTrigger={true} bind:menuOpen={$navSidebarOpen} position="fixed">
	<Logo slot="logo" />
	<div slot="headerCenter">
		<form method="GET" action="/search" on:submit={onSearchSubmit}>
			<Search name="q" placeholder="Search" bind:value={headerSearchText} />
		</form>
	</div>
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
		{#if isModerator}
			<IconLink
				text="Unread Reports"
				{placement}
				icon="shield-halved"
				cl="{$unreadReportCount > 0 ? 'sx-badge-red' : ''} p-2"
				href="/reports"
			>
				{$unreadReportCount}
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

		<LogButton on:click={() => console.log(data)} text="Log Layout Data" small={false} {placement} />
		<HeaderUserMenu />
		<IconButton
			icon={$sidebarVisible ? 'angles-right' : 'angles-left'}
			on:click={() => ($sidebarVisible = !$sidebarVisible)}
			text="Toggle sidebar"
			{placement}
		/>
	</div>
</Header>

<div class="f-row f-1 root-layout-content">
	<Toasts />
	<Modals />
	<Sidebar bind:menuOpen={$navSidebarOpen} docked={$navSidebarDocked}>
		<div slot="header" class="f-row align-items-center">
			<Logo />
			<h1 class="ml-2">Alexandrite</h1>
		</div>

		<AppSidebar subscriptions={data.site.my_user?.follows} />
	</Sidebar>

	<main class="f-column f-1">
		<ModContext>
			<slot />
		</ModContext>
	</main>
</div>

{#if showLoadingOverlay}
	<div class="loading-overlay sx-font-size-10 f-row align-items-center justify-content-center">
		<Spinner />
	</div>
{/if}

<script lang="ts">
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import ModContext from '$lib/mod/ModContext.svelte';
	import { Sidebar, Header, Tooltip, Search, Toasts, Modals } from 'sheodox-ui';
	import { onDestroy, onMount } from 'svelte';
	import AppSidebar from './AppSidebar.svelte';
	import { setAppContext } from '$lib/app-context';
	import LogButton from '$lib/LogButton.svelte';
	import Spinner from '$lib/Spinner.svelte';
	import IconLink from '$lib/IconLink.svelte';
	import Logo from '$lib/Logo.svelte';
	import { writable, type Unsubscriber, readable } from 'svelte/store';
	import IconButton from '$lib/IconButton.svelte';
	import { getLemmyClient } from '$lib/lemmy-client';
	import { setSettingsContext } from '$lib/settings-context';
	import HeaderUserMenu from './HeaderUserMenu.svelte';
	import { localStorageBackedStore } from '$lib/utils';
	import { AlexandriteSettingsDefaults } from '$lib/settings-context';

	export let data;

	// there's an overlay that shows when navigating, but if the navigation is fast we don't want to show it,
	// so we delay it a little bit to cut down on annoying one or two frame flashes of the overlay
	const LOADING_OVERLAY_DELAY = 50;

	const { client, jwt } = getLemmyClient();

	const placement = 'bottom-end',
		unreadCount = writable(0),
		unreadReportCount = writable(0);

	let showLoadingOverlay = false,
		headerSearchText = '';

	$: isModerator = (data.site.my_user?.moderates.length ?? 0) > 0;

	let showOverlayTimeout: ReturnType<typeof setTimeout>;
	beforeNavigate(() => {
		clearTimeout(showOverlayTimeout);
		showOverlayTimeout = setTimeout(() => (showLoadingOverlay = true), LOADING_OVERLAY_DELAY);
	});

	afterNavigate(() => {
		clearTimeout(showOverlayTimeout);
		showLoadingOverlay = false;
		if (!$navSidebarDocked) {
			$navSidebarOpen = false;
		}
	});

	const sidebarVisible = localStorageBackedStore('sidebar-visible', AlexandriteSettingsDefaults.sidebarVisible),
		themeHue = localStorageBackedStore('theme-hue', AlexandriteSettingsDefaults.themeHue),
		nsfwImageHandling = localStorageBackedStore('nsfw-handling', AlexandriteSettingsDefaults.nsfwImageHandling),
		feedLayout = localStorageBackedStore('feed-layout', AlexandriteSettingsDefaults.feedLayout),
		navSidebarOpen = writable(false),
		navSidebarDocked = localStorageBackedStore('nav-sidebar-docked', AlexandriteSettingsDefaults.navSidebarDocked),
		cssVariables = writable<Record<string, string | number>>({});

	async function checkUnread() {
		if (!jwt) {
			return;
		}

		const unread = await client.getUnreadCount({
			auth: jwt
		});

		$unreadCount = unread.replies + unread.mentions + unread.private_messages;
	}

	async function checkUnreadReports() {
		if (!jwt || !isModerator) {
			return;
		}

		const unread = await client.getReportCount({
			auth: jwt
		});

		$unreadReportCount = unread.post_reports + unread.comment_reports;
	}

	function onSearchSubmit(e: Event) {
		const communityReg = /^!([a-zA-Z0-9_]+@[\w-]+(\.[\w-]+)*(\.[a-z]+))$/g;

		// they are trying to search for a community they copied from somewhere,
		// redirect right to it instead of doing a search
		if (communityReg.test(headerSearchText)) {
			e.preventDefault();
			// trim the leading !
			goto(`/c/${headerSearchText.substring(1)}`);
		}
	}

	setAppContext({
		username: data.settings.username ?? '',
		loggedIn: data.loggedIn,
		instance: data.settings.instance,
		instanceUrl: data.settings.instanceUrl,
		siteMeta: data.site,
		navSidebarOpen,
		unreadCount,
		unreadReportCount,
		ctrlBasedHotkeys: !navigator.userAgent.toLowerCase().includes('macintosh'),
		checkUnread,
		checkUnreadReports,
		screenDimensions: readable({ width: window.innerWidth, height: window.innerHeight }, (set) => {
			function update() {
				set({ width: window.innerWidth, height: window.innerHeight });
			}

			window.addEventListener('resize', update);
			return () => window.removeEventListener('resize', update);
		})
	});

	setSettingsContext({
		themeHue,
		nsfwImageHandling,
		sidebarVisible,
		feedLayout,
		navSidebarDocked
	});

	$: instanceText = data.settings.username
		? `${data.settings.username}@${data.settings.instance}`
		: data.settings.instance;

	$: lemmySettings =
		data.lemmySettings &&
		Object.entries(data.lemmySettings).map(([label, value]) => {
			return { label: label.replaceAll('_', ' '), value };
		});

	const unreadPollMS = 1000 * 60 * 15;
	// if you're a moderator you want to be alerted of stuff faster
	const unreadReportPollMS = 1000 * 60 * 1;
	const styleId = 'alexandrite-style-overrides';
	let pollIntervals: ReturnType<typeof setInterval>[] = [],
		headerResizeObserver: ResizeObserver,
		cssVarUnsub: Unsubscriber;

	$: $cssVariables['--sx-hue-gray'] = $themeHue + ' !important';

	onMount(async () => {
		// track the height of the header, wanted for some styling in various places
		// where fixed/absolutely positioned elements need to be below the header (which is fixed)
		const header = document.querySelector('header');
		if (header) {
			headerResizeObserver = new ResizeObserver((entries) => {
				const height = entries.at(0)?.borderBoxSize[0].blockSize;
				cssVariables.update((v) => {
					return { ...v, '--app-header-height': `${height || 45}px` };
				});
			});
			headerResizeObserver.observe(header);
		}

		cssVarUnsub = cssVariables.subscribe((vars) => {
			let style = document.getElementById(styleId);
			if (!style) {
				style = document.createElement('style');
				style.id = styleId;
				document.head.appendChild(style);
			}

			const rules = [];

			for (const [varName, val] of Object.entries(vars)) {
				rules.push(`${varName}: ${val};`);
			}

			style.textContent = `:root { ${rules.join('\n')} }`;
		});

		if (!jwt) {
			return;
		}

		checkUnread();
		checkUnreadReports();

		pollIntervals = [setInterval(checkUnread, unreadPollMS), setInterval(checkUnreadReports, unreadReportPollMS)];
	});

	onDestroy(() => {
		pollIntervals.forEach(clearInterval);
		headerResizeObserver?.disconnect();
		cssVarUnsub?.();
		document.getElementById(styleId)?.remove();
	});
</script>
