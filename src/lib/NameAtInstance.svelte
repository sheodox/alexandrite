{prefix}{name}<wbr /><span class="muted">{instance}</span>

<script lang="ts">
	export let place: NamedThing;
	export let displayName = '';
	export let prefix: string; // @, !, /m/ etc

	$: name = displayName || place.name;
	$: instance = getInstance(place);

	interface NamedThing {
		name: string;
		local: boolean;
		actor_id: string;
	}
	const getInstance = (thing: NamedThing) => {
		if (!thing.local) {
			return '@' + new URL(thing.actor_id).hostname;
		}
		return '';
	};
</script>
