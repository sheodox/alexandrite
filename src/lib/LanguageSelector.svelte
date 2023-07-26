<select aria-label="language" name="languageId" required bind:value={selectedLanguage} on:change={saveSelectedLanguage}>
	{#each $siteMeta.all_languages as lang}
		<option value={lang.id}>{lang.name}</option>
	{/each}
</select>

<script lang="ts">
	import { onMount } from 'svelte';
	import { getAppContext } from './app-context';

	export let selectedLanguage: number | null = null;
	const languageCacheKey = 'editor-language';
	const { siteMeta } = getAppContext();
	// assume english, Alexandrite isn't translated yet anyway
	const englishLanguageId = $siteMeta.all_languages.find(({ code }) => code === 'en')?.id;

	onMount(() => {
		const cached = localStorage?.getItem(languageCacheKey);
		if (selectedLanguage === null) {
			selectedLanguage = (cached ? Number(cached) : englishLanguageId) ?? 0;
		}
	});

	function saveSelectedLanguage() {
		localStorage.setItem(languageCacheKey, '' + selectedLanguage);
	}
</script>
