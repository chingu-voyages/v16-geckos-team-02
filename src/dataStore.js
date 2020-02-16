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
            widgets: new Map(),
            _widgetsCount: writable(0)
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
            sizeAndPos: {w: 2, h: 2, x: 0, y: 0},
            _title: writable(''),
            _data: writable('')
        }
        getActiveDash().widgets.set(Symbol(), widgetData);
        getActiveDash()._widgetsCount.update(n => n + 1);

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

export const removeWidget = (widgetRef, dashRef = activeDashId) => {
    try {
        if(dashboards.get(dashRef).widgets.delete(widgetRef))
        {
            dashboards.get(dashRef)._widgetsCount.update(n => n - 1);
            console.log('deleted')
        }
        else {
            console.log(dashboards.get(dashRef))
        }
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

export const setWidgetSizeAndPos = (ref, data) => {
    try {
        getActiveDash().widgets.get(ref).sizeAndPos = data;
    } catch (e) {
        // TODO decide how to handle the exception
    }
}

addDash('default dash', activeDashId);
addWidget('Sticky');