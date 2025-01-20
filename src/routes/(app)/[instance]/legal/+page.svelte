<Layout>
	<h1>{$profile.instance} Legal</h1>
	<hr />
	<Markdown md={$siteMeta.site_view.local_site.legal_information ?? ''} />
</Layout>

<script>
	import { getAppContext } from '$lib/app-context';
	import Markdown from '$lib/Markdown.svelte';
	import { Layout } from 'sheodox-ui';
	import { profile } from '$lib/profiles/profiles';

	const { siteMeta } = getAppContext();
</script>
