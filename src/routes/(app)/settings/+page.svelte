<style lang="scss">
	h2 {
		margin-top: var(--sx-spacing-6);
		margin-bottom: var(--sx-spacing-2);
	}
	.description {
		width: 20rem;
	}
</style>

<h2>Alexandrite</h2>

<Stack dir="c" gap={4} align="start">
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

<h2>Lemmy</h2>
<Stack dir="c" gap={4} align="start">
	<p class="muted m-0">More coming soon!</p>

	{#if blocks?.length}
		<CommunityBlocks {blocks} on:unblock={onUnblock} />
	{/if}
</Stack>

<script lang="ts">
	import { getSettingsContext, AlexandriteSettingsDefaults, NSFWHandlingOptions } from '$lib/settings-context';
	import { Stack, Fieldset, Icon } from 'sheodox-ui';
	import FeedLayoutSettings from '$lib/FeedLayoutSettings.svelte';
	import DescriptiveToggles from '$lib/DescriptiveToggles.svelte';
	import CommunityBlocks from './CommunityBlocks.svelte';

	const { themeHue, nsfwImageHandling } = getSettingsContext();

	export let data;

	let blocks = data.siteMeta.my_user?.community_blocks
		.map(({ community }) => community)
		.sort((a, b) => {
			return (a.title || a.name).localeCompare(b.title || b.name);
		});

	function onUnblock(e: CustomEvent<number>) {
		blocks = blocks?.filter((community) => community.id !== e.detail);
	}
</script>
