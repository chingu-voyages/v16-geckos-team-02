<script>
    import { getActiveDash } from '../dataStore';
    let title = getActiveDash().title;
    // TODO bind title from dataStore to an input
    console.log(title)
</script>

<nav>
    <h1>{$title}</h1>
</nav>

<style>

</style>