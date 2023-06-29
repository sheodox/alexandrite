import type { CommentView } from 'lemmy-js-client';
import { getCommentContextId } from './nav-utils';
import { it, describe, expect } from 'vitest';

const path = (p: string) => {
	return getCommentContextId({ comment: { path: p } } as unknown as CommentView);
};

describe('comment context', () => {
	it('should be correct', () => {
		expect(path('0.1')).toBe(1);
		expect(path('0.1.2')).toBe(1);
		expect(path('0.1.2.3')).toBe(2);
		expect(path('0.1.2.3.4')).toBe(3);
	});
});
