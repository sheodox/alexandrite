<Layout size="medium" cl="mt-4">
	<Breadcrumbs {links} linkifyLast />
	<slot />
</Layout>

<script lang="ts">
	import { Layout, Breadcrumbs } from 'sheodox-ui';
	import { profile } from '$lib/profiles/profiles';
	import { nameAtInstance } from '$lib/nav-utils.js';

	export let data;

	$: links = [
		{
			text: 'Home',
			href: `/${$profile.instance}`
		},
		...(data.communityView
			? [
					{
						text: data.communityView.community.title,
						href: `/${$profile.instance}/c/${nameAtInstance(data.communityView.community)}`
					}
			  ]
			: []),
		{
			text: 'Modlog'
		}
	];
</script>
