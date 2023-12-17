<style>
	h2 {
		font-size: var(--sx-font-size-8);
		margin-bottom: 0;
	}
	p {
		font-size: var(--sx-font-size-4);
	}
	.version {
		font-family: monospace;
	}
</style>

<Title title="About" />

<Layout size="narrow">
	<div class="has-inline-links">
		<h1 class="sx-font-size-9">About</h1>
		<p>Alexandrite is built by <ExternalLink href="https://sheodox.com/">sheodox</ExternalLink>.</p>

		<p>
			Feel free to request features or report issues by submitting an issue on <ExternalLink
				href="https://github.com/sheodox/alexandrite/issues">Github</ExternalLink
			>!
		</p>

		<p>
			Come join the community at <a href="/{$profile.instance}/c/alexandrite@lemmy.world">!alexandrite@lemmy.world</a>.
		</p>

		<h2>Support Development</h2>
		<p>
			If you'd like to donate to support development of Alexandrite you can tip me on <ExternalLink
				href="https://www.buymeacoffee.com/sheodox">Buy me a coffee</ExternalLink
			>. Any support is appreciated, either financially or by sharing the site with your friends!
		</p>

		<ExternalLink href="https://www.buymeacoffee.com/sheodox">
			<img
				src="/buy_me_a_coffee.png"
				alt="Buy Me A Coffee"
				style="height: 40px !important;width: 144.6px !important;"
			/>
		</ExternalLink>

		<p>Alexandrite is nothing without Lemmy and the various instances. Remember to support them too!</p>

		<h2>Other Project By Me</h2>

		<p>
			<ExternalLink href="https://sheodox.com/">Check out my other projects!</ExternalLink> I have several projects both
			for productivity and learning Japanese, you might find something you like!
		</p>

		<h2>Why "Alexandrite"</h2>
		<p>It's the name of the gem stone in my wife's wedding ring, and I just think it looks cool.</p>

		<p><strong>Have a great day!</strong></p>

		<h2>Version</h2>

		<p>
			<!-- linting doesn't recognize this, but all the other types know it's defined -->
			<!-- svelte-ignore missing-declaration -->
			<!-- eslint-disable-next-line no-undef -->
			Alexandrite version <span class="sx-badge-gray m-0 version">{__ALEXANDRITE_VERSION__}</span>
		</p>
		<p>
			<ExternalLink href="https://github.com/sheodox/alexandrite/releases">View Release history</ExternalLink>
		</p>
	</div>
</Layout>

<script lang="ts">
	import { Layout, ExternalLink } from 'sheodox-ui';
	import { profile } from '$lib/profiles/profiles';
	import Title from '$lib/Title.svelte';
</script>
