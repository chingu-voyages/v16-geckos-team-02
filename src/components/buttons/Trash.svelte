
<script>
    import { createEventDispatcher } from 'svelte';
    export let active;
    const dispatch = createEventDispatcher();
    const trash = () => dispatch('trash');
</script>

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
        background: none;
    }
    .active {
        background: #707070;
    }
</style>