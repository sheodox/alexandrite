interface NamedThing {
	name: string;
	local: boolean;
	actor_id: string;
}

export const nameAtInstance = (thing: NamedThing) => {
	let name = thing.name;
	if (!thing.local) {
		const host = new URL(thing.actor_id).hostname;
		name += '@' + host;
	}

	return name;
};
