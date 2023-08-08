import type { PostView } from 'lemmy-js-client';

export function hasImageExtension(url?: string) {
	if (!url || !/^https?:\/\//.test(url)) {
		return false;
	}

	try {
		const u = new URL(url);
		return /\.(png|jpg|jpeg|webp)$/.test(u.pathname);
	} catch (e) {
		return false;
	}
}

export interface PostAssertions {
	imageSrc?: string;
	has: {
		image: boolean;
		body: boolean;
		embed: boolean;
		any: boolean;
	};
	is: {
		mine: boolean;
	};
}

export function makePostAssertions(pv: PostView, myUserId?: number): PostAssertions {
	let imageSrc = pv.post.thumbnail_url;

	if (!imageSrc && hasImageExtension(pv.post.url)) {
		imageSrc = pv.post.url;
	}

	const hasParts = {
		image: !!imageSrc,
		body: !!pv.post.body?.trim(),
		embed: !!pv.post.embed_title
	};

	return {
		imageSrc,
		has: {
			...hasParts,
			// whether the post has any of the types of content that a post can contain
			any: Object.values(hasParts).some((has) => has)
		},
		is: {
			mine: pv.creator.id === myUserId
		}
	};
}
