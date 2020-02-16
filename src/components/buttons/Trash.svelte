
<script>
    import { createEventDispatcher } from 'svelte';
    export let active;
    const dispatch = createEventDispatcher();
    const trash = () => {
        dispatch('trash', {
			active: !active // not sure why this inverts
		});
    } 
</script>

{#if active}
<img class="cancel" on:click={trash} src="/images/cancelIcon.svg" alt="x" />
{/if}
<button class="{active ? 'active' : ''}" on:click={trash}><img src="/images/TrashIcon.svg" alt="-" /></button>

<style>
	button {
        grid-area: trash;
        min-width: 100%;
        min-height: 100%;
        width: 68px;
        height: 68px;
        border: solid 1px #707070;
        margin: 0;
        background: #ffffff;
    }
    .active {
        background: #707070;
    }
</style>