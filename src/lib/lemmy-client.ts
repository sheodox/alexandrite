import { error } from '@sveltejs/kit';
import { LemmyHttp } from 'lemmy-js-client';
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

export const createLemmyClient = (instanceUrl: string, onExpire?: () => unknown) => {
	return new LemmyHttp(instanceUrl, {
		fetchFunction: async (input: URL | RequestInfo, init?: RequestInit | undefined) => {
			if (!init) {
				init = {};
			}

			init.headers = {
				'user-agent': APP_USER_AGENT,
				...(init.headers || {})
			};

			let res;
			try {
				res = await fetch(input, init);
			} catch (e) {
				createAutoExpireToast({
					variant: 'error',
					message: 'Network Error'
				});

				// wanted to use 0, but `error` throws if you use something outside of 400-599
				throw error(500, {
					message: `Network Error`
				});
			}

			if (!res.ok) {
				const text = await res.text();

				const lemmyError = tryParse(text)?.error ?? '';

				if (lemmyError === 'not_logged_in') {
					onExpire?.();
				}

				const errMsg = lemmyError ? getMessageFromError(lemmyError) : text;

				createAutoExpireToast({
					variant: 'error',
					message: errMsg ? `Lemmy Error: ${errMsg}` : 'Unknown Error'
				});

				throw error(res.status, {
					message: `Lemmy Error: ${errMsg} (status ${res.status})`,
					lemmyError
				});
			}
			return res;
		}
	});
};
