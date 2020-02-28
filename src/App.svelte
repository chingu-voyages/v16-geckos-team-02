<script>
	import DashNav from './components/DashNav.svelte';
	import Dash from './components/Dash.svelte';
	import WidgetMenu from './components/WidgetMenu.svelte';
	let trashActive = false;
	let clearWidgets = false;
	const clearDash = event => {
		clearWidgets = true;
		setTimeout(() => clearWidgets = false, 0)
	}
	const activateTrash = event => {
		trashActive = event.detail.active;
	}
</script>

<main class="{trashActive ? 'trash' : ''}">
	<DashNav on:changingDash={clearDash} />
	<Dash {clearWidgets} />
    <WidgetMenu on:trash={activateTrash} />
</main>

<style>
	main {
		width: 100%;
	}
</style>
