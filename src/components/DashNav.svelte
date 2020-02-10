<script>
    import { getActiveDash } from '../dataStore';
    let _title = getActiveDash()._title;
    // TODO bind title from dataStore to an input
</script>

<nav>
    <h1>{$_title}</h1>
</nav>

<style>

</style>