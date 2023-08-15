<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="markdown-renderer has-inline-links" on:click={toggleFullSize}>
	{#if viewSource}
		<pre class="ws-pre-line view-source">{md}</pre>
	{:else}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html rendered}
	{/if}
</div>

<script lang="ts">
	import MarkdownIt, { type Options } from 'markdown-it';
	import mdi_sub from 'markdown-it-sub';
	import mdi_sup from 'markdown-it-sup';
	import mdi_footnote from 'markdown-it-footnote';
	import mdi_container from 'markdown-it-container';
	import mdi_ruby from 'markdown-it-ruby';
	import type Token from 'markdown-it/lib/token';
	import './markdown.scss';
	import { instance } from './profiles/profiles';

	export let md: string;
	export let noImages = false;
	export let viewSource = false;

	const mdOptions: Options = {
		linkify: true,
		html: false,
		typographer: true
	};

	// (community name) @ (domain or subdomain) (.subdomain)* (.tld)
	const communityReg = /([a-zA-Z0-9_]+@[\w-]+(\.[\w-]+)*(\.[a-z]+))/g;

	const fullRender = new MarkdownIt(mdOptions);
	const noImageRender = new MarkdownIt(mdOptions).disable('image');

	extendMd(fullRender);
	extendMd(noImageRender);

	function extendMd(md: MarkdownIt) {
		md.use(mdi_sub)
			.use(mdi_sup)
			.use(mdi_footnote)
			.use(mdi_container, 'spoiler', {
				validate(params: string) {
					return params.trim().match(/^spoiler\s+(.*)$/);
				},

				render(tokens: Token[], idx: number) {
					var m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/);

					if (tokens[idx].nesting === 1 && m) {
						// opening tag
						return `<details><summary> ${md.utils.escapeHtml(m[1])} </summary>\n`;
					} else {
						// closing tag
						return '</details>\n';
					}
				}
			})
			.use(mdi_ruby);

		md.linkify.set({ fuzzyEmail: false });
		// linkify community links in the format: !communityname@example.com
		md.linkify.add('!', {
			validate: function (text, pos) {
				const tail = text.slice(pos);
				const match = tail.match(communityReg);
				if (match) {
					return match[0].length;
				}

				return 0;
			},
			normalize: function (match) {
				match.url = `/${$instance}/c/${match.url.replace('!', '')}`;
			}
		});
		// linkify user links in the format: @user@example.com
		md.linkify.add('@', {
			validate: function (text, pos) {
				const tail = text.slice(pos);
				const match = tail.match(communityReg);
				if (match) {
					return match[0].length;
				}

				return 0;
			},
			normalize: function (match) {
				match.url = `/${$instance}/u/${match.url.replace(/^@/, '')}`;
			}
		});

		const defaultRender =
			md.renderer.rules.link_open ||
			function (tokens, idx, options, env, self) {
				return self.renderToken(tokens, idx, options);
			};

		//rewrite various links to Alexandrite links
		md.renderer.rules.link_open = function (token, idx, options, env, self) {
			const href = token[idx].attrGet('href'),
				url = safeUrl(href);

			if (url) {
				const communityRegMatch = url.pathname.match(/\/[mc]\/([a-zA-Z0-9_@.]{3,})\/?$/),
					userRegMatch = url.pathname.match(/\/u\/([a-zA-Z0-9_@.]{3,})\/?$/),
					postRegMatch = url.pathname.match(/\/post\/(\d+)\/?$/),
					commentRegMatch = url.pathname.match(/\/comment\/(\d+)\/?$/),
					isLocal = url.host === $instance;
				let newPathname: null | string = null;

				if (communityRegMatch && communityRegMatch.length > 1) {
					// already a link with a host, don't duplicate the instances
					if (communityRegMatch[1].includes('@') || isLocal) {
						newPathname = `/c/${communityRegMatch[1]}`;
					} else {
						newPathname = `/c/${communityRegMatch[1]}@${url.host}`;
					}
				} else if (userRegMatch && userRegMatch.length > 1) {
					// trim superfluous leading @'s before usernames
					const match = userRegMatch[1].replace(/^@/, '');
					// already a link with a host, don't duplicate the instances
					if (match.includes('@') || isLocal) {
						newPathname = `/u/${match}`;
					} else {
						newPathname = `/u/${match}@${url.host}`;
					}
				}
				// post IDs are not the same between instances, only try rewriting
				// links to local posts, otherwise it'll go to the wrong place or nowhere
				else if (postRegMatch && postRegMatch.length > 1 && isLocal) {
					newPathname = `/post/${postRegMatch[1]}`;
				} else if (commentRegMatch && commentRegMatch.length > 1 && isLocal) {
					newPathname = `/comment/${commentRegMatch[1]}`;
				}

				if (newPathname) {
					token[idx].attrSet('href', `/${$instance}${newPathname}${url.search}`);
				}
			}

			return defaultRender(token, idx, options, env, self);
		};
	}

	$: rendered = noImages ? noImageRender.render(md) : fullRender.render(md);

	function toggleFullSize(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName.toLowerCase() === 'img') {
			target.classList.toggle('show-full');
		}
	}

	function safeUrl(url: string | null) {
		if (!url) {
			return null;
		}
		try {
			return new URL(url);
		} catch (e) {
			return null;
		}
	}
</script>
