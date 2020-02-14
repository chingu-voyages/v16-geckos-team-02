import {
    writable
} from 'svelte/store';

const dashboards = new Map();
export const activeDashId = Symbol(); // the first dashboard key
export const getActiveDash = () => dashboards.get(activeDashId);
export const getWidget = ref => getActiveDash().widgets.get(ref);

export const addDash = (title, ref = Symbol()) => {
    try {
        const dashData = {
            _title: writable(title),
            widgets: new Map()
        };
        dashboards.set(ref, dashData);
    } catch (e) {
        // TODO decide how to handle the exception
    }
}
export const addWidget = type => {
    try {
        const widgetData = {
            type,
            _title: writable(''),
            _data: writable('')
        }
        getActiveDash().widgets.set(Symbol(), widgetData);
    } catch (e) {
        // TODO decide how to handle the exception
    }
}

export const removeDash = ref => {
    try {
        dashboards.delete(ref);
    } catch (e) {
        // TODO decide how to handle the exception
    }
}

export const removeWidget = (dashRef, widgetRef) => {
    try {
        dashboards.get(dashRef).widgets.delete(widgetRef);
    } catch (e) {
        // TODO decide how to handle the exception
    }
}

export const updateDash = (title, ref) => {
    try {
        dashboards.get(ref)._title.set(title);
    } catch (e) {
        // TODO decide how to handle the exception
    }
}

export const updateWidget = (title, dashRef, widgetRef) => {
    try {
        dashboards.get(dashRef).widgets.get(widgetRef)._title.set(title);
    } catch (e) {
        // TODO decide how to handle the exception
    }
}

addDash('default dash', activeDashId);
addWidget('Sticky');