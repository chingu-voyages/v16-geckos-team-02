
<script>
    import { createEventDispatcher } from 'svelte';
    export let active = false;
    export let cancelPos = 'top';
    const dispatch = createEventDispatcher();
    const trash = () => {
        dispatch('trash', {
			active: !active // not sure why this inverts
		});
    } 
</script>


<button class="{active ? 'active' : ''}" on:click={trash}>
    {#if active}
        <img class="cancel {cancelPos}" on:click={trash} src="/images/cancelIcon.svg" alt="x" />
    {/if}
    <img src="/images/TrashIcon.svg" alt="-" />
</button>

<style>
	button {
        position: relative;
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
    .cancel {
        position: absolute;
        z-index: 300;
    }
    .cancel.top {
        top: -50%;
        left: 0;
    }
    .cancel.right {
        transform: rotate(90deg);
        left: 150%;
        top: 25%;
    }
    
</style>