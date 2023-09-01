<a href={modlogHref} class="m-0 {highlight ? `sx-badge-${highlightColor}` : 'inline-link'}"
	><Icon icon="shield-halved" /> {label}</a
>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { profile } from '$lib/profiles/profiles';

	export let communityId: number | undefined = undefined;
	export let targetId: number | undefined = undefined;
	export let warn: boolean;
	export let highlight: boolean;
	export let highlightColor: string;
	export let label = 'Modlog';

	// direct to the modlog or the warning page depending on the user's settings
	$: modlogHref = `/${$profile.instance}/modlog${warn ? '' : '/view'}${getQuery({ communityId, targetId })}`;

	function getQuery({ communityId, targetId }: { communityId?: number; targetId?: number }) {
		const parts = [];

		if (communityId !== undefined) {
			parts.push(`community=${communityId}`);
		}
		if (targetId !== undefined) {
			parts.push(`target=${targetId}`);
		}

		return parts.length ? `?${parts.join('&')}` : '';
	}
</script>
