<div class="f-row" class:f-wrap={wrappable}><span>{prefix}{name}</span><span class="muted">{instance}</span></div>

<script lang="ts">
	export let place: NamedThing;
	export let displayName = '';
	export let prefix = ''; // @, !, /m/ etc
	export let wrappable = true;

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
