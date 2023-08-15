<style lang="scss">
	.description {
		width: 20rem;
	}
	.theme-preview {
		pointer-events: none;
	}
</style>

<Fieldset legend="Theme">
	<Stack dir="r" gap={4}>
		<Stack dir="c" gap={4} cl="f-1">
			<label>
				Color Scheme
				<br />
				<select bind:value={$colorScheme}>
					{#each colorSchemes as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</label>
			<ThemeSlider label="Theme Hue" min={0} max={360} step={1} bind:value={$themeHue} />
			<ThemeSlider label="Theme Saturation" min={0} max={5} step={0.1} bind:value={$themeSaturation} />
			<ThemeSlider label="Link Hue" min={0} max={360} step={1} bind:value={$linkHue} />
			<ThemeSlider label="Upvote Hue" min={0} max={360} step={1} bind:value={$upvoteHue} />
			<ThemeSlider label="Downvote Hue" min={0} max={360} step={1} bind:value={$downvoteHue} />
		</Stack>
	</Stack>
	<p class="muted description">
		<Icon icon="question-circle" variant="regular" /> If you use DarkReader, make sure to disable it for this site.
	</p>
	<div class="text-align-right">
		<button class="tertiary" on:click={onDefaultTheme}>
			<Icon icon="trash-can" />
			Default
		</button>
	</div>
</Fieldset>

<Fieldset legend="Theme Preview">
	<div class="card-body theme-preview">
		<a href="/" class="inline-link">Link Text</a>

		<VoteButtons score={1} vote={1} />
		<VoteButtons score={1} vote={0} />
		<VoteButtons score={1} vote={-1} />
	</div>
</Fieldset>

<script lang="ts">
	import { getSettingsContext, AlexandriteSettingsDefaults } from '$lib/settings-context';
	import { Stack, Fieldset, Icon } from 'sheodox-ui';
	import VoteButtons from '$lib/VoteButtons.svelte';
	import ThemeSlider from './ThemeSlider.svelte';

	const { themeHue, themeSaturation, linkHue, upvoteHue, downvoteHue, colorScheme } = getSettingsContext();

	const colorSchemes = [
		{
			value: null,
			label: 'System Default'
		},
		{
			value: 'light',
			label: 'Light'
		},
		{
			value: 'dark',
			label: 'Dark'
		}
	];

	function onDefaultTheme() {
		if (confirm('Are you sure you want to reset your theme?')) {
			$themeHue = AlexandriteSettingsDefaults.themeHue;
			$themeSaturation = AlexandriteSettingsDefaults.themeSaturation;
			$colorScheme = AlexandriteSettingsDefaults.colorScheme;
			$linkHue = AlexandriteSettingsDefaults.linkHue;
			$upvoteHue = AlexandriteSettingsDefaults.upvoteHue;
			$downvoteHue = AlexandriteSettingsDefaults.downvoteHue;
		}
	}
</script>
