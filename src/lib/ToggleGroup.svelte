<div class="sx-toggles">
	{#each options as option}
		{@const radioId = `${id}-${option.value}-radio`}
		<input
			id={radioId}
			value={option.value}
			type="radio"
			bind:group={selected}
			on:change
			{name}
			disabled={option.disabled}
		/>
		<label for={radioId}>
			<span>{option.label}</span>
		</label>
	{/each}
</div>

<script lang="ts">
	import { genId } from 'sheodox-ui/util';
	const id = genId();
	interface Option {
		value: string;
		label: string;
		disabled?: boolean;
	}
	export let options: Option[];
	export let selected: string;
	export let name: string;
</script>
