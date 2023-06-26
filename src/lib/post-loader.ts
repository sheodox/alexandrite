interface MorePage<T> {
	items: T[];
	error: boolean;
	endOfFeed: boolean;
}

export async function* postLoader<T>(resourceUrl: string, viewKey: string): AsyncIterator<MorePage<T>, MorePage<T>> {
	const u = new URL(location.origin + resourceUrl);
	let pageNum = 1,
		endOfFeed = false;

	while (!endOfFeed) {
		u.searchParams.set('page', '' + pageNum++);

		const res = await fetch(u);

		if (!res.ok) {
			// decrement so retrying tries the same page, probably an
			// intermittent failure
			pageNum--;
			yield {
				error: true,
				items: [],
				endOfFeed
			};

			continue;
		}

		const items = (await res.json())[viewKey];

		if (items.length === 0) {
			endOfFeed = true;
		}

		yield {
			items,
			error: false,
			endOfFeed
		};
	}

	return {
		endOfFeed: true,
		items: [],
		error: false
	};
}
