<script>
  import DashNav from "./components/DashNav.svelte";
  import Dash from "./components/Dash.svelte";
  import WidgetMenu from "./components/WidgetMenu.svelte";
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";

  const id = () =>
    "_" +
    Math.random()
      .toString(36)
      .substr(2, 9);

  let items = [
    gridHelp.item({ x: 0, y: 0, w: 2, h: 2, id: id() }),
    gridHelp.item({ x: 2, y: 0, w: 2, h: 2, id: id() })
  ];
</script>



<main>
  <DashNav />
  <Dash />
  <WidgetMenu />

</main>


<!-- As long as this element is commented it works
But if you uncomment it, dev server freezes. -->

<!-- <Grid {items} bind:items cols={4} let:item rowHeight={100}>
  <div class="content" style="background: #ccc; border: 1px solid black;">{item.id}</div>
</Grid> -->


<style>
  .content {
    width: 100%;
    height: 100%;
    color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: large;
  }
  :global(.svlt-grid-shadow) {
    background: pink;
  }
  :global(.svlt-grid-container) {
    background: #eee;
  }
  .link {
    display: flex;
    padding-bottom: 20px;
  }
  .link a {
    margin-left: 10px;
  }
</style>