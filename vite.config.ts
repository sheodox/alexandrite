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
	},
	optimizeDeps: {
		// let `npm link sheodox-ui` work without wiping out `node_modules/.vite` and restarting Vite between every change
		exclude: ['sheodox-ui']
	}
});
