<style>
	.modal-body {
		width: 27rem;
		max-width: 90vw;
	}
</style>

<slot />

{#if showBanPrompt && pendingBan}
	{@const expires = calculateBanExpiration(pendingBan.expireDays)}
	<Modal title="Community Ban" bind:visible={showBanPrompt} on:closed={pendingBan.onCancel}>
		<div class="modal-body">
			<Stack dir="c" gap={2}>
				<p class="m-0">Banning <strong>{pendingBan.username}</strong> from this community.</p>
				<TextInput bind:value={pendingBan.reason} autofocus>Reason</TextInput>
				<div class="pl-1">
					<Checkbox bind:checked={pendingBan.removeContent}>Remove Content</Checkbox>
				</div>
				<div class="pl-1">
					<Checkbox bind:checked={pendingBan.isPermanent}>Permanent Ban</Checkbox>
				</div>
				{#if !pendingBan.isPermanent}
					<TextInput bind:value={pendingBan.expireDays} type="number" min={1}>Ban duration (in days)</TextInput>
					<p class="m-0 muted px-4">
						<Icon icon="calendar" variant="regular" />
						User will be unbanned {banExpireFormat.format(expires)} ({banExpireFormatDayOfWeek.format(expires)}).
					</p>
				{/if}
			</Stack>
		</div>
		<div class="modal-footer">
			<button class="tertiary" on:click={pendingBan.onCancel}>Cancel</button>
			<button class="danger" on:click={() => (pendingBan ? pendingBan.onDone(pendingBan) : null)}>Ban</button>
		</div>
	</Modal>
{/if}

<script lang="ts">
	import { Modal, Icon, TextInput, Stack, Checkbox } from 'sheodox-ui';
	import { writable } from 'svelte/store';
	import { setModContext, type ModAction, type ModContext } from './mod-context';
	import { showPromptModal, createAutoExpireToast } from 'sheodox-ui';
	import { profile } from '$lib/profiles/profiles';
	import { getCommunityContext } from '$lib/community-context/community-context';
	import { getAppContext } from '$lib/app-context';

	$: client = $profile.client;
	$: jwt = $profile.jwt;

	const { siteMeta } = getAppContext();

	const pending = writable(new Set<string>()),
		DAY_MS = 1000 * 60 * 60 * 24;

	const communityContext = getCommunityContext();

	interface PendingBan {
		username: string;
		reason: string;
		expireDays: number;
		removeContent: boolean;
		isPermanent: boolean;
		onDone: (banOpts: PendingBan) => void;
		onCancel: () => void;
	}

	// banning needs some extra information
	let showBanPrompt = false,
		pendingBan: PendingBan | null = null;

	const banExpireFormat = new Intl.DateTimeFormat(navigator.languages[0], {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
	const banExpireFormatDayOfWeek = new Intl.DateTimeFormat(navigator.languages[0], {
		weekday: 'short'
	});

	// marks an arbitrary thing as pending
	export const setPending = (action: ModAction, id: number | string, isPending: boolean) => {
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

	function calculateBanExpiration(days: number) {
		return new Date(Date.now() + days * DAY_MS);
	}

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
				const banOpts = await new Promise<null | PendingBan>((resolve) => {
					showBanPrompt = true;
					pendingBan = {
						username: opt.personName,
						reason: '',
						expireDays: 1,
						removeContent: false,
						isPermanent: false,
						onDone: (banOpts) => {
							resolve(banOpts);
							showBanPrompt = false;
							pendingBan = null;
						},
						onCancel: () => {
							resolve(null);
							showBanPrompt = false;
							pendingBan = null;
						}
					};
				});

				if (banOpts !== null) {
					const expires = banOpts.isPermanent
							? undefined
							: // expires is the number of *seconds* since epoch
							  Math.floor(calculateBanExpiration(banOpts.expireDays).getTime() / 1000),
						res = await client.banFromCommunity({
							auth: jwt,
							person_id: opt.personId,
							community_id: opt.communityId,
							ban: true,
							reason: banOpts.reason,
							remove_data: banOpts.removeContent,
							expires
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

		const pendingType = opt.featureType === 'Community' ? 'feature-post-community' : 'feature-post-local';

		setPending(pendingType, opt.postId, true);
		try {
			const res = await client.featurePost({
				auth: jwt,
				post_id: opt.postId,
				featured: opt.featured,
				feature_type: opt.featureType
			});
			if (opt.featureType === 'Community') {
				successToast(res.post_view.post.featured_community ? 'Pinned to community' : 'Unpinned from community');
			} else {
				successToast(res.post_view.post.featured_local ? 'Pinned to local' : 'Unpinned from local');
			}
			return res;
		} finally {
			setPending(pendingType, opt.postId, false);
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

	const addMod: ModContext['addMod'] = async (opt) => {
		if (!jwt) {
			return;
		}

		const pendingKey = `${opt.communityId}-${opt.personId}`;

		setPending('add-mod', pendingKey, true);

		try {
			const res = await client.addModToCommunity({
				auth: jwt,
				added: opt.added,
				community_id: opt.communityId,
				person_id: opt.personId
			});

			successToast(opt.added ? `Added ${opt.personName} to mods` : `Removed ${opt.personName} from mods`);

			communityContext.updateCommunity(await client.getCommunity({ auth: jwt, id: opt.communityId }));

			if (opt.personId === $siteMeta.my_user?.local_user_view.person.id && !opt.added) {
				// user resigned, remove this community from siteMeta to hide mod actions
				siteMeta.update((meta) => {
					if (meta.my_user && (meta.my_user?.moderates?.length ?? 0) > 0) {
						// filter out that community
						meta.my_user.moderates = meta.my_user.moderates.filter((mod) => mod.community.id !== opt.communityId);
					}
					return meta;
				});
			}

			return res;
		} finally {
			setPending('add-mod', pendingKey, false);
		}
	};

	setModContext({
		pending,
		banPerson,
		removePost,
		removeComment,
		featurePost,
		lockPost,
		distinguishComment,
		addMod
	});
</script>
