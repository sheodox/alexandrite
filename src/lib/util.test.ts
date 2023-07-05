import { endpoint } from './utils';
import { it, describe, expect } from 'vitest';

describe('endpoint url creation', () => {
	it('should be correct', () => {
		expect(endpoint('/api/posts', {})).toBe('/api/posts');
		// various values that shouldn't result in query params
		expect(endpoint('/api/posts', { x: null })).toBe('/api/posts');
		expect(endpoint('/api/posts', { x: undefined })).toBe('/api/posts');
		expect(endpoint('/api/posts', { x: '' })).toBe('/api/posts');
		expect(endpoint('/api/posts', { x: 'hello' })).toBe('/api/posts?x=hello');

		// normal usage test, and params should be alphabetized
		expect(endpoint('/api/posts', { z: 'hello', y: 'world' })).toBe('/api/posts?y=world&z=hello');
	});
});
