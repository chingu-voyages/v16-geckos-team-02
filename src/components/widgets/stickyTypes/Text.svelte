
<script>
	import toMarkdown from '../../../utils/toMarkdown.js';
	import { createEventDispatcher } from 'svelte';
	export let _data;
	const dispatch = createEventDispatcher();
    const click = () => {
        dispatch('click');
    } 
	let editing = $_data === '';
	const disableEditIfNoFocus = () => { if (this !== document.activeElement) editing = false };

</script>

<article on:click={click}>{@html toMarkdown($_data)}</article>

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