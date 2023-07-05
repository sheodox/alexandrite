import type { HttpError } from '@sveltejs/kit';

export const errorMessages: Record<string, string> = {
	email_not_verified: 'Email not verified',
	password_incorrect: 'Password incorrect'
};

export function getMessageFromError(e: unknown) {
	if (e && e?.hasOwnProperty('body')) {
		const httpErr = e as HttpError;

		if (httpErr.body.lemmyError) {
			return errorMessages[httpErr.body.lemmyError] || httpErr.body.lemmyError;
		}

		return;
	}
}
