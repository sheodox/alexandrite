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
						{#if link.click}
							<button on:click={link.click}>
								<Icon icon={link.icon} />
								{link.text}
							</button>
						{:else if link.href}
							<a href={link.href} class="button">
								<Icon icon={link.icon} />
								{link.text}
							</a>
						{/if}
					</li>
				{/if}
			{/each}
		</ul>
	</div>
</NavDropdown>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { logout } from '$lib/settings/auth';
	import { NavDropdown, Icon } from 'sheodox-ui';
	import { profile } from '$lib/profiles/profiles';

	$: loggedIn = $profile.loggedIn;
	$: links = [
		{ text: 'Profile', icon: 'user', href: `/u/${$profile.username}`, disabled: !loggedIn },
		{ text: 'Settings', icon: 'cog', href: `/settings`, disabled: !loggedIn },
		{ text: 'About Alexandrite', icon: 'address-card', href: '/about' },
		{ text: 'Accounts', icon: 'passport', href: '/instance' },
		{
			text: loggedIn ? 'Logout' : 'Login / Change Instance',
			icon: 'right-from-bracket',
			click: () => {
				logout();
				goto('/instance');
			}
		}
	];
</script>
