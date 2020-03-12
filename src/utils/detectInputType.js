
export default function detectInputType(data) {
    if (data && data.length > 0) {
        return 'Text';
    }
    else {
        return undefined
    }
    // TODO after prototype is finished: check first for date, image, link, todo types
}