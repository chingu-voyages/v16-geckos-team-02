<script>
  import { addWidget } from '../dataStore.js';
  import { onMount } from 'svelte';
  import Add from './buttons/Add.svelte';
  import Trash from './buttons/Trash.svelte';
  import Toggler from '../utils/toggler.js';

  let menuIsOpen = false;
  const menu = new Toggler(state => menuIsOpen = state);
  let trashActive = false;
  const toggleTrash = () => {trashActive = !trashActive};
  const add = type => {
    addWidget(type);
  };

  let isAtBottom = false;

  onMount(() => {
    let observer = new IntersectionObserver(entries => {
      console.log(entries[0])
      if (entries[0].isIntersecting) {
        document.body.classList.add("header-not-at-top");
        isAtBottom = true;
      } else {
        document.body.classList.remove("header-not-at-top");
        isAtBottom = false;
      }
    }, );
    let footer = document.querySelector('#footer');
    observer.observe(footer); 
    return () => observer.unobserve(footer); 
  });
</script>
  
  <nav class="{isAtBottom ? 'bottom' : ''}">
    <Trash active={trashActive} on:trash={toggleTrash} on:trash /> <!-- the 2nd on:trash is to pass the event out to App -->
      {#if menuIsOpen}
        <img class="cancel" src="/images/cancelIcon.svg" alt="x" />
        <div class="menu">
          <button on:click={() => add('Sticky')}>
            <h3>Sticky</h3> 
            <img src="/images/addIcon.svg" alt="+" />
          </button>
        </div>
      {/if}
    <h2>Widgets</h2>
    <Add active={menuIsOpen} on:add={menu.toggle} />
  </nav>
  
<style>
  nav {
    position: fixed;
    bottom: 5vh;
    right: 5vh;
    z-index: 100;
    max-width: 300px;
    display: inline-grid;
    grid-template-columns: 1fr 5fr 1fr;
    grid-template-rows: auto auto 70px;
    grid-template-areas: 
      ". . cancel"
      ". menu menu"
      "trash title add";
    align-items: center;
  }
  @media only screen and (min-width: 780px) {
    nav {
      right: calc(15vw - 78px - 39px);
    }
  }
  nav.bottom {
    position: absolute;
  }
  .menu {
    grid-area: menu;
    border-radius: 12px;
    background: #ACACAC;
  }
  .cancel {
    grid-area: cancel;
    place-self: center end;
  }
  button {
    width: 100%;
    display: inline-flex;
    flex-flow: row nowrap;
    align-items: center;
    background: none;
    border: none;
    padding: 8px;
    padding-right: 9px;
    margin: 0;
  }
  h3 {
    width: 100%;
    font-size: 32px;
    font-weight: 300;
    margin: 0;
    font-family: 'Play', sans-serif;
    color: #ffffff;
    text-align: left;
    margin-left: 14px;
  }
  h2 {
    grid-area: title;
    display: inline-grid;
    place-items: center center;
    height: 100%;
    background: #ACACAC;
    font-size: 32px;
    font-weight: 300;
    margin: 0;
    width:120%;
    margin-left: -10%;
  }
</style>