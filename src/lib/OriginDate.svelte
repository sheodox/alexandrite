{dateFormatter.format(parseDate(date))}

<script lang="ts">
	import { parseDate } from './utils';

	// accepts an ISO date string, so it can just be passed without parsing
	export let date: string;

	const dateFormatter = new Intl.DateTimeFormat('en', {
		dateStyle: 'medium'
	});
</script>
