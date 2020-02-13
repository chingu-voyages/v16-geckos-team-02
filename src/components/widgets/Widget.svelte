<script>
    import { getWidget } from '../../dataStore';
    import Sticky from './Sticky.svelte';
    import Trash from '../buttons/Trash.svelte';
    export let ref;
    let {_title, _data, type} = getWidget(ref);
    let editingTitle = false;
    const removeSelf = () => console.log('deleting self'); // todo link to a delete widget function from dataStore
</script>

<div>
  {#if editingTitle}
    <input bind:value={$_title} on:blur={() => editingTitle = false} type="text" autofocus />
  {:else}
    <h2 on:click={() => editingTitle = true}>{$_title}</h2>
  {/if}
  {#if type === 'Sticky'}
      <Sticky {_data} />
      {:else}
      <div>{type} Widget type not yet implemented</div>
  {/if}
  <span><Trash on:trash={removeSelf} /></span>
</div>

<style>
  div {
    display: grid;
    place-items: start center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 12px;
    box-sizing: border-box;
  }
  h2, input {
    text-decoration: none;
    color: #707070;
    font-size: 32px;
    padding: 0;
    margin: 0;
    text-align: center;
    white-space: nowrap;
    width: 100%;
    height: 50px;
    background: none;
    font-weight: 400;
  }
  span {
    position: absolute;
    right: 0;
    bottom: 0;
    visibility: hidden;
  }
  :global(.trash) span {
    visibility: visible;
  }
  
</style>
