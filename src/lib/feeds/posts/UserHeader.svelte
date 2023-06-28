<FeedHeader icon={personView.person.avatar ?? ''} published={personView.person.published}>
	<NameAtInstance place={personView.person} prefix="@" slot="name" />
	<Stack slot="actions" dir="r" gap={2} align="center">
		<UserBadges user={personView.person} />
		<a class="button tertiary" rel="noreferrer" target="_blank" href={personView.person.actor_id}>
			<Icon icon="network-wired" />
			On {personInstance}
		</a>
		<LogButton on:click={() => console.log({ personView })} text="Log PersonView" small={false} />
	</Stack>
</FeedHeader>

<script lang="ts">
	import type { PersonView } from 'lemmy-js-client';
	import { Stack, Icon } from 'sheodox-ui';
	import FeedHeader from './FeedHeader.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import UserBadges from './UserBadges.svelte';
	import LogButton from '$lib/LogButton.svelte';

	export let personView: PersonView;

	$: personInstance = new URL(personView.person.actor_id).host;
</script>
