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
    <div>
        {#if editingTitle}
            <input bind:value={$_title} on:blur={() => editingTitle = false} type="text" autofocus />
        {:else}
            <a class="active-dash-title" on:click={() => editingTitle = true}>{$_title}</a>
        {/if}
    </div>
    <Add />
    <Right />
</nav>

<style>

</style>