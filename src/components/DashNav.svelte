<script>
    import {activeDashIndex, dashboards, removeDash, addDash, setActiveDashIndex} from '../dataStore';
    import { get } from 'svelte/store';
    import Left from './buttons/Left.svelte';
    import Right from './buttons/Right.svelte';
    import Trash from './buttons/Trash.svelte';
    import Add from './buttons/Add.svelte';
    import Toggler from '../utils/toggler.js';
    
    let trashIsOpen = false;
    const trash = new Toggler(state => trashIsOpen = state);
    $: _title = dashboards[$activeDashIndex]._title;
    let editingTitle = false;

    const makeNavIndexArray = activeIndex => {
        let arr = [];
        for (let i=0;i<7;i++) {
            if (dashboards.length < 5) { // no loop
                arr.push(i-3-dashboards.length);
            }
            else {
                const loopedIndex = (dashboards.length + activeIndex + i - 3) % dashboards.length;
                arr.push(loopedIndex);
            }
        }
        return arr
    }
    $: navIndexArray = makeNavIndexArray($activeDashIndex);

    let animationClass = '';
    const setActiveDash = shift => {
        if (shift !== 0) {
            if (shift > 0) {
                animationClass = 'forward-animation';
            }
            else {
                animationClass = 'backward-animation';
            }
            setTimeout(() => {
                setActiveDashIndex((dashboards.length + $activeDashIndex + shift) % dashboards.length);
                animationClass = '';
            }, 500);
        }
    } 

</script>

<nav>
    <Left on:left={() => setActiveDash(-1)} />
    <Trash active={trashIsOpen} on:trash={trash.toggle} cancelPos="right" />
    <div class="container">
        {#if trashIsOpen}
            <div class="trashMenu">
            {#each dashboards as dash, i}
                <button on:click={() => removeDash(i)}>
                    <h3>{get(dash._title)}</h3> 
                    <img src="/images/trashIcon.svg" alt="-" />
                </button>
            {/each}
            </div>
        {:else}
        <div class="carousel {animationClass}">
            {#each navIndexArray as dashIndex, i}
                {#if dashIndex === $activeDashIndex} 
                    <div class="current">
                        {#if editingTitle}
                            <input bind:value={$_title} on:blur={() => editingTitle = false} type="text" autofocus />
                        {:else}
                            <button class="active-dash-title" on:click={() => editingTitle = true}>{$_title}</button>
                        {/if}
                    </div>
                {:else}
                    <button class="nav-button-{i}" on:click={() => setActiveDash(i > 3 ? 1 : -1)}>{dashboards[dashIndex] ? get(dashboards[dashIndex]._title) : ''}</button>
                {/if}
            {/each}
        </div>
        {/if}
    </div>
    <Add on:add={addDash} />
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
    left: calc(var(--carousel-size) / -6);
    display: grid;
    grid-template-columns: repeat(7, 1fr);
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
    min-width: 150px;
    font-size: 32px;
    display: grid;
    place-items: center center;
}
.nav-button-2, .nav-button-4 {
    font-size: 24px;
}
.nav-button-1, .nav-button-5 {
    font-size: 16px;
}
.nav-button-0, .nav-button-6 {
    font-size: 12px;
}

.forward-animation .current, .backward-animation .current, .forward-animation .nav-button-2, .backward-animation .nav-button-4, .forward-animation .nav-button-5, .backward-animation .nav-button-1 {
    animation: shrink var(--animation-speed) var(--animation-curve) 0s 1 forwards;
}
@keyframes shrink {
    from { transform: scale(1) }
    to { transform: scale(0.75) }
}

.forward-animation .nav-button-4, .backward-animation .nav-button-2, .forward-animation .nav-button-1, .backward-animation .nav-button-5 {
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
@media only screen and (max-width: 420px) { 
    .carousel {
        width: 200%;
        left: -50%;
    }
}
</style>