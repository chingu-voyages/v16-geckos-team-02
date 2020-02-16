<script>
  import { getActiveDash } from "../dataStore";
  import Widget from "./widgets/Widget.svelte";
  let dashData = getActiveDash();
  let widgets = dashData ? Array.from(dashData.widgets.keys()) : [];

   //Grid Layout 
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";

    //The array of grid elements
 let items_arr = [];
 let cols = 10;

    //Add so many items to grid as we have in 'widgets'
    //how can we get positions and sizes of each Widget? 
    //It will be stored in dataStorage by default(as MVP)?

  widgets.forEach((ref) => {
    let newItem = gridHelp.item({
    w: 2,
    h: 2,
    x: 3,
    y: 0,
    id: ref
  });
  items_arr = gridHelp.appendItem(newItem, items_arr, cols);
  })
 
</script>

<div class="grid-container">
  <Grid items={items_arr} bind:items={items_arr} cols={cols} let:item rowHeight={100} gap={20}>
    <div class="content">
      <Widget ref={item.id} />
    </div>
  </Grid>
</div>

<style>
  .grid-container {
    width: 100%;
    height: 100%;
    padding: 20px;
    padding-bottom: 15vw;
  }
  .content {
    width: 100%;
    height: 100%;
    color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: large;
    border: 1px solid #707070;
  }

</style>