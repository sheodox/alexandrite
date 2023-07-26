<style lang="scss">
	.description {
		width: 20rem;
	}
</style>

<Stack dir="c" gap={4} align="start">
	<div class="mx-2">
		<Checkbox bind:checked={$navSidebarDocked}>Keep navigation sidebar open</Checkbox>
		<Checkbox bind:checked={$loadImagesAsWebp}>Load images as <code>.webp</code></Checkbox>
	</div>
	<Fieldset legend="Theme">
		<Stack dir="r" align="center" gap={4}>
			<label class="f-1">
				Hue
				<br />
				<input type="range" min={0} max={360} step={1} bind:value={$themeHue} />
			</label>
			<button
				on:click={() => ($themeHue = AlexandriteSettingsDefaults.themeHue)}
				disabled={$themeHue === AlexandriteSettingsDefaults.themeHue}
			>
				Default
			</button>
		</Stack>
		<p class="muted description">
			<Icon icon="question-circle" variant="regular" /> If you use DarkReader, make sure to disable it for this site.
		</p>
	</Fieldset>
	<DescriptiveToggles legend="NSFW Thumbnails" options={NSFWHandlingOptions} bind:group={$nsfwImageHandling} />
	<FeedLayoutSettings />
</Stack>

<script lang="ts">
	import { getSettingsContext, AlexandriteSettingsDefaults, NSFWHandlingOptions } from '$lib/settings-context';
	import { Stack, Fieldset, Checkbox, Icon } from 'sheodox-ui';
	import FeedLayoutSettings from '$lib/FeedLayoutSettings.svelte';
	import DescriptiveToggles from '$lib/DescriptiveToggles.svelte';

	const { themeHue, nsfwImageHandling, navSidebarDocked, loadImagesAsWebp } = getSettingsContext();
</script>
