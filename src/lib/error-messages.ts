import type { HttpError } from '@sveltejs/kit';

export const errorMessages: Record<string, string> = {
	email_not_verified: 'Email not verified',
	incorrect_login: 'Username/email or password incorrect',
	couldnt_find_community: "Couldn't find community",
	couldnt_create_report: "Couldn't create report",
	community_ban: 'You are banned in this community',
	registration_application_pending: 'Your registration application is pending',
	couldnt_find_post: "Couldn't find post"
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
