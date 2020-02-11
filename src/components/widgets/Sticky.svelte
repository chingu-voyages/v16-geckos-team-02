<script>
    import { getWidget } from '../../dataStore';
    import { beforeUpdate } from 'svelte';
    import Text from './stickyTypes/Text.svelte';
    import detectInputType from '../../utils/detectInputType.js';
    export let _data;
    let type;
    beforeUpdate(() => {
		type = detectInputType($_data);
	});
</script>

{#if type === 'Text'}
    <Text {_data} />
{:else}
    <input type="text" bind:value={$_data} />
{/if}

<style>

</style>
