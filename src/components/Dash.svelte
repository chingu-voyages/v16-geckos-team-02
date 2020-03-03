<script>
  import { dashboards, _activeDashIndex, getWidget, setWidgetSizeAndPos } from "../dataStore";
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import Widget from "./widgets/Widget.svelte";
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";

  export let clearWidgets = false;

  $: _widgetsCount = dashboards[$_activeDashIndex] ? dashboards[$_activeDashIndex]._widgetsCount : writable(0); // fallback for no dashboards
  let widgets = [];
  let items_arr = [];
  $: {
    if (clearWidgets) {
      items_arr = [];
    }
  }
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
  let prevItemsHashTable = {};
  onMount(() => {
    // hash table of initial widgets to compare sizeAndPos changes
    items_arr.forEach(item => prevItemsHashTable[item.id] = item); 
  })
  const getHighestColumnInUse = arr => Math.max(...arr.map(item => item.x + item.w));
  const sameSizeAndPos = ({x, y, w, h}, {x: x2, y: y2, w: w2, h: h2}) => x === x2 && y === y2 && w === w2 && h === h2;
  const storeWidgetSizeAndPos = item => {
    // filter items_arr for items with changed size or position or if new item use whole items_arr
    const changedItems = !prevItemsHashTable.hasOwnProperty(item.id) ? items_arr : items_arr.filter(item => !sameSizeAndPos(item, prevItemsHashTable[item.id]));
    if (changedItems.length > 0) {
      // find N of max used column - x + w
      const highestColumnInUse = getHighestColumnInUse(items_arr);
      // update sizeAndPos[highestColumnInUse] for each changedItems
      changedItems.forEach(item => {
        const {w, h, x, y} = item;
        setWidgetSizeAndPos(highestColumnInUse, item.id, {w, h, x, y})
      });
      items_arr.forEach(item => prevItemsHashTable[item.id] = item);
    }
  }
  const centerGridItems = arr => {
    // find highest x position 
    const highestXPos = getHighestColumnInUse(arr);
    // diff between cols and highestXPos divided by two
    const halfDiff = Math.floor((($cols) - highestXPos) / 2);
    // shift all x positions up by halfDiff
    return arr.map(item => { 
      return  {...item, ...{x: item.x + halfDiff}}
    });
  };
  const generateGridItems = (widgets, cols) => {
    let arr = [];
    // method to find which sizeAndPos store to use
    const getClosestStoredColMatch = sizeAndPos => Object.keys(sizeAndPos).sort((a,b) => Math.abs(cols - a) - Math.abs(cols - b))[0];
    widgets.forEach((ref, i) => {
      const widget = getWidget(ref);
      let {w, h, x, y} = widget.sizeAndPos[getClosestStoredColMatch(widget.sizeAndPos)];
      if (w > cols) { // width of item is larger then grid:
        w = cols; // prevent items overflowing x
        fillEmpty = true; // fill empty spaces
      }
      else {
        fillEmpty = false;
      }
      let newItem = gridHelp.item({w, h, x, y, id: ref});
      if (x+w > cols || findSpaceForAll) {
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
  <Grid {fillEmpty} items={items_arr} bind:items={items_arr} cols={$cols} let:item rowHeight={50} gap={20} on:adjust={storeWidgetSizeAndPos} on:resize={handleWindowResize} on:mount={handleWindowResize}>
      <Widget ref={item.id} />
  </Grid>
</div>

<style>
  .grid-container {
    width: 100%;
    height: 100%;
    min-height: calc(100vh - 180px);
    padding: 20px;
    padding-bottom: 15vh;
    box-sizing: border-box;
  }
  :global(.svlt-grid-resizer) {
    opacity: 0;
  }
</style>