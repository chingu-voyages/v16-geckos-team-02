<script>
  import { addWidget } from '../dataStore.js';
  import Add from './buttons/Add.svelte';
  import Trash from './buttons/Trash.svelte';
  let menuOpen = false;
  let trashActive = false;
  
  const closeMenu = () => {
    setTimeout(() => { 
      if (menuOpen) { // timeout and latch so runs after toggle
        menuOpen = false;
      }
    }, 0);
    window.removeEventListener('click', closeMenu, {capture : true});
  }
  const openMenu = () => {
    menuOpen = true;
    window.addEventListener('click', closeMenu, {capture : true});
  }
  const toggleMenu = () => {menuOpen ? closeMenu() : openMenu()};

  const toggleTrash = () => {trashActive = !trashActive};

  const add = type => {
    addWidget(type);
    closeMenu();
  }
</script>
  
<nav>
  <Trash active={trashActive} on:trash={toggleTrash} on:trash /> <!-- the 2nd on:trash is to pass the event out to App -->
    {#if menuOpen}
      <img class="cancel" src="/images/cancelIcon.svg" alt="x" />
      <div>
        <button on:click={() => add('Sticky')}>
          <h3>Sticky</h3> 
          <img src="/images/addIcon.svg" alt="+" />
        </button>
      </div>
    {/if}
  <h2>Widgets</h2>
  <Add active={menuOpen} on:add={toggleMenu} />
</nav>
  
<style>
  nav {
    width: 280px;
    position: fixed;
    bottom: 5vh;
    right: 5vw;
    display: inline-grid;
    grid-template-columns: 1fr 5fr 1fr;
    grid-template-rows: auto auto 70px;
    grid-template-areas: 
      ". . cancel"
      "menu menu menu"
      "trash title add";
    align-items: center;
  }
  div {
    grid-area: menu;
    border: solid 1px #707070;
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
  }
  h3 {
    width: 100%;
    font-size: 32px;
    font-weight: 300;
    margin: 0;
  }
  h2 {
    grid-area: title;
    display: inline-grid;
    place-items: center center;
    height: 96%;
    border: solid 1px #707070;
    border-width: 1px 0 1px 0;
    font-size: 32px;
    font-weight: 300;
    margin: 0;
  }
</style>