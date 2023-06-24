<Sidebar view={siteView} name={siteView.site.name} description={siteView.site.description ?? ''} />

<script lang="ts">
	import Sidebar from '$lib/Sidebar.svelte';
	import type { SiteView } from 'lemmy-js-client';
	export let siteView: SiteView;
</script>
