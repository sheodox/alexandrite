<Tooltip>
	<span slot="tooltip">Feed Post Layout</span>
	<MenuButton triggerClasses="m-0 tertiary">
		<span slot="trigger" class="responsive-text">
			{#if selectedOption}
				<Icon icon={selectedOption.icon} />
				<span>{selectedOption.label}</span>
			{/if}
			<Icon icon="chevron-down" />
		</span>
		<ul slot="menu">
			{#each PostPreviewLayoutOptions as opt}
				{@const selected = $postPreviewLayout === opt.value}
				<li>
					<Tooltip>
						<span slot="tooltip">
							{opt.description}
						</span>
						<button aria-pressed={selected} disabled={selected} on:click={() => ($postPreviewLayout = opt.value)}>
							<Icon icon={opt.icon} />
							<span>{opt.label}</span>
						</button>
					</Tooltip>
				</li>
			{/each}
		</ul>
	</MenuButton>
</Tooltip>

<script lang="ts">
	import { MenuButton, Icon, Tooltip } from 'sheodox-ui';
	import { getSettingsContext, PostPreviewLayoutOptions } from '$lib/settings-context';

	const { postPreviewLayout } = getSettingsContext();

	$: selectedOption = PostPreviewLayoutOptions.find((opt) => opt.value === $postPreviewLayout);
</script>
