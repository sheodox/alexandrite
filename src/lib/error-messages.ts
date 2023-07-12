import type { HttpError } from '@sveltejs/kit';

export const errorMessages: Record<string, string> = {
	email_not_verified: 'Email not verified',
	password_incorrect: 'Password incorrect',
	couldnt_find_that_username_or_email: "Couldn't find that username or email"
};

const unknownError = 'Unknown Error';

export function getMessageFromError(e: unknown) {
	if (typeof e === 'string') {
		return errorMessages[e] || e || unknownError;
	}
	// else is type HttpError
	if (e && Object.getOwnPropertyDescriptor(e, 'body')) {
		const httpErr = e as HttpError;

		if (httpErr.body.lemmyError) {
			return errorMessages[httpErr.body.lemmyError] || httpErr.body.lemmyError;
		}
	}

	return e?.toString() || unknownError;
}
