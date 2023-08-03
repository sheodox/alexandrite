import type { HttpError } from '@sveltejs/kit';

export const errorMessages: Record<string, string> = {
	email_not_verified: 'Email not verified',
	incorrect_login: 'Username/email or password incorrect',
	couldnt_find_community: "Couldn't find community",
	couldnt_create_report: "Couldn't create report",
	community_ban: 'You are banned in this community',
	registration_application_pending: 'Your registration application is pending',
	couldnt_find_post: "Couldn't find post",
	not_an_admin: "You can't do that, you're not an admin",
	invalid_password: 'Invalid password',
	email_already_exists: 'An account with that email already exists',
	captcha_incorrect: 'Incorrect captcha answer',
	invalid_name: 'Username is invalid',
	rate_limit_error: "You're being rate limited, wait a bit before trying that again.",
	user_already_exists: 'A account with that username already exists',
	passwords_dont_match: "Passwords don't match",
	downvotes_disabled: 'Downvotes are disabled'
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
