import type { HttpError } from '@sveltejs/kit';

export const errorMessages: Record<string, string> = {
	email_not_verified: 'Email not verified',
	password_incorrect: 'Password incorrect',
	couldnt_find_that_username_or_email: "Couldn't find that username or email"
};

export function getMessageFromError(e: unknown) {
	if (e && e?.hasOwnProperty('body')) {
		const httpErr = e as HttpError;

		if (httpErr.body.lemmyError) {
			return errorMessages[httpErr.body.lemmyError] || httpErr.body.lemmyError;
		}
	}

	return e?.toString() || 'Unknown Error';
}
