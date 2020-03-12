<script>
    import { getWidget, removeWidget} from '../../dataStore';
  	import { quintOut } from 'svelte/easing';
    import Sticky from './Sticky.svelte';
    import Trash from '../buttons/Trash.svelte';
    import handleEnter from '../../utils/handleEnter';
    export let ref;
    let {_title, _data, type} = getWidget(ref);
    let editingTitle = false;
    const removeSelf = () => {
      removeWidget(ref);
    }

    function flip(node, { delay = 0, duration = 400, easing: easing$1 = easing.cubicOut }) {
      const style = getComputedStyle(node);
      const opacity = +style.opacity;
      const width = parseFloat(style.width);
      return {
          delay,
          duration,
          easing: easing$1,
          css: t => `overflow: hidden;` +
              `opacity: ${Math.min(t * 20, 1) * opacity};` +
              `transform: rotateY(${(t - 1) * 90}deg)`
      };
    }
</script>

<div transition:flip="{{duration: 300, easing: quintOut }}">
  {#if editingTitle}
    <input bind:value={$_title} on:blur={() => editingTitle = false} on:keypress={handleEnter} type="text" autofocus />
  {:else}
    <h2 on:click={() => editingTitle = true}>{$_title}</h2>
  {/if}
  {#if type === 'Sticky'}
      <Sticky {_data} />
      {:else}
      <div>{type} Widget type not yet implemented</div>
  {/if}
  <span><Trash on:trash={removeSelf} /></span>
  <img class="resize-icon" src="/images/resizeIcon.svg" alt="-" />
</div>

<style>
  div {
    position: relative;
    display: grid;
    place-items: start center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 12px;
    box-sizing: border-box;
    border: 1px solid #ACACAC;
    box-shadow: #ACACAC 0 3px 6px;
    color: #707070;
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
    min-height: 30px;
    background: none;
    font-weight: 400;
    font-family: 'Courgette', cursive;
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
  .resize-icon {
    position: absolute;
    bottom: 0;
    right: 0;
  }
  
</style>
