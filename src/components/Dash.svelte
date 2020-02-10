<script>
    import { getActiveDash } from '../dataStore';
    import Sticky from './widgets/Sticky.svelte';
    let dashData = getActiveDash();
    let widgets = dashData ? dashData.widgets : [];
</script>

<section>
    {#each Object.keys(widgets) as ref}
        {#if widgets[ref].type === 'Sticky'}
            <Sticky {ref} />
            {:else}
            <div>{widgets[ref].type} not yet implemented</div>
        {/if}
    {/each}
</section>

<style>

</style>