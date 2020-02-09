<script>
	import DashNav from './components/DashNav.svelte';
	import Dash from './components/Dash.svelte';
	import WidgetMenu from './components/WidgetMenu.svelte';
</script>

<main>
	<div class="container">
		<div class="nav-row">
			<div class="dashnav">
				<DashNav />
			</div>
		</div>
		<div class="main-row">
			<div class="dash">
				<Dash />
			</div>
		</div>
		<div class="bottom-row">
			<WidgetMenu />
		</div>
	</div>
</main>

<style>
	.container {
		display: grid;
	/*	grid-template-columns: 1fr 1fr 1fr;*/
		grid-template-rows: 1fr 7fr 1fr;
	}

	.nav-row {
		justify-self: center;
		align-self: top;
	}

	.main-row {
		display: grid;
		justify-self: center;

	}

	.dashnav {
		justify-self: center;
	}

	.dash {
		justify-self: center;
	}

	.bottom-row {
		justify-self: right;
		align-self: end;
	}
</style>