import { writable } from 'svelte/store';

const dashboards = new Map();
export const activeDashId = Symbol(); // the first dashboard key
export const getActiveDash = () => dashboards.get(activeDashId);
export const getWidget = ref => getActiveDash().widgets.get(ref);
export const addDash = (title, ref = Symbol()) => {
    const dashData = { 
        _title: writable(title), 
        widgets: new Map()
    };
    dashboards.set(ref, dashData);
    // TODO error handling
} 
export const addWidget = type => {
    const widgetData = {
        type,
        _title: writable(''),
        _data: writable('')
    }
    getActiveDash().widgets.set(Symbol(), widgetData);
     // TODO error handling
} 

// TODO make deleteWidget(ref) method

addDash('default dash', activeDashId);
addWidget('Sticky');



