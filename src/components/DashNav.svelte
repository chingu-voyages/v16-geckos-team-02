<script>
    import { getActiveDash } from '../dataStore';
    import Left from './buttons/Left.svelte';
    import Right from './buttons/Right.svelte';
    import Trash from './buttons/Trash.svelte';
    import Add from './buttons/Add.svelte';
    let _title = getActiveDash()._title;
    let editingTitle = false;
</script>

<nav>
    <Left />
    <Trash />
    <div class="container">
        <div class="carousel">
            <button class="prev-prev-prev" on:click={() => null}>prev-prev-prev</button>
            <button class="prev-prev" on:click={() => null}>prev-prev</button>
            <button class="prev" on:click={() => null}>prev</button>
            <div class="current">
                {#if editingTitle}
                    <input bind:value={$_title} on:blur={() => editingTitle = false} type="text" autofocus />
                {:else}
                    <button class="active-dash-title" on:click={() => editingTitle = true}>{$_title}</button>
                {/if}
            </div>
            <button class="next" on:click={() => null}>next</button>
            <button class="next-next" on:click={() => null}>next-next</button>
            <button class="next-next-next" on:click={() => null}>next-next-next</button>
        </div>
    </div>
    <Add />
    <Right />
</nav>

<style>
nav { 
    width: 100%;
    display: grid;
    grid-template-columns: auto 70px auto 70px auto 70px auto 70px auto;
    grid-template-areas: ". left . trash bar add . right .";
    grid-template-rows: 70px auto;
    margin-bottom: 70px;
}
.container {
    grid-area: bar;
    overflow: hidden;
    width: 100%;
    height: 70px;
    box-sizing: border-box;
    border: solid 1px #707070;
}
.carousel {
    width: 150%;
    height: 100%;
    position: relative;
    left: -25%;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    align-content: center;
    justify-content: space-between;
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
}
.prev, .next {
    font-size: 24px;
}
.prev-prev, .next-next {
    font-size: 16px;
}
.prev-prev-prev, .next-next-next {
    font-size: 12px;
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