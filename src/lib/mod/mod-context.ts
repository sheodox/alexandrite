import type {
	AddModToCommunityResponse,
	BanFromCommunityResponse,
	CommentResponse,
	PostFeatureType,
	PostResponse
} from 'lemmy-js-client';
import { getContext, setContext } from 'svelte';
import { derived, type Writable } from 'svelte/store';

const MOD_CONTEXT_KEY = '__MOD_CONTEXT__';

export interface ModContext {
	// a set of things like `ban-<person_id>`, to check if things are happening to a given resource
	pending: Writable<Set<string>>;
	banPerson: (opts: {
		personId: number;
		personName: string;
		ban: boolean;
		communityId: number;
	}) => Promise<BanFromCommunityResponse | undefined>;
	removePost: (opts: { postId: number; removed: boolean }) => Promise<PostResponse | undefined>;
	removeComment: (opts: { commentId: number; removed: boolean }) => Promise<CommentResponse | undefined>;
	featurePost: (opts: {
		postId: number;
		featured: boolean;
		featureType: PostFeatureType;
	}) => Promise<PostResponse | undefined>;
	lockPost: (opts: { postId: number; locked: boolean }) => Promise<PostResponse | undefined>;
	distinguishComment: (opts: { commentId: number; distinguished: boolean }) => Promise<CommentResponse | undefined>;
	addMod: (opts: {
		added: boolean;
		communityId: number;
		personId: number;
		personName: string;
	}) => Promise<AddModToCommunityResponse | undefined>;
}

export type ModAction =
	| 'ban-person'
	| 'remove-post'
	| 'remove-comment'
	| 'feature-post-community'
	| 'feature-post-local'
	| 'lock-post'
	| 'distinguish-comment'
	| 'add-mod';

// get a store indicating if an action is pending for a given user/post/comment etc
export const getModActionPending = (action: ModAction, id: number | string) => {
	const { pending } = getModContext();
	return derived([pending], ([pending]) => {
		return pending.has(`${action}-${id}`);
	});
};

export const getModContext = () => {
	return getContext<ModContext>(MOD_CONTEXT_KEY);
};

export const setModContext = (modContext: ModContext) => {
	setContext(MOD_CONTEXT_KEY, modContext);
};
