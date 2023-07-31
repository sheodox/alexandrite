<Sidebar
	counts={siteCounts}
	description={siteView.site.description ?? ''}
	sidebar={siteView.site.sidebar}
	context="Your Instance"
>
	<span slot="name" class="f-row gap-2 align-items-center"
		><InstanceLogo size="3rem" /><NameAtInstance prefix="" place={{ ...siteView.site, local: true }} />
	</span>
	<Stack slot="actions" dir="c" gap={2} cl="mt-2">
		{#each $siteMeta.taglines as tagline}
			<Alert variant="info"><Markdown md={tagline.content} /></Alert>
		{/each}
	</Stack>
</Sidebar>

<script lang="ts">
	import { Alert, Stack } from 'sheodox-ui';
	import Sidebar from '$lib/Sidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import Markdown from '$lib/Markdown.svelte';
	import { getAppContext } from '$lib/app-context';
	import InstanceLogo from '../../routes/(app)/[instance]/InstanceLogo.svelte';

	const { siteMeta } = getAppContext();
	$: siteView = $siteMeta.site_view;

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
		},
		{
			label: 'Server Version',
			icon: 'code-branch',
			value: $siteMeta.version
		}
	];
</script>
