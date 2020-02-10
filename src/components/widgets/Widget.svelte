<script>
    import { getWidget } from '../../dataStore';
    import Sticky from './Sticky.svelte';
    export let ref;
    let {_title, _data, type} = getWidget(ref);
    // TODO bind title from dataStore to an input
</script>

<div>
  <h2>{$_title}</h2>
  {#if type === 'Sticky'}
      <Sticky {_data} />
      {:else}
      <div>{type} Widget type not yet implemented</div>
  {/if}
</div>

<style>
</style>
