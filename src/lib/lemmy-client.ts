import { error } from '@sveltejs/kit';
import { LemmyHttp } from 'lemmy-js-client';
import { createAutoExpireToast } from 'sheodox-ui';
import { getMessageFromError } from './error-messages';
import { profile } from './profiles/profiles';
import { get } from 'svelte/store';

function tryParse(str: string) {
	try {
		return JSON.parse(str);
	} catch (e) {
		return null;
	}
}

export const createLemmyClient = (
	instanceUrl: string,
	{ onExpire, useProfile = true, jwt }: { onExpire?: () => unknown; useProfile?: boolean; jwt?: string }
) => {
	return new LemmyHttp(instanceUrl, {
		fetchFunction: async (input: URL | RequestInfo, init?: RequestInit | undefined) => {
			if (!init) {
				init = {};
			}

			if (useProfile) {
				// use the passed jwt if given (used on login page)
				jwt ??= get(profile).jwt;

				init.headers = {
					...(init.headers || {}),
					...(jwt
						? {
								Authorization: `Bearer ${jwt}`
						  }
						: {})
				};

				// 0.18.x compatibility for auth
				if (input instanceof URL && jwt) {
					input.searchParams.set('auth', jwt);
				} else if (typeof input === 'string' && jwt) {
					const u = new URL(input);
					u.searchParams.set('auth', jwt);
					input = u.toString();
				}

				// taken from Photon, thanks Xylight!
				if (init?.body && jwt) {
					try {
						const json = JSON.parse(init.body.toString());
						json.auth = jwt;
						init.body = JSON.stringify(json);
					} catch (e) {
						// It seems this isn't a JSON request. Ignore adding an auth parameter.
					}
				}
			}

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
