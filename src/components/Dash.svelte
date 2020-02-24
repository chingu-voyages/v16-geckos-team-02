<script>
  import { dashboards, _activeDashIndex, getWidget, setWidgetSizeAndPos } from "../dataStore";
  import { writable } from 'svelte/store';
  import Widget from "./widgets/Widget.svelte";
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";

  $: _widgetsCount = dashboards[$_activeDashIndex]._widgetsCount;
  let widgets = Array.from(dashboards[$_activeDashIndex].widgets.keys());
  let items_arr = [];
  $: {
    if ($_widgetsCount !== widgets.length) {
      widgets = Array.from(dashboards[$_activeDashIndex].widgets.keys());
      items_arr = generateGridItems(widgets, $cols);
    }
  } 
  const cols = writable(40);
  let fillEmpty = false;
  const findSpaceForAll = false;
  const approxColumnSizePx = 50;

  const getNOfCols = () => {
    const gridWidth = document.getElementById('gridContainer').clientWidth;
    const nColsFitInWindow = Math.round(gridWidth/approxColumnSizePx);
    return nColsFitInWindow - (nColsFitInWindow%2);
  }
  const storeWidgetSizeAndPos = item => {
    const {w, h, x, y} = item;
    setWidgetSizeAndPos(item.id, {w, h, x, y});
  }
  const centerGridItems = arr => {
    // find highest x position 
    const highestXPos = Math.max(...arr.map(item => item.x + item.w));
    // diff between cols and highestXPos divided by two
    const halfDiff = Math.floor((($cols) - highestXPos) / 2);
    // shift all x positions up by halfDiff
    return arr.map(item => { 
      return  {...item, ...{x: item.x + halfDiff}}
    });
  };
  const generateGridItems = (widgets, cols) => {
    let arr = [];
    widgets.forEach((ref, i) => {
      let {w, h, x, y} = getWidget(ref).sizeAndPos;
      if (w > cols) { // width of item is larger then grid:
        w = cols; // prevent items overflowing x
        fillEmpty = true; // fill empty spaces
      }
      else {
        fillEmpty = false;
      }
      let newItem = gridHelp.item({w, h, x, y, id: ref});
      if (x+w >= cols || findSpaceForAll) {
        newItem = {...newItem, ...gridHelp.findSpaceForItem(newItem, arr, cols)};
      }
      arr = gridHelp.appendItem(newItem, arr, cols);
    });
    return centerGridItems(arr);
  };
  const handleWindowResize = () => {
    cols.update(getNOfCols);
    items_arr = generateGridItems(widgets, $cols);
  };
</script>

<div id="gridContainer" class="grid-container">
  <Grid {fillEmpty} items={items_arr} bind:items={items_arr} cols={$cols} let:item rowHeight={50} gap={20} on:adjust={event => storeWidgetSizeAndPos(event.detail.focuesdItem)} on:resize={handleWindowResize} on:mount={handleWindowResize}>
      <Widget ref={item.id} />
  </Grid>
</div>

<style>
  .grid-container {
    width: 100%;
    height: 100%;
    padding: 20px;
    padding-bottom: 15vh;
    box-sizing: border-box;
  }
</style>