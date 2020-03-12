import { writable, get } from 'svelte/store';
import Dexie from 'dexie';
export const dashboards = [];
export let _activeDashIndex = writable(2); 
export const setActiveDashIndex = i => _activeDashIndex.update(() => i);
export const getActiveDash = () => dashboards[get(_activeDashIndex)];
export const getWidget = ref => getActiveDash().widgets.get(ref);

const localDb = new Dexie('dashes');
localDb.version(1).stores({
    dashes: 'ref',
    widgets: 'ref'
});
initData();

let uidCount = 0;
const makeUID = name => name+'-'+Date.now()+'-'+(uidCount++);

const loadDash = (title, ref) => {
    try {
        const dashData = {
            ref,
            _title: writable(title),
            widgets: new Map(),
            _widgetsCount: writable(0)
        };
        dashboards.push(dashData);
        setActiveDashIndex(dashboards.length-1);
        dashData._title.subscribe(title => localDb.dashes.update(ref, {title}));
    } catch (e) {
        console.error(e);
    }
}
export const addDash = (title = '', ref = makeUID('dash')) => {
    return new Promise((resolve, reject) => {
        loadDash(title, ref);
        localDb.dashes.put({
            ref,
            title,
            widgets: []
        }).then(() => resolve, e => reject(e));
    });
}

const loadWidget = (type, title, data, sizeAndPos, dashIndex, ref) => {
    try {
        const widgetData = {
            type,
            sizeAndPos,
            _title: writable(title),
            _data: writable(data)
        }
        dashboards[dashIndex].widgets.set(ref, widgetData);
        dashboards[dashIndex]._widgetsCount.update(n => n + 1);
        widgetData._title.subscribe(title => localDb.widgets.update(ref, {title}));
        widgetData._data.subscribe(data => localDb.widgets.update(ref, {data}));
    } catch (e) {
        console.error(e);
    }
}
export const addWidget = (type, title = '', data = '', sizeAndPos = { [0]: {w: 8, h: 5, x: Infinity, y: 0}}, dashIndex = get(_activeDashIndex), ref = makeUID('widget')) => {
    return new Promise((resolve, reject) => {
        loadWidget(type, title, data, sizeAndPos, dashIndex, ref);
        localDb.dashes.update(dashboards[dashIndex].ref, {widgets: Array.from(dashboards[dashIndex].widgets.keys())})
        localDb.widgets.put({
            ref,
            type,
            sizeAndPos,
            title,
            data
        }).then(w => resolve(), e => reject(e));
    });
}

export const removeDash = index => {
    try {
        localDb.dashes.delete(dashboards[index].ref);
        dashboards.splice(index, 1);
    } catch (e) {
        console.error(e);
    }
}

export const removeWidget = (widgetRef, dashIndex = get(_activeDashIndex)) => {
    try {
        if(dashboards[dashIndex].widgets.delete(widgetRef))
        {
            localDb.widgets.delete(widgetRef);
            dashboards[dashIndex]._widgetsCount.update(n => n - 1);
            localDb.dashes.update(dashboards[dashIndex].ref, {widgets: Array.from(dashboards[dashIndex].widgets.keys())})
        }
    } catch (e) {
        console.error(e);
    }
}

export const setWidgetSizeAndPos = (highestCol, ref, data) => {
    try {
        getActiveDash().widgets.get(ref).sizeAndPos[highestCol] = data;
        localDb.widgets.update(ref, {sizeAndPos: getActiveDash().widgets.get(ref).sizeAndPos})
    } catch (e) {
        console.error(e);
    }
}

export const removeWidgetSizeAndPos = (ref, col) => {
    try {
        delete getActiveDash().widgets.get(ref).sizeAndPos[col];
        localDb.widgets.update(ref, {sizeAndPos: getActiveDash().widgets.get(ref).sizeAndPos})
    } catch (e) {
        console.error(e);
    }
}

async function initData() {
    const nDashes = await localDb.dashes.count();
    if (nDashes > 0) {
        const dashes = await localDb.dashes.toArray()
        dashes.forEach((dash, dashIndex) => {
            loadDash(dash.title, dash.ref);
            dash.widgets.forEach(ref => {
                localDb.widgets.get(ref).then(({type, title, data, sizeAndPos}) => loadWidget(type, title, data, sizeAndPos, dashIndex, ref))
            });
        });
    }
    else {
       loadTemplates();
    } 
}

function deleteAllData() {
    localDb.dashes.clear()
    localDb.widgets.clear();
}
// deleteAllData()

function loadTemplates() {
    addDash('one');
    addDash('two');
    addDash('three');
    addDash('four');
    addDash('five');
    addWidget(
        'Sticky', 
        'Welcome', 
        'This is currently only a prototype. The concept is a personal dash space for organising activities. At the moment functionality is limited.',
        {24: {w: 8, h: 5, x: 0, y: 0}, 23: {w: 8, h: 5, x: 5, y: 0}, 12: {w: 12, h: 4, x: 0, y: 0}}
    );
    addWidget(
        'Sticky',  
        'Widgets', 
        'These are the building block. Each has an editiable title. You can resize and drag and drop them.',
        {24: {w: 8, h: 5, x: 8, y: 4}, 23: {w: 6, h: 6, x: 6, y: 5}, 12: {w: 10, h: 4, x: 1, y: 4}}
    );
    addWidget(
        'Sticky', 
        'Sticky', 
        'A type of Widget. Currently the only type available for the prototype. It accepts a text input. Future versions will accept and automatically convert image urls, dates, links, and todo lists.',
        {24: {w: 8, h: 5, x: 0, y: 6}, 23: {w: 8, h: 5, x: 5, y: 12}, 12: {w: 12, h: 5, x: 0, y: 13}}
    );
    addWidget(
        'Sticky', 
        'Add Widget', 
        'You may add more widgets using the widgets menu in the bottom right corner.',
        {24: {w: 8, h: 5, x: 0, y: 8}, 23: {w: 6, h: 6, x: 0, y: 6}, 12: {w: 6, h: 5, x: 0, y: 8}, 11: {w: 11, h: 5, x: 0, y: 8}}
    );
    addWidget(
        'Sticky', 
        'Delete Widgets', 
        'You can remove widgets by activating the trash from the widgets menu and clicking the trash icon within each widget to be removed.',
        {24: {w: 8, h: 5, x: 16, y: 8}, 23: {w: 6, h: 6, x: 12, y: 6}, 12: {w: 6, h: 5, x: 6, y: 8}, 11: {w: 11, h: 5, x: 0, y: 8}}
    ); 
}