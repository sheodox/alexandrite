<select aria-label="language" name="languageId" required bind:value={selectedLanguage} on:change={saveSelectedLanguage}>
	{#each siteMeta.all_languages as lang}
		<option value={lang.id}>{lang.name}</option>
	{/each}
</select>

<script lang="ts">
	import { onMount } from 'svelte';
	import { getAppContext } from './app-context';

	export let selectedLanguage = 0;
	const languageCacheKey = 'editor-language';
	const { siteMeta } = getAppContext();
	const englishLanguageId = siteMeta.all_languages.find(({ code }) => code === 'en')?.id;

	onMount(() => {
		const cached = localStorage?.getItem(languageCacheKey);
		selectedLanguage = (cached ? Number(cached) : englishLanguageId) ?? 0;
	});

	function saveSelectedLanguage() {
		localStorage.setItem(languageCacheKey, '' + selectedLanguage);
	}
</script>
