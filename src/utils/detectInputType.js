
export default function detectInputType(data) {
    if (isUrl(data)) {
        if (isImgUrl(data)) {
            return 'Image'
        }
        return 'Link'
    }
    if (data && data.length > 0) {
        return 'Text'
    }
    return undefined
    // TODO after prototype is finished: check first for date, image, link, todo types
}

function isUrl(data) {
    const hasNoSpaces = !data.includes(' ');
    const urlMatch = data.match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/);
    return hasNoSpaces && urlMatch
}

function isImgUrl(data) {
    const urlExt = data.substr(data.lastIndexOf('.')).toLowerCase();
    const validImgExts = ['.apng', '.bmp', '.gif', '.ico', '.jpeg', '.jpg', '.png', '.svg', '.tiff', '.webp'];
    const endsWithImgExt = validImgExts.find(ext => urlExt === ext);
    return endsWithImgExt
}