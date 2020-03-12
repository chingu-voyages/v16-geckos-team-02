
<script>
    import { createEventDispatcher } from 'svelte';
    export let active = false;
    export let cancelPos = 'top';
    export let className = '';
    const dispatch = createEventDispatcher();
    const trash = () => {
        dispatch('trash', {
			active: !active // not sure why this inverts
		});
    } 
</script>


<button class="{active ? 'active ' : ''}{className}" on:click={trash}>
    {#if active}
        <img class="cancel {cancelPos}" on:click={trash} src="/images/cancelIcon.svg" alt="x" />
    {/if}
    <img src="/images/trashIcon.svg" alt="-" />
</button>

<style>
	button {
        position: relative;
        grid-area: trash;
        width: 70px;
        height: 70px;
        border: solid 5px #ACACAC;
        border-radius: 12px;
        margin: 0;
        background: #ffffff;
        z-index: 300;
        font-size: 16px;
    }
    .small {
        width: 50px;
        height: 50px;
    }
    img {
        height: 100%;
        width: 100%;
    }
    .active {
        background: #707070;
    }
    .cancel {
        position: absolute;
        z-index: 300;
        width: 24px;
        height: 31px;
    }
    .cancel.top {
        top: -65%;
        left: 0;
    }
    .cancel.right {
        transform: rotate(90deg);
        left: 125%;
        top: 0%;
    }
    
</style>