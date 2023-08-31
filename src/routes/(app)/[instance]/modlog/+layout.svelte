<Title title="{data.communityName ? `/c/${data.communityName}` : ''} Modlog" />
<slot />

<script lang="ts">
	import Title from '$lib/Title.svelte';
	export let data;
</script>
