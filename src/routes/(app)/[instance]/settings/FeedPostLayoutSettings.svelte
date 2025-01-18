<DescriptiveToggles legend="Feed Post Layout" options={PostPreviewLayoutOptions} bind:group={$postPreviewLayout}>
	{#if $postPreviewLayout === 'LIST'}
		<Fieldset legend="List Settings">
			<Checkbox bind:checked={$postListLayoutContentPreview}>Show content preview</Checkbox>
		</Fieldset>
	{:else if $postPreviewLayout === 'CARD'}
		<Fieldset legend="Card Settings">
			<Checkbox bind:checked={$postCardLayoutLeftAlignedButtons}>Left-aligned vote buttons</Checkbox>
		</Fieldset>
	{/if}
</DescriptiveToggles>

<script lang="ts">
	import { Checkbox, Fieldset } from 'sheodox-ui';
	import DescriptiveToggles from '$lib/DescriptiveToggles.svelte';
	import { PostPreviewLayoutOptions, getSettingsContext } from '$lib/settings-context';

	const { postPreviewLayout, postListLayoutContentPreview, postCardLayoutLeftAlignedButtons } = getSettingsContext();
</script>
