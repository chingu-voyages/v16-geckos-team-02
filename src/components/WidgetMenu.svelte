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
  const add = type => {
    addWidget(type);
    closeMenu();
  }
  </script>
  
  <nav>
  <Trash active={trashActive} />
    {#if menuOpen}
      <img class="cancel" on:escape={() => {menuOpen = false}} src="/images/cancelIcon.svg" alt="x" />
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
 
  </style>