<NavDropdown showOpenIcon={false}>
	<span slot="button">
		<Icon icon="user-circle" />
		<span class="sr-only">User Options</span>
	</span>
	<div slot="menu">
		<ul>
			{#each links as link}
				{#if !link.disabled}
					<li>
						{#if link.as === 'a'}
							<a href={link.href} class="button" on:click={link.click}>
								<Icon icon={link.icon} />
								{link.text}
							</a>
						{:else if link.as === 'button'}
							<button on:click={link.click}>
								<Icon icon={link.icon} />
								{link.text}
							</button>
						{/if}
					</li>
				{/if}
			{/each}
		</ul>
	</div>
</NavDropdown>

<script lang="ts">
	import { NavDropdown, Icon } from 'sheodox-ui';
	import { profile, profiles, switchToInstanceDefaultProfile } from '$lib/profiles/profiles';
	import { createEventDispatcher } from 'svelte';
	import { logout } from '$lib/settings/auth';
	import { invalidateAll } from '$app/navigation';

	const dispatch = createEventDispatcher<{
		accounts: void;
	}>();

	$: loggedIn = $profile.loggedIn;
	let links: {
		as: string;
		text: string;
		icon: string;
		href?: string;
		disabled?: boolean;
		click?: (e: MouseEvent) => unknown;
	}[];

	$: otherInstances = Array.from(
		new Set($profiles.filter((p) => p.instance !== $profile.instance).map((p) => p.instance))
	);

	$: links = [
		{
			text: 'Profile',
			icon: 'user',
			href: `/${$profile.instance}/u/${$profile.username}`,
			disabled: !loggedIn,
			as: 'a'
		},
		{ text: 'Settings', icon: 'cog', href: `/${$profile.instance}/settings`, disabled: !loggedIn, as: 'a' },
		{ text: 'About Alexandrite', icon: 'address-card', href: '/about', as: 'a' },
		{ text: 'Switch Account', icon: 'circle-user', click: () => dispatch('accounts'), as: 'button' },
		{ text: 'Login / Manage Accounts', icon: 'users', href: '/instance', as: 'a' },
		...otherInstances.map((inst) => ({
			text: 'Switch to ' + inst,
			href: `/${inst}`,
			click: (e: MouseEvent) => {
				// if they clicked, redirect the page, but using a link still lets them middle click to open in a new tab
				e.preventDefault();
				// stores weren't all updating smoothly when using goto/invalidateAll, this works but is a little less smooth
				location.href = `/${inst}`;
			},
			icon: 'shuffle',
			as: 'a'
		})),
		{
			text: 'Logout',
			icon: 'right-from-bracket',
			click: () => {
				logout();
				switchToInstanceDefaultProfile();
				invalidateAll();
			},
			disabled: !$profile.jwt,
			as: 'button'
		}
	];
</script>
