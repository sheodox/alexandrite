<style>
	.sx-toggles label {
		font-size: var(--sx-font-size-4);
		max-width: 10rem;
	}
	.description {
		width: 20rem;
	}
</style>

<Fieldset {legend} fieldsetClasses="m-0">
	<div class="sx-toggles">
		{#each options as opt}
			{@const inputId = `descriptive-title-${idBase}-option-${opt.value}`}
			<input id={inputId} value={opt.value} type="radio" bind:group />
			<label for={inputId}>
				{opt.label}
			</label>
		{/each}
	</div>
	{@const selected = options.find((opt) => opt.value === group)}
	{#if selected}
		<p class="muted description">
			<Icon icon="question-circle" iconVariant="regular" /><strong>{selected.label}:</strong>
			{selected.description}
		</p>
	{/if}
</Fieldset>

<script lang="ts">
	import { Fieldset, Icon } from 'sheodox-ui';
	import { genId } from 'sheodox-ui/util';

	export let options: { value: string | null; label: string; description: string }[];
	export let legend: string;
	export let group: (typeof options)[number]['value'];

	// ensure all IDs are unique
	const idBase = genId();
</script>
