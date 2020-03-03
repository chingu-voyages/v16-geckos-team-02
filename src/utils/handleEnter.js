export default function handleEnter(event) {
    if (event.key === 'Enter') {
        event.target.blur();
    }
}