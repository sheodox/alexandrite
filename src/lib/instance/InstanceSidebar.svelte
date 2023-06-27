<Sidebar counts={siteCounts} description={siteView.site.description ?? ''} sidebar={siteView.site.sidebar}>
	<span slot="name"
		><Icon icon="network-wired" /><NameAtInstance prefix="" place={{ ...siteView.site, local: true }} />
	</span>
</Sidebar>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import Sidebar from '$lib/Sidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
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
