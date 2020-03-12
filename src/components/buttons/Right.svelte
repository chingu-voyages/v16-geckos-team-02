<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    const right = () => {
        dispatch('right');
    } 
</script>

<button on:click={right}>
    <img src="/images/arrowRightIcon.svg" alt="next" />
</button>

<style>
 button {
    grid-area: right;
    min-height: 100%;
    width: 68px;
    height: 68px;
    background: none;
    border: none;
}
</style>