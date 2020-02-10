<script>
    export let title = 'Not Set!';
    // TODO bind title from dataStore to an input
</script>

<div>
  <h2>{$title}</h2>
	<slot></slot> <!-- * slot -->
</div>

<style>
</style>

<!-- // * https://svelte.dev/tutorial/slots -->