<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    const left = () => {
        dispatch('left');
    } 
</script>

<button on:click={left}>
    <img src="/images/arrowRightIcon.svg" alt="prev" />
</button>

<style>
button {
    grid-area: left;
    min-width: 100%;
    min-height: 100%;
    width: 68px;
    height: 68px;
    background: none;
    border: none;
    transform: rotate(180deg);
}
</style>