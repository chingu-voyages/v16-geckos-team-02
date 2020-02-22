<script>
    import { getActiveDash, activeDashId, removeDash, addDash } from '../dataStore';
    import Left from './buttons/Left.svelte';
    import Right from './buttons/Right.svelte';
    import Trash from './buttons/Trash.svelte';
    import Add from './buttons/Add.svelte';
    import Toggler from '../utils/toggler.js';
    
    let trashIsOpen = false;
    const trash = new Toggler(state => trashIsOpen = state);
    let showNewDashInput = false;
    const newDashInput = new Toggler(state => showNewDashInput = state);
    let _title = getActiveDash()._title;
    let editingTitle = false;

    const dashList = [ // just for testing
        {title: 'one', ref: 1},
        {title: 'two', ref: 2}, 
        {title: 'three', ref: 3},
        {title: $_title, ref: activeDashId}, 
        {title: 'five', ref: 5},
        {title: 'six', ref: 6},  
        {title: 'seven', ref: 7},
        {title: 'eight', ref: 8}
    ]; // TODO get list from dataStore, it should return an array [{title, ref},]

    const generateOrderedNavArray = (activeId) => {
        const pivotIndex = dashList.findIndex(dash => dash.ref === activeId);
        if (pivotIndex < 0) {
            throw 'Can not find active dash';
        }
        const indexesOfDashesAdded = new Set();
        let afterPivotArr = [];
        let beforePivotArr = [];
        for (let i=0;i<9;i++) {
            let relativeIndex = pivotIndex - 4 + i; // maintain pivotIndex as middle of a 9 length segment
            let loopedIndex = (dashList.length + relativeIndex) % dashList.length; // loop within dashList
            if (pivotIndex === loopedIndex) { // skip adding the middle/active dash/pivot
                continue;
            }
            let isARepeat = indexesOfDashesAdded.has(loopedIndex);
            indexesOfDashesAdded.add(loopedIndex);
            // use empty placeholder item if looped dash is already added within first 5/is visible, this allows looping smaller lists without seeing repeats
            let item = (dashList.length >= 5 || !isARepeat) ? dashList[loopedIndex] : {title: '', ref: null};
            let isBeforePivot = relativeIndex < pivotIndex;
            isBeforePivot ? isARepeat ? beforePivotArr.unshift(item) : beforePivotArr.push(item) : afterPivotArr.push(item);
        }
        const pivot = dashList[pivotIndex];
        return [...beforePivotArr, pivot, ...afterPivotArr];
    };
    let displayArr = generateOrderedNavArray(activeDashId);

    const createDash = title => {
        !showNewDashInput && addDash(title);
    }
    
    let animationClass = '';
    const setActiveDash = (ref, index) => {
        if (!ref) {
            return
        }
        animationClass = '';
        switch(index) {
            case 'fwd': 
            animationClass = 'forward-animation';
            break;
            case 'fwd-fwd': 
            animationClass = 'forward-forward-animation';
            break;
            case 'bck': 
            animationClass = 'backward-animation';
            break;
            case 'bck-bck': 
            animationClass = 'backward-backward-animation';
            break;
        }
        setTimeout(() => {
            displayArr = generateOrderedNavArray(ref);
            // TODO setActiveDash: make setActiveDash in dataStore and import it
            animationClass = '';
        }, 500);
    } 

</script>

