import { error } from '@sveltejs/kit';
import { LemmyHttp } from 'lemmy-js-client';

const APP_USER_AGENT = 'Alexandrite https://alexandrite.app';

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
					message: 'Lemmy Error: ' + res.statusText + ':\n' + text
				});
			}
			return res;
		}
	});
};
