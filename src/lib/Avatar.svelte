<style lang="scss">
	.avatar {
		height: var(--avatar-size);
		width: var(--avatar-size);
		border-radius: var(--avatar-size);
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;

		:global(img) {
			border-radius: var(--avatar-size);
			height: 100%;
			width: 100%;
			object-fit: cover;
		}
	}
	.avatar-fallback {
		background: var(--sx-gray-transparent);
	}
</style>

<div class="avatar {cl}" style="--avatar-size: {size};" class:avatar-fallback={!hasImage}>
	{#if hasImage && src}
		<Image {src} />
	{:else}
		<Icon {icon} />
	{/if}
</div>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import Image from './Image.svelte';
	import { getLemmySettings } from './lemmy-settings';

	const ls = getLemmySettings();

	export let src: string | undefined;
	export let icon: string;
	export let cl = '';
	export let size: string;

	$: hasImage = src && ls.show_avatars;
</script>
