<FeedHeader icon={personView.person.avatar ?? ''} published={personView.person.published}>
	<NameAtInstance place={personView.person} displayName={personView.person.display_name} prefix="@" slot="name" />
	<Stack slot="actions" dir="r" gap={2} align="center">
		<a class="button tertiary" rel="noreferrer" target="_blank" href={personView.person.actor_id}>
			<Icon icon="network-wired" />
			On {personInstance}
		</a>
		{#if !isMe}
			<a class="button tertiary" href="/message/{personView.person.id}">
				<Icon icon="message" />
				Send Message
			</a>
		{/if}
		{#if !readOnly}
			<a class="button tertiary" href="/search?creator={personView.person.id}">
				<Icon icon="magnifying-glass" />
				Search
			</a>
		{/if}
		<LogButton on:click={() => console.log({ personView })} text="Log PersonView" small={false} />
	</Stack>

	<div slot="badges">
		<UserBadges user={personView.person} />
	</div>
</FeedHeader>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import FeedHeader from './FeedHeader.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import UserBadges from './UserBadges.svelte';
	import LogButton from '$lib/LogButton.svelte';
	import type { ContentViewPerson } from '$lib/content-views';
	import { profile } from '$lib/profiles/profiles';

	export let contentView: ContentViewPerson;
	export let readOnly = false;

	$: personView = contentView.view;
	$: personInstance = new URL(personView.person.actor_id).host;
	$: isMe = personView.person.local && personView.person.name === $profile.username;
</script>
