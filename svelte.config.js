import adapterAuto from '@sveltejs/adapter-auto';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: process.env.ALEXANDRITE_RUN_IN_NODE === 'true' ? adapterNode() : adapterAuto(),
		env: {
			publicPrefix: 'ALEXANDRITE_'
		},
		csp: {
			directives: {
				'script-src': ['self'],
				'frame-ancestors': ['none'],
				'frame-src': ['none']
			}
		}
	}
};

export default config;
