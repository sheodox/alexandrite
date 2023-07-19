{#if visible}
	<Modal bind:visible title="Report">
		<div class="modal-body">
			<slot />
			<br />
			<TextInput bind:value={reason}>Reason</TextInput>
		</div>
		<div class="modal-footer">
			<button on:click={() => (visible = false)} class="tertiary">Cancel</button>
			<BusyButton on:click={() => dispatch('report', reason)} cl="danger" {busy}>Report</BusyButton>
		</div>
	</Modal>
{/if}

<script lang="ts">
	import { Modal, TextInput } from 'sheodox-ui';
	import { createEventDispatcher } from 'svelte';
	import BusyButton from './BusyButton.svelte';

	export let visible: boolean;
	export let busy: boolean;
	let reason = '';

	const dispatch = createEventDispatcher<{ report: string }>();
</script>
