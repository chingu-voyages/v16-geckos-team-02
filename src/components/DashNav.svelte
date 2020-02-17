<script>
    import { beforeUpdate } from 'svelte';
    import { getActiveDash, activeDashId, addDash } from '../dataStore';
    import Left from './buttons/Left.svelte';
    import Right from './buttons/Right.svelte';
    import Trash from './buttons/Trash.svelte';
    import Add from './buttons/Add.svelte';
    let _title = getActiveDash()._title;
    beforeUpdate(()=>{
         if($activeDashId)
         _title = getActiveDash()._title;
    });
    let editingTitle = false;

      const changeActiveId = () => {
          activeDashId.update(()=>Symbol());
          addDash('new dash', activeDashId);
      };

    


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
    <Add on:add={changeActiveId}/>
    <Right />
</nav>

<style>
nav {
    display: grid;
    grid-template-columns: auto 70px auto 70px auto 70px auto 70px auto;
    grid-template-areas: ". left . trash bar add . right .";
    grid-template-rows: 70px auto;
    margin-bottom: 70px;
}
div {
    overflow: hidden;
    grid-area: bar;
    border: solid 1px #707070;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center; /* will need to change when we add dashes */
}
.active-dash-title, input {
    text-decoration: none;
    color: #707070;
    font-size: 32px;
    padding: 0;
    margin: 0;
    text-align: center;
    white-space: nowrap;
    min-width: 120px;
    height: 50px;
}
@media only screen and (max-width: 640px) {
    nav {
    display: grid;
    grid-template-columns: auto 70px auto 70px auto 70px auto 70px auto;
    grid-template-areas: 
    ". left . trash . add . right ."
    ". bar bar bar bar bar bar bar .";
    row-gap: 24px;
    grid-template-rows: 70px 70px auto;
    margin-bottom: 70px;
}
}
</style>