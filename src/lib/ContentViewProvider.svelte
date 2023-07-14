<slot />

<script lang="ts">
	import { setContext } from 'svelte';
	import { __CONTENT_VIEW_CONTEXT_KEY__, type ContentViewStore } from './content-views';

	export let store: ContentViewStore;

	$: {
		if (store) {
			setContext(__CONTENT_VIEW_CONTEXT_KEY__, store);
		} else {
			throw new Error('Must pass `store` to <ContentViewProvider>');
		}
	}
</script>
