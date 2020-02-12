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
    <Add />
    <h2>Widgets</h2>
    <Trash />
  </nav>
  
  <style>
 
  </style>