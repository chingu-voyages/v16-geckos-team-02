import { writable, get } from 'svelte/store';

export const dashboards = [];
export let _activeDashIndex = writable(2); 
export const setActiveDashIndex = i => _activeDashIndex.update(() => i);
export const getActiveDash = () => dashboards[get(_activeDashIndex)];
export const getWidget = ref => getActiveDash().widgets.get(ref);

export const addDash = (title = '') => {
    try {
        const dashData = {
            _title: writable(title),
            widgets: new Map(),
            _widgetsCount: writable(0)
        };
        dashboards.push(dashData);
        setActiveDashIndex(dashboards.length-1)
    } catch (e) {
        // TODO decide how to handle the exception
    }
}
export const addWidget = (type, title = '', data = '', sizeAndPos = {w: 8, h: 5, x: Infinity, y: 0}) => {
    try {
        const widgetData = {
            type,
            sizeAndPos,
            _title: writable(title),
            _data: writable(data)
        }
        getActiveDash().widgets.set(Symbol(), widgetData);
        getActiveDash()._widgetsCount.update(n => n + 1);
    } catch (e) {
        // TODO decide how to handle the exception
    }
}

export const removeDash = index => {
    try {
        dashboards.splice(index, 1);
    } catch (e) {
        // TODO decide how to handle the exception
    }
}

export const removeWidget = (widgetRef, dashRef = get(_activeDashIndex)) => {
    try {
        if(dashboards[dashRef].widgets.delete(widgetRef))
        {
            dashboards[dashRef]._widgetsCount.update(n => n - 1);
        }
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

addDash('one');
addDash('two');
addDash('three');
addDash('four');
addDash('five');
addWidget(
    'Sticky', 
    'Welcome', 
    'This is currently only a prototype. The concept is a personal dash space for organising activities. At the moment functionality is limited.',
    {w: 8, h: 5, x: 0, y: 0 }
);
addWidget(
    'Sticky',  
    'Widgets', 
    'These are the building block. Each has an editiable title. You can resize and drag and drop them.',
    {w: 8, h: 6, x: 8, y: 4 }
);
addWidget(
    'Sticky', 
    'Sticky', 
    'A type of Widget. Currently the only type available for the prototype. It accepts a text input. Future versions will accept and automatically convert image urls, dates, links, and todo lists.',
    {w: 8, h: 5, x: 0, y: 6 }
);
addWidget(
    'Sticky', 
    'Add Widget', 
    'You may add more widgets using the widgets menu in the bottom right corner.',
    {w: 8, h: 5, x: 0, y: 8 }
);
addWidget(
    'Sticky', 
    'Delete Widgets', 
    'You can remove widgets by activating the trash from the widgets menu and clicking the trash icon within each widget to be removed.',
    {w: 8, h: 5, x: 16, y: 8 }
);