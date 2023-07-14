{#if visible}
	<Modal bind:visible title="Report">
		<div class="modal-body">
			<slot />
			<br />
			<TextInput bind:value={reason}>Reason</TextInput>
		</div>
		<div class="modal-footer">
			<button on:click={() => (visible = false)} class="tertiary">Cancel</button>
			<button on:click={() => dispatch('report', reason)} class="danger">Report</button>
		</div>
	</Modal>
{/if}

<script lang="ts">
	import { Modal, TextInput } from 'sheodox-ui';
	import { createEventDispatcher } from 'svelte';

	export let visible = false;
	let reason = '';

	const dispatch = createEventDispatcher<{ report: string }>();
</script>
