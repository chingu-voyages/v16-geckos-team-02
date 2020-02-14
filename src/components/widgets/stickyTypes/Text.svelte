
<script>
	export let _data;
	let editing = true;
</script>

{#if editing}
	<textarea bind:value={$_data} on:blur={() => editing = false} autofocus />
{:else}
	<article on:click={() => editing = true}>{$_data}</article>
{/if}

<style>
	textarea, article {
		width: 90%;
		background: none;
		padding: 0;
		margin: 0;
	}
</style>