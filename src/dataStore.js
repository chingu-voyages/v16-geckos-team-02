export const dashboards = {
    0: { 
        title: 'test dash', 
        widgets: {
            0: {
                type: 'Sticky', 
                title: 'Test Sticky'
            }
        }
    }
}; // TODO make as map, containing Symbol[dashId]: { title: string, widgets: Map }
export const activeDashId = 0; // TODO make as Symbol[dashId]
export const getActiveDash = () => dashboards[activeDashId];
export const getWidget = ref => getActiveDash().widgets[ref];