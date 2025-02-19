{#if variant === 'text'}
	<Tooltip>
		<span slot="tooltip">
			{verb}
			{secondaryText}
		</span>
		<span class="muted">
			{primaryText}
		</span>
	</Tooltip>
{:else}
	<Tooltip>
		<span slot="tooltip">
			{verb}
			{secondaryText}
			<br />
			{d.toLocaleString()}
		</span>
		<span class="muted">
			<Icon {icon} />
			<span class="sr-only">{primaryText}</span>
		</span>
	</Tooltip>
{/if}

<script lang="ts">
	import { Tooltip, Icon } from 'sheodox-ui';
	import {
		differenceInDays,
		differenceInHours,
		differenceInMinutes,
		differenceInMonths,
		differenceInSeconds,
		differenceInYears
	} from 'date-fns';
	import { parseDate } from './utils';
	import { getSettingsContext } from './settings-context';

	const { showRelativeDates } = getSettingsContext();

	export let date: string;
	export let variant: 'icon' | 'text' = 'text';
	export let icon = 'edit';
	export let verb = 'Posted';

	const rtf = new Intl.RelativeTimeFormat(navigator.language, {
		style: 'narrow'
	});

	$: d = parseDate(date);
	let formatted = '';
	$: {
		const now = new Date(),
			diff = {
				years: differenceInYears(d, now),
				months: differenceInMonths(d, now),
				days: differenceInDays(d, now),
				hours: differenceInHours(d, now),
				minutes: differenceInMinutes(d, now),
				seconds: differenceInSeconds(d, now)
			};

		for (const unit of ['years', 'months', 'days', 'hours', 'minutes', 'seconds'] as const) {
			if (Math.abs(diff[unit]) > 0) {
				formatted = rtf.format(diff[unit], unit);
				break;
			}
		}
	}

	$: primaryText = $showRelativeDates ? formatted : d.toLocaleString();
	$: secondaryText = $showRelativeDates ? d.toLocaleString() : formatted;
</script>
