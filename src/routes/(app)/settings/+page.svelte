<style lang="scss">
	.nsfw-description {
		width: 20rem;
	}
	h2 {
		margin-top: var(--sx-spacing-6);
		margin-bottom: var(--sx-spacing-2);
	}
</style>

<h2>Alexandrite</h2>

<Stack dir="c" gap={4} align="start">
	<Stack dir="r" align="center" gap={4}>
		<label>
			Theme Hue
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
	<DescriptiveToggles legend="NSFW Thumbnails" options={NSFWHandlingOptions} bind:group={$nsfwImageHandling} />
	<FeedLayoutSettings />
</Stack>

<h2>Lemmy</h2>
<Stack dir="c" gap={4} align="start">
	<p class="muted m-0">Coming Soon!</p>
</Stack>

<script lang="ts">
	import { getSettingsContext, AlexandriteSettingsDefaults, NSFWHandlingOptions } from '$lib/settings-context';
	import { Stack } from 'sheodox-ui';
	import FeedLayoutSettings from '$lib/FeedLayoutSettings.svelte';
	import DescriptiveToggles from '$lib/DescriptiveToggles.svelte';

	const { themeHue, nsfwImageHandling } = getSettingsContext();
</script>
