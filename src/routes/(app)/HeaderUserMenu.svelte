<NavDropdown showOpenIcon={false}>
	<span slot="button">
		<Icon icon="user-circle" variant="icon-only" />
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
	import { getAppContext } from '$lib/app-context';
	import { logout } from '$lib/settings/auth';
	import { NavDropdown, Icon } from 'sheodox-ui';

	const { loggedIn, username } = getAppContext();

	$: links = [
		{ text: 'Profile', icon: 'user', href: `/u/${username}`, disabled: !loggedIn },
		{ text: 'Settings', icon: 'cog', href: `/settings`, disabled: !loggedIn },
		{ text: 'About Alexandrite', icon: 'address-card', href: '/about' },
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
