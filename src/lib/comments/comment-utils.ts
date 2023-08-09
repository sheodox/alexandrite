import type { CommentView } from 'lemmy-js-client';

// TODO rewrite to include less abbreviations, more convenience stuff like the comment ID
export interface CommentBranch {
	cv: CommentView;
	depth: number;
	path: string;
	parentComment?: CommentView;
}

// some API methods exported by the Comment component so a consumer of Comment can trigger
// actions with hotkeys caught by some parent element
export interface CommentAPI {
	upvote: () => Promise<unknown>;
	downvote: () => Promise<unknown>;
	save: () => Promise<unknown>;
}
