import { error } from '@sveltejs/kit';
import { LemmyHttp } from 'lemmy-js-client';
import { getLemmySettings } from './lemmy-settings';

const APP_USER_AGENT = 'Alexandrite https://alexandrite.app';

function tryParse(str: string) {
	try {
		return JSON.parse(str);
	} catch (e) {
		return null;
	}
}

export const createLemmyClient = (instanceUrl: string) => {
	return new LemmyHttp(instanceUrl, {
		fetchFunction: async (input: URL | RequestInfo, init?: RequestInit | undefined) => {
			if (!init) {
				init = {};
			}

			init.headers = {
				'user-agent': APP_USER_AGENT,
				...(init.headers || {})
			};

			const res = await fetch(input, init);
			if (!res.ok) {
				const text = await res.text();

				throw error(res.status, {
					message: 'Lemmy Error: ' + res.status + ':\n' + text,
					lemmyError: tryParse(text)?.error ?? ''
				});
			}
			return res;
		}
	});
};

// cache the client, so long as we're accessing the same instance
let client: LemmyHttp, clientInstanceUrl: string;

// this should only be used when we know we'll have this stuff, don't use in `/(meta)` routes
export const getLemmyClient = () => {
	const instance = localStorage.getItem('instance')!,
		instanceUrl = `https://${instance}`;

	if (instanceUrl !== clientInstanceUrl) {
		client = createLemmyClient(instanceUrl);
		clientInstanceUrl = instanceUrl;
	}

	return {
		client: createLemmyClient(instanceUrl),
		lemmySettings: getLemmySettings(),
		username: localStorage.getItem('username'),
		jwt: localStorage.getItem('jwt') ?? undefined,
		instance,
		instanceUrl
	};
};
