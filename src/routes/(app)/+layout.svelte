<Header appName="sx-lemmy" href="/">
	<div slot="headerEnd" class="f-row align-items-center">
		<Tooltip placement="bottom">
			<span slot="tooltip">Your Home Instance</span>
			<span class="sx-badge-gray">{data.homeInstance}</span>
		</Tooltip>
		<Tooltip placement="bottom-end">
			<span slot="tooltip">Change Instance</span>
			<a href="/instance" class="button">
				<Icon icon="edit" variant="icon-only" />
				<span class="sr-only">Change Instance</span>
			</a>
		</Tooltip>
	</div>
</Header>

<slot />

<script lang="ts">
	import { Header, Icon, Tooltip } from 'sheodox-ui';
	export let data;
</script>
