<script>
  import { getActiveDash, getWidget, setWidgetSizeAndPos } from "../dataStore";
  import { beforeUpdate } from 'svelte';
  import Widget from "./widgets/Widget.svelte";
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";

    //The array of grid elements
  let items_arr = [];
  let cols = 10;
  let _widgetsCount = getActiveDash()._widgetsCount;
  const updateWidgetSizeAndPos = item => {
    const {w, h, x, y} = item;
    setWidgetSizeAndPos(item.id, {w, h, x, y});
  }
   //Grid Layout
  let widgets = [];
    beforeUpdate(() => {
      if ($_widgetsCount !== widgets.length) {
        items_arr = [];
        widgets = Array.from(getActiveDash().widgets.keys());
        widgets.forEach((ref) => {
          let {w, h, x, y} = getWidget(ref).sizeAndPos;
          let newItem = gridHelp.item({
            w,
            h,
            x,
            y,
            id: ref
          });
          items_arr = gridHelp.appendItem(newItem, items_arr, cols);
        });
        items_arr.forEach(item => {
          updateWidgetSizeAndPos(item);
        })
      }
  });
</script>

<Grid fillEmpty={false} on:adjust={event => updateWidgetSizeAndPos(event.detail.focuesdItem)} items={items_arr} bind:items={items_arr} cols={cols} let:item rowHeight={100}>
  <div class="content" style="background: #ccc; border: 1px solid black;">
    <Widget ref={item.id} />
  </div>
</Grid>

<style>
  div {
    width: 100%;
    height: 100%;
  }
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
</style>