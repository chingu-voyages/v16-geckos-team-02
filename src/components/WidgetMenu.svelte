<script>
  import Add from './buttons/Add.svelte';
  import Trash from './buttons/Trash.svelte';
</script>

<nav>
  <div class="widg-menu-container">
    <div class="add-btn">
      <Add />
    </div>
    <div class="widg-menu">
      <h2>Widgets</h2>
    </div>
    <div class="trash-btn">
      <Trash />
    </div>
  </div>
</nav>

<style>
  .widg-menu-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .add-btn{
    align-self: center;
    justify-self: center;
  }

    .widg-menu{
    align-self: center;
    justify-self: center;
  }
    .trash-btn{
    align-self: center;
    justify-self: center;
  }
</style>