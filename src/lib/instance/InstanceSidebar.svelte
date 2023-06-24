<Sidebar counts={siteCounts} name={siteView.site.name} description={siteView.site.description ?? ''} />

<script lang="ts">
	import Sidebar from '$lib/Sidebar.svelte';
	import type { SiteView } from 'lemmy-js-client';
	export let siteView: SiteView;

	$: siteCounts = [
		{
			label: 'Users',
			icon: 'users',
			value: siteView.counts.users
		},
		{
			label: 'Posts',
			icon: 'file-lines',
			value: siteView.counts.posts
		},
		{
			label: 'Comments',
			icon: 'comments',
			value: siteView.counts.comments
		}
	];
</script>
