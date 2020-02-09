<script>
    import { beforeUpdate } from 'svelte';
    import Widget from './Widget.svelte';
    import Text from './StickyTypes/Text.svelte';
    import Image from './StickyTypes/Image.svelte';
    import detectInputType from '../utils/detectInputType.js';
    export let title;
    export let data;

    let type;
    beforeUpdate(() => {
		  type = detectInputType($data);
	});
</script>
<div class="stickies-container">
<div class="text-widg">
<Widget {title}>
    {#if type === 'Text'}
        <Text {data} />
    {:else}
        <input type="text" bind:value={$data} /> <!-- * bind -->
    {/if}

    
</Widget>
</div>
<div class="image-widg">
<Widget {title}>
    <Image/>
</Widget>
</div>
</div>
<style>
.stickies-container{
display:grid;
		grid-template-columns: 1fr 1fr;
}
</style>

<!-- https://svelte.dev/tutorial/text-inputs -->
