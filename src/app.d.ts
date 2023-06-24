// See https://kit.svelte.dev/docs/types#app

import type { LemmyHttp } from 'lemmy-js-client';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			// lemmy server instance URL
			instance: string;
			instanceUrl: string; // instance url with https protocol
			jwt: string;
			client: LemmyHttp;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
