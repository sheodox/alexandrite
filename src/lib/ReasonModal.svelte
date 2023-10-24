<Modal bind:visible {title}>
	<div class="modal-body">
		<form on:submit|preventDefault={submit}>
			<TextInput bind:value={reason} autofocus>Reason</TextInput>
		</form>
	</div>
	<div class="modal-footer gap-2">
		<button on:click={() => (visible = false)} class="tertiary m-0">Cancel</button>
		<BusyButton on:click={submit} cl="danger" {busy}>Submit</BusyButton>
	</div>
</Modal>

<script lang="ts">
	import { Modal, TextInput } from 'sheodox-ui';
	import { createEventDispatcher } from 'svelte';
	import BusyButton from './BusyButton.svelte';

	export let visible: boolean;
	export let busy: boolean;
	export let title = 'Report';
	let reason = '';

	const dispatch = createEventDispatcher<{ reason: string }>();
	const submit = () => dispatch('reason', reason);
</script>
