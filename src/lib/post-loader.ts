interface MorePage<T> {
	items: T[];
	error: boolean;
	endOfFeed: boolean;
}

export async function* postLoader<T>(resourceUrl: string, viewKey: string): AsyncIterator<MorePage<T>, MorePage<T>> {
	const u = new URL(location.origin + resourceUrl);
	// assume the first page has already loaded with the page, and this is just used for additional pages.
	// only the comments under a post start with nothing loaded, it doesn't use this loader
	let pageNum = 2,
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
