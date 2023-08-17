<style lang="scss">
	.avatar {
		border-radius: var(--avatar-size);
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		line-height: 0;
		border-radius: var(--avatar-size);
		height: var(--avatar-size);
		width: var(--avatar-size);

		:global(img) {
			object-fit: cover;
			height: var(--avatar-size);
			width: var(--avatar-size);
		}
	}
	.avatar-fallback {
		background: var(--sx-gray-transparent);
	}
</style>

<div
	class="avatar f-row justify-content-center align-items-center {cl}"
	style="--avatar-size: {size};"
	class:avatar-fallback={!hasImage}
>
	{#if hasImage && src}
		<Image {src} mode="thumbnail" thumbnailResolution={resolution} />
	{:else}
		<Icon {icon} />
	{/if}
</div>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import Image from './Image.svelte';
	import { profile } from './profiles/profiles';

	export let src: string | undefined;
	export let icon: string;
	export let cl = '';
	export let size: string;
	export let resolution = 64;

	$: hasImage = src && $profile.settings.show_avatars;
</script>
