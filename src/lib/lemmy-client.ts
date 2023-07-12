import { error } from '@sveltejs/kit';
import { LemmyHttp } from 'lemmy-js-client';
import { getLemmySettings } from './lemmy-settings';
import { createAutoExpireToast } from 'sheodox-ui';
import { getMessageFromError } from './error-messages';

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

				const lemmyError = tryParse(text)?.error ?? '';

				if (lemmyError === 'not_logged_in') {
					// redirect to the login page, they tried doing something
					// that required auth with an invalid session.
					// using a full page redirect to clear everything out
					// as I saw it continue trying to load a ton of stuff in the
					// feed after redirecting away without this.
					location.href = '/instance?expired=true';
				}

				createAutoExpireToast({
					variant: 'error',
					title: getMessageFromError(lemmyError),
					message: !lemmyError ? `Lemmy Error: ${text}` : ''
				});

				throw error(res.status, {
					message: 'Lemmy Error: ' + res.status + ':\n' + text,
					lemmyError
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
