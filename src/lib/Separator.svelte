<style>
	.separator {
		color: var(--sx-gray-100);
	}
	.line {
		border-radius: 2px;
		height: 3px;
		flex: 1;
		background: var(--sx-gray-300);
	}
	.content {
		flex: 1;
		text-align: center;
		font-weight: bold;
		white-space: nowrap;
	}
</style>

<div class="separator px-8 py-2 {cl}">
	<Stack dir="r" align="center" justify="around" gap={4}>
		<div class="line" />
		<div class="content">
			<slot />
		</div>
		<div class="line" />
	</Stack>
</div>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	export let cl = '';
</script>
