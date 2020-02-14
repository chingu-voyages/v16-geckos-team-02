<script>
	import DashNav from './components/DashNav.svelte';
	import Dash from './components/Dash.svelte';
	import WidgetMenu from './components/WidgetMenu.svelte';
	let trashActive = false;
	const activateTrash = event => {
		trashActive = event.detail.active;
	}
</script>

<main class="{trashActive ? 'trash' : ''}">
	<DashNav />
	<Dash />
    <WidgetMenu on:trash={activateTrash} />
</main>