<style lang="scss">
	.sidbar-details {
		background: var(--sx-gray-transparent);
		border-radius: 10px;
		padding: var(--sx-spacing-2);
	}
</style>

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
	<div slot="end">
		<div class="sidbar-details mb-4">
			<h2 class="m-0 mb-2">Instance Details</h2>
			<div class="f-column gap-4">
				<ul class="sx-list">
					{#each serverStats as stat}
						<li class="sx-list-item two-columns">
							<span class="column">{stat.label}</span>
							<span class="column text-align-right">{stat.value.toLocaleString()} <Icon icon={stat.icon} /></span>
						</li>
					{/each}
					<li class="sx-list-item">
						<ModlogLink highlight={isAdmin ?? false} highlightColor="orange" warn={$showModlogWarning} />
					</li>
					<li class="sx-list-item">
						<a href="/{$profile.instance}/legal" class="inline-link"><Icon icon="gavel" /> Legal</a>
					</li>
					<li class="sx-list-item">
						<a href="/{$profile.instance}/instances" class="inline-link"><Icon icon="circle-nodes" /> Instances</a>
					</li>
					<li class="sx-list-item">
						<ExternalLink href={`https://${$profile.instance}`} cl="inline-link"
							><Icon icon="arrow-up-right-from-square" /> {$profile.instance}</ExternalLink
						>
					</li>
				</ul>
				{#if $siteMeta.admins.length}
					<Accordion>
						<span slot="title">Admins ({$siteMeta.admins.length})</span>
						<ul class="sx-list">
							{#each $siteMeta.admins as admin}
								<li class="sx-list-item">
									<UserLink user={admin.person} />
								</li>
							{/each}
						</ul>
					</Accordion>
				{/if}
			</div>
		</div>

		<div class="sidbar-details">
			<h2 class="m-0 mb-2">External Links</h2>
			<ul class="sx-list">
				{#each externalLinks as link}
					<li class="sx-list-item">
						<ExternalLink href={link.href} cl="inline-link"
							><Icon icon={link.icon} variant={link.iconVariant} /> {link.label}</ExternalLink
						>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</Sidebar>

<script lang="ts">
	import { Alert, Stack, Icon, ExternalLink, Accordion } from 'sheodox-ui';
	import Sidebar from '$lib/Sidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import ModlogLink from '$lib/ModlogLink.svelte';
	import Markdown from '$lib/Markdown.svelte';
	import { getAppContext } from '$lib/app-context';
	import InstanceLogo from '../../routes/(app)/[instance]/InstanceLogo.svelte';
	import type { Tagline } from 'lemmy-js-client';
	import { getSettingsContext } from '$lib/settings-context';
	import { profile } from '../profiles/profiles';
	import UserLink from '$lib/UserLink.svelte';

	const { siteMeta } = getAppContext();
	const { showModlogWarning } = getSettingsContext();
	$: siteView = $siteMeta.site_view;
	$: isAdmin = $siteMeta.admins.some(
		(admin) => admin.person.actor_id === $siteMeta.my_user?.local_user_view.person.actor_id
	);

	const externalLinks = [
		{
			label: 'Join Lemmy',
			href: 'https://join-lemmy.org/',
			icon: 'compass',
			iconVariant: 'solid'
		},
		{
			label: 'Lemmy Docs',
			href: 'https://join-lemmy.org/docs/index.html',
			icon: 'circle-info',
			iconVariant: 'solid'
		},
		{
			label: 'Lemmy Github',
			href: 'https://github.com/LemmyNet',
			icon: 'github',
			iconVariant: 'brands'
		},
		{
			label: 'Alexandrite Github',
			href: 'https://github.com/sheodox/alexandrite',
			icon: 'github',
			iconVariant: 'brands'
		}
	] as const;

	$: serverStats = [
		{
			label: 'Posts',
			value: $siteMeta.site_view.counts.posts,
			icon: 'file-lines'
		},
		{
			label: 'Comments',
			value: $siteMeta.site_view.counts.comments,
			icon: 'comments'
		},
		{
			label: 'Users',
			value: $siteMeta.site_view.counts.users,
			icon: 'users'
		},
		{
			label: 'Daily Active Users',
			value: $siteMeta.site_view.counts.users_active_day,
			icon: 'users'
		},
		{
			label: 'Weekly Active Users',
			value: $siteMeta.site_view.counts.users_active_week,
			icon: 'users'
		},
		{
			label: 'Monthly Active Users',
			value: $siteMeta.site_view.counts.users_active_month,
			icon: 'users'
		},
		{
			label: 'Half-Year Active Users',
			value: $siteMeta.site_view.counts.users_active_half_year,
			icon: 'users'
		},
		{
			label: 'Server Version',
			value: $siteMeta.version,
			icon: 'code-branch'
		}
	];

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
