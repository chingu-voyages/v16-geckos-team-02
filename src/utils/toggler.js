
export default function Toggler(update, active = false) {
    this.isOpen = active;
    this.update = update
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.toggle = this.toggle.bind(this);
}
Toggler.prototype.close = function() {
    setTimeout(() => { 
        if (this.isOpen) { // timeout and latch so runs after toggle
            this.isOpen = false;
            this.update(this.isOpen);
        }
    }, 0);
    window.removeEventListener('click', this.close, {capture : true});
}
Toggler.prototype.open = function() {
    this.isOpen = true;
    window.addEventListener('click', this.close, {capture : true});
    this.update(this.isOpen);
}
Toggler.prototype.toggle = function() {
    this.isOpen ? this.close() : this.open();
}