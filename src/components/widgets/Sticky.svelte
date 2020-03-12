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
    <textarea bind:value={$_data} />
{/if}

<style>
    textarea {
      width: 90%;
      font-family: 'Patrick Hand', cursive;
      color: #707070;
    }
</style>
