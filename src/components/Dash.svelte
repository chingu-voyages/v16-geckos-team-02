<script>
    import { activeDash, tempData } from '../dataStore';
    import Sticky from './Sticky.svelte';
</script>

<section>
    {#each $activeDash.widgets as {type, title, data}}
        {#if type === 'Sticky'}
            <Sticky {title} data={tempData} />
            {:else}
            <div>{type} not yet implemented</div>
        {/if}
    {/each}
</section>

<style>

</style>
