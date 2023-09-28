<style>
	.extra-actions-trigger {
		aspect-ratio: 1;
		display: block;
		width: 1em;
	}
</style>

{#if actions.length}
	{@const text = 'Extra actions'}
	<Tooltip title={text}>
		<MenuButton triggerClasses="{small ? 'small' : ''} m-0 {cl}" on:open>
			<span slot="trigger" class="extra-actions-trigger">
				<span class="sr-only">{text}</span>
				<Icon icon="ellipsis-vertical" />
			</span>

			<ul slot="menu">
				{#each actions as opt}
					<li>
						<ExtraActionButton action={opt} />
					</li>
				{/each}
			</ul>
		</MenuButton>
	</Tooltip>
{/if}

<script lang="ts">
	import { Tooltip, MenuButton, Icon } from 'sheodox-ui';
	import type { ExtraAction } from './utils';
	import ExtraActionButton from './ExtraActionButton.svelte';

	export let actions: ExtraAction[];
	export let small = false;
	export let cl = '';
</script>
