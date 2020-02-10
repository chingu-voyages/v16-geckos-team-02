import { writable } from 'svelte/store';

export const dashboards = {
    0: { 
        title: writable('test dash'), 
        widgets: {
            0: {
                type: 'Sticky', 
                title: writable('Test Sticky'),
                data: writable('Test Input')
            }
        }
    }
}; // TODO make as map, containing Symbol[dashId]: { title: string, widgets: Map }
export const activeDashId = 0; // TODO make as Symbol[dashId]
export const getActiveDash = () => dashboards[activeDashId];
export const getWidget = ref => getActiveDash().widgets[ref];