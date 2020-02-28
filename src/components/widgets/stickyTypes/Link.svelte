
<script>
	export let _data;
	let editing = true;
	const disableEditIfNoFocus = () => { if (this !== document.activeElement) editing = false };
</script>

<a href="{$_data}">{$_data}</a>

<style>
	figure {
		width: 90%;
		height: 100%;
		background: none;
    }
    img {
        width: 100%;
		height: 100%;
    }
</style>