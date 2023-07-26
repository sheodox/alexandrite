import { getContext, setContext } from 'svelte';
import type { Writable } from 'svelte/store';

const BAN_USERS_STORE_KEY = '__BANNED_USERS__';

type BannedUsersStore = Writable<Map<number, boolean>>;

export function setBannedUsers(store: BannedUsersStore) {
	setContext(BAN_USERS_STORE_KEY, store);
}

export function getBannedUsersStore() {
	return getContext<BannedUsersStore>(BAN_USERS_STORE_KEY);
}
