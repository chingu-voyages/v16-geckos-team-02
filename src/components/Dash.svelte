<script>
  import { dashboards, _activeDashIndex, getWidget, setWidgetSizeAndPos, removeWidgetSizeAndPos } from "../dataStore";
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import Widget from "./widgets/Widget.svelte";
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";

  export let clearWidgets = false;
  const findSpaceForAll = false;
  const approxColumnSizePx = 50;
 
  $: _widgetsCount = dashboards[$_activeDashIndex] ? dashboards[$_activeDashIndex]._widgetsCount : writable(0); // fallback for no dashboards
  let widgets = [];
  let itemsArr = [];
  let prevDashIndex = $_activeDashIndex;
  $: cols = 0;
  $: {
    if ($_widgetsCount !== widgets.length || $_activeDashIndex !== prevDashIndex) {
      prevDashIndex = $_activeDashIndex;
      widgets = dashboards[$_activeDashIndex] ? Array.from(dashboards[$_activeDashIndex].widgets.keys()) : [];
      itemsArr = generateGridItems(widgets, cols);
    }
  } 
  $: {
    if (clearWidgets) {
      itemsArr = [];
    }
  }

  let fillEmpty = false;
  const generateGridItems = (widgets, cols) => {
    let arr = [];
    widgets.forEach((ref, i) => {
      const widget = getWidget(ref);
      let {w, h, x, y} = widget.sizeAndPos[getClosestStoredColMatch(widget.sizeAndPos)];
      if (w > cols) {
        w = cols;
        fillEmpty = true;
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
    cols = getNOfCols();
    itemsArr = generateGridItems(widgets, cols);
  }

  let prevItemsLookup = {};
  const handleAdjust = function storeWidgetSizeAndPos() {
    const changedItems = itemsArr.filter(item => !prevItemsLookup[item.id] || !isSameSizeAndPos(item, prevItemsLookup[item.id]));
    if (changedItems.length > 0) {
      const highestColumnInUse = getHighestColumnInUse(itemsArr);
      changedItems.forEach(item => {
        const {w, h, x, y} = item;
        setWidgetSizeAndPos(highestColumnInUse, item.id, {w, h, x, y})
        const currentClosestMatch = getClosestStoredColMatch(getWidget(item.id).sizeAndPos);
        if (currentClosestMatch > highestColumnInUse) {
          removeWidgetSizeAndPos(item.id, currentClosestMatch);
        }
      });
      itemsArr.forEach(item => prevItemsLookup[item.id] = item);
    }
  }

  const centerGridItems = arr => {
    const highestXPos = getHighestColumnInUse(arr);
    const halfDiff = Math.floor(((cols) - highestXPos) / 2);
    return arr.map(item => { 
      return  {...item, ...{x: item.x + halfDiff}}
    });
  };
  
  onMount(() => {
    itemsArr.forEach(item => prevItemsLookup[item.id] = item); 
  })

  function getClosestStoredColMatch(sizeAndPos) {
    const accendingDiffArr = Object.keys(sizeAndPos).sort((a,b) => {
      const diffOfFirstVal = Math.abs(cols - a);
      const diffOfSecondVal = Math.abs(cols - b);
      return diffOfFirstVal - diffOfSecondVal
    });
    return accendingDiffArr[0]
  } 
  function isSameSizeAndPos ({x, y, w, h}, {x: x2, y: y2, w: w2, h: h2}) {
    return x === x2 && y === y2 && w === w2 && h === h2
  }
  function getHighestColumnInUse(arr) {
    return Math.max(...arr.map(item => item.x + item.w))
  }
  function getNOfCols() {
    const gridWidth = document.getElementById('gridContainer').clientWidth;
    const nColsFitInWindow = Math.round(gridWidth/approxColumnSizePx);
    return nColsFitInWindow - (nColsFitInWindow%2);
  }
</script>

<div id="gridContainer" class="grid-container">
  <Grid {fillEmpty} items={itemsArr} bind:items={itemsArr} cols={cols} let:item rowHeight={50} gap={20} on:adjust={handleAdjust} on:resize={handleWindowResize} on:mount={handleWindowResize}>
      <Widget ref={item.id} />
  </Grid>
</div>

<style>
  .grid-container {
    width: 100%;
    height: 100%;
    min-height: calc(100vh - 180px - 220px);
    padding: 20px;
    padding-bottom: 180px;
    box-sizing: border-box;
  }
  :global(.svlt-grid-resizer) {
    opacity: 0;
  }
</style>