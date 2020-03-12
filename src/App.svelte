<script>
	import DashNav from './components/DashNav.svelte';
	import Dash from './components/Dash.svelte';
	import WidgetMenu from './components/WidgetMenu.svelte';
	import Footer from './components/Footer.svelte';
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
<Footer />

<style>
	main {
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;
		position: relative;
	}
	@media only screen and (min-width: 780px) {
		main {
		padding-left: calc(15vw - 78px - 39px);
		padding-right: calc(15vw - 78px - 39px);
		}
	}
</style>
