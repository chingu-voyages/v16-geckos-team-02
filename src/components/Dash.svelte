<script>
  import { getActiveDash, getWidget, setWidgetSizeAndPos } from "../dataStore";
  import { writable } from 'svelte/store';
  import { beforeUpdate } from 'svelte';
  import Widget from "./widgets/Widget.svelte";
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";

  let items_arr = [];
  const approxColumnSizePx = 100;
  const cols = writable(20);
  const getNOfCols = () => {
    const windowWidth = document.documentElement.clientWidth;
    return Math.floor(windowWidth/approxColumnSizePx);
  }
  let _widgetsCount = getActiveDash()._widgetsCount;
  const storeWidgetSizeAndPos = item => {
    const {w, h, x, y} = item;
    setWidgetSizeAndPos(item.id, {w, h, x, y});
  }
   //Grid Layout
  const generateGridItems = () => {
    items_arr = [];
    widgets = Array.from(getActiveDash().widgets.keys());
    widgets.forEach((ref, i) => {
      let {w, h, x, y} = getWidget(ref).sizeAndPos;
      let newItem = gridHelp.item({w, h, x, y, id: ref});
      if (x+w >= $cols) {
        newItem = {...newItem, ...gridHelp.findSpaceForItem(newItem, items_arr, $cols)};
      }
      items_arr = gridHelp.appendItem(newItem, items_arr, $cols);
    });
  };
  let widgets = [];
    beforeUpdate(() => {
      if ($_widgetsCount !== widgets.length) {
        generateGridItems();
      }
  });
  const handleWindowResize = () => {
    cols.update(getNOfCols);
    generateGridItems();
  };
</script>

<div class="grid-container">
  <Grid fillEmpty={false} items={items_arr} bind:items={items_arr} cols={$cols} let:item rowHeight={50} gap={20} on:adjust={event => storeWidgetSizeAndPos(event.detail.focuesdItem)} on:resize={handleWindowResize} on:mount={handleWindowResize}>
      <Widget ref={item.id} />
  </Grid>
</div>

<style>
  .grid-container {
    width: 100%;
    height: 100%;
    padding: 20px;
    padding-bottom: 15vh;
  }
</style>