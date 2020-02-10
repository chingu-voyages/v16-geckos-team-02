<script>
    import { dashTitle, activeDash } from '../dataStore';
    let dashBoards;
    let showInputTitle = false;

    function toggleInput(){
      showInputTitle = !showInputTitle;
    }

</script>

<nav>
    {#if showInputTitle}
      <form on:submit|preventDefault="{toggleInput}">
        <input
          autofocus
          bind:value={$dashTitle}
        />
      </form>
    {:else}
      <div class="dashtitle" on:click="{toggleInput}">
        {$dashTitle}
      </div>
    {/if}
</nav>

<style>
.dashtitle{
  font-size: 30px;
  letter-spacing: 1.2px;
}
</style>
