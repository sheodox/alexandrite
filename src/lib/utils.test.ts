import { it, describe, expect } from 'vitest';
import { CrossTabMessageTypes } from './utils';

function assertEnumValueUniqueness(enumName: string, enm: Record<string, string>) {
	// reverse of the enum, `value: key` to find conflicting names
	const foundValues = new Map<string, string>();
	for (const [name, val] of Object.entries(enm)) {
		if (foundValues.has(val)) {
			throw new Error(
				`Enum values for "${enumName}" are not unique, has duplicate value "${val}" for keys "${name}" and "${foundValues.get(
					val
				)}"`,
				enm
			);
		}
		foundValues.set(val, name);
	}
}

describe('cross tab messages', () => {
	it('message type enum values are unique', () => {
		expect(() => assertEnumValueUniqueness('CrossTabMessageTypes', CrossTabMessageTypes)).not.toThrow();
	});
});
