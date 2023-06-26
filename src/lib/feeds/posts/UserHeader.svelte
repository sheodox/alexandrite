<FeedHeader icon={personView.person.avatar ?? ''} published={personView.person.published}>
	<NameAtInstance place={personView.person} prefix="@" slot="name" />
	<UserBadges slot="badges" user={personView.person} />
</FeedHeader>

<script lang="ts">
	import type { PersonView } from 'lemmy-js-client';
	import FeedHeader from './FeedHeader.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import UserBadges from './UserBadges.svelte';

	export let personView: PersonView;
</script>
