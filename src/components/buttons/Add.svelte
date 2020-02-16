
<script>
    import { createEventDispatcher } from 'svelte';
    export let active = false;
    const dispatch = createEventDispatcher();
    const add = () => dispatch('add');
</script>

<button class="{active ? 'active' : ''}" on:click={add}>
    <img src="/images/addIcon.svg" alt="+" />
</button>

<style>
	button {
        grid-area: add;
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