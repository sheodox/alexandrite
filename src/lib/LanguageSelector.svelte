<select aria-label="language" name="languageId" required bind:value={selectedLanguage} on:change={saveSelectedLanguage}>
	{#each discussionLanguages as lang}
		<option value={lang.id}>{lang.name}</option>
	{/each}
</select>

<script lang="ts">
	import { onMount } from 'svelte';
	import { getAppContext } from './app-context';

	export let selectedLanguage: number | null = null;
	export let validDiscussionLanguages: number[] | undefined;

	$: languages =
		// if a community doesn't specify any languages, assume all
		validDiscussionLanguages && validDiscussionLanguages.length > 0
			? validDiscussionLanguages
			: $siteMeta.discussion_languages;

	// filter what's valid for the community further down to what the user says they chat in
	$: userDiscussionLanguages =
		($siteMeta.my_user?.discussion_languages.length ?? 0) > 0
			? languages.filter((langId) => $siteMeta.my_user?.discussion_languages.includes(langId))
			: languages;

	$: discussionLanguages = $siteMeta.all_languages.filter((lang) => userDiscussionLanguages.includes(lang.id));

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
