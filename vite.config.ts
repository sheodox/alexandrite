import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	envPrefix: 'ALEXANDRITE_',
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	define: {
		__ALEXANDRITE_VERSION__: JSON.stringify(process.env.npm_package_version)
	}
});
