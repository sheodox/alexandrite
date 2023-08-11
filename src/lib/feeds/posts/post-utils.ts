import type { PostView } from 'lemmy-js-client';

// allow the consumer of PostLayout to perform actions on the post (from hotkeys)
export interface PostLayoutAPI {
	upvote: () => Promise<unknown>;
	downvote: () => Promise<unknown>;
	save: () => Promise<unknown>;
}

export function isValidUrl(url?: string): url is string {
	if (!url?.trim()) {
		return false;
	}
	try {
		// must start with http:// or https://
		if (!/^https?:\/\//.test(url)) {
			return false;
		}
		new URL(url);
		return true;
	} catch (e) {
		return false;
	}
}

export function hasImageExtension(url?: string) {
	if (!isValidUrl(url)) {
		return false;
	}

	try {
		const u = new URL(url);
		return /\.(png|jpg|jpeg|webp)$/.test(u.pathname);
	} catch (e) {
		return false;
	}
}

export function hasVideoExtension(url?: string) {
	if (!isValidUrl(url)) {
		return false;
	}

	try {
		const u = new URL(url);
		return /\.(mp4|mpv|mov)$/.test(u.pathname);
	} catch (e) {
		return false;
	}
}

export interface PostAssertions {
	imageSrc?: string;
	videoSrc?: string;
	// existence of certain types of embedded content
	has: {
		image: boolean;
		video: boolean;
		body: boolean;
		embed: boolean;
		any: boolean;
	};
	is: {
		mine: boolean;
		externalLink: boolean;
	};
}

export function makePostAssertions(pv: PostView, myUserId?: number): PostAssertions {
	let imageSrc = pv.post.thumbnail_url;
	let videoSrc = pv.post.embed_video_url;

	if (!imageSrc && hasImageExtension(pv.post.url)) {
		imageSrc = pv.post.url;
	}
	if (!videoSrc && hasVideoExtension(pv.post.url)) {
		videoSrc = pv.post.url;
	}

	const hasParts = {
		image: !!imageSrc,
		video: !!videoSrc,
		body: !!pv.post.body?.trim(),
		embed: !!(pv.post.embed_title || videoSrc)
	};

	return {
		imageSrc,
		videoSrc,
		// assertions about embedded contents
		has: {
			...hasParts,
			// whether the post has any of the types of content that a post can contain
			any: Object.values(hasParts).some((has) => has)
		},
		is: {
			mine: pv.creator.id === myUserId,
			// if the `url` on a post points to a place we're not already showing. if it's an image on Lemmy and we
			// are just showing an image, don't show the link! but if it's hosted elsewhere with no thumbnail,
			// like some third party image host, or if the thumbnail is just the thumbnail for an article, the url
			// is still useful and we should show it
			externalLink: isValidUrl(pv.post.url) && (!hasImageExtension(pv.post.url) || !pv.post.thumbnail_url)
		}
	};
}
