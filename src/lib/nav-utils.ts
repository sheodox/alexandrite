interface NamedThing {
	name: string;
	local: boolean;
	actor_id: string;
}

export const nameAtInstance = (thing: NamedThing, justInstance = false) => {
	let name = thing.name;
	if (!thing.local) {
		const host = new URL(thing.actor_id).hostname;
		if (justInstance) {
			return host;
		}
		name += '@' + host;
	}

	return name;
};
