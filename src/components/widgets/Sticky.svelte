<script>
    import { getWidget } from '../../dataStore';
    import { beforeUpdate } from 'svelte';
    import Text from './stickyTypes/Text.svelte';
    import detectInputType from '../../utils/detectInputType.js';
    export let _data;
    let type;
    const Components = {
        Text
    }
    let Component = Text;
    let editing = $_data === '';
    beforeUpdate(() => {
        type = detectInputType($_data);
        if (type) {
            Component = Components[type];
        }
        else {
            editing = true;
        }
	});
</script>

{#if !editing}
    <Component {_data} on:click={() => editing = true} />
{:else}
    
    <textarea bind:value={$_data} on:blur={() => editing = false} />
{/if}

<style>
    textarea {
      width: 90%;
      height: 100%;
      font-family: 'Patrick Hand', cursive;
      color: #707070;
    }
</style>