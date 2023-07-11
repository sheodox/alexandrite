<style lang="scss">
	.sx-toggles {
		label {
			font-size: var(--sx-font-size-4);
			max-width: 10rem;
		}
	}
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
	<Fieldset legend="NSFW Thumbnails" fieldsetClasses="m-0">
		<div class="sx-toggles">
			{#each NSFWHandlingOptions as opt}
				{@const inputId = `nsfw-handling-option-${opt.value}`}
				<input id={inputId} value={opt.value} type="radio" bind:group={$nsfwImageHandling} />
				<label for={inputId}>
					{opt.label}
				</label>
			{/each}
		</div>
		{@const selected = NSFWHandlingOptions.find((opt) => opt.value === $nsfwImageHandling)}
		{#if selected}
			<p class="muted nsfw-description">
				<Icon icon="question-circle" iconVariant="regular" /><strong>{selected.label}:</strong>
				{selected.description}
			</p>
		{/if}
	</Fieldset>
</Stack>

<h2>Lemmy</h2>
<Stack dir="c" gap={4} align="start">
	<p class="muted m-0">Coming Soon!</p>
</Stack>

<script lang="ts">
	import { getSettingsContext, AlexandriteSettingsDefaults, NSFWHandlingOptions } from '$lib/settings-context';
	import { Icon, Stack, Fieldset } from 'sheodox-ui';

	const { themeHue, nsfwImageHandling } = getSettingsContext();
</script>