<nav>
    <Left on:left={() => setActiveDash(displayArr[3].ref, 'bck')} />
    <Trash active={trashIsOpen} on:trash={trash.toggle} cancelPos="right" />
    <div class="container">
    {#if trashIsOpen}
        <div class="trashMenu">
        {#each dashList as dash}
            <button on:click={() => removeDash(dash.ref)}>
                <h3>{dash.title}</h3> 
                <img src="/images/trashIcon.svg" alt="-" />
            </button>
        {/each}
        </div>
    {:else}
        <div class="carousel {animationClass}">
        {#if !showNewDashInput} <!-- if displaying input make room by removing prev-4 -->
            <button class="prev-4">{displayArr[0].title}</button>
        {/if}  
            <button class="prev-3">{displayArr[1].title}</button>
            <button class="prev-2" on:click={() => setActiveDash(displayArr[2].ref, 'bck-bck')}>{displayArr[2].title}</button>
            <button class="prev" on:click={() => setActiveDash(displayArr[3].ref, 'bck')}>{displayArr[3].title}</button>
        {#if showNewDashInput}
            <button class="prev">{displayArr[4].title}</button>
            <div class="current">
                <input on:change={() => createDash(event.target.value)} autofocus />
            </div>
        {:else}
            <div class="current">
            {#if editingTitle}
                <input bind:value={$_title} on:blur={() => editingTitle = false} type="text" autofocus />
            {:else}
                <button class="active-dash-title" on:click={() => editingTitle = true}>{displayArr[4].title}</button>
            {/if}
            </div>
        {/if}
            <button class="next" on:click={() => setActiveDash(displayArr[5].ref, 'fwd')}>{displayArr[5].title}</button>
            <button class="next-2" on:click={() => setActiveDash(displayArr[6].ref, 'fwd-fwd')}>{displayArr[6].title}</button>
            <button class="next-3">{displayArr[7].title}</button>
            <button class="next-4">{displayArr[7].title}</button>
        </div>
    {/if}
    </div>
    <Add active={showNewDashInput} on:add={newDashInput.toggle} />
    <Right on:right={() => setActiveDash(displayArr[5].ref, 'fwd')} />
</nav>

<style>
    :root {
        --animation-speed: 0.5s;
        --animation-curve: ease-in;
        --carousel-size: 200%;
    }
nav { 
    width: 100%;
    display: grid;
    grid-template-columns: auto 70px auto 70px auto 70px auto 70px auto;
    grid-template-areas: ". left . trash bar add . right .";
    grid-template-rows: 70px;
    place-items: start center;
    margin-bottom: 70px;
}
.container {
    position: relative;
    grid-area: bar;
    overflow-x: hidden;
    overflow-y: visible;
    width: 100%;
    min-width: 50vw;
    box-sizing: border-box;
    border: solid 1px #707070;
}
.trashMenu {
    position: relative;
    display: flex;
    overflow-y: visible;
    flex-direction: column;
    align-items: center;
    top: 0;
    left: 0;
    width: 100%;
    border: solid 1px #707070;
    box-sizing: border-box;
    padding: 24px;
    background: #ffffff;
    z-index: 200;
}
.trashMenu button {
    width: 200px;
    display: inline-flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-end;
}
.trashMenu button img {
    margin-left: 12px;
    padding: 8px;
    width: 20px;
    border: solid 1px #707070;
}
.carousel {
    width: var(--carousel-size);
    height: 68px;
    position: relative;
    left: calc(var(--carousel-size) / -4);
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    place-items: center center;
}
button, input {
    background: none;
    border: none;
    color: #707070;
    padding: 0;
    margin: 0;
    text-align: center;
    white-space: nowrap;
    height: 50px;
}
.current {
    min-width: 120px;
    font-size: 32px;
    display: grid;
    place-items: center center;
}
.prev, .next {
    font-size: 24px;
}
.prev-2, .next-2 {
    font-size: 16px;
}
.prev-3, .next-3, .prev-4, .next-4 {
    font-size: 12px;
}

.forward-animation .current, .backward-animation .current, .forward-animation .prev, .backward-animation .next, .forward-animation .next-2, .backward-animation .prev-2 {
    animation: shrink var(--animation-speed) var(--animation-curve) 0s 1 forwards;
}
@keyframes shrink {
    from { transform: scale(1) }
    to { transform: scale(0.75) }
}

.forward-animation .next, .backward-animation .prev, .forward-animation .prev-2, .backward-animation .next-2 {
    animation: grow var(--animation-speed) var(--animation-curve) 0s 1 forwards;
}
@keyframes grow {
    from { transform: scale(1) }
    to { transform: scale(1.25) }
}

.forward-animation {
    animation: forward var(--animation-speed) var(--animation-curve) 0s 1 forwards;
}
@keyframes forward {
    from { transform: translateX(0%) }
    to { transform: translateX(-11%) }
}
.forward-forward-animation {
    animation: forward-forward var(--animation-speed) var(--animation-curve) 0s 1 forwards;
}
@keyframes forward-forward {
    from { transform: translateX(0%) }
    to { transform: translateX(-22%) }
}
.backward-animation {
    animation: backward var(--animation-speed) var(--animation-curve) 0s 1 forwards;
}
@keyframes backward {
    from { transform: translateX(0%) }
    to { transform: translateX(11%) }
}
.backward-backward-animation {
    animation: backward-backward var(--animation-speed) var(--animation-curve) 0s 1 forwards;
}
@keyframes backward-backward {
    from { transform: translateX(0%) }
    to { transform: translateX(22%) }
}


@media only screen and (max-width: 768px) {
    nav {
        width: 110%;
        margin-left: -5%;  
        grid-template-areas: 
        ". left . trash . add . right ."
        "bar bar bar bar bar bar bar bar bar";
        row-gap: 24px;
        grid-template-rows: 70px 70px auto;
        margin-bottom: 70px;
    }
  
}
@media only screen and (max-width: 420px) { 
    .carousel {
        width: 200%;
        left: -50%;
    }
}
</style>