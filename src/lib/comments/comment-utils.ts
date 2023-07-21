import type { CommentView } from 'lemmy-js-client';

export interface CommentBranch {
	cv: CommentView;
	depth: number;
	path: string;
	parentComment?: CommentView;
}
