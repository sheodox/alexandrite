import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST = (async ({ locals, request }) => {
	const body = Object.fromEntries(await request.formData());

	const res = await locals.client.createPrivateMessage({
		auth: locals.jwt,
		content: body.content as string,
		recipient_id: Number(body.recipientId)
	});

	return json({
		privateMessageView: res.private_message_view
	});
}) satisfies RequestHandler;
