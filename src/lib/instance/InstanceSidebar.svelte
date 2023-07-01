<Sidebar counts={siteCounts} description={siteView.site.description ?? ''} sidebar={siteView.site.sidebar}>
	<span slot="name"
		><Icon icon="network-wired" /><NameAtInstance prefix="" place={{ ...siteView.site, local: true }} />
	</span>
	<Stack slot="actions" dir="c" gap={2} cl="mt-2">
		{#each taglines as tagline}
			<Alert variant="info"><Markdown md={tagline.content} /></Alert>
		{/each}
	</Stack>
</Sidebar>

<script lang="ts">
	import { Alert, Stack, Icon } from 'sheodox-ui';
	import Sidebar from '$lib/Sidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import Markdown from '$lib/Markdown.svelte';
	import type { SiteView } from 'lemmy-js-client';
	import { getAppContext } from '$lib/app-context';
	export let siteView: SiteView;

	const taglines = getAppContext().siteMeta.taglines;

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
