{#if variant === 'text'}
	<Tooltip>
		<span slot="tooltip">
			{verb}
			{d.toLocaleString()}
		</span>
		<span class="muted">
			{formatted}
		</span>
	</Tooltip>
{:else}
	<Tooltip>
		<span slot="tooltip">
			{verb}
			{formatted}
			<br />
			{d.toLocaleString()}
		</span>
		<span class="muted">
			<Icon {icon} variant="icon-only" />
			<span class="sr-only">{formatted}</span>
		</span>
	</Tooltip>
{/if}

<script lang="ts">
	import { Tooltip, Icon } from 'sheodox-ui';
	import { formatDistance, parseISO } from 'date-fns';
	export let date: string;

	export let variant: 'icon' | 'text' = 'text';
	export let icon = 'edit';
	export let verb = 'Posted';

	$: d = parseISO(date + 'Z');
	$: formatted = formatDistance(d, new Date(), { addSuffix: true });
</script>
