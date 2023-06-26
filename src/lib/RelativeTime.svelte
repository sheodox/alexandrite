<Tooltip>
	<span slot="tooltip">
		{d.toLocaleString()}
	</span>
	<span class="muted">
		{formatted}
	</span>
</Tooltip>

<script lang="ts">
	import { Tooltip } from 'sheodox-ui';
	import { formatDistance, parseISO } from 'date-fns';
	export let date: string;

	$: d = parseISO(date + 'Z');
	$: formatted = formatDistance(d, new Date(), { addSuffix: true });
</script>
