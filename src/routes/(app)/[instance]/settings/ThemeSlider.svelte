<style>
	.output {
		width: 3rem;
	}
</style>

<Stack dir="r" gap={2} align="end" cl="f-1">
	<label class="f-1 f-column">
		{label}
		<input type="range" {min} {max} {step} bind:value class="f-1" />
	</label>

	<div aria-hidden>
		<Tooltip>
			<span slot="tooltip">{label}</span>
			<input {value} readonly class="output" />
		</Tooltip>
	</div>
</Stack>

<script lang="ts">
	import { Stack, Tooltip } from 'sheodox-ui';

	export let label: string;
	export let value: number;
	export let min: number;
	export let max: number;
	export let step: number;
</script>
