<script>
    import {_activeDashIndex, dashboards, removeDash, addDash, setActiveDashIndex} from '../dataStore';
    import { createEventDispatcher } from 'svelte';
    import { get, writable } from 'svelte/store';
    import Left from './buttons/Left.svelte';
    import Right from './buttons/Right.svelte';
    import Trash from './buttons/Trash.svelte';
    import Add from './buttons/Add.svelte';
    import Toggler from '../utils/toggler.js';
    import handleEnter from '../utils/handleEnter';
    
    const dispatch = createEventDispatcher();
    let trashIsOpen = false;
    const trash = new Toggler(state => trashIsOpen = state);
    let editingTitle = false;

    const makeNavIndexArray = (activeIndex) => {
        let arr = [];
        for (let i=0;i<7;i++) {
            if (dashboards.length < 5) { // no loop
                arr.push((activeIndex+i-3));
            }
            else {
                const loopedIndex = (dashboards.length + activeIndex + i - 3) % dashboards.length;
                arr.push(loopedIndex);
            }
        }
        return arr
    }
    $: navIndexArray = makeNavIndexArray($_activeDashIndex);
    $: _title = dashboards[$_activeDashIndex] ? dashboards[$_activeDashIndex]._title : writable(''); // fallback for no dashboards

    let animationClass = '';
    const setActiveDash = shift => {
        const nextDashIndex = (dashboards.length + $_activeDashIndex + shift) % dashboards.length;
        if (shift !== 0 && nextDashIndex !== $_activeDashIndex) {
            dispatch('changingDash');
            if (shift > 0) {
                animationClass = 'forward-animation';
            }
            else {
                animationClass = 'backward-animation';
            }
            setTimeout(() => {
                setActiveDashIndex(nextDashIndex);
                animationClass = '';
            }, 500);
        }
    } 

    let previousDash = $_activeDashIndex;
    const addNewDash = () => {
        previousDash = $_activeDashIndex;
        addDash('');
        editingTitle = true;
        setActiveDashIndex(dashboards.length-1);
    }

    const closeEditingTitle = () => {
        editingTitle = false;
        if (event.target.value === '') {
            removeDash(dashboards.length-1);
            setActiveDashIndex(previousDash);
        }
    }

    const deleteDash = i => {
        removeDash(i);
        setActiveDashIndex((dashboards.length + $_activeDashIndex - 1) % dashboards.length);
    }

</script>

<nav>
    <Left on:left={() => setActiveDash(-1)} />
    <Trash active={trashIsOpen} on:trash={trash.toggle} cancelPos="right" />
    <div class="container {trashIsOpen ? 'trash' : ''}">
    {#if dashboards.length > 0}
        <div class="carousel {animationClass}">
            {#each navIndexArray as dashIndex, i}
                {#if dashIndex === $_activeDashIndex} 
                    <div class="current">
                        {#if editingTitle}
                            <input bind:value={$_title} on:blur={closeEditingTitle} on:keypress={handleEnter} type="text" autofocus />
                        {:else}
                            <div class="active-dash-title"><button on:click={() => editingTitle = true}>{$_title}</button><span><Trash className="small" on:trash={() => deleteDash(dashIndex)} /></span></div>
                        {/if}
                    </div>
                {:else}
                    <div class="nav-button-{i}">
                    {#if dashboards[dashIndex]} 
                        <button on:click={() => setActiveDash(i > 3 ? 1 : -1)}>{get(dashboards[dashIndex]._title)}</button>
                        <span><Trash className="small" on:trash={() => deleteDash(dashIndex)} /></span>
                    {/if}
                    </div>
                {/if}
            {/each}
        </div>
    {:else}
        <div class="carousel"></div>
    {/if}
    </div>
    <Add on:add={addNewDash} />
    <Right on:right={() => setActiveDash(1)} />
</nav>

<style>
:root {
    --animation-speed: 500ms;
    --animation-curve: ease-in-out;
    --carousel-size: 150%;
}
nav { 
    width: 100%;
    display: grid;
    grid-template-columns: auto 70px auto 70px auto 70px auto 70px auto;
    grid-template-areas: "left . . trash bar add . . right";
    grid-template-rows: 70px;
    place-items: start center;
    margin-bottom: 70px;
    margin-top: 24px;
}
.container {
    position: relative;
    grid-area: bar;
    overflow-x: hidden;
    overflow-y: visible;
    width: calc(100% + 18px);
    min-width: 50vw;
    min-height: 100%;
    box-sizing: border-box;
    background: #ACACAC;
    z-index: 200;
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
    box-sizing: border-box;
    padding: 24px;
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
span {
    visibility: hidden;
    width: 50px;
    height: 50px;
  }
  :global(.container.trash) span {
    visibility: visible;
  }
.carousel {
    width: var(--carousel-size);
    height: 68px;
    position: relative;
    left: calc(var(--carousel-size) / -6);
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    place-items: center center;
}
button, input {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    text-align: center;
    white-space: nowrap;
    height: 50px;
    color: #ffffff;
}
.current {
    height: 68px;
    min-width: 150px;
    font-size: 32px;
    display: grid;
    place-items: center center;
}
.active-dash-title {
    display: inline-flex;
    align-items: center;
}
.nav-button-2, .nav-button-4 {
    display: inline-flex;
    align-items: center;
    font-size: 24px;
}
.nav-button-1, .nav-button-5 {
    display: inline-flex;
    align-items: center;
    font-size: 18px;
}
.nav-button-0, .nav-button-6 {
    display: inline-flex;
    align-items: center;
    font-size: 14px;
}

.forward-animation .current, .forward-animation .nav-button-2, .forward-animation .nav-button-1, .backward-animation .current, .backward-animation .nav-button-4, .backward-animation .nav-button-5 {
    animation: shrink var(--animation-speed) var(--animation-curve) 0s 1 forwards;
}
@keyframes shrink {
    from { transform: scale(1) }
    to { transform: scale(0.75) }
}

.forward-animation .nav-button-4, .forward-animation .nav-button-5, .forward-animation .nav-button-6, .backward-animation .nav-button-2, .backward-animation .nav-button-1, .backward-animation .nav-button-0 {
    animation: grow var(--animation-speed) var(--animation-curve) 0s 1 forwards;
}
@keyframes grow {
    from { transform: scale(1) }
    to { transform: scale(1.32) }
}

.forward-animation {
    animation: forward var(--animation-speed) var(--animation-curve) 0s 1 forwards;
}
@keyframes forward {
    from { transform: translateX(0%) }
    to { transform: translateX(-14.2%) }
}
.backward-animation {
    animation: backward var(--animation-speed) var(--animation-curve) 0s 1 forwards;
}
@keyframes backward {
    from { transform: translateX(0%) }
    to { transform: translateX(14.2%) }
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
@media only screen and (max-width: 620px) { 
    .carousel {
        width: 300%;
        left: -100%;
    }

}
</style>