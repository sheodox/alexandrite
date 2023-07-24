import type { CommentView } from 'lemmy-js-client';

// TODO rewrite to include less abbreviations, more convenience stuff like the comment ID
export interface CommentBranch {
	cv: CommentView;
	depth: number;
	path: string;
	parentComment?: CommentView;
}
