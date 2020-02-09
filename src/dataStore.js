
import { writable, derived } from 'svelte/store'; // *

export const dashTitle = writable('Dash Title');
export const activeDashIndex = writable(0);
export const dashBoards =  writable([    // *** TODO code way of getting/setting, updating/adding to this object store
    { 
        title: 'default dash',
        widgets: [
            {
                type: 'Sticky',
                title: 'default widget',
                data: 'no widgets yet, add one from widget menu'
            }
        ]
    }
]);
export const tempData = writable('no widgets yet, add one from widget menu'); // just for example purposes until we can get dashBoards to update

export const activeDash = derived( // **
	[dashBoards, activeDashIndex],
	([$dashBoards, $activeDashIndex]) => $dashBoards[$activeDashIndex]
);

// * https://svelte.dev/tutorial/writable-stores
// ** https://svelte.dev/tutorial/derived-stores
// *** https://svelte.dev/tutorial/custom-stores I think we can use this to make a dashBoards store that can Object.assign(oldStore, newStore) on update