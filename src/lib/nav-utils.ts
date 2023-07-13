import type { CommentView } from 'lemmy-js-client';

interface NamedThing {
	name: string;
	local: boolean;
	actor_id: string;
}

export const nameAtInstance = (thing: NamedThing, displayName?: string) => {
	let name = displayName || thing.name;
	if (!thing.local) {
		const host = new URL(thing.actor_id).hostname;
		name += '@' + host;
	}

	return name;
};

export const getCommentContextId = (cv: CommentView) => {
	const path = cv.comment.path.split('.');
	// a root level comment has a path like 0.<id>,
	// so if the path only has two segments the context *is* this comment,
	if (path.length === 2) {
		return Number(path.at(-1));
	}
	// nested comments have paths like 0.<id>.<id>.<id> etc, where
	// the last one is the current comment ID, in this case we use
	// the second to last comment to get the parent of this comment
	return Number(path.at(-2));
};
