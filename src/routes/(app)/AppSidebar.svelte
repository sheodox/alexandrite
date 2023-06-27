<style>
</style>

<div>
	<nav class="sx-sidebar-simple-links">
		<Stack dir="c" gap={1}>
			{#each links as link}
				<a href={link.href}><Icon icon={link.icon} />{link.text}</a>
			{/each}
		</Stack>
	</nav>
</div>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	const links = [
		{
			href: '/',
			text: 'Home',
			icon: 'home'
		},
		{
			href: '/communities',
			text: 'Communities',
			icon: 'users'
		}
	];
</script>
