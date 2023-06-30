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
