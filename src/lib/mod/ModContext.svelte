<slot />

<script lang="ts">
	import { getLemmyClient } from '$lib/lemmy-client';
	import { writable } from 'svelte/store';
	import { setModContext, type ModAction, type ModContext } from './mod-context';
	import { showPromptModal, createAutoExpireToast } from 'sheodox-ui';

	const { client, jwt } = getLemmyClient();

	const pending = writable(new Set<string>());

	// marks an arbitrary thing as pending
	export const setPending = (action: ModAction, id: number, isPending: boolean) => {
		pending.update((p) => {
			const actionId = `${action}-${id}`;
			isPending ? p.add(actionId) : p.delete(actionId);
			return p;
		});
	};

	function successToast(message: string) {
		createAutoExpireToast({ message, variant: 'success' });
	}

	const getReason = (title: string) => showPromptModal({ title, label: 'Reason', default: '' });

	const banPerson: ModContext['banPerson'] = async (opt) => {
		if (!jwt) {
			return;
		}

		setPending('ban-person', opt.personId, true);

		try {
			if (!opt.ban) {
				const res = await client.banFromCommunity({
					auth: jwt,
					person_id: opt.personId,
					community_id: opt.communityId,
					ban: false
				});

				successToast(`${opt.personName} unbanned`);

				return res;
			} else {
				const reason = await getReason(`Ban ${opt.personName} From Community`);

				if (reason !== null) {
					const res = await client.banFromCommunity({
						auth: jwt,
						person_id: opt.personId,
						community_id: opt.communityId,
						ban: true,
						reason
					});

					successToast(`${opt.personName} banned`);
					return res;
				}
			}
		} finally {
			setPending('ban-person', opt.personId, false);
		}
	};

	const removePost: ModContext['removePost'] = async (opt) => {
		if (!jwt) {
			return;
		}

		setPending('remove-post', opt.postId, true);

		try {
			if (!opt.removed) {
				const res = await client.removePost({
					auth: jwt,
					post_id: opt.postId,
					removed: false
				});

				successToast('Post restored');
				return res;
			} else {
				const reason = await getReason('Remove Post');

				if (reason !== null) {
					const res = await client.removePost({
						auth: jwt,
						post_id: opt.postId,
						reason,
						removed: true
					});

					successToast('Post removed');
					return res;
				}
			}
		} finally {
			setPending('remove-post', opt.postId, false);
		}
	};

	const removeComment: ModContext['removeComment'] = async (opt) => {
		if (!jwt) {
			return;
		}

		setPending('remove-comment', opt.commentId, true);
		try {
			if (!opt.removed) {
				const res = await client.removeComment({
					auth: jwt,
					comment_id: opt.commentId,
					removed: false
				});
				successToast('Comment restored');
				return res;
			} else {
				const reason = await getReason('Remove Comment');

				if (reason !== null) {
					const res = await client.removeComment({
						auth: jwt,
						comment_id: opt.commentId,
						reason,
						removed: true
					});
					successToast('Comment removed');
					return res;
				}
			}
		} finally {
			setPending('remove-comment', opt.commentId, false);
		}
	};

	const featurePost: ModContext['featurePost'] = async (opt) => {
		if (!jwt) {
			return;
		}

		setPending('feature-post', opt.postId, true);
		try {
			const res = await client.featurePost({
				auth: jwt,
				post_id: opt.postId,
				featured: opt.featured,
				feature_type: 'Community'
			});
			successToast(res.post_view.post.featured_community ? 'Pinned to community' : 'Unpinned from community');
			return res;
		} finally {
			setPending('feature-post', opt.postId, false);
		}
	};

	const lockPost: ModContext['lockPost'] = async (opt) => {
		if (!jwt) {
			return;
		}

		setPending('lock-post', opt.postId, true);
		try {
			const res = await client.lockPost({
				auth: jwt,
				post_id: opt.postId,
				locked: opt.locked
			});

			successToast(res.post_view.post.locked ? 'Locked post' : 'Unlocked post');
			return res;
		} finally {
			setPending('lock-post', opt.postId, false);
		}
	};

	const distinguishComment: ModContext['distinguishComment'] = async (opt) => {
		if (!jwt) {
			return;
		}

		setPending('distinguish-comment', opt.commentId, true);
		try {
			const res = await client.distinguishComment({
				auth: jwt,
				comment_id: opt.commentId,
				distinguished: opt.distinguished
			});

			successToast(res.comment_view.comment.distinguished ? 'Distinguished comment' : 'Undistinguished commment');
			return res;
		} finally {
			setPending('distinguish-comment', opt.commentId, false);
		}
	};

	setModContext({
		pending,
		banPerson,
		removePost,
		removeComment,
		featurePost,
		lockPost,
		distinguishComment
	});
</script>
