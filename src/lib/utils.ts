export class Throttler {
	timeout: ReturnType<typeof setTimeout> | null = null;

	constructor(private callback: () => unknown, private throttleMS: number = 200) {}

	run() {
		if (this.timeout) {
			return;
		}
		this.timeout = setTimeout(() => {
			this.timeout = null;
			this.callback();
		}, this.throttleMS);
	}
}

export const endpoint = (pathname: string, queryParams: Record<string, string | number | null | undefined>) => {
	const url = pathname,
		query = [];

	// sort alphabetically for consistent ordering
	const params = Object.entries(queryParams).sort((a, b) => a[0].localeCompare(b[0]));

	for (const [name, value] of params) {
		if (value !== undefined && value !== null && value !== '') {
			query.push(`${name}=${encodeURIComponent(value)}`);
		}
	}
	return url + (query.length ? '?' + query.join('&') : '');
};
