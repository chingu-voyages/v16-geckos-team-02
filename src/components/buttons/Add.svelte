
<script>
    import { createEventDispatcher } from 'svelte';
    export let active;
    const dispatch = createEventDispatcher();
    const add = () => dispatch('add');
</script>

<button class="{active ? 'active' : ''}" on:click={add}>
    <img src="/images/addIcon.svg" alt="+" />
</button>

<style>
	button {
        grid-area: add;
        width: 70px;
        height: 70px;
        border: solid 5px #ACACAC;
        border-radius: 12px;
        margin: 0;
        background: none;
        background: #ffffff;
        z-index: 300;
    }
    .active {
        background: #707070;
    }
</style>