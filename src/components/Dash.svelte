<script>
    import { getActiveDash } from '../dataStore';
    import Widget from './widgets/Widget.svelte';
    let dashData = getActiveDash();
    let widgets = dashData ? Array.from(dashData.widgets.keys()) : [];
</script>

<section>
    {#each widgets as ref}
            <Widget {ref} />
    {/each}
</section>

<style>

</style>