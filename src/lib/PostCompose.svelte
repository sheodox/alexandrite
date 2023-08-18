<style>
	.dn {
		display: none;
	}
</style>

<Stack dir="c" gap={2}>
	{#if errorMessage}
		<Alert variant="error">{errorMessage}</Alert>
	{/if}

	<input name="communityId" value={community.id} type="hidden" />
	<input name="honeypot" value="" class="dn" />

	<TextInput name="title" bind:value={title}>Title</TextInput>
	<Stack dir="r" gap={2} justify="between" align="start" cl="f-wrap">
		<div class="f-1">
			<TextInput name="url" bind:value={url} placeholder="https://example.com">URL</TextInput>
		</div>
		<BusyButton
			type="button"
			cl="tertiary"
			icon="newspaper"
			on:click={() => $fetchSiteMetadataState.submit()}
			busy={$fetchSiteMetadataState.busy}
			disabled={!safeUrl(url)}>Suggest Title</BusyButton
		>
	</Stack>
	<Stack dir="r" gap={4} justify="between" align="start" cl="f-wrap">
		<Checkbox name="nsfw" bind:checked={nsfw} {disabled}>NSFW</Checkbox>
		{#if urlMetadata && urlMetadata.title && title !== urlMetadata.title}
			<EmbedCard title={urlMetadata.title} description={''}>
				<Stack dir="r" gap={2}>
					<button class="secondary f-1" type="button" on:click={onUseSuggestedTitle}>Use This Title</button>
					<button class="tertiary" type="button" on:click={() => (urlMetadata = null)}>Cancel</button>
				</Stack>
			</EmbedCard>
		{/if}
	</Stack>
	<Stack dir="c" cl="mt-2">
		<MarkdownEditor label="Post Text" name="content" bind:value={content} required={false} />
	</Stack>

	<Stack dir="r" justify="between">
		<LanguageSelector validDiscussionLanguages={discussionLanguages} />
		<BusyButton cl="primary" style="width: 8rem;" disabled={!title} busy={submitting}>{postButtonText}</BusyButton>
	</Stack>
</Stack>

<script lang="ts">
	import MarkdownEditor from './MarkdownEditor.svelte';
	import { Alert, Stack, Checkbox, TextInput, createAutoExpireToast } from 'sheodox-ui';
	import EmbedCard from './feeds/posts/EmbedCard.svelte';
	import BusyButton from './BusyButton.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import { getCommunityContext } from './community-context/community-context';
	import type { Community, Post, PostView, SiteMetadata } from 'lemmy-js-client';
	import { onMount } from 'svelte';
	import { createStatefulAction, safeUrl } from './utils';
	import { profile } from './profiles/profiles';

	export let community: Community;
	export let errorMessage = '';
	export let submitting: boolean;
	export let title = '';
	export let content = '';
	export let url = '';
	export let postButtonText = 'Post';
	// if this is a crosspost, this is the post it's crossposting
	export let crossPost: PostView | null = null;
	export let nsfw = false;

	let urlMetadata: SiteMetadata | null = null;

	$: client = $profile.client;

	$: disabled = submitting;

	const communityContext = getCommunityContext();
	$: communityRes = communityContext.getFullCommunity(community);

	$: discussionLanguages = $communityRes?.discussion_languages;

	onMount(() => {
		if (crossPost) {
			url = crossPost.post.url ?? '';
			title = crossPost.post.name;
			content = crossPostBody(crossPost.post);
			nsfw = crossPost.post.nsfw ?? false;
		}
	});

	function crossPostBody(post: Post) {
		return `cross-posted from: ${post.ap_id}` + (post.body ? `\n\n${post.body.replace(/^/gm, '> ')}` : '');
	}

	const fetchSiteMetadataState = createStatefulAction<void>(async () => {
		const u = safeUrl(url);

		// not a parseable URL
		if (!u) {
			return;
		}

		const res = await client.getSiteMetadata({
			url
		});

		if (!res.metadata.title) {
			createAutoExpireToast({
				variant: 'error',
				message: "Lemmy couldn't find a title for that URL"
			});
		} else if (res.metadata.title === title) {
			createAutoExpireToast({
				variant: 'info',
				message: "You're already using the suggested title"
			});
		}

		urlMetadata = res.metadata;
	});

	function onUseSuggestedTitle() {
		title = urlMetadata?.title ?? '';
	}
</script>
