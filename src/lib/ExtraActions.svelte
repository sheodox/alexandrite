{#if actions.length}
	{@const text = 'Extra actions'}
	<Tooltip title={text}>
		<MenuButton triggerClasses="small">
			<span slot="trigger">
				<span class="sr-only">{text}</span>
				<Icon icon="caret-down" />
			</span>

			<ul slot="menu">
				{#each actions as opt}
					{@const variant = opt.variant || 'solid'}
					<li>
						{#if opt.href}
							<a href={opt.href} class="button"><Icon icon={opt.icon} {variant} /> {opt.text}</a>
						{:else if opt.click}
							<button on:click={opt.click} class="button"><Icon icon={opt.icon} {variant} /> {opt.text}</button>
						{/if}
					</li>
				{/each}
			</ul>
		</MenuButton>
	</Tooltip>
{/if}

<script lang="ts">
	import { Tooltip, MenuButton, Icon } from 'sheodox-ui';
	import type { ExtraAction } from './utils';

	export let actions: ExtraAction[];
</script>
