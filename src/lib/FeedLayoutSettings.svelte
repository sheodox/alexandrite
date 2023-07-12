<DescriptiveToggles legend="Feed Layout" bind:group={$feedLayout} options={FeedLayoutOptions} />

<script lang="ts">
	import DescriptiveToggles from './DescriptiveToggles.svelte';
	import { FeedLayoutOptions, getSettingsContext } from './settings-context';

	const { feedLayout } = getSettingsContext();
</script>
