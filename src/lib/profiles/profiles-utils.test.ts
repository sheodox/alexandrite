import { getInstanceFromRoute } from './profile-utils';
import { it, describe, expect } from 'vitest';

describe('getting instance from url', () => {
	it('should be correct', () => {
		expect(getInstanceFromRoute('/lemmy.world/post/id')).toBe('lemmy.world');
		expect(getInstanceFromRoute('/lemmy.ml/post/id')).toBe('lemmy.ml');
		expect(getInstanceFromRoute('/long.subdomain.example.com/post/id')).toBe('long.subdomain.example.com');
		expect(getInstanceFromRoute('/communities')).toBe(null);
	});
});
