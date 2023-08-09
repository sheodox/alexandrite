<table>
	<caption>{caption}</caption>
	<thead>
		<tr>
			<th>Key</th>
			<th>Action</th><th> </th></tr
		>
	</thead>
	<tbody>
		{#each hotkeys as hk}
			<tr>
				<td><kbd class="ws-nowrap">{hk.key}</kbd></td>
				<td>{hk.description}</td>
			</tr>
		{/each}
	</tbody>
</table>

<script lang="ts">
	export let caption: string;
	export let hotkeys: { key: string; description: string }[];
</script>
