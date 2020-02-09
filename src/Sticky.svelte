<script>
    import { beforeUpdate } from 'svelte';
    import Widget from './Widget.svelte';
    import Text from './StickyTypes/Text.svelte';
    import detectInputType from './utils/detectInputType.js';
    export let title;
    export let data;

    let type;
    beforeUpdate(() => {
		type = detectInputType($data);
	});
</script>

<Widget {title}>
    {#if type === 'Text'}
        <Text {data} />
    {:else}
        <input type="text" bind:value={$data} /> <!-- * bind -->
    {/if}
</Widget>

<style>
	
</style>

<!-- https://svelte.dev/tutorial/text-inputs -->