{formatted}

<script lang="ts">
	import { formatDistance, parseISO } from 'date-fns';
	export let date: string;

	$: d = parseISO(date + 'Z');
	$: formatted = formatDistance(d, new Date(), { addSuffix: true });
</script>
