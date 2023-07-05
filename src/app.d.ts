// See https://kit.svelte.dev/docs/types#app

import type { LemmyHttp } from 'lemmy-js-client';

export interface Settings {
	username: string;
	instance: string;
	instanceUrl: string; // instance url with https protocol
}

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			lemmyError: strin;
		}
		interface Locals {
			// lemmy server instance URL
			settings: Settings;
			jwt: string;
			client: LemmyHttp;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
