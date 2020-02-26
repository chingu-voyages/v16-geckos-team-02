
<script>
	import toMarkdown from '../../../utils/toMarkdown.js';
	export let _data;
	let editing = true;
	const disableEditIfNoFocus = () => { if (this !== document.activeElement) editing = false };
</script>

{#if editing}
	<textarea on:change={disableEditIfNoFocus} bind:value={$_data} on:blur={() => editing = false} autofocus />
{:else}
	<article on:click={() => editing = true}>{@html toMarkdown($_data)}</article>
{/if}

<style>
	textarea, article {
		width: 90%;
		height: 100%;
		background: none;
		padding: 0;
		margin: 0;
		white-space: pre-wrap;
	}
</style>