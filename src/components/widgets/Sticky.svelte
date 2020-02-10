<script>
    import { getWidget } from '../../dataStore';
    import { beforeUpdate } from 'svelte';
    import Widget from './Widget.svelte';
    import Text from './stickyTypes/Text.svelte';
    import detectInputType from '../../utils/detectInputType.js';
    export let ref;
    const {title} = getWidget(ref);
    let type;
    beforeUpdate(() => {
		  // type = detectInputType($data); // uncomment when dectectInput function is ready
	});
</script>
<Widget {title}>
    {#if type === 'Text'}
        <Text /> <!-- TODO add prop with a bindable dataStore -->
    {:else}
        <input type="text" /> <!-- TODO bind input to item in dataStore -->
    {/if}
</Widget>

<style>

</style>

<!-- https://svelte.dev/tutorial/text-inputs -->