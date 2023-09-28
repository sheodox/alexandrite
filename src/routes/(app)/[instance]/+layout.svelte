<style lang="scss">
	main {
		max-width: 100vw;
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

<Header
	appName={$siteMeta.site_view.site.name}
	href="/{$instance}"
	on:titleclick={onHeaderTitleClick}
	showMenuTrigger={true}
	bind:menuOpen={$navSidebarOpen}
	position="fixed"
>
	<div slot="logo" class="header-logo">
		{#if $siteMeta.site_view.site.icon}
			<InstanceLogo />
		{:else}
			<Logo />
		{/if}
	</div>
	<div slot="headerCenter">
		<form method="GET" action="/{$instance}/search" on:submit={onSearchSubmit}>
			<Search name="q" placeholder="Search" bind:value={headerSearchText} />
		</form>
	</div>
	<div slot="headerEnd" class="f-row align-items-center">
		{#if data.loggedIn}
			<IconLink
				text="Unread"
				icon="bell"
				cl="{$unreadCount > 0 ? 'sx-badge-orange' : ''} p-2"
				href="/{$profile.instance}/inbox"
			>
				{$unreadCount}
			</IconLink>
		{/if}
		{#if isModerator}
			<IconLink
				text="Unread Reports"
				icon="shield-halved"
				cl="{$unreadReportCount > 0 ? 'sx-badge-red' : ''} p-2"
				href="/{$profile.instance}/reports"
			>
				{$unreadReportCount}
			</IconLink>
		{/if}

		<span class="sx-badge-gray">
			{#if !$profile.loggedIn}
				<Icon icon="user-secret" />
			{/if}
			{instanceText}
		</span>

		{#if $profile.loggedIn}
			<HeaderCreateMenu />
		{/if}
		<HeaderUserMenu on:accounts={() => (showAccountsSelector = true)} />
		<IconButton
			icon={$sidebarVisible ? 'angles-right' : 'angles-left'}
			on:click={() => ($sidebarVisible = !$sidebarVisible)}
			text="Toggle sidebar"
		/>
		<LogButton on:click={() => console.log(data)} text="Log Layout Data" small={false} />
	</div>
</Header>

<div class="f-row f-1 root-layout-content">
	<Toasts />
	<Modals />
	<Sidebar bind:menuOpen={$navSidebarOpen} docked={$navSidebarDocked}>
		<div slot="header" class="f-row align-items-center">
			<InstanceLogo />
			<h1 class="ml-2 sx-font-size-4">{$siteMeta.site_view.site.name}</h1>
		</div>

		<AppSidebar subscriptions={$siteMeta.my_user?.follows ?? []} />
	</Sidebar>

	<main class="f-column f-1">
		<CommunityContext>
			<ModContext>
				<slot />
			</ModContext>
		</CommunityContext>
	</main>

	{#if showAccountsSelector}
		<ProfileOverlay bind:visible={showAccountsSelector} />
	{/if}
</div>

{#if showLoadingOverlay}
	<div class="loading-overlay sx-font-size-10 f-row align-items-center justify-content-center">
		<Spinner />
	</div>
{/if}

<script lang="ts">
	import { afterNavigate, beforeNavigate, goto, invalidateAll } from '$app/navigation';
	import CommunityContext from '$lib/community-context/CommunityContext.svelte';
	import ModContext from '$lib/mod/ModContext.svelte';
	import HeaderCreateMenu from './HeaderCreateMenu.svelte';
	import { Sidebar, Header, Icon, Search, Toasts, Modals, getSxColorSchemeContext } from 'sheodox-ui';
	import ProfileOverlay from '$lib/profiles/ProfileOverlay.svelte';
	import { onDestroy, onMount } from 'svelte';
	import AppSidebar from './AppSidebar.svelte';
	import { getCtrlBasedHotkeys, setAppContext } from '$lib/app-context';
	import LogButton from '$lib/LogButton.svelte';
	import Spinner from '$lib/Spinner.svelte';
	import IconLink from '$lib/IconLink.svelte';
	import Logo from '$lib/Logo.svelte';
	import { writable, type Unsubscriber, readable, derived } from 'svelte/store';
	import IconButton from '$lib/IconButton.svelte';
	import { setSettingsContext } from '$lib/settings-context';
	import HeaderUserMenu from './HeaderUserMenu.svelte';
	import { localStorageBackedStore } from '$lib/utils';
	import { AlexandriteSettingsDefaults } from '$lib/settings-context';
	import { profile, instance } from '$lib/profiles/profiles';
	import InstanceLogo from './InstanceLogo.svelte';

	export let data;

	const siteMeta = writable(data.site);
	$: $siteMeta = data.site;

	// there's an overlay that shows when navigating, but if the navigation is fast we don't want to show it,
	// so we delay it a little bit to cut down on annoying one or two frame flashes of the overlay
	const LOADING_OVERLAY_DELAY = 50;

	$: client = $profile.client;
	$: jwt = $profile.jwt;

	const unreadCount = writable(0),
		unreadReportCount = writable(0);

	let showLoadingOverlay = false,
		showOverlayTimeout: ReturnType<typeof setTimeout>,
		showAccountsSelector = false,
		headerSearchText = '';

	$: isModerator = ($siteMeta.my_user?.moderates.length ?? 0) > 0;

	beforeNavigate((navigation) => {
		clearTimeout(showOverlayTimeout);
		if (!navigation.willUnload && navigation.type !== 'popstate') {
			showOverlayTimeout = setTimeout(() => (showLoadingOverlay = true), LOADING_OVERLAY_DELAY);
		}
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
		linkHue = localStorageBackedStore('link-hue', AlexandriteSettingsDefaults.linkHue),
		upvoteHue = localStorageBackedStore('upvote-hue', AlexandriteSettingsDefaults.upvoteHue),
		downvoteHue = localStorageBackedStore('downvote-hue', AlexandriteSettingsDefaults.downvoteHue),
		themeSaturation = localStorageBackedStore('theme-saturation', AlexandriteSettingsDefaults.themeSaturation),
		nsfwImageHandling = localStorageBackedStore('nsfw-handling', AlexandriteSettingsDefaults.nsfwImageHandling),
		loadImagesAsWebp = localStorageBackedStore('load-images-as-webp', AlexandriteSettingsDefaults.loadImagesAsWebp),
		feedLayout = localStorageBackedStore('feed-layout', AlexandriteSettingsDefaults.feedLayout),
		postPreviewLayout = localStorageBackedStore('post-preview-layout', AlexandriteSettingsDefaults.postPreviewLayout),
		postListLayoutContentPreview = localStorageBackedStore(
			'post-list-layout-content-preview',
			AlexandriteSettingsDefaults.postListLayoutContentPreview
		),
		navSidebarOpen = writable(false),
		navSidebarDocked = localStorageBackedStore('nav-sidebar-docked', AlexandriteSettingsDefaults.navSidebarDocked),
		colorScheme = localStorageBackedStore('color-scheme', AlexandriteSettingsDefaults.colorScheme),
		showModlogWarning = localStorageBackedStore('show-modlog', AlexandriteSettingsDefaults.showModlogWarning),
		showModlogWarningModerated = localStorageBackedStore(
			'show-modlog-moderated',
			AlexandriteSettingsDefaults.showModlogWarningModerated
		),
		cssVariables = writable<Record<string, string | number>>({});

	const sxColorScheme = getSxColorSchemeContext();

	$: $sxColorScheme = $colorScheme;

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
			goto(`/${$profile.instance}/c/${headerSearchText.substring(1)}`);
		}
	}

	setAppContext({
		siteMeta,
		navSidebarOpen,
		unreadCount,
		unreadReportCount,
		ctrlBasedHotkeys: getCtrlBasedHotkeys(),
		checkUnread,
		checkUnreadReports,
		screenDimensions: readable({ width: window.innerWidth, height: window.innerHeight }, (set) => {
			function update() {
				const width = window.innerWidth;
				set({ width, height: window.innerHeight });

				// if the screen was really wide, auto-hide on resize once it gets small enough to matter
				if ($sidebarVisible && width < 800) {
					$sidebarVisible = false;
				}
			}

			window.addEventListener('resize', update);
			return () => window.removeEventListener('resize', update);
		}),
		userId: derived(siteMeta, (siteMeta) => {
			return siteMeta.my_user?.local_user_view.person.id ?? null;
		})
	});

	setSettingsContext({
		colorScheme,
		themeHue,
		linkHue,
		upvoteHue,
		downvoteHue,
		themeSaturation,
		nsfwImageHandling,
		sidebarVisible,
		loadImagesAsWebp,
		feedLayout,
		navSidebarDocked,
		postPreviewLayout,
		postListLayoutContentPreview,
		showModlogWarning,
		showModlogWarningModerated
	});

	$: instanceText = $profile.username ? `${$profile.username}@${$profile.instance}` : $profile.instance;

	const unreadPollMS = 1000 * 60 * 15;
	// if you're a moderator you want to be alerted of stuff faster
	const unreadReportPollMS = 1000 * 60 * 1;
	const styleId = 'alexandrite-style-overrides';
	let pollIntervals: ReturnType<typeof setInterval>[] = [],
		headerResizeObserver: ResizeObserver,
		storeUnsubs: Unsubscriber[] = [];

	$: $cssVariables['--sxo-hue-gray'] = $themeHue;
	$: $cssVariables['--sxo-hue-link'] = $linkHue;
	$: $cssVariables['--upvote-hue'] = $upvoteHue;
	$: $cssVariables['--downvote-hue'] = $downvoteHue;
	$: $cssVariables['--sxo-hue-gray-saturation-strength'] = $themeSaturation;

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

		// if they want the sidebar to stay open, start with it open
		$navSidebarOpen = $navSidebarDocked;

		storeUnsubs.push(
			cssVariables.subscribe((vars) => {
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
			})
		);

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
		storeUnsubs.forEach((unsub) => unsub());
		storeUnsubs = [];
		document.getElementById(styleId)?.remove();
	});

	function onHeaderTitleClick() {
		// todo: try doing something more granular that doesn't invalidate siteMeta.
		// this is here so you can click the header title while on the home page already and have it refresh the feed,
		// otherwise if the URL doesn't change it won't refresh
		invalidateAll();
	}
</script>
