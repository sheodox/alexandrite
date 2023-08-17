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
		{#if tagline}
			<Alert variant="info"><Markdown md={tagline.content} /></Alert>
		{/if}
	</Stack>
</Sidebar>

<script lang="ts">
	import { Alert, Stack } from 'sheodox-ui';
	import Sidebar from '$lib/Sidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import Markdown from '$lib/Markdown.svelte';
	import { getAppContext } from '$lib/app-context';
	import InstanceLogo from '../../routes/(app)/[instance]/InstanceLogo.svelte';
	import type { Tagline } from 'lemmy-js-client';

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

	$: tagline = randomTagline($siteMeta.taglines);

	function randomTagline(taglines: Tagline[]) {
		if (!taglines.length || false) {
			return null;
		}

		return taglines[Math.floor(Math.random() * taglines.length)];
	}
</script>
