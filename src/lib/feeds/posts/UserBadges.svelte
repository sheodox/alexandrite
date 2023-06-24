{#if user.banned}
	<span class="sx-badge-red">Banned</span>
{/if}
{#if user.bot_account}
	<span class="sx-badge-cyan">Bot</span>
{/if}
{#if user.admin}
	<span class="sx-badge-orange">Admin</span>
{/if}
{#if user.actor_id === postOP}
	<span class="sx-badge-pink">OP</span>
{/if}

<script lang="ts">
	import type { Person } from 'lemmy-js-client';

	export let user: Person;
	export let postOP: string; // actor_id of someone who made a post
</script>
