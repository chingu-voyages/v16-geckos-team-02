import marked from 'marked';
import createDOMPurify from 'dompurify';
const DOMPurify = createDOMPurify(window);

export default function(input) {
    return marked(DOMPurify.sanitize(input))
}