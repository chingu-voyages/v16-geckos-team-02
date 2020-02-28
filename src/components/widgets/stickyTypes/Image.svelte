
<script>
	import { createEventDispatcher } from 'svelte';
	export let _data;
	const dispatch = createEventDispatcher();
    const click = () => {
        dispatch('click');
    } 
</script>

<figure><img src="{$_data}" alt="" /></figure>

<style>
	figure {
		width: 90%;
		height: 100%;
		background: none;
    }
    img {
        max-width: 100%;
    }
</style>