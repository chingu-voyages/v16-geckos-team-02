
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /*
     * Dexie.js - a minimalistic wrapper for IndexedDB
     * ===============================================
     *
     * By David Fahlander, david.fahlander@gmail.com
     *
     * Version {version}, {date}
     *
     * http://dexie.org
     *
     * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
     */
     
    var keys = Object.keys;
    var isArray = Array.isArray;
    var _global = typeof self !== 'undefined' ? self :
        typeof window !== 'undefined' ? window :
            global;
    function extend(obj, extension) {
        if (typeof extension !== 'object')
            return obj;
        keys(extension).forEach(function (key) {
            obj[key] = extension[key];
        });
        return obj;
    }
    var getProto = Object.getPrototypeOf;
    var _hasOwn = {}.hasOwnProperty;
    function hasOwn(obj, prop) {
        return _hasOwn.call(obj, prop);
    }
    function props(proto, extension) {
        if (typeof extension === 'function')
            extension = extension(getProto(proto));
        keys(extension).forEach(function (key) {
            setProp(proto, key, extension[key]);
        });
    }
    var defineProperty = Object.defineProperty;
    function setProp(obj, prop, functionOrGetSet, options) {
        defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ?
            { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } :
            { value: functionOrGetSet, configurable: true, writable: true }, options));
    }
    function derive(Child) {
        return {
            from: function (Parent) {
                Child.prototype = Object.create(Parent.prototype);
                setProp(Child.prototype, "constructor", Child);
                return {
                    extend: props.bind(null, Child.prototype)
                };
            }
        };
    }
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    function getPropertyDescriptor(obj, prop) {
        var pd = getOwnPropertyDescriptor(obj, prop), proto;
        return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
    }
    var _slice = [].slice;
    function slice(args, start, end) {
        return _slice.call(args, start, end);
    }
    function override(origFunc, overridedFactory) {
        return overridedFactory(origFunc);
    }
    function assert(b) {
        if (!b)
            throw new Error("Assertion Failed");
    }
    function asap(fn) {
        if (_global.setImmediate)
            setImmediate(fn);
        else
            setTimeout(fn, 0);
    }

    /** Generate an object (hash map) based on given array.
     * @param extractor Function taking an array item and its index and returning an array of 2 items ([key, value]) to
     *        instert on the resulting object for each item in the array. If this function returns a falsy value, the
     *        current item wont affect the resulting object.
     */
    function arrayToObject(array, extractor) {
        return array.reduce(function (result, item, i) {
            var nameAndValue = extractor(item, i);
            if (nameAndValue)
                result[nameAndValue[0]] = nameAndValue[1];
            return result;
        }, {});
    }
    function trycatcher(fn, reject) {
        return function () {
            try {
                fn.apply(this, arguments);
            }
            catch (e) {
                reject(e);
            }
        };
    }
    function tryCatch(fn, onerror, args) {
        try {
            fn.apply(null, args);
        }
        catch (ex) {
            onerror && onerror(ex);
        }
    }
    function getByKeyPath(obj, keyPath) {
        // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
        if (hasOwn(obj, keyPath))
            return obj[keyPath]; // This line is moved from last to first for optimization purpose.
        if (!keyPath)
            return obj;
        if (typeof keyPath !== 'string') {
            var rv = [];
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                var val = getByKeyPath(obj, keyPath[i]);
                rv.push(val);
            }
            return rv;
        }
        var period = keyPath.indexOf('.');
        if (period !== -1) {
            var innerObj = obj[keyPath.substr(0, period)];
            return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
        }
        return undefined;
    }
    function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === undefined)
            return;
        if ('isFrozen' in Object && Object.isFrozen(obj))
            return;
        if (typeof keyPath !== 'string' && 'length' in keyPath) {
            assert(typeof value !== 'string' && 'length' in value);
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                setByKeyPath(obj, keyPath[i], value[i]);
            }
        }
        else {
            var period = keyPath.indexOf('.');
            if (period !== -1) {
                var currentKeyPath = keyPath.substr(0, period);
                var remainingKeyPath = keyPath.substr(period + 1);
                if (remainingKeyPath === "")
                    if (value === undefined)
                        delete obj[currentKeyPath];
                    else
                        obj[currentKeyPath] = value;
                else {
                    var innerObj = obj[currentKeyPath];
                    if (!innerObj)
                        innerObj = (obj[currentKeyPath] = {});
                    setByKeyPath(innerObj, remainingKeyPath, value);
                }
            }
            else {
                if (value === undefined)
                    delete obj[keyPath];
                else
                    obj[keyPath] = value;
            }
        }
    }
    function delByKeyPath(obj, keyPath) {
        if (typeof keyPath === 'string')
            setByKeyPath(obj, keyPath, undefined);
        else if ('length' in keyPath)
            [].map.call(keyPath, function (kp) {
                setByKeyPath(obj, kp, undefined);
            });
    }
    function shallowClone(obj) {
        var rv = {};
        for (var m in obj) {
            if (hasOwn(obj, m))
                rv[m] = obj[m];
        }
        return rv;
    }
    var concat = [].concat;
    function flatten(a) {
        return concat.apply([], a);
    }
    //https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
    var intrinsicTypes = "Boolean,String,Date,RegExp,Blob,File,FileList,ArrayBuffer,DataView,Uint8ClampedArray,ImageData,Map,Set"
        .split(',').concat(flatten([8, 16, 32, 64].map(function (num) { return ["Int", "Uint", "Float"].map(function (t) { return t + num + "Array"; }); }))).filter(function (t) { return _global[t]; }).map(function (t) { return _global[t]; });
    function deepClone(any) {
        if (!any || typeof any !== 'object')
            return any;
        var rv;
        if (isArray(any)) {
            rv = [];
            for (var i = 0, l = any.length; i < l; ++i) {
                rv.push(deepClone(any[i]));
            }
        }
        else if (intrinsicTypes.indexOf(any.constructor) >= 0) {
            rv = any;
        }
        else {
            rv = any.constructor ? Object.create(any.constructor.prototype) : {};
            for (var prop in any) {
                if (hasOwn(any, prop)) {
                    rv[prop] = deepClone(any[prop]);
                }
            }
        }
        return rv;
    }
    function getObjectDiff(a, b, rv, prfx) {
        // Compares objects a and b and produces a diff object.
        rv = rv || {};
        prfx = prfx || '';
        keys(a).forEach(function (prop) {
            if (!hasOwn(b, prop))
                rv[prfx + prop] = undefined; // Property removed
            else {
                var ap = a[prop], bp = b[prop];
                if (typeof ap === 'object' && typeof bp === 'object' &&
                    ap && bp &&
                    // Now compare constructors are same (not equal because wont work in Safari)
                    ('' + ap.constructor) === ('' + bp.constructor))
                    // Same type of object but its properties may have changed
                    getObjectDiff(ap, bp, rv, prfx + prop + ".");
                else if (ap !== bp)
                    rv[prfx + prop] = b[prop]; // Primitive value changed
            }
        });
        keys(b).forEach(function (prop) {
            if (!hasOwn(a, prop)) {
                rv[prfx + prop] = b[prop]; // Property added
            }
        });
        return rv;
    }
    // If first argument is iterable or array-like, return it as an array
    var iteratorSymbol = typeof Symbol !== 'undefined' && Symbol.iterator;
    var getIteratorOf = iteratorSymbol ? function (x) {
        var i;
        return x != null && (i = x[iteratorSymbol]) && i.apply(x);
    } : function () { return null; };
    var NO_CHAR_ARRAY = {};
    // Takes one or several arguments and returns an array based on the following criteras:
    // * If several arguments provided, return arguments converted to an array in a way that
    //   still allows javascript engine to optimize the code.
    // * If single argument is an array, return a clone of it.
    // * If this-pointer equals NO_CHAR_ARRAY, don't accept strings as valid iterables as a special
    //   case to the two bullets below.
    // * If single argument is an iterable, convert it to an array and return the resulting array.
    // * If single argument is array-like (has length of type number), convert it to an array.
    function getArrayOf(arrayLike) {
        var i, a, x, it;
        if (arguments.length === 1) {
            if (isArray(arrayLike))
                return arrayLike.slice();
            if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string')
                return [arrayLike];
            if ((it = getIteratorOf(arrayLike))) {
                a = [];
                while ((x = it.next()), !x.done)
                    a.push(x.value);
                return a;
            }
            if (arrayLike == null)
                return [arrayLike];
            i = arrayLike.length;
            if (typeof i === 'number') {
                a = new Array(i);
                while (i--)
                    a[i] = arrayLike[i];
                return a;
            }
            return [arrayLike];
        }
        i = arguments.length;
        a = new Array(i);
        while (i--)
            a[i] = arguments[i];
        return a;
    }

    // By default, debug will be true only if platform is a web platform and its page is served from localhost.
    // When debug = true, error's stacks will contain asyncronic long stacks.
    var debug = typeof location !== 'undefined' &&
        // By default, use debug mode if served from localhost.
        /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
    function setDebug(value, filter) {
        debug = value;
        libraryFilter = filter;
    }
    var libraryFilter = function () { return true; };
    var NEEDS_THROW_FOR_STACK = !new Error("").stack;
    function getErrorWithStack() {
        if (NEEDS_THROW_FOR_STACK)
            try {
                // Doing something naughty in strict mode here to trigger a specific error
                // that can be explicitely ignored in debugger's exception settings.
                // If we'd just throw new Error() here, IE's debugger's exception settings
                // will just consider it as "exception thrown by javascript code" which is
                // something you wouldn't want it to ignore.
                getErrorWithStack.arguments;
                throw new Error(); // Fallback if above line don't throw.
            }
            catch (e) {
                return e;
            }
        return new Error();
    }
    function prettyStack(exception, numIgnoredFrames) {
        var stack = exception.stack;
        if (!stack)
            return "";
        numIgnoredFrames = (numIgnoredFrames || 0);
        if (stack.indexOf(exception.name) === 0)
            numIgnoredFrames += (exception.name + exception.message).split('\n').length;
        return stack.split('\n')
            .slice(numIgnoredFrames)
            .filter(libraryFilter)
            .map(function (frame) { return "\n" + frame; })
            .join('');
    }
    function deprecated(what, fn) {
        return function () {
            console.warn(what + " is deprecated. See https://github.com/dfahlander/Dexie.js/wiki/Deprecations. " + prettyStack(getErrorWithStack(), 1));
            return fn.apply(this, arguments);
        };
    }

    var dexieErrorNames = [
        'Modify',
        'Bulk',
        'OpenFailed',
        'VersionChange',
        'Schema',
        'Upgrade',
        'InvalidTable',
        'MissingAPI',
        'NoSuchDatabase',
        'InvalidArgument',
        'SubTransaction',
        'Unsupported',
        'Internal',
        'DatabaseClosed',
        'PrematureCommit',
        'ForeignAwait'
    ];
    var idbDomErrorNames = [
        'Unknown',
        'Constraint',
        'Data',
        'TransactionInactive',
        'ReadOnly',
        'Version',
        'NotFound',
        'InvalidState',
        'InvalidAccess',
        'Abort',
        'Timeout',
        'QuotaExceeded',
        'Syntax',
        'DataClone'
    ];
    var errorList = dexieErrorNames.concat(idbDomErrorNames);
    var defaultTexts = {
        VersionChanged: "Database version changed by other database connection",
        DatabaseClosed: "Database has been closed",
        Abort: "Transaction aborted",
        TransactionInactive: "Transaction has already completed or failed"
    };
    //
    // DexieError - base class of all out exceptions.
    //
    function DexieError(name, msg) {
        // Reason we don't use ES6 classes is because:
        // 1. It bloats transpiled code and increases size of minified code.
        // 2. It doesn't give us much in this case.
        // 3. It would require sub classes to call super(), which
        //    is not needed when deriving from Error.
        this._e = getErrorWithStack();
        this.name = name;
        this.message = msg;
    }
    derive(DexieError).from(Error).extend({
        stack: {
            get: function () {
                return this._stack ||
                    (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
            }
        },
        toString: function () { return this.name + ": " + this.message; }
    });
    function getMultiErrorMessage(msg, failures) {
        return msg + ". Errors: " + failures
            .map(function (f) { return f.toString(); })
            .filter(function (v, i, s) { return s.indexOf(v) === i; }) // Only unique error strings
            .join('\n');
    }
    //
    // ModifyError - thrown in Collection.modify()
    // Specific constructor because it contains members failures and failedKeys.
    //
    function ModifyError(msg, failures, successCount, failedKeys) {
        this._e = getErrorWithStack();
        this.failures = failures;
        this.failedKeys = failedKeys;
        this.successCount = successCount;
    }
    derive(ModifyError).from(DexieError);
    function BulkError(msg, failures) {
        this._e = getErrorWithStack();
        this.name = "BulkError";
        this.failures = failures;
        this.message = getMultiErrorMessage(msg, failures);
    }
    derive(BulkError).from(DexieError);
    //
    //
    // Dynamically generate error names and exception classes based
    // on the names in errorList.
    //
    //
    // Map of {ErrorName -> ErrorName + "Error"}
    var errnames = errorList.reduce(function (obj, name) { return (obj[name] = name + "Error", obj); }, {});
    // Need an alias for DexieError because we're gonna create subclasses with the same name.
    var BaseException = DexieError;
    // Map of {ErrorName -> exception constructor}
    var exceptions = errorList.reduce(function (obj, name) {
        // Let the name be "DexieError" because this name may
        // be shown in call stack and when debugging. DexieError is
        // the most true name because it derives from DexieError,
        // and we cannot change Function.name programatically without
        // dynamically create a Function object, which would be considered
        // 'eval-evil'.
        var fullName = name + "Error";
        function DexieError(msgOrInner, inner) {
            this._e = getErrorWithStack();
            this.name = fullName;
            if (!msgOrInner) {
                this.message = defaultTexts[name] || fullName;
                this.inner = null;
            }
            else if (typeof msgOrInner === 'string') {
                this.message = msgOrInner;
                this.inner = inner || null;
            }
            else if (typeof msgOrInner === 'object') {
                this.message = msgOrInner.name + " " + msgOrInner.message;
                this.inner = msgOrInner;
            }
        }
        derive(DexieError).from(BaseException);
        obj[name] = DexieError;
        return obj;
    }, {});
    // Use ECMASCRIPT standard exceptions where applicable:
    exceptions.Syntax = SyntaxError;
    exceptions.Type = TypeError;
    exceptions.Range = RangeError;
    var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
        obj[name + "Error"] = exceptions[name];
        return obj;
    }, {});
    function mapError(domError, message) {
        if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
            return domError;
        var rv = new exceptionMap[domError.name](message || domError.message, domError);
        if ("stack" in domError) {
            // Derive stack from inner exception if it has a stack
            setProp(rv, "stack", { get: function () {
                    return this.inner.stack;
                } });
        }
        return rv;
    }
    var fullNameExceptions = errorList.reduce(function (obj, name) {
        if (["Syntax", "Type", "Range"].indexOf(name) === -1)
            obj[name + "Error"] = exceptions[name];
        return obj;
    }, {});
    fullNameExceptions.ModifyError = ModifyError;
    fullNameExceptions.DexieError = DexieError;
    fullNameExceptions.BulkError = BulkError;

    function nop() { }
    function mirror(val) { return val; }
    function pureFunctionChain(f1, f2) {
        // Enables chained events that takes ONE argument and returns it to the next function in chain.
        // This pattern is used in the hook("reading") event.
        if (f1 == null || f1 === mirror)
            return f2;
        return function (val) {
            return f2(f1(val));
        };
    }
    function callBoth(on1, on2) {
        return function () {
            on1.apply(this, arguments);
            on2.apply(this, arguments);
        };
    }
    function hookCreatingChain(f1, f2) {
        // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
        // This pattern is used in the hook("creating") event.
        if (f1 === nop)
            return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res !== undefined)
                arguments[0] = res;
            var onsuccess = this.onsuccess, // In case event listener has set this.onsuccess
            onerror = this.onerror; // In case event listener has set this.onerror
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res2 !== undefined ? res2 : res;
        };
    }
    function hookDeletingChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            f1.apply(this, arguments);
            var onsuccess = this.onsuccess, // In case event listener has set this.onsuccess
            onerror = this.onerror; // In case event listener has set this.onerror
            this.onsuccess = this.onerror = null;
            f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        };
    }
    function hookUpdatingChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function (modifications) {
            var res = f1.apply(this, arguments);
            extend(modifications, res); // If f1 returns new modifications, extend caller's modifications with the result before calling next in chain.
            var onsuccess = this.onsuccess, // In case event listener has set this.onsuccess
            onerror = this.onerror; // In case event listener has set this.onerror
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res === undefined ?
                (res2 === undefined ? undefined : res2) :
                (extend(res, res2));
        };
    }
    function reverseStoppableEventChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            if (f2.apply(this, arguments) === false)
                return false;
            return f1.apply(this, arguments);
        };
    }

    function promisableChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res && typeof res.then === 'function') {
                var thiz = this, i = arguments.length, args = new Array(i);
                while (i--)
                    args[i] = arguments[i];
                return res.then(function () {
                    return f2.apply(thiz, args);
                });
            }
            return f2.apply(this, arguments);
        };
    }

    /*
     * Copyright (c) 2014-2017 David Fahlander
     * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/LICENSE-2.0
     */
    //
    // Promise and Zone (PSD) for Dexie library
    //
    // I started out writing this Promise class by copying promise-light (https://github.com/taylorhakes/promise-light) by
    // https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
    //
    // In previous versions this was fixed by not calling setTimeout when knowing that the resolve() or reject() came from another
    // tick. In Dexie v1.4.0, I've rewritten the Promise class entirely. Just some fragments of promise-light is left. I use
    // another strategy now that simplifies everything a lot: to always execute callbacks in a new micro-task, but have an own micro-task
    // engine that is indexedDB compliant across all browsers.
    // Promise class has also been optimized a lot with inspiration from bluebird - to avoid closures as much as possible.
    // Also with inspiration from bluebird, asyncronic stacks in debug mode.
    //
    // Specific non-standard features of this Promise class:
    // * Custom zone support (a.k.a. PSD) with ability to keep zones also when using native promises as well as
    //   native async / await.
    // * Promise.follow() method built upon the custom zone engine, that allows user to track all promises created from current stack frame
    //   and below + all promises that those promises creates or awaits.
    // * Detect any unhandled promise in a PSD-scope (PSD.onunhandled). 
    //
    // David Fahlander, https://github.com/dfahlander
    //
    // Just a pointer that only this module knows about.
    // Used in Promise constructor to emulate a private constructor.
    var INTERNAL = {};
    // Async stacks (long stacks) must not grow infinitely.
    var LONG_STACKS_CLIP_LIMIT = 100;
    var MAX_LONG_STACKS = 20;
    var ZONE_ECHO_LIMIT = 7;
    var nativePromiseInstanceAndProto = (function () {
        try {
            // Be able to patch native async functions
            return new Function("let F=async ()=>{},p=F();return [p,Object.getPrototypeOf(p),Promise.resolve(),F.constructor];")();
        }
        catch (e) {
            var P = _global.Promise;
            return P ?
                [P.resolve(), P.prototype, P.resolve()] :
                [];
        }
    })();
    var resolvedNativePromise = nativePromiseInstanceAndProto[0];
    var nativePromiseProto = nativePromiseInstanceAndProto[1];
    var resolvedGlobalPromise = nativePromiseInstanceAndProto[2];
    var nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
    var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
    var AsyncFunction = nativePromiseInstanceAndProto[3];
    var patchGlobalPromise = !!resolvedGlobalPromise;
    var stack_being_generated = false;
    /* The default function used only for the very first promise in a promise chain.
       As soon as then promise is resolved or rejected, all next tasks will be executed in micro ticks
       emulated in this module. For indexedDB compatibility, this means that every method needs to
       execute at least one promise before doing an indexedDB operation. Dexie will always call
       db.ready().then() for every operation to make sure the indexedDB event is started in an
       indexedDB-compatible emulated micro task loop.
    */
    var schedulePhysicalTick = resolvedGlobalPromise ?
        function () { resolvedGlobalPromise.then(physicalTick); }
        :
            _global.setImmediate ?
                // setImmediate supported. Those modern platforms also supports Function.bind().
                setImmediate.bind(null, physicalTick) :
                _global.MutationObserver ?
                    // MutationObserver supported
                    function () {
                        var hiddenDiv = document.createElement("div");
                        (new MutationObserver(function () {
                            physicalTick();
                            hiddenDiv = null;
                        })).observe(hiddenDiv, { attributes: true });
                        hiddenDiv.setAttribute('i', '1');
                    } :
                    // No support for setImmediate or MutationObserver. No worry, setTimeout is only called
                    // once time. Every tick that follows will be our emulated micro tick.
                    // Could have uses setTimeout.bind(null, 0, physicalTick) if it wasnt for that FF13 and below has a bug 
                    function () { setTimeout(physicalTick, 0); };
    // Configurable through Promise.scheduler.
    // Don't export because it would be unsafe to let unknown
    // code call it unless they do try..catch within their callback.
    // This function can be retrieved through getter of Promise.scheduler though,
    // but users must not do Promise.scheduler = myFuncThatThrowsException
    var asap$1 = function (callback, args) {
        microtickQueue.push([callback, args]);
        if (needsNewPhysicalTick) {
            schedulePhysicalTick();
            needsNewPhysicalTick = false;
        }
    };
    var isOutsideMicroTick = true;
    var needsNewPhysicalTick = true;
    var unhandledErrors = [];
    var rejectingErrors = [];
    var currentFulfiller = null;
    var rejectionMapper = mirror; // Remove in next major when removing error mapping of DOMErrors and DOMExceptions
    var globalPSD = {
        id: 'global',
        global: true,
        ref: 0,
        unhandleds: [],
        onunhandled: globalError,
        pgp: false,
        env: {},
        finalize: function () {
            this.unhandleds.forEach(function (uh) {
                try {
                    globalError(uh[0], uh[1]);
                }
                catch (e) { }
            });
        }
    };
    var PSD = globalPSD;
    var microtickQueue = []; // Callbacks to call in this or next physical tick.
    var numScheduledCalls = 0; // Number of listener-calls left to do in this physical tick.
    var tickFinalizers = []; // Finalizers to call when there are no more async calls scheduled within current physical tick.
    function Promise$1(fn) {
        if (typeof this !== 'object')
            throw new TypeError('Promises must be constructed via new');
        this._listeners = [];
        this.onuncatched = nop; // Deprecate in next major. Not needed. Better to use global error handler.
        // A library may set `promise._lib = true;` after promise is created to make resolve() or reject()
        // execute the microtask engine implicitely within the call to resolve() or reject().
        // To remain A+ compliant, a library must only set `_lib=true` if it can guarantee that the stack
        // only contains library code when calling resolve() or reject().
        // RULE OF THUMB: ONLY set _lib = true for promises explicitely resolving/rejecting directly from
        // global scope (event handler, timer etc)!
        this._lib = false;
        // Current async scope
        var psd = (this._PSD = PSD);
        if (debug) {
            this._stackHolder = getErrorWithStack();
            this._prev = null;
            this._numPrev = 0; // Number of previous promises (for long stacks)
        }
        if (typeof fn !== 'function') {
            if (fn !== INTERNAL)
                throw new TypeError('Not a function');
            // Private constructor (INTERNAL, state, value).
            // Used internally by Promise.resolve() and Promise.reject().
            this._state = arguments[1];
            this._value = arguments[2];
            if (this._state === false)
                handleRejection(this, this._value); // Map error, set stack and addPossiblyUnhandledError().
            return;
        }
        this._state = null; // null (=pending), false (=rejected) or true (=resolved)
        this._value = null; // error or result
        ++psd.ref; // Refcounting current scope
        executePromiseTask(this, fn);
    }
    // Prepare a property descriptor to put onto Promise.prototype.then
    var thenProp = {
        get: function () {
            var psd = PSD, microTaskId = totalEchoes;
            function then(onFulfilled, onRejected) {
                var _this = this;
                var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
                if (possibleAwait)
                    decrementExpectedAwaits();
                var rv = new Promise$1(function (resolve, reject) {
                    propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait), resolve, reject, psd));
                });
                debug && linkToPreviousPromise(rv, this);
                return rv;
            }
            then.prototype = INTERNAL; // For idempotense, see setter below.
            return then;
        },
        // Be idempotent and allow another framework (such as zone.js or another instance of a Dexie.Promise module) to replace Promise.prototype.then
        // and when that framework wants to restore the original property, we must identify that and restore the original property descriptor.
        set: function (value) {
            setProp(this, 'then', value && value.prototype === INTERNAL ?
                thenProp : // Restore to original property descriptor.
                {
                    get: function () {
                        return value; // Getter returning provided value (behaves like value is just changed)
                    },
                    set: thenProp.set // Keep a setter that is prepared to restore original.
                });
        }
    };
    props(Promise$1.prototype, {
        then: thenProp,
        _then: function (onFulfilled, onRejected) {
            // A little tinier version of then() that don't have to create a resulting promise.
            propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
        },
        catch: function (onRejected) {
            if (arguments.length === 1)
                return this.then(null, onRejected);
            // First argument is the Error type to catch
            var type = arguments[0], handler = arguments[1];
            return typeof type === 'function' ? this.then(null, function (err) {
                // Catching errors by its constructor type (similar to java / c++ / c#)
                // Sample: promise.catch(TypeError, function (e) { ... });
                return err instanceof type ? handler(err) : PromiseReject(err);
            })
                : this.then(null, function (err) {
                    // Catching errors by the error.name property. Makes sense for indexedDB where error type
                    // is always DOMError but where e.name tells the actual error type.
                    // Sample: promise.catch('ConstraintError', function (e) { ... });
                    return err && err.name === type ? handler(err) : PromiseReject(err);
                });
        },
        finally: function (onFinally) {
            return this.then(function (value) {
                onFinally();
                return value;
            }, function (err) {
                onFinally();
                return PromiseReject(err);
            });
        },
        stack: {
            get: function () {
                if (this._stack)
                    return this._stack;
                try {
                    stack_being_generated = true;
                    var stacks = getStack(this, [], MAX_LONG_STACKS);
                    var stack = stacks.join("\nFrom previous: ");
                    if (this._state !== null)
                        this._stack = stack; // Stack may be updated on reject.
                    return stack;
                }
                finally {
                    stack_being_generated = false;
                }
            }
        },
        timeout: function (ms, msg) {
            var _this = this;
            return ms < Infinity ?
                new Promise$1(function (resolve, reject) {
                    var handle = setTimeout(function () { return reject(new exceptions.Timeout(msg)); }, ms);
                    _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
                }) : this;
        }
    });
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
        setProp(Promise$1.prototype, Symbol.toStringTag, 'Promise');
    // Now that Promise.prototype is defined, we have all it takes to set globalPSD.env.
    // Environment globals snapshotted on leaving global zone
    globalPSD.env = snapShot();
    function Listener(onFulfilled, onRejected, resolve, reject, zone) {
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
        this.psd = zone;
    }
    // Promise Static Properties
    props(Promise$1, {
        all: function () {
            var values = getArrayOf.apply(null, arguments) // Supports iterables, implicit arguments and array-like.
                .map(onPossibleParallellAsync); // Handle parallell async/awaits 
            return new Promise$1(function (resolve, reject) {
                if (values.length === 0)
                    resolve([]);
                var remaining = values.length;
                values.forEach(function (a, i) { return Promise$1.resolve(a).then(function (x) {
                    values[i] = x;
                    if (!--remaining)
                        resolve(values);
                }, reject); });
            });
        },
        resolve: function (value) {
            if (value instanceof Promise$1)
                return value;
            if (value && typeof value.then === 'function')
                return new Promise$1(function (resolve, reject) {
                    value.then(resolve, reject);
                });
            var rv = new Promise$1(INTERNAL, true, value);
            linkToPreviousPromise(rv, currentFulfiller);
            return rv;
        },
        reject: PromiseReject,
        race: function () {
            var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new Promise$1(function (resolve, reject) {
                values.map(function (value) { return Promise$1.resolve(value).then(resolve, reject); });
            });
        },
        PSD: {
            get: function () { return PSD; },
            set: function (value) { return PSD = value; }
        },
        //totalEchoes: {get: ()=>totalEchoes},
        //task: {get: ()=>task},
        newPSD: newScope,
        usePSD: usePSD,
        scheduler: {
            get: function () { return asap$1; },
            set: function (value) { asap$1 = value; }
        },
        rejectionMapper: {
            get: function () { return rejectionMapper; },
            set: function (value) { rejectionMapper = value; } // Map reject failures
        },
        follow: function (fn, zoneProps) {
            return new Promise$1(function (resolve, reject) {
                return newScope(function (resolve, reject) {
                    var psd = PSD;
                    psd.unhandleds = []; // For unhandled standard- or 3rd party Promises. Checked at psd.finalize()
                    psd.onunhandled = reject; // Triggered directly on unhandled promises of this library.
                    psd.finalize = callBoth(function () {
                        var _this = this;
                        // Unhandled standard or 3rd part promises are put in PSD.unhandleds and
                        // examined upon scope completion while unhandled rejections in this Promise
                        // will trigger directly through psd.onunhandled
                        run_at_end_of_this_or_next_physical_tick(function () {
                            _this.unhandleds.length === 0 ? resolve() : reject(_this.unhandleds[0]);
                        });
                    }, psd.finalize);
                    fn();
                }, zoneProps, resolve, reject);
            });
        }
    });
    /**
    * Take a potentially misbehaving resolver function and make sure
    * onFulfilled and onRejected are only called once.
    *
    * Makes no guarantees about asynchrony.
    */
    function executePromiseTask(promise, fn) {
        // Promise Resolution Procedure:
        // https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        try {
            fn(function (value) {
                if (promise._state !== null)
                    return; // Already settled
                if (value === promise)
                    throw new TypeError('A promise cannot be resolved with itself.');
                var shouldExecuteTick = promise._lib && beginMicroTickScope();
                if (value && typeof value.then === 'function') {
                    executePromiseTask(promise, function (resolve, reject) {
                        value instanceof Promise$1 ?
                            value._then(resolve, reject) :
                            value.then(resolve, reject);
                    });
                }
                else {
                    promise._state = true;
                    promise._value = value;
                    propagateAllListeners(promise);
                }
                if (shouldExecuteTick)
                    endMicroTickScope();
            }, handleRejection.bind(null, promise)); // If Function.bind is not supported. Exception is handled in catch below
        }
        catch (ex) {
            handleRejection(promise, ex);
        }
    }
    function handleRejection(promise, reason) {
        rejectingErrors.push(reason);
        if (promise._state !== null)
            return;
        var shouldExecuteTick = promise._lib && beginMicroTickScope();
        reason = rejectionMapper(reason);
        promise._state = false;
        promise._value = reason;
        debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(function () {
            var origProp = getPropertyDescriptor(reason, "stack");
            reason._promise = promise;
            setProp(reason, "stack", {
                get: function () {
                    return stack_being_generated ?
                        origProp && (origProp.get ?
                            origProp.get.apply(reason) :
                            origProp.value) :
                        promise.stack;
                }
            });
        });
        // Add the failure to a list of possibly uncaught errors
        addPossiblyUnhandledError(promise);
        propagateAllListeners(promise);
        if (shouldExecuteTick)
            endMicroTickScope();
    }
    function propagateAllListeners(promise) {
        //debug && linkToPreviousPromise(promise);
        var listeners = promise._listeners;
        promise._listeners = [];
        for (var i = 0, len = listeners.length; i < len; ++i) {
            propagateToListener(promise, listeners[i]);
        }
        var psd = promise._PSD;
        --psd.ref || psd.finalize(); // if psd.ref reaches zero, call psd.finalize();
        if (numScheduledCalls === 0) {
            // If numScheduledCalls is 0, it means that our stack is not in a callback of a scheduled call,
            // and that no deferreds where listening to this rejection or success.
            // Since there is a risk that our stack can contain application code that may
            // do stuff after this code is finished that may generate new calls, we cannot
            // call finalizers here.
            ++numScheduledCalls;
            asap$1(function () {
                if (--numScheduledCalls === 0)
                    finalizePhysicalTick(); // Will detect unhandled errors
            }, []);
        }
    }
    function propagateToListener(promise, listener) {
        if (promise._state === null) {
            promise._listeners.push(listener);
            return;
        }
        var cb = promise._state ? listener.onFulfilled : listener.onRejected;
        if (cb === null) {
            // This Listener doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
            return (promise._state ? listener.resolve : listener.reject)(promise._value);
        }
        ++listener.psd.ref;
        ++numScheduledCalls;
        asap$1(callListener, [cb, promise, listener]);
    }
    function callListener(cb, promise, listener) {
        try {
            // Set static variable currentFulfiller to the promise that is being fullfilled,
            // so that we connect the chain of promises (for long stacks support)
            currentFulfiller = promise;
            // Call callback and resolve our listener with it's return value.
            var ret, value = promise._value;
            if (promise._state) {
                // cb is onResolved
                ret = cb(value);
            }
            else {
                // cb is onRejected
                if (rejectingErrors.length)
                    rejectingErrors = [];
                ret = cb(value);
                if (rejectingErrors.indexOf(value) === -1)
                    markErrorAsHandled(promise); // Callback didnt do Promise.reject(err) nor reject(err) onto another promise.
            }
            listener.resolve(ret);
        }
        catch (e) {
            // Exception thrown in callback. Reject our listener.
            listener.reject(e);
        }
        finally {
            // Restore env and currentFulfiller.
            currentFulfiller = null;
            if (--numScheduledCalls === 0)
                finalizePhysicalTick();
            --listener.psd.ref || listener.psd.finalize();
        }
    }
    function getStack(promise, stacks, limit) {
        if (stacks.length === limit)
            return stacks;
        var stack = "";
        if (promise._state === false) {
            var failure = promise._value, errorName, message;
            if (failure != null) {
                errorName = failure.name || "Error";
                message = failure.message || failure;
                stack = prettyStack(failure, 0);
            }
            else {
                errorName = failure; // If error is undefined or null, show that.
                message = "";
            }
            stacks.push(errorName + (message ? ": " + message : "") + stack);
        }
        if (debug) {
            stack = prettyStack(promise._stackHolder, 2);
            if (stack && stacks.indexOf(stack) === -1)
                stacks.push(stack);
            if (promise._prev)
                getStack(promise._prev, stacks, limit);
        }
        return stacks;
    }
    function linkToPreviousPromise(promise, prev) {
        // Support long stacks by linking to previous completed promise.
        var numPrev = prev ? prev._numPrev + 1 : 0;
        if (numPrev < LONG_STACKS_CLIP_LIMIT) {
            promise._prev = prev;
            promise._numPrev = numPrev;
        }
    }
    /* The callback to schedule with setImmediate() or setTimeout().
       It runs a virtual microtick and executes any callback registered in microtickQueue.
     */
    function physicalTick() {
        beginMicroTickScope() && endMicroTickScope();
    }
    function beginMicroTickScope() {
        var wasRootExec = isOutsideMicroTick;
        isOutsideMicroTick = false;
        needsNewPhysicalTick = false;
        return wasRootExec;
    }
    /* Executes micro-ticks without doing try..catch.
       This can be possible because we only use this internally and
       the registered functions are exception-safe (they do try..catch
       internally before calling any external method). If registering
       functions in the microtickQueue that are not exception-safe, this
       would destroy the framework and make it instable. So we don't export
       our asap method.
    */
    function endMicroTickScope() {
        var callbacks, i, l;
        do {
            while (microtickQueue.length > 0) {
                callbacks = microtickQueue;
                microtickQueue = [];
                l = callbacks.length;
                for (i = 0; i < l; ++i) {
                    var item = callbacks[i];
                    item[0].apply(null, item[1]);
                }
            }
        } while (microtickQueue.length > 0);
        isOutsideMicroTick = true;
        needsNewPhysicalTick = true;
    }
    function finalizePhysicalTick() {
        var unhandledErrs = unhandledErrors;
        unhandledErrors = [];
        unhandledErrs.forEach(function (p) {
            p._PSD.onunhandled.call(null, p._value, p);
        });
        var finalizers = tickFinalizers.slice(0); // Clone first because finalizer may remove itself from list.
        var i = finalizers.length;
        while (i)
            finalizers[--i]();
    }
    function run_at_end_of_this_or_next_physical_tick(fn) {
        function finalizer() {
            fn();
            tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
        }
        tickFinalizers.push(finalizer);
        ++numScheduledCalls;
        asap$1(function () {
            if (--numScheduledCalls === 0)
                finalizePhysicalTick();
        }, []);
    }
    function addPossiblyUnhandledError(promise) {
        // Only add to unhandledErrors if not already there. The first one to add to this list
        // will be upon the first rejection so that the root cause (first promise in the
        // rejection chain) is the one listed.
        if (!unhandledErrors.some(function (p) { return p._value === promise._value; }))
            unhandledErrors.push(promise);
    }
    function markErrorAsHandled(promise) {
        // Called when a reject handled is actually being called.
        // Search in unhandledErrors for any promise whos _value is this promise_value (list
        // contains only rejected promises, and only one item per error)
        var i = unhandledErrors.length;
        while (i)
            if (unhandledErrors[--i]._value === promise._value) {
                // Found a promise that failed with this same error object pointer,
                // Remove that since there is a listener that actually takes care of it.
                unhandledErrors.splice(i, 1);
                return;
            }
    }
    function PromiseReject(reason) {
        return new Promise$1(INTERNAL, false, reason);
    }
    function wrap(fn, errorCatcher) {
        var psd = PSD;
        return function () {
            var wasRootExec = beginMicroTickScope(), outerScope = PSD;
            try {
                switchToZone(psd, true);
                return fn.apply(this, arguments);
            }
            catch (e) {
                errorCatcher && errorCatcher(e);
            }
            finally {
                switchToZone(outerScope, false);
                if (wasRootExec)
                    endMicroTickScope();
            }
        };
    }
    //
    // variables used for native await support
    //
    var task = { awaits: 0, echoes: 0, id: 0 }; // The ongoing macro-task when using zone-echoing.
    var taskCounter = 0; // ID counter for macro tasks.
    var zoneStack = []; // Stack of left zones to restore asynchronically.
    var zoneEchoes = 0; // zoneEchoes is a must in order to persist zones between native await expressions.
    var totalEchoes = 0; // ID counter for micro-tasks. Used to detect possible native await in our Promise.prototype.then.
    var zone_id_counter = 0;
    function newScope(fn, props$$1, a1, a2) {
        var parent = PSD, psd = Object.create(parent);
        psd.parent = parent;
        psd.ref = 0;
        psd.global = false;
        psd.id = ++zone_id_counter;
        // Prepare for promise patching (done in usePSD):
        var globalEnv = globalPSD.env;
        psd.env = patchGlobalPromise ? {
            Promise: Promise$1,
            PromiseProp: { value: Promise$1, configurable: true, writable: true },
            all: Promise$1.all,
            race: Promise$1.race,
            resolve: Promise$1.resolve,
            reject: Promise$1.reject,
            nthen: getPatchedPromiseThen(globalEnv.nthen, psd),
            gthen: getPatchedPromiseThen(globalEnv.gthen, psd) // global then
        } : {};
        if (props$$1)
            extend(psd, props$$1);
        // unhandleds and onunhandled should not be specifically set here.
        // Leave them on parent prototype.
        // unhandleds.push(err) will push to parent's prototype
        // onunhandled() will call parents onunhandled (with this scope's this-pointer though!)
        ++parent.ref;
        psd.finalize = function () {
            --this.parent.ref || this.parent.finalize();
        };
        var rv = usePSD(psd, fn, a1, a2);
        if (psd.ref === 0)
            psd.finalize();
        return rv;
    }
    // Function to call if scopeFunc returns NativePromise
    // Also for each NativePromise in the arguments to Promise.all()
    function incrementExpectedAwaits() {
        if (!task.id)
            task.id = ++taskCounter;
        ++task.awaits;
        task.echoes += ZONE_ECHO_LIMIT;
        return task.id;
    }
    // Function to call when 'then' calls back on a native promise where onAwaitExpected() had been called.
    // Also call this when a native await calls then method on a promise. In that case, don't supply
    // sourceTaskId because we already know it refers to current task.
    function decrementExpectedAwaits(sourceTaskId) {
        if (!task.awaits || (sourceTaskId && sourceTaskId !== task.id))
            return;
        if (--task.awaits === 0)
            task.id = 0;
        task.echoes = task.awaits * ZONE_ECHO_LIMIT; // Will reset echoes to 0 if awaits is 0.
    }
    // Call from Promise.all() and Promise.race()
    function onPossibleParallellAsync(possiblePromise) {
        if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
            incrementExpectedAwaits();
            return possiblePromise.then(function (x) {
                decrementExpectedAwaits();
                return x;
            }, function (e) {
                decrementExpectedAwaits();
                return rejection(e);
            });
        }
        return possiblePromise;
    }
    function zoneEnterEcho(targetZone) {
        ++totalEchoes;
        if (!task.echoes || --task.echoes === 0) {
            task.echoes = task.id = 0; // Cancel zone echoing.
        }
        zoneStack.push(PSD);
        switchToZone(targetZone, true);
    }
    function zoneLeaveEcho() {
        var zone = zoneStack[zoneStack.length - 1];
        zoneStack.pop();
        switchToZone(zone, false);
    }
    function switchToZone(targetZone, bEnteringZone) {
        var currentZone = PSD;
        if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
            // Enter or leave zone asynchronically as well, so that tasks initiated during current tick
            // will be surrounded by the zone when they are invoked.
            enqueueNativeMicroTask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
        }
        if (targetZone === PSD)
            return;
        PSD = targetZone; // The actual zone switch occurs at this line.
        // Snapshot on every leave from global zone.
        if (currentZone === globalPSD)
            globalPSD.env = snapShot();
        if (patchGlobalPromise) {
            // Let's patch the global and native Promises (may be same or may be different)
            var GlobalPromise = globalPSD.env.Promise;
            // Swich environments (may be PSD-zone or the global zone. Both apply.)
            var targetEnv = targetZone.env;
            // Change Promise.prototype.then for native and global Promise (they MAY differ on polyfilled environments, but both can be accessed)
            // Must be done on each zone change because the patched method contains targetZone in its closure.
            nativePromiseProto.then = targetEnv.nthen;
            GlobalPromise.prototype.then = targetEnv.gthen;
            if (currentZone.global || targetZone.global) {
                // Leaving or entering global zone. It's time to patch / restore global Promise.
                // Set this Promise to window.Promise so that transiled async functions will work on Firefox, Safari and IE, as well as with Zonejs and angular.
                Object.defineProperty(_global, 'Promise', targetEnv.PromiseProp);
                // Support Promise.all() etc to work indexedDB-safe also when people are including es6-promise as a module (they might
                // not be accessing global.Promise but a local reference to it)
                GlobalPromise.all = targetEnv.all;
                GlobalPromise.race = targetEnv.race;
                GlobalPromise.resolve = targetEnv.resolve;
                GlobalPromise.reject = targetEnv.reject;
            }
        }
    }
    function snapShot() {
        var GlobalPromise = _global.Promise;
        return patchGlobalPromise ? {
            Promise: GlobalPromise,
            PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
            all: GlobalPromise.all,
            race: GlobalPromise.race,
            resolve: GlobalPromise.resolve,
            reject: GlobalPromise.reject,
            nthen: nativePromiseProto.then,
            gthen: GlobalPromise.prototype.then
        } : {};
    }
    function usePSD(psd, fn, a1, a2, a3) {
        var outerScope = PSD;
        try {
            switchToZone(psd, true);
            return fn(a1, a2, a3);
        }
        finally {
            switchToZone(outerScope, false);
        }
    }
    function enqueueNativeMicroTask(job) {
        //
        // Precondition: nativePromiseThen !== undefined
        //
        nativePromiseThen.call(resolvedNativePromise, job);
    }
    function nativeAwaitCompatibleWrap(fn, zone, possibleAwait) {
        return typeof fn !== 'function' ? fn : function () {
            var outerZone = PSD;
            if (possibleAwait)
                incrementExpectedAwaits();
            switchToZone(zone, true);
            try {
                return fn.apply(this, arguments);
            }
            finally {
                switchToZone(outerZone, false);
            }
        };
    }
    function getPatchedPromiseThen(origThen, zone) {
        return function (onResolved, onRejected) {
            return origThen.call(this, nativeAwaitCompatibleWrap(onResolved, zone, false), nativeAwaitCompatibleWrap(onRejected, zone, false));
        };
    }
    var UNHANDLEDREJECTION = "unhandledrejection";
    function globalError(err, promise) {
        var rv;
        try {
            rv = promise.onuncatched(err);
        }
        catch (e) { }
        if (rv !== false)
            try {
                var event, eventData = { promise: promise, reason: err };
                if (_global.document && document.createEvent) {
                    event = document.createEvent('Event');
                    event.initEvent(UNHANDLEDREJECTION, true, true);
                    extend(event, eventData);
                }
                else if (_global.CustomEvent) {
                    event = new CustomEvent(UNHANDLEDREJECTION, { detail: eventData });
                    extend(event, eventData);
                }
                if (event && _global.dispatchEvent) {
                    dispatchEvent(event);
                    if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
                        // No native support for PromiseRejectionEvent but user has set window.onunhandledrejection. Manually call it.
                        try {
                            _global.onunhandledrejection(event);
                        }
                        catch (_) { }
                }
                if (!event.defaultPrevented) {
                    console.warn("Unhandled rejection: " + (err.stack || err));
                }
            }
            catch (e) { }
    }
    var rejection = Promise$1.reject;

    function Events(ctx) {
        var evs = {};
        var rv = function (eventName, subscriber) {
            if (subscriber) {
                // Subscribe. If additional arguments than just the subscriber was provided, forward them as well.
                var i = arguments.length, args = new Array(i - 1);
                while (--i)
                    args[i - 1] = arguments[i];
                evs[eventName].subscribe.apply(null, args);
                return ctx;
            }
            else if (typeof (eventName) === 'string') {
                // Return interface allowing to fire or unsubscribe from event
                return evs[eventName];
            }
        };
        rv.addEventType = add;
        for (var i = 1, l = arguments.length; i < l; ++i) {
            add(arguments[i]);
        }
        return rv;
        function add(eventName, chainFunction, defaultFunction) {
            if (typeof eventName === 'object')
                return addConfiguredEvents(eventName);
            if (!chainFunction)
                chainFunction = reverseStoppableEventChain;
            if (!defaultFunction)
                defaultFunction = nop;
            var context = {
                subscribers: [],
                fire: defaultFunction,
                subscribe: function (cb) {
                    if (context.subscribers.indexOf(cb) === -1) {
                        context.subscribers.push(cb);
                        context.fire = chainFunction(context.fire, cb);
                    }
                },
                unsubscribe: function (cb) {
                    context.subscribers = context.subscribers.filter(function (fn) { return fn !== cb; });
                    context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
                }
            };
            evs[eventName] = rv[eventName] = context;
            return context;
        }
        function addConfiguredEvents(cfg) {
            // events(this, {reading: [functionChain, nop]});
            keys(cfg).forEach(function (eventName) {
                var args = cfg[eventName];
                if (isArray(args)) {
                    add(eventName, cfg[eventName][0], cfg[eventName][1]);
                }
                else if (args === 'asap') {
                    // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
                    // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
                    var context = add(eventName, mirror, function fire() {
                        // Optimazation-safe cloning of arguments into args.
                        var i = arguments.length, args = new Array(i);
                        while (i--)
                            args[i] = arguments[i];
                        // All each subscriber:
                        context.subscribers.forEach(function (fn) {
                            asap(function fireEvent() {
                                fn.apply(null, args);
                            });
                        });
                    });
                }
                else
                    throw new exceptions.InvalidArgument("Invalid event config");
            });
        }
    }

    /*
     * Dexie.js - a minimalistic wrapper for IndexedDB
     * ===============================================
     *
     * Copyright (c) 2014-2017 David Fahlander
     *
     * Version {version}, {date}
     *
     * http://dexie.org
     *
     * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/LICENSE-2.0
     *
     */
    var DEXIE_VERSION = '{version}';
    var maxString = String.fromCharCode(65535);
    var maxKey = (function () { try {
        IDBKeyRange.only([[]]);
        return [[]];
    }
    catch (e) {
        return maxString;
    } })();
    var minKey = -Infinity;
    var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
    var STRING_EXPECTED = "String expected.";
    var connections = [];
    var isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
    var hasIEDeleteObjectStoreBug = isIEOrEdge;
    var hangsOnDeleteLargeKeyRange = isIEOrEdge;
    var dexieStackFrameFilter = function (frame) { return !/(dexie\.js|dexie\.min\.js)/.test(frame); };
    var dbNamesDB; // Global database for backing Dexie.getDatabaseNames() on browser without indexedDB.webkitGetDatabaseNames() 
    // Init debug
    setDebug(debug, dexieStackFrameFilter);
    function Dexie(dbName, options) {
        /// <param name="options" type="Object" optional="true">Specify only if you wich to control which addons that should run on this instance</param>
        var deps = Dexie.dependencies;
        var opts = extend({
            // Default Options
            addons: Dexie.addons,
            autoOpen: true,
            indexedDB: deps.indexedDB,
            IDBKeyRange: deps.IDBKeyRange // Backend IDBKeyRange api. Default to browser env.
        }, options);
        var addons = opts.addons, autoOpen = opts.autoOpen, indexedDB = opts.indexedDB, IDBKeyRange = opts.IDBKeyRange;
        var globalSchema = this._dbSchema = {};
        var versions = [];
        var dbStoreNames = [];
        var allTables = {};
        ///<var type="IDBDatabase" />
        var idbdb = null; // Instance of IDBDatabase
        var dbOpenError = null;
        var isBeingOpened = false;
        var onReadyBeingFired = null;
        var openComplete = false;
        var READONLY = "readonly", READWRITE = "readwrite";
        var db = this;
        var dbReadyResolve, dbReadyPromise = new Promise$1(function (resolve) {
            dbReadyResolve = resolve;
        }), cancelOpen, openCanceller = new Promise$1(function (_, reject) {
            cancelOpen = reject;
        });
        var autoSchema = true;
        var hasNativeGetDatabaseNames = !!getNativeGetDatabaseNamesFn(indexedDB), hasGetAll;
        function init() {
            // Default subscribers to "versionchange" and "blocked".
            // Can be overridden by custom handlers. If custom handlers return false, these default
            // behaviours will be prevented.
            db.on("versionchange", function (ev) {
                // Default behavior for versionchange event is to close database connection.
                // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
                // Let's not block the other window from making it's delete() or open() call.
                // NOTE! This event is never fired in IE,Edge or Safari.
                if (ev.newVersion > 0)
                    console.warn("Another connection wants to upgrade database '" + db.name + "'. Closing db now to resume the upgrade.");
                else
                    console.warn("Another connection wants to delete database '" + db.name + "'. Closing db now to resume the delete request.");
                db.close();
                // In many web applications, it would be recommended to force window.reload()
                // when this event occurs. To do that, subscribe to the versionchange event
                // and call window.location.reload(true) if ev.newVersion > 0 (not a deletion)
                // The reason for this is that your current web app obviously has old schema code that needs
                // to be updated. Another window got a newer version of the app and needs to upgrade DB but
                // your window is blocking it unless we close it here.
            });
            db.on("blocked", function (ev) {
                if (!ev.newVersion || ev.newVersion < ev.oldVersion)
                    console.warn("Dexie.delete('" + db.name + "') was blocked");
                else
                    console.warn("Upgrade '" + db.name + "' blocked by other connection holding version " + ev.oldVersion / 10);
            });
        }
        //
        //
        //
        // ------------------------- Versioning Framework---------------------------
        //
        //
        //
        this.version = function (versionNumber) {
            /// <param name="versionNumber" type="Number"></param>
            /// <returns type="Version"></returns>
            if (idbdb || isBeingOpened)
                throw new exceptions.Schema("Cannot add version when database is open");
            this.verno = Math.max(this.verno, versionNumber);
            var versionInstance = versions.filter(function (v) { return v._cfg.version === versionNumber; })[0];
            if (versionInstance)
                return versionInstance;
            versionInstance = new Version(versionNumber);
            versions.push(versionInstance);
            versions.sort(lowerVersionFirst);
            // Disable autoschema mode, as at least one version is specified.
            autoSchema = false;
            return versionInstance;
        };
        function Version(versionNumber) {
            this._cfg = {
                version: versionNumber,
                storesSource: null,
                dbschema: {},
                tables: {},
                contentUpgrade: null
            };
            this.stores({}); // Derive earlier schemas by default.
        }
        extend(Version.prototype, {
            stores: function (stores) {
                /// <summary>
                ///   Defines the schema for a particular version
                /// </summary>
                /// <param name="stores" type="Object">
                /// Example: <br/>
                ///   {users: "id++,first,last,&amp;username,*email", <br/>
                ///   passwords: "id++,&amp;username"}<br/>
                /// <br/>
                /// Syntax: {Table: "[primaryKey][++],[&amp;][*]index1,[&amp;][*]index2,..."}<br/><br/>
                /// Special characters:<br/>
                ///  "&amp;"  means unique key, <br/>
                ///  "*"  means value is multiEntry, <br/>
                ///  "++" means auto-increment and only applicable for primary key <br/>
                /// </param>
                this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;
                // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
                var storesSpec = {};
                versions.forEach(function (version) {
                    extend(storesSpec, version._cfg.storesSource);
                });
                var dbschema = (this._cfg.dbschema = {});
                this._parseStoresSpec(storesSpec, dbschema);
                // Update the latest schema to this version
                // Update API
                globalSchema = db._dbSchema = dbschema;
                removeTablesApi([allTables, db, Transaction.prototype]); // Keep Transaction.prototype even though it should be depr.
                setApiOnPlace([allTables, db, Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
                dbStoreNames = keys(dbschema);
                return this;
            },
            upgrade: function (upgradeFunction) {
                this._cfg.contentUpgrade = upgradeFunction;
                return this;
            },
            _parseStoresSpec: function (stores, outSchema) {
                keys(stores).forEach(function (tableName) {
                    if (stores[tableName] !== null) {
                        var instanceTemplate = {};
                        var indexes = parseIndexSyntax(stores[tableName]);
                        var primKey = indexes.shift();
                        if (primKey.multi)
                            throw new exceptions.Schema("Primary key cannot be multi-valued");
                        if (primKey.keyPath)
                            setByKeyPath(instanceTemplate, primKey.keyPath, primKey.auto ? 0 : primKey.keyPath);
                        indexes.forEach(function (idx) {
                            if (idx.auto)
                                throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                            if (!idx.keyPath)
                                throw new exceptions.Schema("Index must have a name and cannot be an empty string");
                            setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () { return ""; }) : "");
                        });
                        outSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
                    }
                });
            }
        });
        function runUpgraders(oldVersion, idbtrans, reject) {
            var trans = db._createTransaction(READWRITE, dbStoreNames, globalSchema);
            trans.create(idbtrans);
            trans._completion.catch(reject);
            var rejectTransaction = trans._reject.bind(trans);
            newScope(function () {
                PSD.trans = trans;
                if (oldVersion === 0) {
                    // Create tables:
                    keys(globalSchema).forEach(function (tableName) {
                        createTable(idbtrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
                    });
                    Promise$1.follow(function () { return db.on.populate.fire(trans); }).catch(rejectTransaction);
                }
                else
                    updateTablesAndIndexes(oldVersion, trans, idbtrans).catch(rejectTransaction);
            });
        }
        function updateTablesAndIndexes(oldVersion, trans, idbtrans) {
            // Upgrade version to version, step-by-step from oldest to newest version.
            // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
            var queue = [];
            var oldVersionStruct = versions.filter(function (version) { return version._cfg.version === oldVersion; })[0];
            if (!oldVersionStruct)
                throw new exceptions.Upgrade("Dexie specification of currently installed DB version is missing");
            globalSchema = db._dbSchema = oldVersionStruct._cfg.dbschema;
            var anyContentUpgraderHasRun = false;
            var versToRun = versions.filter(function (v) { return v._cfg.version > oldVersion; });
            versToRun.forEach(function (version) {
                /// <param name="version" type="Version"></param>
                queue.push(function () {
                    var oldSchema = globalSchema;
                    var newSchema = version._cfg.dbschema;
                    adjustToExistingIndexNames(oldSchema, idbtrans);
                    adjustToExistingIndexNames(newSchema, idbtrans);
                    globalSchema = db._dbSchema = newSchema;
                    var diff = getSchemaDiff(oldSchema, newSchema);
                    // Add tables           
                    diff.add.forEach(function (tuple) {
                        createTable(idbtrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
                    });
                    // Change tables
                    diff.change.forEach(function (change) {
                        if (change.recreate) {
                            throw new exceptions.Upgrade("Not yet support for changing primary key");
                        }
                        else {
                            var store = idbtrans.objectStore(change.name);
                            // Add indexes
                            change.add.forEach(function (idx) {
                                addIndex(store, idx);
                            });
                            // Update indexes
                            change.change.forEach(function (idx) {
                                store.deleteIndex(idx.name);
                                addIndex(store, idx);
                            });
                            // Delete indexes
                            change.del.forEach(function (idxName) {
                                store.deleteIndex(idxName);
                            });
                        }
                    });
                    if (version._cfg.contentUpgrade) {
                        anyContentUpgraderHasRun = true;
                        return Promise$1.follow(function () {
                            version._cfg.contentUpgrade(trans);
                        });
                    }
                });
                queue.push(function (idbtrans) {
                    if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
                        var newSchema = version._cfg.dbschema;
                        // Delete old tables
                        deleteRemovedTables(newSchema, idbtrans);
                    }
                });
            });
            // Now, create a queue execution engine
            function runQueue() {
                return queue.length ? Promise$1.resolve(queue.shift()(trans.idbtrans)).then(runQueue) :
                    Promise$1.resolve();
            }
            return runQueue().then(function () {
                createMissingTables(globalSchema, idbtrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
            });
        }
        function getSchemaDiff(oldSchema, newSchema) {
            var diff = {
                del: [],
                add: [],
                change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
            };
            for (var table in oldSchema) {
                if (!newSchema[table])
                    diff.del.push(table);
            }
            for (table in newSchema) {
                var oldDef = oldSchema[table], newDef = newSchema[table];
                if (!oldDef) {
                    diff.add.push([table, newDef]);
                }
                else {
                    var change = {
                        name: table,
                        def: newDef,
                        recreate: false,
                        del: [],
                        add: [],
                        change: []
                    };
                    if (oldDef.primKey.src !== newDef.primKey.src) {
                        // Primary key has changed. Remove and re-add table.
                        change.recreate = true;
                        diff.change.push(change);
                    }
                    else {
                        // Same primary key. Just find out what differs:
                        var oldIndexes = oldDef.idxByName;
                        var newIndexes = newDef.idxByName;
                        for (var idxName in oldIndexes) {
                            if (!newIndexes[idxName])
                                change.del.push(idxName);
                        }
                        for (idxName in newIndexes) {
                            var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                            if (!oldIdx)
                                change.add.push(newIdx);
                            else if (oldIdx.src !== newIdx.src)
                                change.change.push(newIdx);
                        }
                        if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                            diff.change.push(change);
                        }
                    }
                }
            }
            return diff;
        }
        function createTable(idbtrans, tableName, primKey, indexes) {
            /// <param name="idbtrans" type="IDBTransaction"></param>
            var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
            indexes.forEach(function (idx) { addIndex(store, idx); });
            return store;
        }
        function createMissingTables(newSchema, idbtrans) {
            keys(newSchema).forEach(function (tableName) {
                if (!idbtrans.db.objectStoreNames.contains(tableName)) {
                    createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
                }
            });
        }
        function deleteRemovedTables(newSchema, idbtrans) {
            for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
                var storeName = idbtrans.db.objectStoreNames[i];
                if (newSchema[storeName] == null) {
                    idbtrans.db.deleteObjectStore(storeName);
                }
            }
        }
        function addIndex(store, idx) {
            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
        }
        //
        //
        //      Dexie Protected API
        //
        //
        this._allTables = allTables;
        this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
            return new Transaction(mode, storeNames, dbschema, parentTransaction);
        };
        /* Generate a temporary transaction when db operations are done outside a transaction scope.
        */
        function tempTransaction(mode, storeNames, fn) {
            if (!openComplete && (!PSD.letThrough)) {
                if (!isBeingOpened) {
                    if (!autoOpen)
                        return rejection(new exceptions.DatabaseClosed());
                    db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
                }
                return dbReadyPromise.then(function () { return tempTransaction(mode, storeNames, fn); });
            }
            else {
                var trans = db._createTransaction(mode, storeNames, globalSchema);
                try {
                    trans.create();
                }
                catch (ex) {
                    return rejection(ex);
                }
                return trans._promise(mode, function (resolve, reject) {
                    return newScope(function () {
                        PSD.trans = trans;
                        return fn(resolve, reject, trans);
                    });
                }).then(function (result) {
                    // Instead of resolving value directly, wait with resolving it until transaction has completed.
                    // Otherwise the data would not be in the DB if requesting it in the then() operation.
                    // Specifically, to ensure that the following expression will work:
                    //
                    //   db.friends.put({name: "Arne"}).then(function () {
                    //       db.friends.where("name").equals("Arne").count(function(count) {
                    //           assert (count === 1);
                    //       });
                    //   });
                    //
                    return trans._completion.then(function () { return result; });
                }); /*.catch(err => { // Don't do this as of now. If would affect bulk- and modify methods in a way that could be more intuitive. But wait! Maybe change in next major.
                    trans._reject(err);
                    return rejection(err);
                });*/
            }
        }
        this._whenReady = function (fn) {
            return openComplete || PSD.letThrough ? fn() : new Promise$1(function (resolve, reject) {
                if (!isBeingOpened) {
                    if (!autoOpen) {
                        reject(new exceptions.DatabaseClosed());
                        return;
                    }
                    db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
                }
                dbReadyPromise.then(resolve, reject);
            }).then(fn);
        };
        //
        //
        //
        //
        //      Dexie API
        //
        //
        //
        this.verno = 0;
        this.open = function () {
            if (isBeingOpened || idbdb)
                return dbReadyPromise.then(function () { return dbOpenError ? rejection(dbOpenError) : db; });
            debug && (openCanceller._stackHolder = getErrorWithStack()); // Let stacks point to when open() was called rather than where new Dexie() was called.
            isBeingOpened = true;
            dbOpenError = null;
            openComplete = false;
            // Function pointers to call when the core opening {"env":{}} completes.
            var resolveDbReady = dbReadyResolve, 
            // upgradeTransaction to abort on failure.
            upgradeTransaction = null;
            return Promise$1.race([openCanceller, new Promise$1(function (resolve, reject) {
                    // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE:
                    // IE fails when deleting objectStore after reading from it.
                    // A future version of Dexie.js will stopover an intermediate version to workaround this.
                    // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.
                    // If no API, throw!
                    if (!indexedDB)
                        throw new exceptions.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL " +
                            "(not locally). If using old Safari versions, make sure to include indexedDB polyfill.");
                    var req = autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
                    if (!req)
                        throw new exceptions.MissingAPI("IndexedDB API not available"); // May happen in Safari private mode, see https://github.com/dfahlander/Dexie.js/issues/134
                    req.onerror = eventRejectHandler(reject);
                    req.onblocked = wrap(fireOnBlocked);
                    req.onupgradeneeded = wrap(function (e) {
                        upgradeTransaction = req.transaction;
                        if (autoSchema && !db._allowEmptyDB) {
                            // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
                            // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we
                            // do not create a new database by accident here.
                            req.onerror = preventDefault; // Prohibit onabort error from firing before we're done!
                            upgradeTransaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
                            // Close database and delete it.
                            req.result.close();
                            var delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!
                            delreq.onsuccess = delreq.onerror = wrap(function () {
                                reject(new exceptions.NoSuchDatabase("Database " + dbName + " doesnt exist"));
                            });
                        }
                        else {
                            upgradeTransaction.onerror = eventRejectHandler(reject);
                            var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
                            runUpgraders(oldVer / 10, upgradeTransaction, reject);
                        }
                    }, reject);
                    req.onsuccess = wrap(function () {
                        // Core opening procedure complete. Now let's just record some stuff.
                        upgradeTransaction = null;
                        idbdb = req.result;
                        connections.push(db); // Used for emulating versionchange event on IE/Edge/Safari.
                        if (autoSchema)
                            readGlobalSchema();
                        else if (idbdb.objectStoreNames.length > 0) {
                            try {
                                adjustToExistingIndexNames(globalSchema, idbdb.transaction(safariMultiStoreFix(idbdb.objectStoreNames), READONLY));
                            }
                            catch (e) {
                                // Safari may bail out if > 1 store names. However, this shouldnt be a showstopper. Issue #120.
                            }
                        }
                        idbdb.onversionchange = wrap(function (ev) {
                            db._vcFired = true; // detect implementations that not support versionchange (IE/Edge/Safari)
                            db.on("versionchange").fire(ev);
                        });
                        if (!hasNativeGetDatabaseNames && dbName !== '__dbnames') {
                            dbNamesDB.dbnames.put({ name: dbName }).catch(nop);
                        }
                        resolve();
                    }, reject);
                })]).then(function () {
                // Before finally resolving the dbReadyPromise and this promise,
                // call and await all on('ready') subscribers:
                // Dexie.vip() makes subscribers able to use the database while being opened.
                // This is a must since these subscribers take part of the opening procedure.
                onReadyBeingFired = [];
                return Promise$1.resolve(Dexie.vip(db.on.ready.fire)).then(function fireRemainders() {
                    if (onReadyBeingFired.length > 0) {
                        // In case additional subscribers to db.on('ready') were added during the time db.on.ready.fire was executed.
                        var remainders = onReadyBeingFired.reduce(promisableChain, nop);
                        onReadyBeingFired = [];
                        return Promise$1.resolve(Dexie.vip(remainders)).then(fireRemainders);
                    }
                });
            }).finally(function () {
                onReadyBeingFired = null;
            }).then(function () {
                // Resolve the db.open() with the db instance.
                isBeingOpened = false;
                return db;
            }).catch(function (err) {
                try {
                    // Did we fail within onupgradeneeded? Make sure to abort the upgrade transaction so it doesnt commit.
                    upgradeTransaction && upgradeTransaction.abort();
                }
                catch (e) { }
                isBeingOpened = false; // Set before calling db.close() so that it doesnt reject openCanceller again (leads to unhandled rejection event).
                db.close(); // Closes and resets idbdb, removes connections, resets dbReadyPromise and openCanceller so that a later db.open() is fresh.
                // A call to db.close() may have made on-ready subscribers fail. Use dbOpenError if set, since err could be a follow-up error on that.
                dbOpenError = err; // Record the error. It will be used to reject further promises of db operations.
                return rejection(dbOpenError);
            }).finally(function () {
                openComplete = true;
                resolveDbReady(); // dbReadyPromise is resolved no matter if open() rejects or resolved. It's just to wake up waiters.
            });
        };
        this.close = function () {
            var idx = connections.indexOf(db);
            if (idx >= 0)
                connections.splice(idx, 1);
            if (idbdb) {
                try {
                    idbdb.close();
                }
                catch (e) { }
                idbdb = null;
            }
            autoOpen = false;
            dbOpenError = new exceptions.DatabaseClosed();
            if (isBeingOpened)
                cancelOpen(dbOpenError);
            // Reset dbReadyPromise promise:
            dbReadyPromise = new Promise$1(function (resolve) {
                dbReadyResolve = resolve;
            });
            openCanceller = new Promise$1(function (_, reject) {
                cancelOpen = reject;
            });
        };
        this.delete = function () {
            var hasArguments = arguments.length > 0;
            return new Promise$1(function (resolve, reject) {
                if (hasArguments)
                    throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
                if (isBeingOpened) {
                    dbReadyPromise.then(doDelete);
                }
                else {
                    doDelete();
                }
                function doDelete() {
                    db.close();
                    var req = indexedDB.deleteDatabase(dbName);
                    req.onsuccess = wrap(function () {
                        if (!hasNativeGetDatabaseNames) {
                            dbNamesDB.dbnames.delete(dbName).catch(nop);
                        }
                        resolve();
                    });
                    req.onerror = eventRejectHandler(reject);
                    req.onblocked = fireOnBlocked;
                }
            });
        };
        this.backendDB = function () {
            return idbdb;
        };
        this.isOpen = function () {
            return idbdb !== null;
        };
        this.hasBeenClosed = function () {
            return dbOpenError && (dbOpenError instanceof exceptions.DatabaseClosed);
        };
        this.hasFailed = function () {
            return dbOpenError !== null;
        };
        this.dynamicallyOpened = function () {
            return autoSchema;
        };
        //
        // Properties
        //
        this.name = dbName;
        // db.tables - an array of all Table instances.
        props(this, {
            tables: {
                get: function () {
                    /// <returns type="Array" elementType="Table" />
                    return keys(allTables).map(function (name) { return allTables[name]; });
                }
            }
        });
        //
        // Events
        //
        this.on = Events(this, "populate", "blocked", "versionchange", { ready: [promisableChain, nop] });
        this.on.ready.subscribe = override(this.on.ready.subscribe, function (subscribe) {
            return function (subscriber, bSticky) {
                Dexie.vip(function () {
                    if (openComplete) {
                        // Database already open. Call subscriber asap.
                        if (!dbOpenError)
                            Promise$1.resolve().then(subscriber);
                        // bSticky: Also subscribe to future open sucesses (after close / reopen) 
                        if (bSticky)
                            subscribe(subscriber);
                    }
                    else if (onReadyBeingFired) {
                        // db.on('ready') subscribers are currently being executed and have not yet resolved or rejected
                        onReadyBeingFired.push(subscriber);
                        if (bSticky)
                            subscribe(subscriber);
                    }
                    else {
                        // Database not yet open. Subscribe to it.
                        subscribe(subscriber);
                        // If bSticky is falsy, make sure to unsubscribe subscriber when fired once.
                        if (!bSticky)
                            subscribe(function unsubscribe() {
                                db.on.ready.unsubscribe(subscriber);
                                db.on.ready.unsubscribe(unsubscribe);
                            });
                    }
                });
            };
        });
        this.transaction = function () {
            /// <summary>
            ///
            /// </summary>
            /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
            /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
            /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>
            var args = extractTransactionArgs.apply(this, arguments);
            return this._transaction.apply(this, args);
        };
        function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
            // Let table arguments be all arguments between mode and last argument.
            var i = arguments.length;
            if (i < 2)
                throw new exceptions.InvalidArgument("Too few arguments");
            // Prevent optimzation killer (https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments)
            // and clone arguments except the first one into local var 'args'.
            var args = new Array(i - 1);
            while (--i)
                args[i - 1] = arguments[i];
            // Let scopeFunc be the last argument and pop it so that args now only contain the table arguments.
            scopeFunc = args.pop();
            var tables = flatten(args); // Support using array as middle argument, or a mix of arrays and non-arrays.
            return [mode, tables, scopeFunc];
        }
        this._transaction = function (mode, tables, scopeFunc) {
            var parentTransaction = PSD.trans;
            // Check if parent transactions is bound to this db instance, and if caller wants to reuse it
            if (!parentTransaction || parentTransaction.db !== db || mode.indexOf('!') !== -1)
                parentTransaction = null;
            var onlyIfCompatible = mode.indexOf('?') !== -1;
            mode = mode.replace('!', '').replace('?', ''); // Ok. Will change arguments[0] as well but we wont touch arguments henceforth.
            try {
                //
                // Get storeNames from arguments. Either through given table instances, or through given table names.
                //
                var storeNames = tables.map(function (table) {
                    var storeName = table instanceof Table ? table.name : table;
                    if (typeof storeName !== 'string')
                        throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                    return storeName;
                });
                //
                // Resolve mode. Allow shortcuts "r" and "rw".
                //
                if (mode == "r" || mode == READONLY)
                    mode = READONLY;
                else if (mode == "rw" || mode == READWRITE)
                    mode = READWRITE;
                else
                    throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
                if (parentTransaction) {
                    // Basic checks
                    if (parentTransaction.mode === READONLY && mode === READWRITE) {
                        if (onlyIfCompatible) {
                            // Spawn new transaction instead.
                            parentTransaction = null;
                        }
                        else
                            throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                    }
                    if (parentTransaction) {
                        storeNames.forEach(function (storeName) {
                            if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                                if (onlyIfCompatible) {
                                    // Spawn new transaction instead.
                                    parentTransaction = null;
                                }
                                else
                                    throw new exceptions.SubTransaction("Table " + storeName +
                                        " not included in parent transaction.");
                            }
                        });
                    }
                    if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                        // '?' mode should not keep using an inactive transaction.
                        parentTransaction = null;
                    }
                }
            }
            catch (e) {
                return parentTransaction ?
                    parentTransaction._promise(null, function (_, reject) { reject(e); }) :
                    rejection(e);
            }
            // If this is a sub-transaction, lock the parent and then launch the sub-transaction.
            return (parentTransaction ?
                parentTransaction._promise(mode, enterTransactionScope, "lock") :
                PSD.trans ?
                    // no parent transaction despite PSD.trans exists. Make sure also
                    // that the zone we create is not a sub-zone of current, because
                    // Promise.follow() should not wait for it if so.
                    usePSD(PSD.transless, function () { return db._whenReady(enterTransactionScope); }) :
                    db._whenReady(enterTransactionScope));
            function enterTransactionScope() {
                return Promise$1.resolve().then(function () {
                    // Keep a pointer to last non-transactional PSD to use if someone calls Dexie.ignoreTransaction().
                    var transless = PSD.transless || PSD;
                    // Our transaction.
                    //return new Promise((resolve, reject) => {
                    var trans = db._createTransaction(mode, storeNames, globalSchema, parentTransaction);
                    // Let the transaction instance be part of a Promise-specific data (PSD) value.
                    var zoneProps = {
                        trans: trans,
                        transless: transless
                    };
                    if (parentTransaction) {
                        // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
                        trans.idbtrans = parentTransaction.idbtrans;
                    }
                    else {
                        trans.create(); // Create the backend transaction so that complete() or error() will trigger even if no operation is made upon it.
                    }
                    // Support for native async await.
                    if (scopeFunc.constructor === AsyncFunction) {
                        incrementExpectedAwaits();
                    }
                    var returnValue;
                    var promiseFollowed = Promise$1.follow(function () {
                        // Finally, call the scope function with our table and transaction arguments.
                        returnValue = scopeFunc.call(trans, trans);
                        if (returnValue) {
                            if (returnValue.constructor === NativePromise) {
                                var decrementor = decrementExpectedAwaits.bind(null, null);
                                returnValue.then(decrementor, decrementor);
                            }
                            else if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
                                // scopeFunc returned an iterator with throw-support. Handle yield as await.
                                returnValue = awaitIterator(returnValue);
                            }
                        }
                    }, zoneProps);
                    return (returnValue && typeof returnValue.then === 'function' ?
                        // Promise returned. User uses promise-style transactions.
                        Promise$1.resolve(returnValue).then(function (x) { return trans.active ?
                            x // Transaction still active. Continue.
                            : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn")); })
                        // No promise returned. Wait for all outstanding promises before continuing. 
                        : promiseFollowed.then(function () { return returnValue; })).then(function (x) {
                        // sub transactions don't react to idbtrans.oncomplete. We must trigger a completion:
                        if (parentTransaction)
                            trans._resolve();
                        // wait for trans._completion
                        // (if root transaction, this means 'complete' event. If sub-transaction, we've just fired it ourselves)
                        return trans._completion.then(function () { return x; });
                    }).catch(function (e) {
                        trans._reject(e); // Yes, above then-handler were maybe not called because of an unhandled rejection in scopeFunc!
                        return rejection(e);
                    });
                });
            }
        };
        this.table = function (tableName) {
            /// <returns type="Table"></returns>
            if (!hasOwn(allTables, tableName)) {
                throw new exceptions.InvalidTable("Table " + tableName + " does not exist");
            }
            return allTables[tableName];
        };
        //
        //
        //
        // Table Class
        //
        //
        //
        function Table(name, tableSchema, optionalTrans) {
            /// <param name="name" type="String"></param>
            this.name = name;
            this.schema = tableSchema;
            this._tx = optionalTrans;
            this.hook = allTables[name] ? allTables[name].hook : Events(null, {
                "creating": [hookCreatingChain, nop],
                "reading": [pureFunctionChain, mirror],
                "updating": [hookUpdatingChain, nop],
                "deleting": [hookDeletingChain, nop]
            });
        }
        function BulkErrorHandlerCatchAll(errorList, done, supportHooks) {
            return (supportHooks ? hookedEventRejectHandler : eventRejectHandler)(function (e) {
                errorList.push(e);
                done && done();
            });
        }
        function bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook) {
            // If hasDeleteHook, keysOrTuples must be an array of tuples: [[key1, value2],[key2,value2],...],
            // else keysOrTuples must be just an array of keys: [key1, key2, ...].
            return new Promise$1(function (resolve, reject) {
                var len = keysOrTuples.length, lastItem = len - 1;
                if (len === 0)
                    return resolve();
                if (!hasDeleteHook) {
                    for (var i = 0; i < len; ++i) {
                        var req = idbstore.delete(keysOrTuples[i]);
                        req.onerror = eventRejectHandler(reject);
                        if (i === lastItem)
                            req.onsuccess = wrap(function () { return resolve(); });
                    }
                }
                else {
                    var hookCtx, errorHandler = hookedEventRejectHandler(reject), successHandler = hookedEventSuccessHandler(null);
                    tryCatch(function () {
                        for (var i = 0; i < len; ++i) {
                            hookCtx = { onsuccess: null, onerror: null };
                            var tuple = keysOrTuples[i];
                            deletingHook.call(hookCtx, tuple[0], tuple[1], trans);
                            var req = idbstore.delete(tuple[0]);
                            req._hookCtx = hookCtx;
                            req.onerror = errorHandler;
                            if (i === lastItem)
                                req.onsuccess = hookedEventSuccessHandler(resolve);
                            else
                                req.onsuccess = successHandler;
                        }
                    }, function (err) {
                        hookCtx.onerror && hookCtx.onerror(err);
                        throw err;
                    });
                }
            });
        }
        props(Table.prototype, {
            //
            // Table Protected Methods
            //
            _trans: function getTransaction(mode, fn, writeLocked) {
                var trans = this._tx || PSD.trans;
                return trans && trans.db === db ?
                    trans === PSD.trans ?
                        trans._promise(mode, fn, writeLocked) :
                        newScope(function () { return trans._promise(mode, fn, writeLocked); }, { trans: trans, transless: PSD.transless || PSD }) :
                    tempTransaction(mode, [this.name], fn);
            },
            _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
                var tableName = this.name;
                function supplyIdbStore(resolve, reject, trans) {
                    if (trans.storeNames.indexOf(tableName) === -1)
                        throw new exceptions.NotFound("Table" + tableName + " not part of transaction");
                    return fn(resolve, reject, trans.idbtrans.objectStore(tableName), trans);
                }
                return this._trans(mode, supplyIdbStore, writeLocked);
            },
            //
            // Table Public Methods
            //
            get: function (keyOrCrit, cb) {
                if (keyOrCrit && keyOrCrit.constructor === Object)
                    return this.where(keyOrCrit).first(cb);
                var self = this;
                return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                    var req = idbstore.get(keyOrCrit);
                    req.onerror = eventRejectHandler(reject);
                    req.onsuccess = wrap(function () {
                        resolve(self.hook.reading.fire(req.result));
                    }, reject);
                }).then(cb);
            },
            where: function (indexOrCrit) {
                if (typeof indexOrCrit === 'string')
                    return new WhereClause(this, indexOrCrit);
                if (isArray(indexOrCrit))
                    return new WhereClause(this, "[" + indexOrCrit.join('+') + "]");
                // indexOrCrit is an object map of {[keyPath]:value} 
                var keyPaths = keys(indexOrCrit);
                if (keyPaths.length === 1)
                    // Only one critera. This was the easy case:
                    return this
                        .where(keyPaths[0])
                        .equals(indexOrCrit[keyPaths[0]]);
                // Multiple criterias.
                // Let's try finding a compound index that matches all keyPaths in
                // arbritary order:
                var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function (ix) {
                    return ix.compound &&
                        keyPaths.every(function (keyPath) { return ix.keyPath.indexOf(keyPath) >= 0; }) &&
                        ix.keyPath.every(function (keyPath) { return keyPaths.indexOf(keyPath) >= 0; });
                })[0];
                if (compoundIndex && maxKey !== maxString)
                    // Cool! We found such compound index
                    // and this browser supports compound indexes (maxKey !== maxString)!
                    return this
                        .where(compoundIndex.name)
                        .equals(compoundIndex.keyPath.map(function (kp) { return indexOrCrit[kp]; }));
                if (!compoundIndex)
                    console.warn("The query " + JSON.stringify(indexOrCrit) + " on " + this.name + " would benefit of a " +
                        ("compound index [" + keyPaths.join('+') + "]"));
                // Ok, now let's fallback to finding at least one matching index
                // and filter the rest.
                var idxByName = this.schema.idxByName;
                var simpleIndex = keyPaths.reduce(function (r, keyPath) { return [
                    r[0] || idxByName[keyPath],
                    r[0] || !idxByName[keyPath] ?
                        combine(r[1], function (x) { return '' + getByKeyPath(x, keyPath) ==
                            '' + indexOrCrit[keyPath]; })
                        : r[1]
                ]; }, [null, null]);
                var idx = simpleIndex[0];
                return idx ?
                    this.where(idx.name).equals(indexOrCrit[idx.keyPath])
                        .filter(simpleIndex[1]) :
                    compoundIndex ?
                        this.filter(simpleIndex[1]) : // Has compound but browser bad. Allow filter.
                        this.where(keyPaths).equals(''); // No index at all. Fail lazily.
            },
            count: function (cb) {
                return this.toCollection().count(cb);
            },
            offset: function (offset) {
                return this.toCollection().offset(offset);
            },
            limit: function (numRows) {
                return this.toCollection().limit(numRows);
            },
            reverse: function () {
                return this.toCollection().reverse();
            },
            filter: function (filterFunction) {
                return this.toCollection().and(filterFunction);
            },
            each: function (fn) {
                return this.toCollection().each(fn);
            },
            toArray: function (cb) {
                return this.toCollection().toArray(cb);
            },
            orderBy: function (index) {
                return new Collection(new WhereClause(this, isArray(index) ?
                    "[" + index.join('+') + "]" :
                    index));
            },
            toCollection: function () {
                return new Collection(new WhereClause(this));
            },
            mapToClass: function (constructor, structure) {
                /// <summary>
                ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
                ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
                /// </summary>
                /// <param name="constructor">Constructor function representing the class.</param>
                /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
                /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
                this.schema.mappedClass = constructor;
                var instanceTemplate = Object.create(constructor.prototype);
                if (structure) {
                    // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
                    applyStructure(instanceTemplate, structure);
                }
                this.schema.instanceTemplate = instanceTemplate;
                // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
                // no matter which method to use for reading (Table.get() or Table.where(...)... )
                var readHook = function (obj) {
                    if (!obj)
                        return obj; // No valid object. (Value is null). Return as is.
                    // Create a new object that derives from constructor:
                    var res = Object.create(constructor.prototype);
                    // Clone members:
                    for (var m in obj)
                        if (hasOwn(obj, m))
                            try {
                                res[m] = obj[m];
                            }
                            catch (_) { }
                    return res;
                };
                if (this.schema.readHook) {
                    this.hook.reading.unsubscribe(this.schema.readHook);
                }
                this.schema.readHook = readHook;
                this.hook("reading", readHook);
                return constructor;
            },
            defineClass: function (structure) {
                /// <summary>
                ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
                ///     as well as making it possible to extend the prototype of the returned constructor function.
                /// </summary>
                /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
                /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>
                return this.mapToClass(Dexie.defineClass(structure), structure);
            },
            bulkDelete: function (keys$$1) {
                if (this.hook.deleting.fire === nop) {
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                        resolve(bulkDelete(idbstore, trans, keys$$1, false, nop));
                    });
                }
                else {
                    return this
                        .where(':id')
                        .anyOf(keys$$1)
                        .delete()
                        .then(function () { }); // Resolve with undefined.
                }
            },
            bulkPut: function (objects, keys$$1) {
                var _this = this;
                return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                    if (!idbstore.keyPath && !_this.schema.primKey.auto && !keys$$1)
                        throw new exceptions.InvalidArgument("bulkPut() with non-inbound keys requires keys array in second argument");
                    if (idbstore.keyPath && keys$$1)
                        throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
                    if (keys$$1 && keys$$1.length !== objects.length)
                        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                    if (objects.length === 0)
                        return resolve(); // Caller provided empty list.
                    var done = function (result) {
                        if (errorList.length === 0)
                            resolve(result);
                        else
                            reject(new BulkError(_this.name + ".bulkPut(): " + errorList.length + " of " + numObjs + " operations failed", errorList));
                    };
                    var req, errorList = [], errorHandler, numObjs = objects.length, table = _this;
                    if (_this.hook.creating.fire === nop && _this.hook.updating.fire === nop) {
                        //
                        // Standard Bulk (no 'creating' or 'updating' hooks to care about)
                        //
                        errorHandler = BulkErrorHandlerCatchAll(errorList);
                        for (var i = 0, l = objects.length; i < l; ++i) {
                            req = keys$$1 ? idbstore.put(objects[i], keys$$1[i]) : idbstore.put(objects[i]);
                            req.onerror = errorHandler;
                        }
                        // Only need to catch success or error on the last operation
                        // according to the IDB spec.
                        req.onerror = BulkErrorHandlerCatchAll(errorList, done);
                        req.onsuccess = eventSuccessHandler(done);
                    }
                    else {
                        var effectiveKeys = keys$$1 || idbstore.keyPath && objects.map(function (o) { return getByKeyPath(o, idbstore.keyPath); });
                        // Generate map of {[key]: object}
                        var objectLookup = effectiveKeys && arrayToObject(effectiveKeys, function (key, i) { return key != null && [key, objects[i]]; });
                        var promise = !effectiveKeys ?
                            // Auto-incremented key-less objects only without any keys argument.
                            table.bulkAdd(objects) :
                            // Keys provided. Either as inbound in provided objects, or as a keys argument.
                            // Begin with updating those that exists in DB:
                            table.where(':id').anyOf(effectiveKeys.filter(function (key) { return key != null; })).modify(function () {
                                this.value = objectLookup[this.primKey];
                                objectLookup[this.primKey] = null; // Mark as "don't add this"
                            }).catch(ModifyError, function (e) {
                                errorList = e.failures; // No need to concat here. These are the first errors added.
                            }).then(function () {
                                // Now, let's examine which items didnt exist so we can add them:
                                var objsToAdd = [], keysToAdd = keys$$1 && [];
                                // Iterate backwards. Why? Because if same key was used twice, just add the last one.
                                for (var i = effectiveKeys.length - 1; i >= 0; --i) {
                                    var key = effectiveKeys[i];
                                    if (key == null || objectLookup[key]) {
                                        objsToAdd.push(objects[i]);
                                        keys$$1 && keysToAdd.push(key);
                                        if (key != null)
                                            objectLookup[key] = null; // Mark as "dont add again"
                                    }
                                }
                                // The items are in reverse order so reverse them before adding.
                                // Could be important in order to get auto-incremented keys the way the caller
                                // would expect. Could have used unshift instead of push()/reverse(),
                                // but: http://jsperf.com/unshift-vs-reverse
                                objsToAdd.reverse();
                                keys$$1 && keysToAdd.reverse();
                                return table.bulkAdd(objsToAdd, keysToAdd);
                            }).then(function (lastAddedKey) {
                                // Resolve with key of the last object in given arguments to bulkPut():
                                var lastEffectiveKey = effectiveKeys[effectiveKeys.length - 1]; // Key was provided.
                                return lastEffectiveKey != null ? lastEffectiveKey : lastAddedKey;
                            });
                        promise.then(done).catch(BulkError, function (e) {
                            // Concat failure from ModifyError and reject using our 'done' method.
                            errorList = errorList.concat(e.failures);
                            done();
                        }).catch(reject);
                    }
                }, "locked"); // If called from transaction scope, lock transaction til all steps are done.
            },
            bulkAdd: function (objects, keys$$1) {
                var self = this, creatingHook = this.hook.creating.fire;
                return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                    if (!idbstore.keyPath && !self.schema.primKey.auto && !keys$$1)
                        throw new exceptions.InvalidArgument("bulkAdd() with non-inbound keys requires keys array in second argument");
                    if (idbstore.keyPath && keys$$1)
                        throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
                    if (keys$$1 && keys$$1.length !== objects.length)
                        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                    if (objects.length === 0)
                        return resolve(); // Caller provided empty list.
                    function done(result) {
                        if (errorList.length === 0)
                            resolve(result);
                        else
                            reject(new BulkError(self.name + ".bulkAdd(): " + errorList.length + " of " + numObjs + " operations failed", errorList));
                    }
                    var req, errorList = [], errorHandler, successHandler, numObjs = objects.length;
                    if (creatingHook !== nop) {
                        //
                        // There are subscribers to hook('creating')
                        // Must behave as documented.
                        //
                        var keyPath = idbstore.keyPath, hookCtx;
                        errorHandler = BulkErrorHandlerCatchAll(errorList, null, true);
                        successHandler = hookedEventSuccessHandler(null);
                        tryCatch(function () {
                            for (var i = 0, l = objects.length; i < l; ++i) {
                                hookCtx = { onerror: null, onsuccess: null };
                                var key = keys$$1 && keys$$1[i];
                                var obj = objects[i], effectiveKey = keys$$1 ? key : keyPath ? getByKeyPath(obj, keyPath) : undefined, keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans);
                                if (effectiveKey == null && keyToUse != null) {
                                    if (keyPath) {
                                        obj = deepClone(obj);
                                        setByKeyPath(obj, keyPath, keyToUse);
                                    }
                                    else {
                                        key = keyToUse;
                                    }
                                }
                                req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
                                req._hookCtx = hookCtx;
                                if (i < l - 1) {
                                    req.onerror = errorHandler;
                                    if (hookCtx.onsuccess)
                                        req.onsuccess = successHandler;
                                }
                            }
                        }, function (err) {
                            hookCtx.onerror && hookCtx.onerror(err);
                            throw err;
                        });
                        req.onerror = BulkErrorHandlerCatchAll(errorList, done, true);
                        req.onsuccess = hookedEventSuccessHandler(done);
                    }
                    else {
                        //
                        // Standard Bulk (no 'creating' hook to care about)
                        //
                        errorHandler = BulkErrorHandlerCatchAll(errorList);
                        for (var i = 0, l = objects.length; i < l; ++i) {
                            req = keys$$1 ? idbstore.add(objects[i], keys$$1[i]) : idbstore.add(objects[i]);
                            req.onerror = errorHandler;
                        }
                        // Only need to catch success or error on the last operation
                        // according to the IDB spec.
                        req.onerror = BulkErrorHandlerCatchAll(errorList, done);
                        req.onsuccess = eventSuccessHandler(done);
                    }
                });
            },
            add: function (obj, key) {
                /// <summary>
                ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
                /// </summary>
                /// <param name="obj" type="Object">A javascript object to insert</param>
                /// <param name="key" optional="true">Primary key</param>
                var creatingHook = this.hook.creating.fire;
                return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                    var hookCtx = { onsuccess: null, onerror: null };
                    if (creatingHook !== nop) {
                        var effectiveKey = (key != null) ? key : (idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined);
                        var keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
                        if (effectiveKey == null && keyToUse != null) {
                            if (idbstore.keyPath)
                                setByKeyPath(obj, idbstore.keyPath, keyToUse);
                            else
                                key = keyToUse;
                        }
                    }
                    try {
                        var req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
                        req._hookCtx = hookCtx;
                        req.onerror = hookedEventRejectHandler(reject);
                        req.onsuccess = hookedEventSuccessHandler(function (result) {
                            // TODO: Remove these two lines in next major release (2.0?)
                            // It's no good practice to have side effects on provided parameters
                            var keyPath = idbstore.keyPath;
                            if (keyPath)
                                setByKeyPath(obj, keyPath, result);
                            resolve(result);
                        });
                    }
                    catch (e) {
                        if (hookCtx.onerror)
                            hookCtx.onerror(e);
                        throw e;
                    }
                });
            },
            put: function (obj, key) {
                var _this = this;
                /// <summary>
                ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
                /// </summary>
                /// <param name="obj" type="Object">A javascript object to insert or update</param>
                /// <param name="key" optional="true">Primary key</param>
                var creatingHook = this.hook.creating.fire, updatingHook = this.hook.updating.fire;
                if (creatingHook !== nop || updatingHook !== nop) {
                    //
                    // People listens to when("creating") or when("updating") events!
                    // We must know whether the put operation results in an CREATE or UPDATE.
                    //
                    var keyPath = this.schema.primKey.keyPath;
                    var effectiveKey = (key !== undefined) ? key : (keyPath && getByKeyPath(obj, keyPath));
                    if (effectiveKey == null)
                        return this.add(obj);
                    // Since key is optional, make sure we get it from obj if not provided
                    // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
                    // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.
                    obj = deepClone(obj);
                    return this._trans(READWRITE, function () {
                        return _this.where(":id").equals(effectiveKey).modify(function () {
                            // Replace extisting value with our object
                            // CRUD event firing handled in Collection.modify()
                            this.value = obj;
                        }).then(function (count) { return count === 0 ? _this.add(obj, key) : effectiveKey; });
                    }, "locked"); // Lock needed because operation is splitted into modify() and add().
                }
                else {
                    // Use the standard IDB put() method.
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                        var req = key !== undefined ? idbstore.put(obj, key) : idbstore.put(obj);
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = wrap(function (ev) {
                            var keyPath = idbstore.keyPath;
                            if (keyPath)
                                setByKeyPath(obj, keyPath, ev.target.result);
                            resolve(req.result);
                        });
                    });
                }
            },
            'delete': function (key) {
                /// <param name="key">Primary key of the object to delete</param>
                if (this.hook.deleting.subscribers.length) {
                    // People listens to when("deleting") event. Must implement delete using Collection.delete() that will
                    // call the CRUD event. Only Collection.delete() will know whether an object was actually deleted.
                    return this.where(":id").equals(key).delete();
                }
                else {
                    // No one listens. Use standard IDB delete() method.
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                        var req = idbstore.delete(key);
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = wrap(function () {
                            resolve(req.result);
                        });
                    });
                }
            },
            clear: function () {
                if (this.hook.deleting.subscribers.length) {
                    // People listens to when("deleting") event. Must implement delete using Collection.delete() that will
                    // call the CRUD event. Only Collection.delete() will knows which objects that are actually deleted.
                    return this.toCollection().delete();
                }
                else {
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                        var req = idbstore.clear();
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = wrap(function () {
                            resolve(req.result);
                        });
                    });
                }
            },
            update: function (keyOrObject, modifications) {
                if (typeof modifications !== 'object' || isArray(modifications))
                    throw new exceptions.InvalidArgument("Modifications must be an object.");
                if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
                    // object to modify. Also modify given object with the modifications:
                    keys(modifications).forEach(function (keyPath) {
                        setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
                    });
                    var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
                    if (key === undefined)
                        return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
                    return this.where(":id").equals(key).modify(modifications);
                }
                else {
                    // key to modify
                    return this.where(":id").equals(keyOrObject).modify(modifications);
                }
            }
        });
        //
        //
        //
        // Transaction Class
        //
        //
        //
        function Transaction(mode, storeNames, dbschema, parent) {
            var _this = this;
            /// <summary>
            ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
            /// </summary>
            /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
            /// <param name="storeNames" type="Array">Array of table names to operate on</param>
            this.db = db;
            this.mode = mode;
            this.storeNames = storeNames;
            this.idbtrans = null;
            this.on = Events(this, "complete", "error", "abort");
            this.parent = parent || null;
            this.active = true;
            this._reculock = 0;
            this._blockedFuncs = [];
            this._resolve = null;
            this._reject = null;
            this._waitingFor = null;
            this._waitingQueue = null;
            this._spinCount = 0; // Just for debugging waitFor()
            this._completion = new Promise$1(function (resolve, reject) {
                _this._resolve = resolve;
                _this._reject = reject;
            });
            this._completion.then(function () {
                _this.active = false;
                _this.on.complete.fire();
            }, function (e) {
                var wasActive = _this.active;
                _this.active = false;
                _this.on.error.fire(e);
                _this.parent ?
                    _this.parent._reject(e) :
                    wasActive && _this.idbtrans && _this.idbtrans.abort();
                return rejection(e); // Indicate we actually DO NOT catch this error.
            });
        }
        props(Transaction.prototype, {
            //
            // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
            //
            _lock: function () {
                assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
                // Temporary set all requests into a pending queue if they are called before database is ready.
                ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
                if (this._reculock === 1 && !PSD.global)
                    PSD.lockOwnerFor = this;
                return this;
            },
            _unlock: function () {
                assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
                if (--this._reculock === 0) {
                    if (!PSD.global)
                        PSD.lockOwnerFor = null;
                    while (this._blockedFuncs.length > 0 && !this._locked()) {
                        var fnAndPSD = this._blockedFuncs.shift();
                        try {
                            usePSD(fnAndPSD[1], fnAndPSD[0]);
                        }
                        catch (e) { }
                    }
                }
                return this;
            },
            _locked: function () {
                // Checks if any write-lock is applied on this transaction.
                // To simplify the Dexie API for extension implementations, we support recursive locks.
                // This is accomplished by using "Promise Specific Data" (PSD).
                // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
                // PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
                //         * callback given to the Promise() constructor  (function (resolve, reject){...})
                //         * callbacks given to then()/catch()/finally() methods (function (value){...})
                // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
                // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
                // PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
                return this._reculock && PSD.lockOwnerFor !== this;
            },
            create: function (idbtrans) {
                var _this = this;
                if (!this.mode)
                    return this;
                assert(!this.idbtrans);
                if (!idbtrans && !idbdb) {
                    switch (dbOpenError && dbOpenError.name) {
                        case "DatabaseClosedError":
                            // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
                            throw new exceptions.DatabaseClosed(dbOpenError);
                        case "MissingAPIError":
                            // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
                            throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
                        default:
                            // Make it clear that the user operation was not what caused the error - the error had occurred earlier on db.open()!
                            throw new exceptions.OpenFailed(dbOpenError);
                    }
                }
                if (!this.active)
                    throw new exceptions.TransactionInactive();
                assert(this._completion._state === null);
                idbtrans = this.idbtrans = idbtrans || idbdb.transaction(safariMultiStoreFix(this.storeNames), this.mode);
                idbtrans.onerror = wrap(function (ev) {
                    preventDefault(ev); // Prohibit default bubbling to window.error
                    _this._reject(idbtrans.error);
                });
                idbtrans.onabort = wrap(function (ev) {
                    preventDefault(ev);
                    _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
                    _this.active = false;
                    _this.on("abort").fire(ev);
                });
                idbtrans.oncomplete = wrap(function () {
                    _this.active = false;
                    _this._resolve();
                });
                return this;
            },
            _promise: function (mode, fn, bWriteLock) {
                var _this = this;
                if (mode === READWRITE && this.mode !== READWRITE)
                    return rejection(new exceptions.ReadOnly("Transaction is readonly"));
                if (!this.active)
                    return rejection(new exceptions.TransactionInactive());
                if (this._locked()) {
                    return new Promise$1(function (resolve, reject) {
                        _this._blockedFuncs.push([function () {
                                _this._promise(mode, fn, bWriteLock).then(resolve, reject);
                            }, PSD]);
                    });
                }
                else if (bWriteLock) {
                    return newScope(function () {
                        var p = new Promise$1(function (resolve, reject) {
                            _this._lock();
                            var rv = fn(resolve, reject, _this);
                            if (rv && rv.then)
                                rv.then(resolve, reject);
                        });
                        p.finally(function () { return _this._unlock(); });
                        p._lib = true;
                        return p;
                    });
                }
                else {
                    var p = new Promise$1(function (resolve, reject) {
                        var rv = fn(resolve, reject, _this);
                        if (rv && rv.then)
                            rv.then(resolve, reject);
                    });
                    p._lib = true;
                    return p;
                }
            },
            _root: function () {
                return this.parent ? this.parent._root() : this;
            },
            waitFor: function (promise) {
                // Always operate on the root transaction (in case this is a sub stransaction)
                var root = this._root();
                // For stability reasons, convert parameter to promise no matter what type is passed to waitFor().
                // (We must be able to call .then() on it.)
                promise = Promise$1.resolve(promise);
                if (root._waitingFor) {
                    // Already called waitFor(). Wait for both to complete.
                    root._waitingFor = root._waitingFor.then(function () { return promise; });
                }
                else {
                    // We're not in waiting state. Start waiting state.
                    root._waitingFor = promise;
                    root._waitingQueue = [];
                    // Start interacting with indexedDB until promise completes:
                    var store = root.idbtrans.objectStore(root.storeNames[0]);
                    (function spin() {
                        ++root._spinCount; // For debugging only
                        while (root._waitingQueue.length)
                            (root._waitingQueue.shift())();
                        if (root._waitingFor)
                            store.get(-Infinity).onsuccess = spin;
                    }());
                }
                var currentWaitPromise = root._waitingFor;
                return new Promise$1(function (resolve, reject) {
                    promise.then(function (res) { return root._waitingQueue.push(wrap(resolve.bind(null, res))); }, function (err) { return root._waitingQueue.push(wrap(reject.bind(null, err))); }).finally(function () {
                        if (root._waitingFor === currentWaitPromise) {
                            // No one added a wait after us. Safe to stop the spinning.
                            root._waitingFor = null;
                        }
                    });
                });
            },
            //
            // Transaction Public Properties and Methods
            //
            abort: function () {
                this.active && this._reject(new exceptions.Abort());
                this.active = false;
            },
            tables: {
                get: deprecated("Transaction.tables", function () { return allTables; })
            },
            table: function (name) {
                var table = db.table(name); // Don't check that table is part of transaction. It must fail lazily!
                return new Table(name, table.schema, this);
            }
        });
        //
        //
        //
        // WhereClause
        //
        //
        //
        function WhereClause(table, index, orCollection) {
            /// <param name="table" type="Table"></param>
            /// <param name="index" type="String" optional="true"></param>
            /// <param name="orCollection" type="Collection" optional="true"></param>
            this._ctx = {
                table: table,
                index: index === ":id" ? null : index,
                or: orCollection
            };
        }
        props(WhereClause.prototype, function () {
            // WhereClause private methods
            function fail(collectionOrWhereClause, err, T) {
                var collection = collectionOrWhereClause instanceof WhereClause ?
                    new Collection(collectionOrWhereClause) :
                    collectionOrWhereClause;
                collection._ctx.error = T ? new T(err) : new TypeError(err);
                return collection;
            }
            function emptyCollection(whereClause) {
                return new Collection(whereClause, function () { return IDBKeyRange.only(""); }).limit(0);
            }
            function upperFactory(dir) {
                return dir === "next" ? function (s) { return s.toUpperCase(); } : function (s) { return s.toLowerCase(); };
            }
            function lowerFactory(dir) {
                return dir === "next" ? function (s) { return s.toLowerCase(); } : function (s) { return s.toUpperCase(); };
            }
            function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
                var length = Math.min(key.length, lowerNeedle.length);
                var llp = -1;
                for (var i = 0; i < length; ++i) {
                    var lwrKeyChar = lowerKey[i];
                    if (lwrKeyChar !== lowerNeedle[i]) {
                        if (cmp(key[i], upperNeedle[i]) < 0)
                            return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
                        if (cmp(key[i], lowerNeedle[i]) < 0)
                            return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
                        if (llp >= 0)
                            return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
                        return null;
                    }
                    if (cmp(key[i], lwrKeyChar) < 0)
                        llp = i;
                }
                if (length < lowerNeedle.length && dir === "next")
                    return key + upperNeedle.substr(key.length);
                if (length < key.length && dir === "prev")
                    return key.substr(0, upperNeedle.length);
                return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
            }
            function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
                /// <param name="needles" type="Array" elementType="String"></param>
                var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
                if (!needles.every(function (s) { return typeof s === 'string'; })) {
                    return fail(whereClause, STRING_EXPECTED);
                }
                function initDirection(dir) {
                    upper = upperFactory(dir);
                    lower = lowerFactory(dir);
                    compare = (dir === "next" ? simpleCompare : simpleCompareReverse);
                    var needleBounds = needles.map(function (needle) {
                        return { lower: lower(needle), upper: upper(needle) };
                    }).sort(function (a, b) {
                        return compare(a.lower, b.lower);
                    });
                    upperNeedles = needleBounds.map(function (nb) { return nb.upper; });
                    lowerNeedles = needleBounds.map(function (nb) { return nb.lower; });
                    direction = dir;
                    nextKeySuffix = (dir === "next" ? "" : suffix);
                }
                initDirection("next");
                var c = new Collection(whereClause, function () {
                    return IDBKeyRange.bound(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
                });
                c._ondirectionchange = function (direction) {
                    // This event onlys occur before filter is called the first time.
                    initDirection(direction);
                };
                var firstPossibleNeedle = 0;
                c._addAlgorithm(function (cursor, advance, resolve) {
                    /// <param name="cursor" type="IDBCursor"></param>
                    /// <param name="advance" type="Function"></param>
                    /// <param name="resolve" type="Function"></param>
                    var key = cursor.key;
                    if (typeof key !== 'string')
                        return false;
                    var lowerKey = lower(key);
                    if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
                        return true;
                    }
                    else {
                        var lowestPossibleCasing = null;
                        for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
                            var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
                            if (casing === null && lowestPossibleCasing === null)
                                firstPossibleNeedle = i + 1;
                            else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                                lowestPossibleCasing = casing;
                            }
                        }
                        if (lowestPossibleCasing !== null) {
                            advance(function () { cursor.continue(lowestPossibleCasing + nextKeySuffix); });
                        }
                        else {
                            advance(resolve);
                        }
                        return false;
                    }
                });
                return c;
            }
            //
            // WhereClause public methods
            //
            return {
                between: function (lower, upper, includeLower, includeUpper) {
                    /// <summary>
                    ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
                    /// </summary>
                    /// <param name="lower"></param>
                    /// <param name="upper"></param>
                    /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
                    /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
                    /// <returns type="Collection"></returns>
                    includeLower = includeLower !== false; // Default to true
                    includeUpper = includeUpper === true; // Default to false
                    try {
                        if ((cmp(lower, upper) > 0) ||
                            (cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)))
                            return emptyCollection(this); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
                        return new Collection(this, function () { return IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper); });
                    }
                    catch (e) {
                        return fail(this, INVALID_KEY_ARGUMENT);
                    }
                },
                equals: function (value) {
                    return new Collection(this, function () { return IDBKeyRange.only(value); });
                },
                above: function (value) {
                    return new Collection(this, function () { return IDBKeyRange.lowerBound(value, true); });
                },
                aboveOrEqual: function (value) {
                    return new Collection(this, function () { return IDBKeyRange.lowerBound(value); });
                },
                below: function (value) {
                    return new Collection(this, function () { return IDBKeyRange.upperBound(value, true); });
                },
                belowOrEqual: function (value) {
                    return new Collection(this, function () { return IDBKeyRange.upperBound(value); });
                },
                startsWith: function (str) {
                    /// <param name="str" type="String"></param>
                    if (typeof str !== 'string')
                        return fail(this, STRING_EXPECTED);
                    return this.between(str, str + maxString, true, true);
                },
                startsWithIgnoreCase: function (str) {
                    /// <param name="str" type="String"></param>
                    if (str === "")
                        return this.startsWith(str);
                    return addIgnoreCaseAlgorithm(this, function (x, a) { return x.indexOf(a[0]) === 0; }, [str], maxString);
                },
                equalsIgnoreCase: function (str) {
                    /// <param name="str" type="String"></param>
                    return addIgnoreCaseAlgorithm(this, function (x, a) { return x === a[0]; }, [str], "");
                },
                anyOfIgnoreCase: function () {
                    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                    if (set.length === 0)
                        return emptyCollection(this);
                    return addIgnoreCaseAlgorithm(this, function (x, a) { return a.indexOf(x) !== -1; }, set, "");
                },
                startsWithAnyOfIgnoreCase: function () {
                    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                    if (set.length === 0)
                        return emptyCollection(this);
                    return addIgnoreCaseAlgorithm(this, function (x, a) {
                        return a.some(function (n) {
                            return x.indexOf(n) === 0;
                        });
                    }, set, maxString);
                },
                anyOf: function () {
                    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                    var compare = ascending;
                    try {
                        set.sort(compare);
                    }
                    catch (e) {
                        return fail(this, INVALID_KEY_ARGUMENT);
                    }
                    if (set.length === 0)
                        return emptyCollection(this);
                    var c = new Collection(this, function () { return IDBKeyRange.bound(set[0], set[set.length - 1]); });
                    c._ondirectionchange = function (direction) {
                        compare = (direction === "next" ? ascending : descending);
                        set.sort(compare);
                    };
                    var i = 0;
                    c._addAlgorithm(function (cursor, advance, resolve) {
                        var key = cursor.key;
                        while (compare(key, set[i]) > 0) {
                            // The cursor has passed beyond this key. Check next.
                            ++i;
                            if (i === set.length) {
                                // There is no next. Stop searching.
                                advance(resolve);
                                return false;
                            }
                        }
                        if (compare(key, set[i]) === 0) {
                            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                            return true;
                        }
                        else {
                            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                            advance(function () { cursor.continue(set[i]); });
                            return false;
                        }
                    });
                    return c;
                },
                notEqual: function (value) {
                    return this.inAnyRange([[minKey, value], [value, maxKey]], { includeLowers: false, includeUppers: false });
                },
                noneOf: function () {
                    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                    if (set.length === 0)
                        return new Collection(this); // Return entire collection.
                    try {
                        set.sort(ascending);
                    }
                    catch (e) {
                        return fail(this, INVALID_KEY_ARGUMENT);
                    }
                    // Transform ["a","b","c"] to a set of ranges for between/above/below: [[minKey,"a"], ["a","b"], ["b","c"], ["c",maxKey]]
                    var ranges = set.reduce(function (res, val) { return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]]; }, null);
                    ranges.push([set[set.length - 1], maxKey]);
                    return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
                },
                /** Filter out values withing given set of ranges.
                * Example, give children and elders a rebate of 50%:
                *
                *   db.friends.where('age').inAnyRange([[0,18],[65,Infinity]]).modify({Rebate: 1/2});
                *
                * @param {(string|number|Date|Array)[][]} ranges
                * @param {{includeLowers: boolean, includeUppers: boolean}} options
                */
                inAnyRange: function (ranges, options) {
                    if (ranges.length === 0)
                        return emptyCollection(this);
                    if (!ranges.every(function (range) { return range[0] !== undefined && range[1] !== undefined && ascending(range[0], range[1]) <= 0; })) {
                        return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
                    }
                    var includeLowers = !options || options.includeLowers !== false; // Default to true
                    var includeUppers = options && options.includeUppers === true; // Default to false
                    function addRange(ranges, newRange) {
                        for (var i = 0, l = ranges.length; i < l; ++i) {
                            var range = ranges[i];
                            if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
                                range[0] = min(range[0], newRange[0]);
                                range[1] = max(range[1], newRange[1]);
                                break;
                            }
                        }
                        if (i === l)
                            ranges.push(newRange);
                        return ranges;
                    }
                    var sortDirection = ascending;
                    function rangeSorter(a, b) { return sortDirection(a[0], b[0]); }
                    // Join overlapping ranges
                    var set;
                    try {
                        set = ranges.reduce(addRange, []);
                        set.sort(rangeSorter);
                    }
                    catch (ex) {
                        return fail(this, INVALID_KEY_ARGUMENT);
                    }
                    var i = 0;
                    var keyIsBeyondCurrentEntry = includeUppers ?
                        function (key) { return ascending(key, set[i][1]) > 0; } :
                        function (key) { return ascending(key, set[i][1]) >= 0; };
                    var keyIsBeforeCurrentEntry = includeLowers ?
                        function (key) { return descending(key, set[i][0]) > 0; } :
                        function (key) { return descending(key, set[i][0]) >= 0; };
                    function keyWithinCurrentRange(key) {
                        return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
                    }
                    var checkKey = keyIsBeyondCurrentEntry;
                    var c = new Collection(this, function () {
                        return IDBKeyRange.bound(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
                    });
                    c._ondirectionchange = function (direction) {
                        if (direction === "next") {
                            checkKey = keyIsBeyondCurrentEntry;
                            sortDirection = ascending;
                        }
                        else {
                            checkKey = keyIsBeforeCurrentEntry;
                            sortDirection = descending;
                        }
                        set.sort(rangeSorter);
                    };
                    c._addAlgorithm(function (cursor, advance, resolve) {
                        var key = cursor.key;
                        while (checkKey(key)) {
                            // The cursor has passed beyond this key. Check next.
                            ++i;
                            if (i === set.length) {
                                // There is no next. Stop searching.
                                advance(resolve);
                                return false;
                            }
                        }
                        if (keyWithinCurrentRange(key)) {
                            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                            return true;
                        }
                        else if (cmp(key, set[i][1]) === 0 || cmp(key, set[i][0]) === 0) {
                            // includeUpper or includeLower is false so keyWithinCurrentRange() returns false even though we are at range border.
                            // Continue to next key but don't include this one.
                            return false;
                        }
                        else {
                            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                            advance(function () {
                                if (sortDirection === ascending)
                                    cursor.continue(set[i][0]);
                                else
                                    cursor.continue(set[i][1]);
                            });
                            return false;
                        }
                    });
                    return c;
                },
                startsWithAnyOf: function () {
                    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                    if (!set.every(function (s) { return typeof s === 'string'; })) {
                        return fail(this, "startsWithAnyOf() only works with strings");
                    }
                    if (set.length === 0)
                        return emptyCollection(this);
                    return this.inAnyRange(set.map(function (str) {
                        return [str, str + maxString];
                    }));
                }
            };
        });
        //
        //
        //
        // Collection Class
        //
        //
        //
        function Collection(whereClause, keyRangeGenerator) {
            /// <summary>
            ///
            /// </summary>
            /// <param name="whereClause" type="WhereClause">Where clause instance</param>
            /// <param name="keyRangeGenerator" value="function(){ return IDBKeyRange.bound(0,1);}" optional="true"></param>
            var keyRange = null, error = null;
            if (keyRangeGenerator)
                try {
                    keyRange = keyRangeGenerator();
                }
                catch (ex) {
                    error = ex;
                }
            var whereCtx = whereClause._ctx, table = whereCtx.table;
            this._ctx = {
                table: table,
                index: whereCtx.index,
                isPrimKey: (!whereCtx.index || (table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name)),
                range: keyRange,
                keysOnly: false,
                dir: "next",
                unique: "",
                algorithm: null,
                filter: null,
                replayFilter: null,
                justLimit: true,
                isMatch: null,
                offset: 0,
                limit: Infinity,
                error: error,
                or: whereCtx.or,
                valueMapper: table.hook.reading.fire
            };
        }
        function isPlainKeyRange(ctx, ignoreLimitFilter) {
            return !(ctx.filter || ctx.algorithm || ctx.or) &&
                (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
        }
        props(Collection.prototype, function () {
            //
            // Collection Private Functions
            //
            function addFilter(ctx, fn) {
                ctx.filter = combine(ctx.filter, fn);
            }
            function addReplayFilter(ctx, factory, isLimitFilter) {
                var curr = ctx.replayFilter;
                ctx.replayFilter = curr ? function () { return combine(curr(), factory()); } : factory;
                ctx.justLimit = isLimitFilter && !curr;
            }
            function addMatchFilter(ctx, fn) {
                ctx.isMatch = combine(ctx.isMatch, fn);
            }
            /** @param ctx {
             *      isPrimKey: boolean,
             *      table: Table,
             *      index: string
             * }
             * @param store IDBObjectStore
             **/
            function getIndexOrStore(ctx, store) {
                if (ctx.isPrimKey)
                    return store;
                var indexSpec = ctx.table.schema.idxByName[ctx.index];
                if (!indexSpec)
                    throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
                return store.index(indexSpec.name);
            }
            /** @param ctx {
             *      isPrimKey: boolean,
             *      table: Table,
             *      index: string,
             *      keysOnly: boolean,
             *      range?: IDBKeyRange,
             *      dir: "next" | "prev"
             * }
             */
            function openCursor(ctx, store) {
                var idxOrStore = getIndexOrStore(ctx, store);
                return ctx.keysOnly && 'openKeyCursor' in idxOrStore ?
                    idxOrStore.openKeyCursor(ctx.range || null, ctx.dir + ctx.unique) :
                    idxOrStore.openCursor(ctx.range || null, ctx.dir + ctx.unique);
            }
            function iter(ctx, fn, resolve, reject, idbstore) {
                var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
                if (!ctx.or) {
                    iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, filter), fn, resolve, reject, !ctx.keysOnly && ctx.valueMapper);
                }
                else
                    (function () {
                        var set = {};
                        var resolved = 0;
                        function resolveboth() {
                            if (++resolved === 2)
                                resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
                        }
                        function union(item, cursor, advance) {
                            if (!filter || filter(cursor, advance, resolveboth, reject)) {
                                var primaryKey = cursor.primaryKey;
                                var key = '' + primaryKey;
                                if (key === '[object ArrayBuffer]')
                                    key = '' + new Uint8Array(primaryKey);
                                if (!hasOwn(set, key)) {
                                    set[key] = true;
                                    fn(item, cursor, advance);
                                }
                            }
                        }
                        ctx.or._iterate(union, resolveboth, reject, idbstore);
                        iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, !ctx.keysOnly && ctx.valueMapper);
                    })();
            }
            return {
                //
                // Collection Protected Functions
                //
                _read: function (fn, cb) {
                    var ctx = this._ctx;
                    return ctx.error ?
                        ctx.table._trans(null, rejection.bind(null, ctx.error)) :
                        ctx.table._idbstore(READONLY, fn).then(cb);
                },
                _write: function (fn) {
                    var ctx = this._ctx;
                    return ctx.error ?
                        ctx.table._trans(null, rejection.bind(null, ctx.error)) :
                        ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
                },
                _addAlgorithm: function (fn) {
                    var ctx = this._ctx;
                    ctx.algorithm = combine(ctx.algorithm, fn);
                },
                _iterate: function (fn, resolve, reject, idbstore) {
                    return iter(this._ctx, fn, resolve, reject, idbstore);
                },
                clone: function (props$$1) {
                    var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
                    if (props$$1)
                        extend(ctx, props$$1);
                    rv._ctx = ctx;
                    return rv;
                },
                raw: function () {
                    this._ctx.valueMapper = null;
                    return this;
                },
                //
                // Collection Public methods
                //
                each: function (fn) {
                    var ctx = this._ctx;
                    return this._read(function (resolve, reject, idbstore) {
                        iter(ctx, fn, resolve, reject, idbstore);
                    });
                },
                count: function (cb) {
                    var ctx = this._ctx;
                    if (isPlainKeyRange(ctx, true)) {
                        // This is a plain key range. We can use the count() method if the index.
                        return this._read(function (resolve, reject, idbstore) {
                            var idx = getIndexOrStore(ctx, idbstore);
                            var req = (ctx.range ? idx.count(ctx.range) : idx.count());
                            req.onerror = eventRejectHandler(reject);
                            req.onsuccess = function (e) {
                                resolve(Math.min(e.target.result, ctx.limit));
                            };
                        }, cb);
                    }
                    else {
                        // Algorithms, filters or expressions are applied. Need to count manually.
                        var count = 0;
                        return this._read(function (resolve, reject, idbstore) {
                            iter(ctx, function () { ++count; return false; }, function () { resolve(count); }, reject, idbstore);
                        }, cb);
                    }
                },
                sortBy: function (keyPath, cb) {
                    /// <param name="keyPath" type="String"></param>
                    var parts = keyPath.split('.').reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
                    function getval(obj, i) {
                        if (i)
                            return getval(obj[parts[i]], i - 1);
                        return obj[lastPart];
                    }
                    var order = this._ctx.dir === "next" ? 1 : -1;
                    function sorter(a, b) {
                        var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
                        return aVal < bVal ? -order : aVal > bVal ? order : 0;
                    }
                    return this.toArray(function (a) {
                        return a.sort(sorter);
                    }).then(cb);
                },
                toArray: function (cb) {
                    var ctx = this._ctx;
                    return this._read(function (resolve, reject, idbstore) {
                        if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                            // Special optimation if we could use IDBObjectStore.getAll() or
                            // IDBKeyRange.getAll():
                            var readingHook = ctx.table.hook.reading.fire;
                            var idxOrStore = getIndexOrStore(ctx, idbstore);
                            var req = ctx.limit < Infinity ?
                                idxOrStore.getAll(ctx.range, ctx.limit) :
                                idxOrStore.getAll(ctx.range);
                            req.onerror = eventRejectHandler(reject);
                            req.onsuccess = readingHook === mirror ?
                                eventSuccessHandler(resolve) :
                                eventSuccessHandler(function (res) {
                                    try {
                                        resolve(res.map(readingHook));
                                    }
                                    catch (e) {
                                        reject(e);
                                    }
                                });
                        }
                        else {
                            // Getting array through a cursor.
                            var a = [];
                            iter(ctx, function (item) { a.push(item); }, function arrayComplete() {
                                resolve(a);
                            }, reject, idbstore);
                        }
                    }, cb);
                },
                offset: function (offset) {
                    var ctx = this._ctx;
                    if (offset <= 0)
                        return this;
                    ctx.offset += offset; // For count()
                    if (isPlainKeyRange(ctx)) {
                        addReplayFilter(ctx, function () {
                            var offsetLeft = offset;
                            return function (cursor, advance) {
                                if (offsetLeft === 0)
                                    return true;
                                if (offsetLeft === 1) {
                                    --offsetLeft;
                                    return false;
                                }
                                advance(function () {
                                    cursor.advance(offsetLeft);
                                    offsetLeft = 0;
                                });
                                return false;
                            };
                        });
                    }
                    else {
                        addReplayFilter(ctx, function () {
                            var offsetLeft = offset;
                            return function () { return (--offsetLeft < 0); };
                        });
                    }
                    return this;
                },
                limit: function (numRows) {
                    this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
                    addReplayFilter(this._ctx, function () {
                        var rowsLeft = numRows;
                        return function (cursor, advance, resolve) {
                            if (--rowsLeft <= 0)
                                advance(resolve); // Stop after this item has been included
                            return rowsLeft >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
                        };
                    }, true);
                    return this;
                },
                until: function (filterFunction, bIncludeStopEntry) {
                    addFilter(this._ctx, function (cursor, advance, resolve) {
                        if (filterFunction(cursor.value)) {
                            advance(resolve);
                            return bIncludeStopEntry;
                        }
                        else {
                            return true;
                        }
                    });
                    return this;
                },
                first: function (cb) {
                    return this.limit(1).toArray(function (a) { return a[0]; }).then(cb);
                },
                last: function (cb) {
                    return this.reverse().first(cb);
                },
                filter: function (filterFunction) {
                    /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
                    addFilter(this._ctx, function (cursor) {
                        return filterFunction(cursor.value);
                    });
                    // match filters not used in Dexie.js but can be used by 3rd part libraries to test a
                    // collection for a match without querying DB. Used by Dexie.Observable.
                    addMatchFilter(this._ctx, filterFunction);
                    return this;
                },
                and: function (filterFunction) {
                    return this.filter(filterFunction);
                },
                or: function (indexName) {
                    return new WhereClause(this._ctx.table, indexName, this);
                },
                reverse: function () {
                    this._ctx.dir = (this._ctx.dir === "prev" ? "next" : "prev");
                    if (this._ondirectionchange)
                        this._ondirectionchange(this._ctx.dir);
                    return this;
                },
                desc: function () {
                    return this.reverse();
                },
                eachKey: function (cb) {
                    var ctx = this._ctx;
                    ctx.keysOnly = !ctx.isMatch;
                    return this.each(function (val, cursor) { cb(cursor.key, cursor); });
                },
                eachUniqueKey: function (cb) {
                    this._ctx.unique = "unique";
                    return this.eachKey(cb);
                },
                eachPrimaryKey: function (cb) {
                    var ctx = this._ctx;
                    ctx.keysOnly = !ctx.isMatch;
                    return this.each(function (val, cursor) { cb(cursor.primaryKey, cursor); });
                },
                keys: function (cb) {
                    var ctx = this._ctx;
                    ctx.keysOnly = !ctx.isMatch;
                    var a = [];
                    return this.each(function (item, cursor) {
                        a.push(cursor.key);
                    }).then(function () {
                        return a;
                    }).then(cb);
                },
                primaryKeys: function (cb) {
                    var ctx = this._ctx;
                    if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                        // Special optimation if we could use IDBObjectStore.getAllKeys() or
                        // IDBKeyRange.getAllKeys():
                        return this._read(function (resolve, reject, idbstore) {
                            var idxOrStore = getIndexOrStore(ctx, idbstore);
                            var req = ctx.limit < Infinity ?
                                idxOrStore.getAllKeys(ctx.range, ctx.limit) :
                                idxOrStore.getAllKeys(ctx.range);
                            req.onerror = eventRejectHandler(reject);
                            req.onsuccess = eventSuccessHandler(resolve);
                        }).then(cb);
                    }
                    ctx.keysOnly = !ctx.isMatch;
                    var a = [];
                    return this.each(function (item, cursor) {
                        a.push(cursor.primaryKey);
                    }).then(function () {
                        return a;
                    }).then(cb);
                },
                uniqueKeys: function (cb) {
                    this._ctx.unique = "unique";
                    return this.keys(cb);
                },
                firstKey: function (cb) {
                    return this.limit(1).keys(function (a) { return a[0]; }).then(cb);
                },
                lastKey: function (cb) {
                    return this.reverse().firstKey(cb);
                },
                distinct: function () {
                    var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
                    if (!idx || !idx.multi)
                        return this; // distinct() only makes differencies on multiEntry indexes.
                    var set = {};
                    addFilter(this._ctx, function (cursor) {
                        var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                        var found = hasOwn(set, strKey);
                        set[strKey] = true;
                        return !found;
                    });
                    return this;
                },
                //
                // Methods that mutate storage
                //
                modify: function (changes) {
                    var self = this, ctx = this._ctx, hook = ctx.table.hook, updatingHook = hook.updating.fire, deletingHook = hook.deleting.fire;
                    return this._write(function (resolve, reject, idbstore, trans) {
                        var modifyer;
                        if (typeof changes === 'function') {
                            // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
                            if (updatingHook === nop && deletingHook === nop) {
                                // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
                                modifyer = changes;
                            }
                            else {
                                // People want to know exactly what is being modified or deleted.
                                // Let modifyer be a proxy function that finds out what changes the caller is actually doing
                                // and call the hooks accordingly!
                                modifyer = function (item) {
                                    var origItem = deepClone(item); // Clone the item first so we can compare laters.
                                    if (changes.call(this, item, this) === false)
                                        return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)
                                    if (!hasOwn(this, "value")) {
                                        // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
                                        deletingHook.call(this, this.primKey, item, trans);
                                    }
                                    else {
                                        // No deletion. Check what was changed
                                        var objectDiff = getObjectDiff(origItem, this.value);
                                        var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);
                                        if (additionalChanges) {
                                            // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
                                            item = this.value;
                                            keys(additionalChanges).forEach(function (keyPath) {
                                                setByKeyPath(item, keyPath, additionalChanges[keyPath]); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                            });
                                        }
                                    }
                                };
                            }
                        }
                        else if (updatingHook === nop) {
                            // changes is a set of {keyPath: value} and no one is listening to the updating hook.
                            var keyPaths = keys(changes);
                            var numKeys = keyPaths.length;
                            modifyer = function (item) {
                                var anythingModified = false;
                                for (var i = 0; i < numKeys; ++i) {
                                    var keyPath = keyPaths[i], val = changes[keyPath];
                                    if (getByKeyPath(item, keyPath) !== val) {
                                        setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                        anythingModified = true;
                                    }
                                }
                                return anythingModified;
                            };
                        }
                        else {
                            // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
                            // allow it to add additional modifications to make.
                            var origChanges = changes;
                            changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.
                            modifyer = function (item) {
                                var anythingModified = false;
                                var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
                                if (additionalChanges)
                                    extend(changes, additionalChanges);
                                keys(changes).forEach(function (keyPath) {
                                    var val = changes[keyPath];
                                    if (getByKeyPath(item, keyPath) !== val) {
                                        setByKeyPath(item, keyPath, val);
                                        anythingModified = true;
                                    }
                                });
                                if (additionalChanges)
                                    changes = shallowClone(origChanges); // Restore original changes for next iteration
                                return anythingModified;
                            };
                        }
                        var count = 0;
                        var successCount = 0;
                        var iterationComplete = false;
                        var failures = [];
                        var failKeys = [];
                        var currentKey = null;
                        function modifyItem(item, cursor) {
                            currentKey = cursor.primaryKey;
                            var thisContext = {
                                primKey: cursor.primaryKey,
                                value: item,
                                onsuccess: null,
                                onerror: null
                            };
                            function onerror(e) {
                                failures.push(e);
                                failKeys.push(thisContext.primKey);
                                checkFinished();
                                return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
                            }
                            if (modifyer.call(thisContext, item, thisContext) !== false) {
                                var bDelete = !hasOwn(thisContext, "value");
                                ++count;
                                tryCatch(function () {
                                    var req = (bDelete ? cursor.delete() : cursor.update(thisContext.value));
                                    req._hookCtx = thisContext;
                                    req.onerror = hookedEventRejectHandler(onerror);
                                    req.onsuccess = hookedEventSuccessHandler(function () {
                                        ++successCount;
                                        checkFinished();
                                    });
                                }, onerror);
                            }
                            else if (thisContext.onsuccess) {
                                // Hook will expect either onerror or onsuccess to always be called!
                                thisContext.onsuccess(thisContext.value);
                            }
                        }
                        function doReject(e) {
                            if (e) {
                                failures.push(e);
                                failKeys.push(currentKey);
                            }
                            return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
                        }
                        function checkFinished() {
                            if (iterationComplete && successCount + failures.length === count) {
                                if (failures.length > 0)
                                    doReject();
                                else
                                    resolve(successCount);
                            }
                        }
                        self.clone().raw()._iterate(modifyItem, function () {
                            iterationComplete = true;
                            checkFinished();
                        }, doReject, idbstore);
                    });
                },
                'delete': function () {
                    var _this = this;
                    var ctx = this._ctx, range = ctx.range, deletingHook = ctx.table.hook.deleting.fire, hasDeleteHook = deletingHook !== nop;
                    if (!hasDeleteHook &&
                        isPlainKeyRange(ctx) &&
                        ((ctx.isPrimKey && !hangsOnDeleteLargeKeyRange) || !range)) {
                        // May use IDBObjectStore.delete(IDBKeyRange) in this case (Issue #208)
                        // For chromium, this is the way most optimized version.
                        // For IE/Edge, this could hang the indexedDB engine and make operating system instable
                        // (https://gist.github.com/dfahlander/5a39328f029de18222cf2125d56c38f7)
                        return this._write(function (resolve, reject, idbstore) {
                            // Our API contract is to return a count of deleted items, so we have to count() before delete().
                            var onerror = eventRejectHandler(reject), countReq = (range ? idbstore.count(range) : idbstore.count());
                            countReq.onerror = onerror;
                            countReq.onsuccess = function () {
                                var count = countReq.result;
                                tryCatch(function () {
                                    var delReq = (range ? idbstore.delete(range) : idbstore.clear());
                                    delReq.onerror = onerror;
                                    delReq.onsuccess = function () { return resolve(count); };
                                }, function (err) { return reject(err); });
                            };
                        });
                    }
                    // Default version to use when collection is not a vanilla IDBKeyRange on the primary key.
                    // Divide into chunks to not starve RAM.
                    // If has delete hook, we will have to collect not just keys but also objects, so it will use
                    // more memory and need lower chunk size.
                    var CHUNKSIZE = hasDeleteHook ? 2000 : 10000;
                    return this._write(function (resolve, reject, idbstore, trans) {
                        var totalCount = 0;
                        // Clone collection and change its table and set a limit of CHUNKSIZE on the cloned Collection instance.
                        var collection = _this
                            .clone({
                            keysOnly: !ctx.isMatch && !hasDeleteHook
                        }) // load just keys (unless filter() or and() or deleteHook has subscribers)
                            .distinct() // In case multiEntry is used, never delete same key twice because resulting count
                            .limit(CHUNKSIZE)
                            .raw(); // Don't filter through reading-hooks (like mapped classes etc)
                        var keysOrTuples = [];
                        // We're gonna do things on as many chunks that are needed.
                        // Use recursion of nextChunk function:
                        var nextChunk = function () { return collection.each(hasDeleteHook ? function (val, cursor) {
                            // Somebody subscribes to hook('deleting'). Collect all primary keys and their values,
                            // so that the hook can be called with its values in bulkDelete().
                            keysOrTuples.push([cursor.primaryKey, cursor.value]);
                        } : function (val, cursor) {
                            // No one subscribes to hook('deleting'). Collect only primary keys:
                            keysOrTuples.push(cursor.primaryKey);
                        }).then(function () {
                            // Chromium deletes faster when doing it in sort order.
                            hasDeleteHook ?
                                keysOrTuples.sort(function (a, b) { return ascending(a[0], b[0]); }) :
                                keysOrTuples.sort(ascending);
                            return bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook);
                        }).then(function () {
                            var count = keysOrTuples.length;
                            totalCount += count;
                            keysOrTuples = [];
                            return count < CHUNKSIZE ? totalCount : nextChunk();
                        }); };
                        resolve(nextChunk());
                    });
                }
            };
        });
        //
        //
        //
        // ------------------------- Help functions ---------------------------
        //
        //
        //
        function lowerVersionFirst(a, b) {
            return a._cfg.version - b._cfg.version;
        }
        function setApiOnPlace(objs, tableNames, dbschema) {
            tableNames.forEach(function (tableName) {
                var schema = dbschema[tableName];
                objs.forEach(function (obj) {
                    if (!(tableName in obj)) {
                        if (obj === Transaction.prototype || obj instanceof Transaction) {
                            // obj is a Transaction prototype (or prototype of a subclass to Transaction)
                            // Make the API a getter that returns this.table(tableName)
                            setProp(obj, tableName, { get: function () { return this.table(tableName); } });
                        }
                        else {
                            // Table will not be bound to a transaction (will use Dexie.currentTransaction)
                            obj[tableName] = new Table(tableName, schema);
                        }
                    }
                });
            });
        }
        function removeTablesApi(objs) {
            objs.forEach(function (obj) {
                for (var key in obj) {
                    if (obj[key] instanceof Table)
                        delete obj[key];
                }
            });
        }
        function iterate(req, filter, fn, resolve, reject, valueMapper) {
            // Apply valueMapper (hook('reading') or mappped class)
            var mappedFn = valueMapper ? function (x, c, a) { return fn(valueMapper(x), c, a); } : fn;
            // Wrap fn with PSD and microtick stuff from Promise.
            var wrappedFn = wrap(mappedFn, reject);
            if (!req.onerror)
                req.onerror = eventRejectHandler(reject);
            if (filter) {
                req.onsuccess = trycatcher(function filter_record() {
                    var cursor = req.result;
                    if (cursor) {
                        var c = function () { cursor.continue(); };
                        if (filter(cursor, function (advancer) { c = advancer; }, resolve, reject))
                            wrappedFn(cursor.value, cursor, function (advancer) { c = advancer; });
                        c();
                    }
                    else {
                        resolve();
                    }
                }, reject);
            }
            else {
                req.onsuccess = trycatcher(function filter_record() {
                    var cursor = req.result;
                    if (cursor) {
                        var c = function () { cursor.continue(); };
                        wrappedFn(cursor.value, cursor, function (advancer) { c = advancer; });
                        c();
                    }
                    else {
                        resolve();
                    }
                }, reject);
            }
        }
        function parseIndexSyntax(indexes) {
            /// <param name="indexes" type="String"></param>
            /// <returns type="Array" elementType="IndexSpec"></returns>
            var rv = [];
            indexes.split(',').forEach(function (index) {
                index = index.trim();
                var name = index.replace(/([&*]|\+\+)/g, ""); // Remove "&", "++" and "*"
                // Let keyPath of "[a+b]" be ["a","b"]:
                var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;
                rv.push(new IndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), /\./.test(index)));
            });
            return rv;
        }
        function cmp(key1, key2) {
            return indexedDB.cmp(key1, key2);
        }
        function min(a, b) {
            return cmp(a, b) < 0 ? a : b;
        }
        function max(a, b) {
            return cmp(a, b) > 0 ? a : b;
        }
        function ascending(a, b) {
            return indexedDB.cmp(a, b);
        }
        function descending(a, b) {
            return indexedDB.cmp(b, a);
        }
        function simpleCompare(a, b) {
            return a < b ? -1 : a === b ? 0 : 1;
        }
        function simpleCompareReverse(a, b) {
            return a > b ? -1 : a === b ? 0 : 1;
        }
        function combine(filter1, filter2) {
            return filter1 ?
                filter2 ?
                    function () { return filter1.apply(this, arguments) && filter2.apply(this, arguments); } :
                    filter1 :
                filter2;
        }
        function readGlobalSchema() {
            db.verno = idbdb.version / 10;
            db._dbSchema = globalSchema = {};
            dbStoreNames = slice(idbdb.objectStoreNames, 0);
            if (dbStoreNames.length === 0)
                return; // Database contains no stores.
            var trans = idbdb.transaction(safariMultiStoreFix(dbStoreNames), 'readonly');
            dbStoreNames.forEach(function (storeName) {
                var store = trans.objectStore(storeName), keyPath = store.keyPath, dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
                var primKey = new IndexSpec(keyPath, keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== 'string', dotted);
                var indexes = [];
                for (var j = 0; j < store.indexNames.length; ++j) {
                    var idbindex = store.index(store.indexNames[j]);
                    keyPath = idbindex.keyPath;
                    dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
                    var index = new IndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== 'string', dotted);
                    indexes.push(index);
                }
                globalSchema[storeName] = new TableSchema(storeName, primKey, indexes, {});
            });
            setApiOnPlace([allTables], keys(globalSchema), globalSchema);
        }
        function adjustToExistingIndexNames(schema, idbtrans) {
            /// <summary>
            /// Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
            /// </summary>
            /// <param name="schema" type="Object">Map between name and TableSchema</param>
            /// <param name="idbtrans" type="IDBTransaction"></param>
            var storeNames = idbtrans.db.objectStoreNames;
            for (var i = 0; i < storeNames.length; ++i) {
                var storeName = storeNames[i];
                var store = idbtrans.objectStore(storeName);
                hasGetAll = 'getAll' in store;
                for (var j = 0; j < store.indexNames.length; ++j) {
                    var indexName = store.indexNames[j];
                    var keyPath = store.index(indexName).keyPath;
                    var dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
                    if (schema[storeName]) {
                        var indexSpec = schema[storeName].idxByName[dexieName];
                        if (indexSpec)
                            indexSpec.name = indexName;
                    }
                }
            }
            // Bug with getAll() on Safari ver<604 on Workers only, see discussion following PR #579
            if (/Safari/.test(navigator.userAgent) &&
                !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
                _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope &&
                [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
                hasGetAll = false;
            }
        }
        function fireOnBlocked(ev) {
            db.on("blocked").fire(ev);
            // Workaround (not fully*) for missing "versionchange" event in IE,Edge and Safari:
            connections
                .filter(function (c) { return c.name === db.name && c !== db && !c._vcFired; })
                .map(function (c) { return c.on("versionchange").fire(ev); });
        }
        extend(this, {
            Collection: Collection,
            Table: Table,
            Transaction: Transaction,
            Version: Version,
            WhereClause: WhereClause
        });
        init();
        addons.forEach(function (fn) {
            fn(db);
        });
    }
    function parseType(type) {
        if (typeof type === 'function') {
            return new type();
        }
        else if (isArray(type)) {
            return [parseType(type[0])];
        }
        else if (type && typeof type === 'object') {
            var rv = {};
            applyStructure(rv, type);
            return rv;
        }
        else {
            return type;
        }
    }
    function applyStructure(obj, structure) {
        keys(structure).forEach(function (member) {
            var value = parseType(structure[member]);
            obj[member] = value;
        });
        return obj;
    }
    function hookedEventSuccessHandler(resolve) {
        // wrap() is needed when calling hooks because the rare scenario of:
        //  * hook does a db operation that fails immediately (IDB throws exception)
        //    For calling db operations on correct transaction, wrap makes sure to set PSD correctly.
        //    wrap() will also execute in a virtual tick.
        //  * If not wrapped in a virtual tick, direct exception will launch a new physical tick.
        //  * If this was the last event in the bulk, the promise will resolve after a physical tick
        //    and the transaction will have committed already.
        // If no hook, the virtual tick will be executed in the reject()/resolve of the final promise,
        // because it is always marked with _lib = true when created using Transaction._promise().
        return wrap(function (event) {
            var req = event.target, ctx = req._hookCtx, // Contains the hook error handler. Put here instead of closure to boost performance.
            result = ctx.value || req.result, // Pass the object value on updates. The result from IDB is the primary key.
            hookSuccessHandler = ctx && ctx.onsuccess;
            hookSuccessHandler && hookSuccessHandler(result);
            resolve && resolve(result);
        }, resolve);
    }
    function eventRejectHandler(reject) {
        return wrap(function (event) {
            preventDefault(event);
            reject(event.target.error);
            return false;
        });
    }
    function eventSuccessHandler(resolve) {
        return wrap(function (event) {
            resolve(event.target.result);
        });
    }
    function hookedEventRejectHandler(reject) {
        return wrap(function (event) {
            // See comment on hookedEventSuccessHandler() why wrap() is needed only when supporting hooks.
            var req = event.target, err = req.error, ctx = req._hookCtx, // Contains the hook error handler. Put here instead of closure to boost performance.
            hookErrorHandler = ctx && ctx.onerror;
            hookErrorHandler && hookErrorHandler(err);
            preventDefault(event);
            reject(err);
            return false;
        });
    }
    function preventDefault(event) {
        if (event.stopPropagation)
            event.stopPropagation();
        if (event.preventDefault)
            event.preventDefault();
    }
    function awaitIterator(iterator) {
        var callNext = function (result) { return iterator.next(result); }, doThrow = function (error) { return iterator.throw(error); }, onSuccess = step(callNext), onError = step(doThrow);
        function step(getNext) {
            return function (val) {
                var next = getNext(val), value = next.value;
                return next.done ? value :
                    (!value || typeof value.then !== 'function' ?
                        isArray(value) ? Promise$1.all(value).then(onSuccess, onError) : onSuccess(value) :
                        value.then(onSuccess, onError));
            };
        }
        return step(callNext)();
    }
    //
    // IndexSpec struct
    //
    function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
        /// <param name="name" type="String"></param>
        /// <param name="keyPath" type="String"></param>
        /// <param name="unique" type="Boolean"></param>
        /// <param name="multi" type="Boolean"></param>
        /// <param name="auto" type="Boolean"></param>
        /// <param name="compound" type="Boolean"></param>
        /// <param name="dotted" type="Boolean"></param>
        this.name = name;
        this.keyPath = keyPath;
        this.unique = unique;
        this.multi = multi;
        this.auto = auto;
        this.compound = compound;
        this.dotted = dotted;
        var keyPathSrc = typeof keyPath === 'string' ? keyPath : keyPath && ('[' + [].join.call(keyPath, '+') + ']');
        this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPathSrc;
    }
    //
    // TableSchema struct
    //
    function TableSchema(name, primKey, indexes, instanceTemplate) {
        /// <param name="name" type="String"></param>
        /// <param name="primKey" type="IndexSpec"></param>
        /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
        /// <param name="instanceTemplate" type="Object"></param>
        this.name = name;
        this.primKey = primKey || new IndexSpec();
        this.indexes = indexes || [new IndexSpec()];
        this.instanceTemplate = instanceTemplate;
        this.mappedClass = null;
        this.idxByName = arrayToObject(indexes, function (index) { return [index.name, index]; });
    }
    function safariMultiStoreFix(storeNames) {
        return storeNames.length === 1 ? storeNames[0] : storeNames;
    }
    function getNativeGetDatabaseNamesFn(indexedDB) {
        var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
        return fn && fn.bind(indexedDB);
    }
    // Export Error classes
    props(Dexie, fullNameExceptions); // Dexie.XXXError = class XXXError {...};
    //
    // Static methods and properties
    // 
    props(Dexie, {
        //
        // Static delete() method.
        //
        delete: function (databaseName) {
            var db = new Dexie(databaseName), promise = db.delete();
            promise.onblocked = function (fn) {
                db.on("blocked", fn);
                return this;
            };
            return promise;
        },
        //
        // Static exists() method.
        //
        exists: function (name) {
            return new Dexie(name).open().then(function (db) {
                db.close();
                return true;
            }).catch(Dexie.NoSuchDatabaseError, function () { return false; });
        },
        //
        // Static method for retrieving a list of all existing databases at current host.
        //
        getDatabaseNames: function (cb) {
            var getDatabaseNames = getNativeGetDatabaseNamesFn(Dexie.dependencies.indexedDB);
            return getDatabaseNames ? new Promise$1(function (resolve, reject) {
                var req = getDatabaseNames();
                req.onsuccess = function (event) {
                    resolve(slice(event.target.result, 0)); // Converst DOMStringList to Array<String>
                };
                req.onerror = eventRejectHandler(reject);
            }).then(cb) : dbNamesDB.dbnames.toCollection().primaryKeys(cb);
        },
        defineClass: function () {
            // Default constructor able to copy given properties into this object.
            function Class(properties) {
                /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
                /// </param>
                if (properties)
                    extend(this, properties);
            }
            return Class;
        },
        applyStructure: applyStructure,
        ignoreTransaction: function (scopeFunc) {
            // In case caller is within a transaction but needs to create a separate transaction.
            // Example of usage:
            //
            // Let's say we have a logger function in our app. Other application-logic should be unaware of the
            // logger function and not need to include the 'logentries' table in all transaction it performs.
            // The logging should always be done in a separate transaction and not be dependant on the current
            // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
            //
            //     Dexie.ignoreTransaction(function() {
            //         db.logentries.add(newLogEntry);
            //     });
            //
            // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
            // in current Promise-scope.
            //
            // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
            // API for this because
            //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
            //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
            //  3) setImmediate() is not supported in the ES standard.
            //  4) You might want to keep other PSD state that was set in a parent PSD, such as PSD.letThrough.
            return PSD.trans ?
                usePSD(PSD.transless, scopeFunc) : // Use the closest parent that was non-transactional.
                scopeFunc(); // No need to change scope because there is no ongoing transaction.
        },
        vip: function (fn) {
            // To be used by subscribers to the on('ready') event.
            // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
            // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
            // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
            // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
            // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
            // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
            // the caller will not resolve until database is opened.
            return newScope(function () {
                PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
                return fn();
            });
        },
        async: function (generatorFn) {
            return function () {
                try {
                    var rv = awaitIterator(generatorFn.apply(this, arguments));
                    if (!rv || typeof rv.then !== 'function')
                        return Promise$1.resolve(rv);
                    return rv;
                }
                catch (e) {
                    return rejection(e);
                }
            };
        },
        spawn: function (generatorFn, args, thiz) {
            try {
                var rv = awaitIterator(generatorFn.apply(thiz, args || []));
                if (!rv || typeof rv.then !== 'function')
                    return Promise$1.resolve(rv);
                return rv;
            }
            catch (e) {
                return rejection(e);
            }
        },
        // Dexie.currentTransaction property
        currentTransaction: {
            get: function () { return PSD.trans || null; }
        },
        waitFor: function (promiseOrFunction, optionalTimeout) {
            // If a function is provided, invoke it and pass the returning value to Transaction.waitFor()
            var promise = Promise$1.resolve(typeof promiseOrFunction === 'function' ? Dexie.ignoreTransaction(promiseOrFunction) : promiseOrFunction)
                .timeout(optionalTimeout || 60000); // Default the timeout to one minute. Caller may specify Infinity if required.       
            // Run given promise on current transaction. If no current transaction, just return a Dexie promise based
            // on given value.
            return PSD.trans ? PSD.trans.waitFor(promise) : promise;
        },
        // Export our Promise implementation since it can be handy as a standalone Promise implementation
        Promise: Promise$1,
        // Dexie.debug proptery:
        // Dexie.debug = false
        // Dexie.debug = true
        // Dexie.debug = "dexie" - don't hide dexie's stack frames.
        debug: {
            get: function () { return debug; },
            set: function (value) {
                setDebug(value, value === 'dexie' ? function () { return true; } : dexieStackFrameFilter);
            }
        },
        // Export our derive/extend/override methodology
        derive: derive,
        extend: extend,
        props: props,
        override: override,
        // Export our Events() function - can be handy as a toolkit
        Events: Events,
        // Utilities
        getByKeyPath: getByKeyPath,
        setByKeyPath: setByKeyPath,
        delByKeyPath: delByKeyPath,
        shallowClone: shallowClone,
        deepClone: deepClone,
        getObjectDiff: getObjectDiff,
        asap: asap,
        maxKey: maxKey,
        minKey: minKey,
        // Addon registry
        addons: [],
        // Global DB connection list
        connections: connections,
        MultiModifyError: exceptions.Modify,
        errnames: errnames,
        // Export other static classes
        IndexSpec: IndexSpec,
        TableSchema: TableSchema,
        //
        // Dependencies
        //
        // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
        //
        // In node.js, however, these properties must be set "manually" before instansiating a new Dexie().
        // For node.js, you need to require indexeddb-js or similar and then set these deps.
        //
        dependencies: (function () {
            try {
                return {
                    // Required:
                    indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
                    IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
                };
            }
            catch (e) {
                return {
                    indexedDB: null,
                    IDBKeyRange: null
                };
            }
        })(),
        // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
        semVer: DEXIE_VERSION,
        version: DEXIE_VERSION.split('.')
            .map(function (n) { return parseInt(n); })
            .reduce(function (p, c, i) { return p + (c / Math.pow(10, i * 2)); }),
        // https://github.com/dfahlander/Dexie.js/issues/186
        // typescript compiler tsc in mode ts-->es5 & commonJS, will expect require() to return
        // x.default. Workaround: Set Dexie.default = Dexie.
        default: Dexie,
        // Make it possible to import {Dexie} (non-default import)
        // Reason 1: May switch to that in future.
        // Reason 2: We declare it both default and named exported in d.ts to make it possible
        // to let addons extend the Dexie interface with Typescript 2.1 (works only when explicitely
        // exporting the symbol, not just default exporting)
        Dexie: Dexie
    });
    // Map DOMErrors and DOMExceptions to corresponding Dexie errors. May change in Dexie v2.0.
    Promise$1.rejectionMapper = mapError;
    // Initialize dbNamesDB (won't ever be opened on chromium browsers')
    dbNamesDB = new Dexie('__dbnames');
    dbNamesDB.version(1).stores({ dbnames: 'name' });
    (function () {
        // Migrate from Dexie 1.x database names stored in localStorage:
        var DBNAMES = 'Dexie.DatabaseNames';
        try {
            if (typeof localStorage !== undefined && _global.document !== undefined) {
                // Have localStorage and is not executing in a worker. Lets migrate from Dexie 1.x.
                JSON.parse(localStorage.getItem(DBNAMES) || "[]")
                    .forEach(function (name) { return dbNamesDB.dbnames.put({ name: name }).catch(nop); });
                localStorage.removeItem(DBNAMES);
            }
        }
        catch (_e) { }
    })();
    //# sourceMappingURL=dexie.es.js.map

    const dashboards = [];
    let _activeDashIndex = writable(2); 
    const setActiveDashIndex = i => _activeDashIndex.update(() => i);
    const getActiveDash = () => dashboards[get_store_value(_activeDashIndex)];
    const getWidget = ref => getActiveDash().widgets.get(ref);

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
    };
    const addDash = (title = '', ref = makeUID('dash')) => {
        return new Promise((resolve, reject) => {
            loadDash(title, ref);
            localDb.dashes.put({
                ref,
                title,
                widgets: []
            }).then(() => resolve, e => reject(e));
        });
    };

    const loadWidget = (type, title, data, sizeAndPos, dashIndex, ref) => {
        try {
            const widgetData = {
                type,
                sizeAndPos,
                _title: writable(title),
                _data: writable(data)
            };
            dashboards[dashIndex].widgets.set(ref, widgetData);
            dashboards[dashIndex]._widgetsCount.update(n => n + 1);
            widgetData._title.subscribe(title => localDb.widgets.update(ref, {title}));
            widgetData._data.subscribe(data => localDb.widgets.update(ref, {data}));
        } catch (e) {
            console.error(e);
        }
    };
    const addWidget = (type, title = '', data = '', sizeAndPos = { [0]: {w: 8, h: 5, x: Infinity, y: 0}}, dashIndex = get_store_value(_activeDashIndex), ref = makeUID('widget')) => {
        return new Promise((resolve, reject) => {
            loadWidget(type, title, data, sizeAndPos, dashIndex, ref);
            localDb.dashes.update(dashboards[dashIndex].ref, {widgets: Array.from(dashboards[dashIndex].widgets.keys())});
            localDb.widgets.put({
                ref,
                type,
                sizeAndPos,
                title,
                data
            }).then(w => resolve(), e => reject(e));
        });
    };

    const removeDash = index => {
        try {
            localDb.dashes.delete(dashboards[index].ref);
            dashboards.splice(index, 1);
        } catch (e) {
            console.error(e);
        }
    };

    const removeWidget = (widgetRef, dashIndex = get_store_value(_activeDashIndex)) => {
        try {
            if(dashboards[dashIndex].widgets.delete(widgetRef))
            {
                localDb.widgets.delete(widgetRef);
                dashboards[dashIndex]._widgetsCount.update(n => n - 1);
                localDb.dashes.update(dashboards[dashIndex].ref, {widgets: Array.from(dashboards[dashIndex].widgets.keys())});
            }
        } catch (e) {
            console.error(e);
        }
    };

    const setWidgetSizeAndPos = (highestCol, ref, data) => {
        try {
            getActiveDash().widgets.get(ref).sizeAndPos[highestCol] = data;
            localDb.widgets.update(ref, {sizeAndPos: getActiveDash().widgets.get(ref).sizeAndPos});
        } catch (e) {
            console.error(e);
        }
    };

    const removeWidgetSizeAndPos = (ref, col) => {
        try {
            delete getActiveDash().widgets.get(ref).sizeAndPos[col];
            localDb.widgets.update(ref, {sizeAndPos: getActiveDash().widgets.get(ref).sizeAndPos});
        } catch (e) {
            console.error(e);
        }
    };

    async function initData() {
        const nDashes = await localDb.dashes.count();
        if (nDashes > 0) {
            const dashes = await localDb.dashes.toArray();
            dashes.forEach((dash, dashIndex) => {
                loadDash(dash.title, dash.ref);
                dash.widgets.forEach(ref => {
                    localDb.widgets.get(ref).then(({type, title, data, sizeAndPos}) => loadWidget(type, title, data, sizeAndPos, dashIndex, ref));
                });
            });
        }
        else {
           loadTemplates();
        } 
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

    /* src\components\buttons\Left.svelte generated by Svelte v3.7.1 */

    const file = "src\\components\\buttons\\Left.svelte";

    function create_fragment(ctx) {
    	var button, img, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			attr(img, "src", "/images/arrowRightIcon.svg");
    			attr(img, "alt", "prev");
    			add_location(img, file, 9, 4, 214);
    			attr(button, "class", "svelte-1l6716q");
    			add_location(button, file, 8, 0, 184);
    			dispose = listen(button, "click", ctx.left);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, img);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function instance($$self) {
    	const dispatch = createEventDispatcher();
        const left = () => {
            dispatch('left');
        };

    	return { left };
    }

    class Left extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src\components\buttons\Right.svelte generated by Svelte v3.7.1 */

    const file$1 = "src\\components\\buttons\\Right.svelte";

    function create_fragment$1(ctx) {
    	var button, img, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			attr(img, "src", "/images/arrowRightIcon.svg");
    			attr(img, "alt", "next");
    			add_location(img, file$1, 9, 4, 217);
    			attr(button, "class", "svelte-1bwa45r");
    			add_location(button, file$1, 8, 0, 186);
    			dispose = listen(button, "click", ctx.right);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, img);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function instance$1($$self) {
    	const dispatch = createEventDispatcher();
        const right = () => {
            dispatch('right');
        };

    	return { right };
    }

    class Right extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src\components\buttons\Trash.svelte generated by Svelte v3.7.1 */

    const file$2 = "src\\components\\buttons\\Trash.svelte";

    // (17:4) {#if active}
    function create_if_block(ctx) {
    	var img, img_class_value, dispose;

    	return {
    		c: function create() {
    			img = element("img");
    			attr(img, "class", img_class_value = "cancel " + ctx.cancelPos + " svelte-111g910");
    			attr(img, "src", "/images/cancelIcon.svg");
    			attr(img, "alt", "x");
    			add_location(img, file$2, 17, 8, 444);
    			dispose = listen(img, "click", ctx.trash);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.cancelPos) && img_class_value !== (img_class_value = "cancel " + ctx.cancelPos + " svelte-111g910")) {
    				attr(img, "class", img_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var button, t, img, button_class_value, dispose;

    	var if_block = (ctx.active) && create_if_block(ctx);

    	return {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			img = element("img");
    			attr(img, "src", "/images/trashIcon.svg");
    			attr(img, "alt", "-");
    			attr(img, "class", "svelte-111g910");
    			add_location(img, file$2, 19, 4, 549);
    			attr(button, "class", button_class_value = "" + (ctx.active ? 'active ' : '') + ctx.className + " svelte-111g910");
    			add_location(button, file$2, 15, 0, 346);
    			dispose = listen(button, "click", ctx.trash);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append(button, t);
    			append(button, img);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.active) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((changed.active || changed.className) && button_class_value !== (button_class_value = "" + (ctx.active ? 'active ' : '') + ctx.className + " svelte-111g910")) {
    				attr(button, "class", button_class_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			if (if_block) if_block.d();
    			dispose();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { active = false, cancelPos = 'top', className = '' } = $$props;
        const dispatch = createEventDispatcher();
        const trash = () => {
            dispatch('trash', {
    			active: !active // not sure why this inverts
    		});
        };

    	const writable_props = ['active', 'cancelPos', 'className'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Trash> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    		if ('cancelPos' in $$props) $$invalidate('cancelPos', cancelPos = $$props.cancelPos);
    		if ('className' in $$props) $$invalidate('className', className = $$props.className);
    	};

    	return { active, cancelPos, className, trash };
    }

    class Trash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["active", "cancelPos", "className"]);
    	}

    	get active() {
    		throw new Error("<Trash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Trash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cancelPos() {
    		throw new Error("<Trash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cancelPos(value) {
    		throw new Error("<Trash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<Trash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<Trash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\buttons\Add.svelte generated by Svelte v3.7.1 */

    const file$3 = "src\\components\\buttons\\Add.svelte";

    function create_fragment$3(ctx) {
    	var button, img, button_class_value, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			attr(img, "src", "/images/addIcon.svg");
    			attr(img, "alt", "+");
    			add_location(img, file$3, 9, 4, 251);
    			attr(button, "class", button_class_value = "" + null_to_empty((ctx.active ? 'active' : '')) + " svelte-qc1k4f");
    			add_location(button, file$3, 8, 0, 189);
    			dispose = listen(button, "click", ctx.add);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, img);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.active) && button_class_value !== (button_class_value = "" + null_to_empty((ctx.active ? 'active' : '')) + " svelte-qc1k4f")) {
    				attr(button, "class", button_class_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { active } = $$props;
        const dispatch = createEventDispatcher();
        const add = () => dispatch('add');

    	const writable_props = ['active'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Add> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    	};

    	return { active, add };
    }

    class Add extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["active"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.active === undefined && !('active' in props)) {
    			console.warn("<Add> was created without expected prop 'active'");
    		}
    	}

    	get active() {
    		throw new Error("<Add>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Add>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function Toggler(update, active = false) {
        this.isOpen = active;
        this.update = update;
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
    };
    Toggler.prototype.open = function() {
        this.isOpen = true;
        window.addEventListener('click', this.close, {capture : true});
        this.update(this.isOpen);
    };
    Toggler.prototype.toggle = function() {
        this.isOpen ? this.close() : this.open();
    };

    function handleEnter(event) {
        if (event.key === 'Enter') {
            event.target.blur();
        }
    }

    /* src\components\DashNav.svelte generated by Svelte v3.7.1 */

    const file$4 = "src\\components\\DashNav.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.dashIndex = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (99:4) {:else}
    function create_else_block_2(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", "carousel svelte-1lbenl");
    			add_location(div, file$4, 99, 8, 3967);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (78:4) {#if dashboards.length > 0}
    function create_if_block$1(ctx) {
    	var div, div_class_value, current;

    	var each_value = ctx.navIndexArray;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div, "class", div_class_value = "carousel " + ctx.animationClass + " svelte-1lbenl");
    			add_location(div, file$4, 78, 8, 2804);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.navIndexArray || changed.$_activeDashIndex || changed.editingTitle || changed.$_title || changed.dashboards || changed.get) {
    				each_value = ctx.navIndexArray;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}

    			if ((!current || changed.animationClass) && div_class_value !== (div_class_value = "carousel " + ctx.animationClass + " svelte-1lbenl")) {
    				attr(div, "class", div_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (89:16) {:else}
    function create_else_block_1(ctx) {
    	var div, t, current;

    	var if_block = (dashboards[ctx.dashIndex]) && create_if_block_3(ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			attr(div, "class", "nav-button-" + ctx.i + " svelte-1lbenl");
    			add_location(div, file$4, 89, 20, 3521);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append(div, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (dashboards[ctx.dashIndex]) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    }

    // (81:16) {#if dashIndex === $_activeDashIndex}
    function create_if_block_1(ctx) {
    	var div, current_block_type_index, if_block, t, current;

    	var if_block_creators = [
    		create_if_block_2,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type_2(ctx) {
    		if (ctx.editingTitle) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			attr(div, "class", "current svelte-1lbenl");
    			add_location(div, file$4, 81, 20, 2972);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append(div, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(div, t);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    // (91:20) {#if dashboards[dashIndex]}
    function create_if_block_3(ctx) {
    	var button, t0_value = get_store_value(dashboards[ctx.dashIndex]._title), t0, t1, span, current, dispose;

    	function click_handler_1() {
    		return ctx.click_handler_1(ctx);
    	}

    	function trash_handler_1() {
    		return ctx.trash_handler_1(ctx);
    	}

    	var trash_1 = new Trash({
    		props: { className: "small" },
    		$$inline: true
    	});
    	trash_1.$on("trash", trash_handler_1);

    	return {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			trash_1.$$.fragment.c();
    			attr(button, "class", "svelte-1lbenl");
    			add_location(button, file$4, 91, 24, 3625);
    			attr(span, "class", "svelte-1lbenl");
    			add_location(span, file$4, 92, 24, 3750);
    			dispose = listen(button, "click", click_handler_1);
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t0);
    			insert(target, t1, anchor);
    			insert(target, span, anchor);
    			mount_component(trash_1, span, null);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((!current || changed.navIndexArray) && t0_value !== (t0_value = get_store_value(dashboards[ctx.dashIndex]._title))) {
    				set_data(t0, t0_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(trash_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(trash_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    				detach(t1);
    				detach(span);
    			}

    			destroy_component(trash_1);

    			dispose();
    		}
    	};
    }

    // (85:24) {:else}
    function create_else_block(ctx) {
    	var div, button, t, span, current, dispose;

    	function trash_handler() {
    		return ctx.trash_handler(ctx);
    	}

    	var trash_1 = new Trash({
    		props: { className: "small" },
    		$$inline: true
    	});
    	trash_1.$on("trash", trash_handler);

    	return {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t = text(ctx.$_title);
    			span = element("span");
    			trash_1.$$.fragment.c();
    			attr(button, "class", "svelte-1lbenl");
    			add_location(button, file$4, 85, 59, 3267);
    			attr(span, "class", "svelte-1lbenl");
    			add_location(span, file$4, 85, 122, 3330);
    			attr(div, "class", "active-dash-title svelte-1lbenl");
    			add_location(div, file$4, 85, 28, 3236);
    			dispose = listen(button, "click", ctx.click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button);
    			append(button, t);
    			append(div, span);
    			mount_component(trash_1, span, null);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (!current || changed.$_title) {
    				set_data(t, ctx.$_title);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(trash_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(trash_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(trash_1);

    			dispose();
    		}
    	};
    }

    // (83:24) {#if editingTitle}
    function create_if_block_2(ctx) {
    	var input, dispose;

    	return {
    		c: function create() {
    			input = element("input");
    			attr(input, "type", "text");
    			input.autofocus = true;
    			attr(input, "class", "svelte-1lbenl");
    			add_location(input, file$4, 83, 28, 3067);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(input, "blur", ctx.closeEditingTitle),
    				listen(input, "keypress", handleEnter)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, input, anchor);

    			input.value = ctx.$_title;

    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.$_title && (input.value !== ctx.$_title)) input.value = ctx.$_title;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(input);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (80:12) {#each navIndexArray as dashIndex, i}
    function create_each_block(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_else_block_1
    	];

    	var if_blocks = [];

    	function select_block_type_1(ctx) {
    		if (ctx.dashIndex === ctx.$_activeDashIndex) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var nav, t0, t1, div, current_block_type_index, if_block, div_class_value, t2, t3, current;

    	var left = new Left({ $$inline: true });
    	left.$on("left", ctx.left_handler);

    	var trash_1 = new Trash({
    		props: {
    		active: ctx.trashIsOpen,
    		cancelPos: "right"
    	},
    		$$inline: true
    	});
    	trash_1.$on("trash", ctx.trash.toggle);

    	var if_block_creators = [
    		create_if_block$1,
    		create_else_block_2
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (dashboards.length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type();
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	var add = new Add({ $$inline: true });
    	add.$on("add", ctx.addNewDash);

    	var right = new Right({ $$inline: true });
    	right.$on("right", ctx.right_handler);

    	return {
    		c: function create() {
    			nav = element("nav");
    			left.$$.fragment.c();
    			t0 = space();
    			trash_1.$$.fragment.c();
    			t1 = space();
    			div = element("div");
    			if_block.c();
    			t2 = space();
    			add.$$.fragment.c();
    			t3 = space();
    			right.$$.fragment.c();
    			attr(div, "class", div_class_value = "container " + (ctx.trashIsOpen ? 'trash' : '') + " svelte-1lbenl");
    			add_location(div, file$4, 76, 4, 2709);
    			attr(nav, "class", "svelte-1lbenl");
    			add_location(nav, file$4, 73, 0, 2572);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, nav, anchor);
    			mount_component(left, nav, null);
    			append(nav, t0);
    			mount_component(trash_1, nav, null);
    			append(nav, t1);
    			append(nav, div);
    			if_blocks[current_block_type_index].m(div, null);
    			append(nav, t2);
    			mount_component(add, nav, null);
    			append(nav, t3);
    			mount_component(right, nav, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var trash_1_changes = {};
    			if (changed.trashIsOpen) trash_1_changes.active = ctx.trashIsOpen;
    			trash_1.$set(trash_1_changes);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type();
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if ((!current || changed.trashIsOpen) && div_class_value !== (div_class_value = "container " + (ctx.trashIsOpen ? 'trash' : '') + " svelte-1lbenl")) {
    				attr(div, "class", div_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(left.$$.fragment, local);

    			transition_in(trash_1.$$.fragment, local);

    			transition_in(if_block);

    			transition_in(add.$$.fragment, local);

    			transition_in(right.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(left.$$.fragment, local);
    			transition_out(trash_1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(add.$$.fragment, local);
    			transition_out(right.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(nav);
    			}

    			destroy_component(left);

    			destroy_component(trash_1);

    			if_blocks[current_block_type_index].d();

    			destroy_component(add);

    			destroy_component(right);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $_activeDashIndex, $_title, $$unsubscribe__title = noop, $$subscribe__title = () => { $$unsubscribe__title(); $$unsubscribe__title = subscribe(_title, $$value => { $_title = $$value; $$invalidate('$_title', $_title); }); };

    	validate_store(_activeDashIndex, '_activeDashIndex');
    	component_subscribe($$self, _activeDashIndex, $$value => { $_activeDashIndex = $$value; $$invalidate('$_activeDashIndex', $_activeDashIndex); });

    	$$self.$$.on_destroy.push(() => $$unsubscribe__title());

    	
        
        const dispatch = createEventDispatcher();
        let trashIsOpen = false;
        const trash = new Toggler(state => { const $$result = trashIsOpen = state; $$invalidate('trashIsOpen', trashIsOpen); return $$result; });
        let editingTitle = false;

        const makeNavIndexArray = (activeIndex) => {
            let arr = [];
            for (let i=0;i<7;i++) {
                if (dashboards.length < 5) { // no loop
                    arr.push((activeIndex+i-3));
                }
                else {
                    const loopedIndex = (dashboards.length + activeIndex + i - 3) % dashboards.length;
                    arr.push(loopedIndex);
                }
            }
            return arr
        }; // fallback for no dashboards

        let animationClass = '';
        const setActiveDash = shift => {
            const nextDashIndex = (dashboards.length + $_activeDashIndex + shift) % dashboards.length;
            if (shift !== 0 && nextDashIndex !== $_activeDashIndex) {
                dispatch('changingDash');
                if (shift > 0) {
                    $$invalidate('animationClass', animationClass = 'forward-animation');
                }
                else {
                    $$invalidate('animationClass', animationClass = 'backward-animation');
                }
                setTimeout(() => {
                    setActiveDashIndex(nextDashIndex);
                    $$invalidate('animationClass', animationClass = '');
                }, 500);
            }
        }; 

        let previousDash = $_activeDashIndex;
        const addNewDash = () => {
            previousDash = $_activeDashIndex;
            addDash('');
            $$invalidate('editingTitle', editingTitle = true);
            setActiveDashIndex(dashboards.length-1);
        };

        const closeEditingTitle = () => {
            $$invalidate('editingTitle', editingTitle = false);
            if (event.target.value === '') {
                removeDash(dashboards.length-1);
                setActiveDashIndex(previousDash);
            }
        };

        const deleteDash = i => {
            removeDash(i);
            setActiveDashIndex((dashboards.length + $_activeDashIndex - 1) % dashboards.length);
        };

    	function left_handler() {
    		return setActiveDash(-1);
    	}

    	function input_input_handler() {
    		_title.set(this.value);
    	}

    	function click_handler() {
    		const $$result = editingTitle = true;
    		$$invalidate('editingTitle', editingTitle);
    		return $$result;
    	}

    	function trash_handler({ dashIndex }) {
    		return deleteDash(dashIndex);
    	}

    	function click_handler_1({ i }) {
    		return setActiveDash(i > 3 ? 1 : -1);
    	}

    	function trash_handler_1({ dashIndex }) {
    		return deleteDash(dashIndex);
    	}

    	function right_handler() {
    		return setActiveDash(1);
    	}

    	let navIndexArray, _title;

    	$$self.$$.update = ($$dirty = { $_activeDashIndex: 1 }) => {
    		if ($$dirty.$_activeDashIndex) { $$invalidate('navIndexArray', navIndexArray = makeNavIndexArray($_activeDashIndex)); }
    		if ($$dirty.$_activeDashIndex) { _title = dashboards[$_activeDashIndex] ? dashboards[$_activeDashIndex]._title : writable(''); $$subscribe__title(), $$invalidate('_title', _title); }
    	};

    	return {
    		trashIsOpen,
    		trash,
    		editingTitle,
    		animationClass,
    		setActiveDash,
    		addNewDash,
    		closeEditingTitle,
    		deleteDash,
    		navIndexArray,
    		$_activeDashIndex,
    		_title,
    		$_title,
    		left_handler,
    		input_input_handler,
    		click_handler,
    		trash_handler,
    		click_handler_1,
    		trash_handler_1,
    		right_handler
    	};
    }

    class DashNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    	}
    }

    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var defaults = createCommonjsModule(function (module) {
    function getDefaults() {
      return {
        baseUrl: null,
        breaks: false,
        gfm: true,
        headerIds: true,
        headerPrefix: '',
        highlight: null,
        langPrefix: 'language-',
        mangle: true,
        pedantic: false,
        renderer: null,
        sanitize: false,
        sanitizer: null,
        silent: false,
        smartLists: false,
        smartypants: false,
        xhtml: false
      };
    }

    function changeDefaults(newDefaults) {
      module.exports.defaults = newDefaults;
    }

    module.exports = {
      defaults: getDefaults(),
      getDefaults,
      changeDefaults
    };
    });
    var defaults_1 = defaults.defaults;
    var defaults_2 = defaults.getDefaults;
    var defaults_3 = defaults.changeDefaults;

    /**
     * Helpers
     */
    const escapeTest = /[&<>"']/;
    const escapeReplace = /[&<>"']/g;
    const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
    const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
    const escapeReplacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    const getEscapeReplacement = (ch) => escapeReplacements[ch];
    function escape(html, encode) {
      if (encode) {
        if (escapeTest.test(html)) {
          return html.replace(escapeReplace, getEscapeReplacement);
        }
      } else {
        if (escapeTestNoEncode.test(html)) {
          return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
        }
      }

      return html;
    }

    const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

    function unescape(html) {
      // explicitly match decimal, hex, and named HTML entities
      return html.replace(unescapeTest, (_, n) => {
        n = n.toLowerCase();
        if (n === 'colon') return ':';
        if (n.charAt(0) === '#') {
          return n.charAt(1) === 'x'
            ? String.fromCharCode(parseInt(n.substring(2), 16))
            : String.fromCharCode(+n.substring(1));
        }
        return '';
      });
    }

    const caret = /(^|[^\[])\^/g;
    function edit(regex, opt) {
      regex = regex.source || regex;
      opt = opt || '';
      const obj = {
        replace: (name, val) => {
          val = val.source || val;
          val = val.replace(caret, '$1');
          regex = regex.replace(name, val);
          return obj;
        },
        getRegex: () => {
          return new RegExp(regex, opt);
        }
      };
      return obj;
    }

    const nonWordAndColonTest = /[^\w:]/g;
    const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
    function cleanUrl(sanitize, base, href) {
      if (sanitize) {
        let prot;
        try {
          prot = decodeURIComponent(unescape(href))
            .replace(nonWordAndColonTest, '')
            .toLowerCase();
        } catch (e) {
          return null;
        }
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
          return null;
        }
      }
      if (base && !originIndependentUrl.test(href)) {
        href = resolveUrl(base, href);
      }
      try {
        href = encodeURI(href).replace(/%25/g, '%');
      } catch (e) {
        return null;
      }
      return href;
    }

    const baseUrls = {};
    const justDomain = /^[^:]+:\/*[^/]*$/;
    const protocol = /^([^:]+:)[\s\S]*$/;
    const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

    function resolveUrl(base, href) {
      if (!baseUrls[' ' + base]) {
        // we can ignore everything in base after the last slash of its path component,
        // but we might need to add _that_
        // https://tools.ietf.org/html/rfc3986#section-3
        if (justDomain.test(base)) {
          baseUrls[' ' + base] = base + '/';
        } else {
          baseUrls[' ' + base] = rtrim(base, '/', true);
        }
      }
      base = baseUrls[' ' + base];
      const relativeBase = base.indexOf(':') === -1;

      if (href.substring(0, 2) === '//') {
        if (relativeBase) {
          return href;
        }
        return base.replace(protocol, '$1') + href;
      } else if (href.charAt(0) === '/') {
        if (relativeBase) {
          return href;
        }
        return base.replace(domain, '$1') + href;
      } else {
        return base + href;
      }
    }

    const noopTest = { exec: function noopTest() {} };

    function merge(obj) {
      let i = 1,
        target,
        key;

      for (; i < arguments.length; i++) {
        target = arguments[i];
        for (key in target) {
          if (Object.prototype.hasOwnProperty.call(target, key)) {
            obj[key] = target[key];
          }
        }
      }

      return obj;
    }

    function splitCells(tableRow, count) {
      // ensure that every cell-delimiting pipe has a space
      // before it to distinguish it from an escaped pipe
      const row = tableRow.replace(/\|/g, (match, offset, str) => {
          let escaped = false,
            curr = offset;
          while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
        cells = row.split(/ \|/);
      let i = 0;

      if (cells.length > count) {
        cells.splice(count);
      } else {
        while (cells.length < count) cells.push('');
      }

      for (; i < cells.length; i++) {
        // leading or trailing whitespace is ignored per the gfm spec
        cells[i] = cells[i].trim().replace(/\\\|/g, '|');
      }
      return cells;
    }

    // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
    // /c*$/ is vulnerable to REDOS.
    // invert: Remove suffix of non-c chars instead. Default falsey.
    function rtrim(str, c, invert) {
      const l = str.length;
      if (l === 0) {
        return '';
      }

      // Length of suffix matching the invert condition.
      let suffLen = 0;

      // Step left until we fail to match the invert condition.
      while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1);
        if (currChar === c && !invert) {
          suffLen++;
        } else if (currChar !== c && invert) {
          suffLen++;
        } else {
          break;
        }
      }

      return str.substr(0, l - suffLen);
    }

    function findClosingBracket(str, b) {
      if (str.indexOf(b[1]) === -1) {
        return -1;
      }
      const l = str.length;
      let level = 0,
        i = 0;
      for (; i < l; i++) {
        if (str[i] === '\\') {
          i++;
        } else if (str[i] === b[0]) {
          level++;
        } else if (str[i] === b[1]) {
          level--;
          if (level < 0) {
            return i;
          }
        }
      }
      return -1;
    }

    function checkSanitizeDeprecation(opt) {
      if (opt && opt.sanitize && !opt.silent) {
        console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
      }
    }

    var helpers = {
      escape,
      unescape,
      edit,
      cleanUrl,
      resolveUrl,
      noopTest,
      merge,
      splitCells,
      rtrim,
      findClosingBracket,
      checkSanitizeDeprecation
    };

    const {
      noopTest: noopTest$1,
      edit: edit$1,
      merge: merge$1
    } = helpers;

    /**
     * Block-Level Grammar
     */
    const block = {
      newline: /^\n+/,
      code: /^( {4}[^\n]+\n*)+/,
      fences: /^ {0,3}(`{3,}|~{3,})([^`~\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
      hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
      heading: /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
      html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
        + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
        + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
        + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
        + ')',
      def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
      nptable: noopTest$1,
      table: noopTest$1,
      lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
      // regex template, placeholders will be replaced according to different paragraph
      // interruption rules of commonmark and the original markdown spec:
      _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
      text: /^[^\n]+/
    };

    block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
    block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
    block.def = edit$1(block.def)
      .replace('label', block._label)
      .replace('title', block._title)
      .getRegex();

    block.bullet = /(?:[*+-]|\d{1,9}\.)/;
    block.item = /^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/;
    block.item = edit$1(block.item, 'gm')
      .replace(/bull/g, block.bullet)
      .getRegex();

    block.list = edit$1(block.list)
      .replace(/bull/g, block.bullet)
      .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
      .replace('def', '\\n+(?=' + block.def.source + ')')
      .getRegex();

    block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
      + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
      + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
      + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
      + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
      + '|track|ul';
    block._comment = /<!--(?!-?>)[\s\S]*?-->/;
    block.html = edit$1(block.html, 'i')
      .replace('comment', block._comment)
      .replace('tag', block._tag)
      .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
      .getRegex();

    block.paragraph = edit$1(block._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} +')
      .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('blockquote', ' {0,3}>')
      .replace('fences', ' {0,3}(?:`{3,}|~{3,})[^`\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
      .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();

    block.blockquote = edit$1(block.blockquote)
      .replace('paragraph', block.paragraph)
      .getRegex();

    /**
     * Normal Block Grammar
     */

    block.normal = merge$1({}, block);

    /**
     * GFM Block Grammar
     */

    block.gfm = merge$1({}, block.normal, {
      nptable: /^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,
      table: /^ *\|(.+)\n *\|?( *[-:]+[-| :]*)(?:\n((?: *[^>\n ].*(?:\n|$))*)\n*|$)/
    });

    /**
     * Pedantic grammar (original John Gruber's loose markdown specification)
     */

    block.pedantic = merge$1({}, block.normal, {
      html: edit$1(
        '^ *(?:comment *(?:\\n|\\s*$)'
        + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
        .replace('comment', block._comment)
        .replace(/tag/g, '(?!(?:'
          + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
          + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
          + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
        .getRegex(),
      def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
      heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
      fences: noopTest$1, // fences not supported
      paragraph: edit$1(block.normal._paragraph)
        .replace('hr', block.hr)
        .replace('heading', ' *#{1,6} *[^\n]')
        .replace('lheading', block.lheading)
        .replace('blockquote', ' {0,3}>')
        .replace('|fences', '')
        .replace('|list', '')
        .replace('|html', '')
        .getRegex()
    });

    /**
     * Inline-Level Grammar
     */
    const inline = {
      escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
      autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
      url: noopTest$1,
      tag: '^comment'
        + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
      link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
      reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
      nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
      strong: /^__([^\s_])__(?!_)|^\*\*([^\s*])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,
      em: /^_([^\s_])_(?!_)|^\*([^\s*<\[])\*(?!\*)|^_([^\s<][\s\S]*?[^\s_])_(?!_|[^\spunctuation])|^_([^\s_<][\s\S]*?[^\s])_(?!_|[^\spunctuation])|^\*([^\s<"][\s\S]*?[^\s\*])\*(?!\*|[^\spunctuation])|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/,
      code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
      br: /^( {2,}|\\)\n(?!\s*$)/,
      del: noopTest$1,
      text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/
    };

    // list of punctuation marks from common mark spec
    // without ` and ] to workaround Rule 17 (inline code blocks/links)
    inline._punctuation = '!"#$%&\'()*+,\\-./:;<=>?@\\[^_{|}~';
    inline.em = edit$1(inline.em).replace(/punctuation/g, inline._punctuation).getRegex();

    inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

    inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
    inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
    inline.autolink = edit$1(inline.autolink)
      .replace('scheme', inline._scheme)
      .replace('email', inline._email)
      .getRegex();

    inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;

    inline.tag = edit$1(inline.tag)
      .replace('comment', block._comment)
      .replace('attribute', inline._attribute)
      .getRegex();

    inline._label = /(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
    inline._href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
    inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

    inline.link = edit$1(inline.link)
      .replace('label', inline._label)
      .replace('href', inline._href)
      .replace('title', inline._title)
      .getRegex();

    inline.reflink = edit$1(inline.reflink)
      .replace('label', inline._label)
      .getRegex();

    /**
     * Normal Inline Grammar
     */

    inline.normal = merge$1({}, inline);

    /**
     * Pedantic Inline Grammar
     */

    inline.pedantic = merge$1({}, inline.normal, {
      strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
      em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
      link: edit$1(/^!?\[(label)\]\((.*?)\)/)
        .replace('label', inline._label)
        .getRegex(),
      reflink: edit$1(/^!?\[(label)\]\s*\[([^\]]*)\]/)
        .replace('label', inline._label)
        .getRegex()
    });

    /**
     * GFM Inline Grammar
     */

    inline.gfm = merge$1({}, inline.normal, {
      escape: edit$1(inline.escape).replace('])', '~|])').getRegex(),
      _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
      url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
      _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
      del: /^~+(?=\S)([\s\S]*?\S)~+/,
      text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?= {2,}\n|[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
    });

    inline.gfm.url = edit$1(inline.gfm.url, 'i')
      .replace('email', inline.gfm._extended_email)
      .getRegex();
    /**
     * GFM + Line Breaks Inline Grammar
     */

    inline.breaks = merge$1({}, inline.gfm, {
      br: edit$1(inline.br).replace('{2,}', '*').getRegex(),
      text: edit$1(inline.gfm.text)
        .replace('\\b_', '\\b_| {2,}\\n')
        .replace(/\{2,\}/g, '*')
        .getRegex()
    });

    var rules = {
      block,
      inline
    };

    const { defaults: defaults$1 } = defaults;
    const { block: block$1 } = rules;
    const {
      rtrim: rtrim$1,
      splitCells: splitCells$1,
      escape: escape$1
    } = helpers;

    /**
     * Block Lexer
     */
    var Lexer_1 = class Lexer {
      constructor(options) {
        this.tokens = [];
        this.tokens.links = Object.create(null);
        this.options = options || defaults$1;
        this.rules = block$1.normal;

        if (this.options.pedantic) {
          this.rules = block$1.pedantic;
        } else if (this.options.gfm) {
          this.rules = block$1.gfm;
        }
      }

      /**
       * Expose Block Rules
       */
      static get rules() {
        return block$1;
      }

      /**
       * Static Lex Method
       */
      static lex(src, options) {
        const lexer = new Lexer(options);
        return lexer.lex(src);
      };

      /**
       * Preprocessing
       */
      lex(src) {
        src = src
          .replace(/\r\n|\r/g, '\n')
          .replace(/\t/g, '    ');

        return this.token(src, true);
      };

      /**
       * Lexing
       */
      token(src, top) {
        src = src.replace(/^ +$/gm, '');
        let next,
          loose,
          cap,
          bull,
          b,
          item,
          listStart,
          listItems,
          t,
          space,
          i,
          tag,
          l,
          isordered,
          istask,
          ischecked;

        while (src) {
          // newline
          if (cap = this.rules.newline.exec(src)) {
            src = src.substring(cap[0].length);
            if (cap[0].length > 1) {
              this.tokens.push({
                type: 'space'
              });
            }
          }

          // code
          if (cap = this.rules.code.exec(src)) {
            const lastToken = this.tokens[this.tokens.length - 1];
            src = src.substring(cap[0].length);
            // An indented code block cannot interrupt a paragraph.
            if (lastToken && lastToken.type === 'paragraph') {
              lastToken.text += '\n' + cap[0].trimRight();
            } else {
              cap = cap[0].replace(/^ {4}/gm, '');
              this.tokens.push({
                type: 'code',
                codeBlockStyle: 'indented',
                text: !this.options.pedantic
                  ? rtrim$1(cap, '\n')
                  : cap
              });
            }
            continue;
          }

          // fences
          if (cap = this.rules.fences.exec(src)) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'code',
              lang: cap[2] ? cap[2].trim() : cap[2],
              text: cap[3] || ''
            });
            continue;
          }

          // heading
          if (cap = this.rules.heading.exec(src)) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'heading',
              depth: cap[1].length,
              text: cap[2]
            });
            continue;
          }

          // table no leading pipe (gfm)
          if (cap = this.rules.nptable.exec(src)) {
            item = {
              type: 'table',
              header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
            };

            if (item.header.length === item.align.length) {
              src = src.substring(cap[0].length);

              for (i = 0; i < item.align.length; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              for (i = 0; i < item.cells.length; i++) {
                item.cells[i] = splitCells$1(item.cells[i], item.header.length);
              }

              this.tokens.push(item);

              continue;
            }
          }

          // hr
          if (cap = this.rules.hr.exec(src)) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'hr'
            });
            continue;
          }

          // blockquote
          if (cap = this.rules.blockquote.exec(src)) {
            src = src.substring(cap[0].length);

            this.tokens.push({
              type: 'blockquote_start'
            });

            cap = cap[0].replace(/^ *> ?/gm, '');

            // Pass `top` to keep the current
            // "toplevel" state. This is exactly
            // how markdown.pl works.
            this.token(cap, top);

            this.tokens.push({
              type: 'blockquote_end'
            });

            continue;
          }

          // list
          if (cap = this.rules.list.exec(src)) {
            src = src.substring(cap[0].length);
            bull = cap[2];
            isordered = bull.length > 1;

            listStart = {
              type: 'list_start',
              ordered: isordered,
              start: isordered ? +bull : '',
              loose: false
            };

            this.tokens.push(listStart);

            // Get each top-level item.
            cap = cap[0].match(this.rules.item);

            listItems = [];
            next = false;
            l = cap.length;
            i = 0;

            for (; i < l; i++) {
              item = cap[i];

              // Remove the list item's bullet
              // so it is seen as the next token.
              space = item.length;
              item = item.replace(/^ *([*+-]|\d+\.) */, '');

              // Outdent whatever the
              // list item contains. Hacky.
              if (~item.indexOf('\n ')) {
                space -= item.length;
                item = !this.options.pedantic
                  ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
                  : item.replace(/^ {1,4}/gm, '');
              }

              // Determine whether the next list item belongs here.
              // Backpedal if it does not belong in this list.
              if (i !== l - 1) {
                b = block$1.bullet.exec(cap[i + 1])[0];
                if (bull.length > 1 ? b.length === 1
                  : (b.length > 1 || (this.options.smartLists && b !== bull))) {
                  src = cap.slice(i + 1).join('\n') + src;
                  i = l - 1;
                }
              }

              // Determine whether item is loose or not.
              // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
              // for discount behavior.
              loose = next || /\n\n(?!\s*$)/.test(item);
              if (i !== l - 1) {
                next = item.charAt(item.length - 1) === '\n';
                if (!loose) loose = next;
              }

              if (loose) {
                listStart.loose = true;
              }

              // Check for task list items
              istask = /^\[[ xX]\] /.test(item);
              ischecked = undefined;
              if (istask) {
                ischecked = item[1] !== ' ';
                item = item.replace(/^\[[ xX]\] +/, '');
              }

              t = {
                type: 'list_item_start',
                task: istask,
                checked: ischecked,
                loose: loose
              };

              listItems.push(t);
              this.tokens.push(t);

              // Recurse.
              this.token(item, false);

              this.tokens.push({
                type: 'list_item_end'
              });
            }

            if (listStart.loose) {
              l = listItems.length;
              i = 0;
              for (; i < l; i++) {
                listItems[i].loose = true;
              }
            }

            this.tokens.push({
              type: 'list_end'
            });

            continue;
          }

          // html
          if (cap = this.rules.html.exec(src)) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: this.options.sanitize
                ? 'paragraph'
                : 'html',
              pre: !this.options.sanitizer
                && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
              text: this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$1(cap[0])) : cap[0]
            });
            continue;
          }

          // def
          if (top && (cap = this.rules.def.exec(src))) {
            src = src.substring(cap[0].length);
            if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
            tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
            if (!this.tokens.links[tag]) {
              this.tokens.links[tag] = {
                href: cap[2],
                title: cap[3]
              };
            }
            continue;
          }

          // table (gfm)
          if (cap = this.rules.table.exec(src)) {
            item = {
              type: 'table',
              header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
            };

            if (item.header.length === item.align.length) {
              src = src.substring(cap[0].length);

              for (i = 0; i < item.align.length; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              for (i = 0; i < item.cells.length; i++) {
                item.cells[i] = splitCells$1(
                  item.cells[i].replace(/^ *\| *| *\| *$/g, ''),
                  item.header.length);
              }

              this.tokens.push(item);

              continue;
            }
          }

          // lheading
          if (cap = this.rules.lheading.exec(src)) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'heading',
              depth: cap[2].charAt(0) === '=' ? 1 : 2,
              text: cap[1]
            });
            continue;
          }

          // top-level paragraph
          if (top && (cap = this.rules.paragraph.exec(src))) {
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'paragraph',
              text: cap[1].charAt(cap[1].length - 1) === '\n'
                ? cap[1].slice(0, -1)
                : cap[1]
            });
            continue;
          }

          // text
          if (cap = this.rules.text.exec(src)) {
            // Top-level should never reach here.
            src = src.substring(cap[0].length);
            this.tokens.push({
              type: 'text',
              text: cap[0]
            });
            continue;
          }

          if (src) {
            throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
          }
        }

        return this.tokens;
      };
    };

    const { defaults: defaults$2 } = defaults;
    const {
      cleanUrl: cleanUrl$1,
      escape: escape$2
    } = helpers;

    /**
     * Renderer
     */
    var Renderer_1 = class Renderer {
      constructor(options) {
        this.options = options || defaults$2;
      }

      code(code, infostring, escaped) {
        const lang = (infostring || '').match(/\S*/)[0];
        if (this.options.highlight) {
          const out = this.options.highlight(code, lang);
          if (out != null && out !== code) {
            escaped = true;
            code = out;
          }
        }

        if (!lang) {
          return '<pre><code>'
            + (escaped ? code : escape$2(code, true))
            + '</code></pre>';
        }

        return '<pre><code class="'
          + this.options.langPrefix
          + escape$2(lang, true)
          + '">'
          + (escaped ? code : escape$2(code, true))
          + '</code></pre>\n';
      };

      blockquote(quote) {
        return '<blockquote>\n' + quote + '</blockquote>\n';
      };

      html(html) {
        return html;
      };

      heading(text, level, raw, slugger) {
        if (this.options.headerIds) {
          return '<h'
            + level
            + ' id="'
            + this.options.headerPrefix
            + slugger.slug(raw)
            + '">'
            + text
            + '</h'
            + level
            + '>\n';
        }
        // ignore IDs
        return '<h' + level + '>' + text + '</h' + level + '>\n';
      };

      hr() {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
      };

      list(body, ordered, start) {
        const type = ordered ? 'ol' : 'ul',
          startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
        return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
      };

      listitem(text) {
        return '<li>' + text + '</li>\n';
      };

      checkbox(checked) {
        return '<input '
          + (checked ? 'checked="" ' : '')
          + 'disabled="" type="checkbox"'
          + (this.options.xhtml ? ' /' : '')
          + '> ';
      };

      paragraph(text) {
        return '<p>' + text + '</p>\n';
      };

      table(header, body) {
        if (body) body = '<tbody>' + body + '</tbody>';

        return '<table>\n'
          + '<thead>\n'
          + header
          + '</thead>\n'
          + body
          + '</table>\n';
      };

      tablerow(content) {
        return '<tr>\n' + content + '</tr>\n';
      };

      tablecell(content, flags) {
        const type = flags.header ? 'th' : 'td';
        const tag = flags.align
          ? '<' + type + ' align="' + flags.align + '">'
          : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
      };

      // span level renderer
      strong(text) {
        return '<strong>' + text + '</strong>';
      };

      em(text) {
        return '<em>' + text + '</em>';
      };

      codespan(text) {
        return '<code>' + text + '</code>';
      };

      br() {
        return this.options.xhtml ? '<br/>' : '<br>';
      };

      del(text) {
        return '<del>' + text + '</del>';
      };

      link(href, title, text) {
        href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }
        let out = '<a href="' + escape$2(href) + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
      };

      image(href, title, text) {
        href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }

        let out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
      };

      text(text) {
        return text;
      };
    };

    /**
     * Slugger generates header id
     */
    var Slugger_1 = class Slugger {
      constructor() {
        this.seen = {};
      }

      /**
       * Convert string to unique id
       */
      slug(value) {
        let slug = value
          .toLowerCase()
          .trim()
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
          .replace(/\s/g, '-');

        if (this.seen.hasOwnProperty(slug)) {
          const originalSlug = slug;
          do {
            this.seen[originalSlug]++;
            slug = originalSlug + '-' + this.seen[originalSlug];
          } while (this.seen.hasOwnProperty(slug));
        }
        this.seen[slug] = 0;

        return slug;
      };
    };

    const { defaults: defaults$3 } = defaults;
    const { inline: inline$1 } = rules;
    const {
      findClosingBracket: findClosingBracket$1,
      escape: escape$3
    } = helpers;

    /**
     * Inline Lexer & Compiler
     */
    var InlineLexer_1 = class InlineLexer {
      constructor(links, options) {
        this.options = options || defaults$3;
        this.links = links;
        this.rules = inline$1.normal;
        this.options.renderer = this.options.renderer || new Renderer_1();
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;

        if (!this.links) {
          throw new Error('Tokens array requires a `links` property.');
        }

        if (this.options.pedantic) {
          this.rules = inline$1.pedantic;
        } else if (this.options.gfm) {
          if (this.options.breaks) {
            this.rules = inline$1.breaks;
          } else {
            this.rules = inline$1.gfm;
          }
        }
      }

      /**
       * Expose Inline Rules
       */
      static get rules() {
        return inline$1;
      }

      /**
       * Static Lexing/Compiling Method
       */
      static output(src, links, options) {
        const inline = new InlineLexer(links, options);
        return inline.output(src);
      }

      /**
       * Lexing/Compiling
       */
      output(src) {
        let out = '',
          link,
          text,
          href,
          title,
          cap,
          prevCapZero;

        while (src) {
          // escape
          if (cap = this.rules.escape.exec(src)) {
            src = src.substring(cap[0].length);
            out += escape$3(cap[1]);
            continue;
          }

          // tag
          if (cap = this.rules.tag.exec(src)) {
            if (!this.inLink && /^<a /i.test(cap[0])) {
              this.inLink = true;
            } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
              this.inLink = false;
            }
            if (!this.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              this.inRawBlock = true;
            } else if (this.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              this.inRawBlock = false;
            }

            src = src.substring(cap[0].length);
            out += this.options.sanitize
              ? this.options.sanitizer
                ? this.options.sanitizer(cap[0])
                : escape$3(cap[0])
              : cap[0];
            continue;
          }

          // link
          if (cap = this.rules.link.exec(src)) {
            const lastParenIndex = findClosingBracket$1(cap[2], '()');
            if (lastParenIndex > -1) {
              const start = cap[0].indexOf('!') === 0 ? 5 : 4;
              const linkLen = start + cap[1].length + lastParenIndex;
              cap[2] = cap[2].substring(0, lastParenIndex);
              cap[0] = cap[0].substring(0, linkLen).trim();
              cap[3] = '';
            }
            src = src.substring(cap[0].length);
            this.inLink = true;
            href = cap[2];
            if (this.options.pedantic) {
              link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

              if (link) {
                href = link[1];
                title = link[3];
              } else {
                title = '';
              }
            } else {
              title = cap[3] ? cap[3].slice(1, -1) : '';
            }
            href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
            out += this.outputLink(cap, {
              href: InlineLexer.escapes(href),
              title: InlineLexer.escapes(title)
            });
            this.inLink = false;
            continue;
          }

          // reflink, nolink
          if ((cap = this.rules.reflink.exec(src))
              || (cap = this.rules.nolink.exec(src))) {
            src = src.substring(cap[0].length);
            link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
            link = this.links[link.toLowerCase()];
            if (!link || !link.href) {
              out += cap[0].charAt(0);
              src = cap[0].substring(1) + src;
              continue;
            }
            this.inLink = true;
            out += this.outputLink(cap, link);
            this.inLink = false;
            continue;
          }

          // strong
          if (cap = this.rules.strong.exec(src)) {
            src = src.substring(cap[0].length);
            out += this.renderer.strong(this.output(cap[4] || cap[3] || cap[2] || cap[1]));
            continue;
          }

          // em
          if (cap = this.rules.em.exec(src)) {
            src = src.substring(cap[0].length);
            out += this.renderer.em(this.output(cap[6] || cap[5] || cap[4] || cap[3] || cap[2] || cap[1]));
            continue;
          }

          // code
          if (cap = this.rules.code.exec(src)) {
            src = src.substring(cap[0].length);
            out += this.renderer.codespan(escape$3(cap[2].trim(), true));
            continue;
          }

          // br
          if (cap = this.rules.br.exec(src)) {
            src = src.substring(cap[0].length);
            out += this.renderer.br();
            continue;
          }

          // del (gfm)
          if (cap = this.rules.del.exec(src)) {
            src = src.substring(cap[0].length);
            out += this.renderer.del(this.output(cap[1]));
            continue;
          }

          // autolink
          if (cap = this.rules.autolink.exec(src)) {
            src = src.substring(cap[0].length);
            if (cap[2] === '@') {
              text = escape$3(this.mangle(cap[1]));
              href = 'mailto:' + text;
            } else {
              text = escape$3(cap[1]);
              href = text;
            }
            out += this.renderer.link(href, null, text);
            continue;
          }

          // url (gfm)
          if (!this.inLink && (cap = this.rules.url.exec(src))) {
            if (cap[2] === '@') {
              text = escape$3(cap[0]);
              href = 'mailto:' + text;
            } else {
              // do extended autolink path validation
              do {
                prevCapZero = cap[0];
                cap[0] = this.rules._backpedal.exec(cap[0])[0];
              } while (prevCapZero !== cap[0]);
              text = escape$3(cap[0]);
              if (cap[1] === 'www.') {
                href = 'http://' + text;
              } else {
                href = text;
              }
            }
            src = src.substring(cap[0].length);
            out += this.renderer.link(href, null, text);
            continue;
          }

          // text
          if (cap = this.rules.text.exec(src)) {
            src = src.substring(cap[0].length);
            if (this.inRawBlock) {
              out += this.renderer.text(this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$3(cap[0])) : cap[0]);
            } else {
              out += this.renderer.text(escape$3(this.smartypants(cap[0])));
            }
            continue;
          }

          if (src) {
            throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
          }
        }

        return out;
      }

      static escapes(text) {
        return text ? text.replace(InlineLexer.rules._escapes, '$1') : text;
      }

      /**
       * Compile Link
       */
      outputLink(cap, link) {
        const href = link.href,
          title = link.title ? escape$3(link.title) : null;

        return cap[0].charAt(0) !== '!'
          ? this.renderer.link(href, title, this.output(cap[1]))
          : this.renderer.image(href, title, escape$3(cap[1]));
      }

      /**
       * Smartypants Transformations
       */
      smartypants(text) {
        if (!this.options.smartypants) return text;
        return text
          // em-dashes
          .replace(/---/g, '\u2014')
          // en-dashes
          .replace(/--/g, '\u2013')
          // opening singles
          .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
          // closing singles & apostrophes
          .replace(/'/g, '\u2019')
          // opening doubles
          .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
          // closing doubles
          .replace(/"/g, '\u201d')
          // ellipses
          .replace(/\.{3}/g, '\u2026');
      }

      /**
       * Mangle Links
       */
      mangle(text) {
        if (!this.options.mangle) return text;
        const l = text.length;
        let out = '',
          i = 0,
          ch;

        for (; i < l; i++) {
          ch = text.charCodeAt(i);
          if (Math.random() > 0.5) {
            ch = 'x' + ch.toString(16);
          }
          out += '&#' + ch + ';';
        }

        return out;
      }
    };

    /**
     * TextRenderer
     * returns only the textual part of the token
     */
    var TextRenderer_1 = class TextRenderer {
      // no need for block level renderers
      strong(text) {
        return text;
      }

      em(text) {
        return text;
      }

      codespan(text) {
        return text;
      }

      del(text) {
        return text;
      }

      text(text) {
        return text;
      }

      link(href, title, text) {
        return '' + text;
      }

      image(href, title, text) {
        return '' + text;
      }

      br() {
        return '';
      }
    };

    const { defaults: defaults$4 } = defaults;
    const {
      merge: merge$2,
      unescape: unescape$1
    } = helpers;

    /**
     * Parsing & Compiling
     */
    var Parser_1 = class Parser {
      constructor(options) {
        this.tokens = [];
        this.token = null;
        this.options = options || defaults$4;
        this.options.renderer = this.options.renderer || new Renderer_1();
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
        this.slugger = new Slugger_1();
      }

      /**
       * Static Parse Method
       */
      static parse(tokens, options) {
        const parser = new Parser(options);
        return parser.parse(tokens);
      };

      /**
       * Parse Loop
       */
      parse(tokens) {
        this.inline = new InlineLexer_1(tokens.links, this.options);
        // use an InlineLexer with a TextRenderer to extract pure text
        this.inlineText = new InlineLexer_1(
          tokens.links,
          merge$2({}, this.options, { renderer: new TextRenderer_1() })
        );
        this.tokens = tokens.reverse();

        let out = '';
        while (this.next()) {
          out += this.tok();
        }

        return out;
      };

      /**
       * Next Token
       */
      next() {
        this.token = this.tokens.pop();
        return this.token;
      };

      /**
       * Preview Next Token
       */
      peek() {
        return this.tokens[this.tokens.length - 1] || 0;
      };

      /**
       * Parse Text Tokens
       */
      parseText() {
        let body = this.token.text;

        while (this.peek().type === 'text') {
          body += '\n' + this.next().text;
        }

        return this.inline.output(body);
      };

      /**
       * Parse Current Token
       */
      tok() {
        let body = '';
        switch (this.token.type) {
          case 'space': {
            return '';
          }
          case 'hr': {
            return this.renderer.hr();
          }
          case 'heading': {
            return this.renderer.heading(
              this.inline.output(this.token.text),
              this.token.depth,
              unescape$1(this.inlineText.output(this.token.text)),
              this.slugger);
          }
          case 'code': {
            return this.renderer.code(this.token.text,
              this.token.lang,
              this.token.escaped);
          }
          case 'table': {
            let header = '',
              i,
              row,
              cell,
              j;

            // header
            cell = '';
            for (i = 0; i < this.token.header.length; i++) {
              cell += this.renderer.tablecell(
                this.inline.output(this.token.header[i]),
                { header: true, align: this.token.align[i] }
              );
            }
            header += this.renderer.tablerow(cell);

            for (i = 0; i < this.token.cells.length; i++) {
              row = this.token.cells[i];

              cell = '';
              for (j = 0; j < row.length; j++) {
                cell += this.renderer.tablecell(
                  this.inline.output(row[j]),
                  { header: false, align: this.token.align[j] }
                );
              }

              body += this.renderer.tablerow(cell);
            }
            return this.renderer.table(header, body);
          }
          case 'blockquote_start': {
            body = '';

            while (this.next().type !== 'blockquote_end') {
              body += this.tok();
            }

            return this.renderer.blockquote(body);
          }
          case 'list_start': {
            body = '';
            const ordered = this.token.ordered,
              start = this.token.start;

            while (this.next().type !== 'list_end') {
              body += this.tok();
            }

            return this.renderer.list(body, ordered, start);
          }
          case 'list_item_start': {
            body = '';
            const loose = this.token.loose;
            const checked = this.token.checked;
            const task = this.token.task;

            if (this.token.task) {
              if (loose) {
                if (this.peek().type === 'text') {
                  const nextToken = this.peek();
                  nextToken.text = this.renderer.checkbox(checked) + ' ' + nextToken.text;
                } else {
                  this.tokens.push({
                    type: 'text',
                    text: this.renderer.checkbox(checked)
                  });
                }
              } else {
                body += this.renderer.checkbox(checked);
              }
            }

            while (this.next().type !== 'list_item_end') {
              body += !loose && this.token.type === 'text'
                ? this.parseText()
                : this.tok();
            }
            return this.renderer.listitem(body, task, checked);
          }
          case 'html': {
            // TODO parse inline content if parameter markdown=1
            return this.renderer.html(this.token.text);
          }
          case 'paragraph': {
            return this.renderer.paragraph(this.inline.output(this.token.text));
          }
          case 'text': {
            return this.renderer.paragraph(this.parseText());
          }
          default: {
            const errMsg = 'Token with "' + this.token.type + '" type was not found.';
            if (this.options.silent) {
              console.log(errMsg);
            } else {
              throw new Error(errMsg);
            }
          }
        }
      };
    };

    const {
      merge: merge$3,
      checkSanitizeDeprecation: checkSanitizeDeprecation$1,
      escape: escape$4
    } = helpers;
    const {
      getDefaults,
      changeDefaults,
      defaults: defaults$5
    } = defaults;

    /**
     * Marked
     */
    function marked(src, opt, callback) {
      // throw error in case of non string input
      if (typeof src === 'undefined' || src === null) {
        throw new Error('marked(): input parameter is undefined or null');
      }
      if (typeof src !== 'string') {
        throw new Error('marked(): input parameter is of type '
          + Object.prototype.toString.call(src) + ', string expected');
      }

      if (callback || typeof opt === 'function') {
        if (!callback) {
          callback = opt;
          opt = null;
        }

        opt = merge$3({}, marked.defaults, opt || {});
        checkSanitizeDeprecation$1(opt);
        const highlight = opt.highlight;
        let tokens,
          pending,
          i = 0;

        try {
          tokens = Lexer_1.lex(src, opt);
        } catch (e) {
          return callback(e);
        }

        pending = tokens.length;

        const done = function(err) {
          if (err) {
            opt.highlight = highlight;
            return callback(err);
          }

          let out;

          try {
            out = Parser_1.parse(tokens, opt);
          } catch (e) {
            err = e;
          }

          opt.highlight = highlight;

          return err
            ? callback(err)
            : callback(null, out);
        };

        if (!highlight || highlight.length < 3) {
          return done();
        }

        delete opt.highlight;

        if (!pending) return done();

        for (; i < tokens.length; i++) {
          (function(token) {
            if (token.type !== 'code') {
              return --pending || done();
            }
            return highlight(token.text, token.lang, function(err, code) {
              if (err) return done(err);
              if (code == null || code === token.text) {
                return --pending || done();
              }
              token.text = code;
              token.escaped = true;
              --pending || done();
            });
          })(tokens[i]);
        }

        return;
      }
      try {
        opt = merge$3({}, marked.defaults, opt || {});
        checkSanitizeDeprecation$1(opt);
        return Parser_1.parse(Lexer_1.lex(src, opt), opt);
      } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.';
        if ((opt || marked.defaults).silent) {
          return '<p>An error occurred:</p><pre>'
            + escape$4(e.message + '', true)
            + '</pre>';
        }
        throw e;
      }
    }

    /**
     * Options
     */

    marked.options =
    marked.setOptions = function(opt) {
      merge$3(marked.defaults, opt);
      changeDefaults(marked.defaults);
      return marked;
    };

    marked.getDefaults = getDefaults;

    marked.defaults = defaults$5;

    /**
     * Expose
     */

    marked.Parser = Parser_1;
    marked.parser = Parser_1.parse;

    marked.Renderer = Renderer_1;
    marked.TextRenderer = TextRenderer_1;

    marked.Lexer = Lexer_1;
    marked.lexer = Lexer_1.lex;

    marked.InlineLexer = InlineLexer_1;
    marked.inlineLexer = InlineLexer_1.output;

    marked.Slugger = Slugger_1;

    marked.parse = marked;

    var marked_1 = marked;

    var purify = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	 module.exports = factory() ;
    }(commonjsGlobal, (function () {
    function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

    var hasOwnProperty = Object.hasOwnProperty;
    var setPrototypeOf = Object.setPrototypeOf;
    var isFrozen = Object.isFrozen;
    var objectKeys = Object.keys;
    var freeze = Object.freeze;
    var seal = Object.seal; // eslint-disable-line import/no-mutable-exports

    var _ref = typeof Reflect !== 'undefined' && Reflect;
    var apply = _ref.apply;
    var construct = _ref.construct;

    if (!apply) {
      apply = function apply(fun, thisValue, args) {
        return fun.apply(thisValue, args);
      };
    }

    if (!freeze) {
      freeze = function freeze(x) {
        return x;
      };
    }

    if (!seal) {
      seal = function seal(x) {
        return x;
      };
    }

    if (!construct) {
      construct = function construct(Func, args) {
        return new (Function.prototype.bind.apply(Func, [null].concat(_toConsumableArray$1(args))))();
      };
    }

    var arrayForEach = unapply(Array.prototype.forEach);
    var arrayIndexOf = unapply(Array.prototype.indexOf);
    var arrayJoin = unapply(Array.prototype.join);
    var arrayPop = unapply(Array.prototype.pop);
    var arrayPush = unapply(Array.prototype.push);
    var arraySlice = unapply(Array.prototype.slice);

    var stringToLowerCase = unapply(String.prototype.toLowerCase);
    var stringMatch = unapply(String.prototype.match);
    var stringReplace = unapply(String.prototype.replace);
    var stringIndexOf = unapply(String.prototype.indexOf);
    var stringTrim = unapply(String.prototype.trim);

    var regExpTest = unapply(RegExp.prototype.test);
    var regExpCreate = unconstruct(RegExp);

    var typeErrorCreate = unconstruct(TypeError);

    function unapply(func) {
      return function (thisArg) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return apply(func, thisArg, args);
      };
    }

    function unconstruct(func) {
      return function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return construct(func, args);
      };
    }

    /* Add properties to a lookup table */
    function addToSet(set, array) {
      if (setPrototypeOf) {
        // Make 'in' and truthy checks like Boolean(set.constructor)
        // independent of any properties defined on Object.prototype.
        // Prevent prototype setters from intercepting set as a this value.
        setPrototypeOf(set, null);
      }

      var l = array.length;
      while (l--) {
        var element = array[l];
        if (typeof element === 'string') {
          var lcElement = stringToLowerCase(element);
          if (lcElement !== element) {
            // Config presets (e.g. tags.js, attrs.js) are immutable.
            if (!isFrozen(array)) {
              array[l] = lcElement;
            }

            element = lcElement;
          }
        }

        set[element] = true;
      }

      return set;
    }

    /* Shallow clone an object */
    function clone(object) {
      var newObject = {};

      var property = void 0;
      for (property in object) {
        if (apply(hasOwnProperty, object, [property])) {
          newObject[property] = object[property];
        }
      }

      return newObject;
    }

    var html = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);

    // SVG
    var svg = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'audio', 'canvas', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'video', 'view', 'vkern']);

    var svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);

    var mathMl = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover']);

    var text = freeze(['#text']);

    var html$1 = freeze(['accept', 'action', 'align', 'alt', 'autocomplete', 'background', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'coords', 'crossorigin', 'datetime', 'default', 'dir', 'disabled', 'download', 'enctype', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'integrity', 'ismap', 'label', 'lang', 'list', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'name', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns']);

    var svg$1 = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'tabindex', 'targetx', 'targety', 'transform', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);

    var mathMl$1 = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);

    var xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

    var MUSTACHE_EXPR = seal(/\{\{[\s\S]*|[\s\S]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
    var ERB_EXPR = seal(/<%[\s\S]*|[\s\S]*%>/gm);
    var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape
    var ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
    var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
    );
    var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
    var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g // eslint-disable-line no-control-regex
    );

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

    var getGlobal = function getGlobal() {
      return typeof window === 'undefined' ? null : window;
    };

    /**
     * Creates a no-op policy for internal use only.
     * Don't export this function outside this module!
     * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
     * @param {Document} document The document object (to determine policy name suffix)
     * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
     * are not supported).
     */
    var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, document) {
      if ((typeof trustedTypes === 'undefined' ? 'undefined' : _typeof(trustedTypes)) !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
        return null;
      }

      // Allow the callers to control the unique policy name
      // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
      // Policy creation with duplicate names throws in Trusted Types.
      var suffix = null;
      var ATTR_NAME = 'data-tt-policy-suffix';
      if (document.currentScript && document.currentScript.hasAttribute(ATTR_NAME)) {
        suffix = document.currentScript.getAttribute(ATTR_NAME);
      }

      var policyName = 'dompurify' + (suffix ? '#' + suffix : '');

      try {
        return trustedTypes.createPolicy(policyName, {
          createHTML: function createHTML(html$$1) {
            return html$$1;
          }
        });
      } catch (error) {
        // Policy creation failed (most likely another DOMPurify script has
        // already run). Skip creating the policy, as this will only cause errors
        // if TT are enforced.
        console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
        return null;
      }
    };

    function createDOMPurify() {
      var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

      var DOMPurify = function DOMPurify(root) {
        return createDOMPurify(root);
      };

      /**
       * Version label, exposed for easier checks
       * if DOMPurify is up to date or not
       */
      DOMPurify.version = '2.0.8';

      /**
       * Array of elements that DOMPurify removed during sanitation.
       * Empty if nothing was removed.
       */
      DOMPurify.removed = [];

      if (!window || !window.document || window.document.nodeType !== 9) {
        // Not running in a browser, provide a factory function
        // so that you can pass your own Window
        DOMPurify.isSupported = false;

        return DOMPurify;
      }

      var originalDocument = window.document;
      var useDOMParser = false;
      var removeTitle = false;

      var document = window.document;
      var DocumentFragment = window.DocumentFragment,
          HTMLTemplateElement = window.HTMLTemplateElement,
          Node = window.Node,
          NodeFilter = window.NodeFilter,
          _window$NamedNodeMap = window.NamedNodeMap,
          NamedNodeMap = _window$NamedNodeMap === undefined ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
          Text = window.Text,
          Comment = window.Comment,
          DOMParser = window.DOMParser,
          trustedTypes = window.trustedTypes;

      // As per issue #47, the web-components registry is inherited by a
      // new document created via createHTMLDocument. As per the spec
      // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
      // a new empty registry is used when creating a template contents owner
      // document, so we use that as our parent document to ensure nothing
      // is inherited.

      if (typeof HTMLTemplateElement === 'function') {
        var template = document.createElement('template');
        if (template.content && template.content.ownerDocument) {
          document = template.content.ownerDocument;
        }
      }

      var trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, originalDocument);
      var emptyHTML = trustedTypesPolicy ? trustedTypesPolicy.createHTML('') : '';

      var _document = document,
          implementation = _document.implementation,
          createNodeIterator = _document.createNodeIterator,
          getElementsByTagName = _document.getElementsByTagName,
          createDocumentFragment = _document.createDocumentFragment;
      var importNode = originalDocument.importNode;


      var hooks = {};

      /**
       * Expose whether this browser supports running the full DOMPurify.
       */
      DOMPurify.isSupported = implementation && typeof implementation.createHTMLDocument !== 'undefined' && document.documentMode !== 9;

      var MUSTACHE_EXPR$$1 = MUSTACHE_EXPR,
          ERB_EXPR$$1 = ERB_EXPR,
          DATA_ATTR$$1 = DATA_ATTR,
          ARIA_ATTR$$1 = ARIA_ATTR,
          IS_SCRIPT_OR_DATA$$1 = IS_SCRIPT_OR_DATA,
          ATTR_WHITESPACE$$1 = ATTR_WHITESPACE;
      var IS_ALLOWED_URI$$1 = IS_ALLOWED_URI;

      /**
       * We consider the elements and attributes below to be safe. Ideally
       * don't add any new ones but feel free to remove unwanted ones.
       */

      /* allowed element names */

      var ALLOWED_TAGS = null;
      var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray(html), _toConsumableArray(svg), _toConsumableArray(svgFilters), _toConsumableArray(mathMl), _toConsumableArray(text)));

      /* Allowed attribute names */
      var ALLOWED_ATTR = null;
      var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray(html$1), _toConsumableArray(svg$1), _toConsumableArray(mathMl$1), _toConsumableArray(xml)));

      /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
      var FORBID_TAGS = null;

      /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
      var FORBID_ATTR = null;

      /* Decide if ARIA attributes are okay */
      var ALLOW_ARIA_ATTR = true;

      /* Decide if custom data attributes are okay */
      var ALLOW_DATA_ATTR = true;

      /* Decide if unknown protocols are okay */
      var ALLOW_UNKNOWN_PROTOCOLS = false;

      /* Output should be safe for jQuery's $() factory? */
      var SAFE_FOR_JQUERY = false;

      /* Output should be safe for common template engines.
       * This means, DOMPurify removes data attributes, mustaches and ERB
       */
      var SAFE_FOR_TEMPLATES = false;

      /* Decide if document with <html>... should be returned */
      var WHOLE_DOCUMENT = false;

      /* Track whether config is already set on this instance of DOMPurify. */
      var SET_CONFIG = false;

      /* Decide if all elements (e.g. style, script) must be children of
       * document.body. By default, browsers might move them to document.head */
      var FORCE_BODY = false;

      /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
       * string (or a TrustedHTML object if Trusted Types are supported).
       * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
       */
      var RETURN_DOM = false;

      /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
       * string  (or a TrustedHTML object if Trusted Types are supported) */
      var RETURN_DOM_FRAGMENT = false;

      /* If `RETURN_DOM` or `RETURN_DOM_FRAGMENT` is enabled, decide if the returned DOM
       * `Node` is imported into the current `Document`. If this flag is not enabled the
       * `Node` will belong (its ownerDocument) to a fresh `HTMLDocument`, created by
       * DOMPurify. */
      var RETURN_DOM_IMPORT = false;

      /* Try to return a Trusted Type object instead of a string, retrun a string in
       * case Trusted Types are not supported  */
      var RETURN_TRUSTED_TYPE = false;

      /* Output should be free from DOM clobbering attacks? */
      var SANITIZE_DOM = true;

      /* Keep element content when removing element? */
      var KEEP_CONTENT = true;

      /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
       * of importing it into a new Document and returning a sanitized copy */
      var IN_PLACE = false;

      /* Allow usage of profiles like html, svg and mathMl */
      var USE_PROFILES = {};

      /* Tags to ignore content of when KEEP_CONTENT is true */
      var FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);

      /* Tags that are safe for data: URIs */
      var DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image']);

      /* Attributes safe for values like "javascript:" */
      var URI_SAFE_ATTRIBUTES = null;
      var DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'summary', 'title', 'value', 'style', 'xmlns']);

      /* Keep a reference to config to pass to hooks */
      var CONFIG = null;

      /* Ideally, do not touch anything below this line */
      /* ______________________________________________ */

      var formElement = document.createElement('form');

      /**
       * _parseConfig
       *
       * @param  {Object} cfg optional config literal
       */
      // eslint-disable-next-line complexity
      var _parseConfig = function _parseConfig(cfg) {
        if (CONFIG && CONFIG === cfg) {
          return;
        }

        /* Shield configuration object from tampering */
        if (!cfg || (typeof cfg === 'undefined' ? 'undefined' : _typeof(cfg)) !== 'object') {
          cfg = {};
        }

        /* Set configuration parameters */
        ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
        ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
        URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR) : DEFAULT_URI_SAFE_ATTRIBUTES;
        FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
        FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
        USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
        ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
        ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
        ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
        SAFE_FOR_JQUERY = cfg.SAFE_FOR_JQUERY || false; // Default false
        SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
        WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
        RETURN_DOM = cfg.RETURN_DOM || false; // Default false
        RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
        RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT || false; // Default false
        RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
        FORCE_BODY = cfg.FORCE_BODY || false; // Default false
        SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
        KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
        IN_PLACE = cfg.IN_PLACE || false; // Default false
        IS_ALLOWED_URI$$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$$1;
        if (SAFE_FOR_TEMPLATES) {
          ALLOW_DATA_ATTR = false;
        }

        if (RETURN_DOM_FRAGMENT) {
          RETURN_DOM = true;
        }

        /* Parse profile info */
        if (USE_PROFILES) {
          ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray(text)));
          ALLOWED_ATTR = [];
          if (USE_PROFILES.html === true) {
            addToSet(ALLOWED_TAGS, html);
            addToSet(ALLOWED_ATTR, html$1);
          }

          if (USE_PROFILES.svg === true) {
            addToSet(ALLOWED_TAGS, svg);
            addToSet(ALLOWED_ATTR, svg$1);
            addToSet(ALLOWED_ATTR, xml);
          }

          if (USE_PROFILES.svgFilters === true) {
            addToSet(ALLOWED_TAGS, svgFilters);
            addToSet(ALLOWED_ATTR, svg$1);
            addToSet(ALLOWED_ATTR, xml);
          }

          if (USE_PROFILES.mathMl === true) {
            addToSet(ALLOWED_TAGS, mathMl);
            addToSet(ALLOWED_ATTR, mathMl$1);
            addToSet(ALLOWED_ATTR, xml);
          }
        }

        /* Merge configuration parameters */
        if (cfg.ADD_TAGS) {
          if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
            ALLOWED_TAGS = clone(ALLOWED_TAGS);
          }

          addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
        }

        if (cfg.ADD_ATTR) {
          if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
            ALLOWED_ATTR = clone(ALLOWED_ATTR);
          }

          addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
        }

        if (cfg.ADD_URI_SAFE_ATTR) {
          addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
        }

        /* Add #text in case KEEP_CONTENT is set to true */
        if (KEEP_CONTENT) {
          ALLOWED_TAGS['#text'] = true;
        }

        /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
        if (WHOLE_DOCUMENT) {
          addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
        }

        /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
        if (ALLOWED_TAGS.table) {
          addToSet(ALLOWED_TAGS, ['tbody']);
          delete FORBID_TAGS.tbody;
        }

        // Prevent further manipulation of configuration.
        // Not available in IE8, Safari 5, etc.
        if (freeze) {
          freeze(cfg);
        }

        CONFIG = cfg;
      };

      /**
       * _forceRemove
       *
       * @param  {Node} node a DOM node
       */
      var _forceRemove = function _forceRemove(node) {
        arrayPush(DOMPurify.removed, { element: node });
        try {
          node.parentNode.removeChild(node);
        } catch (error) {
          node.outerHTML = emptyHTML;
        }
      };

      /**
       * _removeAttribute
       *
       * @param  {String} name an Attribute name
       * @param  {Node} node a DOM node
       */
      var _removeAttribute = function _removeAttribute(name, node) {
        try {
          arrayPush(DOMPurify.removed, {
            attribute: node.getAttributeNode(name),
            from: node
          });
        } catch (error) {
          arrayPush(DOMPurify.removed, {
            attribute: null,
            from: node
          });
        }

        node.removeAttribute(name);
      };

      /**
       * _initDocument
       *
       * @param  {String} dirty a string of dirty markup
       * @return {Document} a DOM, filled with the dirty markup
       */
      var _initDocument = function _initDocument(dirty) {
        /* Create a HTML document */
        var doc = void 0;
        var leadingWhitespace = void 0;

        if (FORCE_BODY) {
          dirty = '<remove></remove>' + dirty;
        } else {
          /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
          var matches = stringMatch(dirty, /^[\s]+/);
          leadingWhitespace = matches && matches[0];
        }

        var dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
        /* Use DOMParser to workaround Firefox bug (see comment below) */
        if (useDOMParser) {
          try {
            doc = new DOMParser().parseFromString(dirtyPayload, 'text/html');
          } catch (error) {}
        }

        /* Remove title to fix a mXSS bug in older MS Edge */
        if (removeTitle) {
          addToSet(FORBID_TAGS, ['title']);
        }

        /* Otherwise use createHTMLDocument, because DOMParser is unsafe in
        Safari (see comment below) */
        if (!doc || !doc.documentElement) {
          doc = implementation.createHTMLDocument('');
          var _doc = doc,
              body = _doc.body;

          body.parentNode.removeChild(body.parentNode.firstElementChild);
          body.outerHTML = dirtyPayload;
        }

        if (dirty && leadingWhitespace) {
          doc.body.insertBefore(document.createTextNode(leadingWhitespace), doc.body.childNodes[0] || null);
        }

        /* Work on whole document or just its body */
        return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
      };

      // Firefox uses a different parser for innerHTML rather than
      // DOMParser (see https://bugzilla.mozilla.org/show_bug.cgi?id=1205631)
      // which means that you *must* use DOMParser, otherwise the output may
      // not be safe if used in a document.write context later.
      //
      // So we feature detect the Firefox bug and use the DOMParser if necessary.
      //
      // Chrome 77 and other versions ship an mXSS bug that caused a bypass to
      // happen. We now check for the mXSS trigger and react accordingly.
      if (DOMPurify.isSupported) {
        (function () {
          try {
            var doc = _initDocument('<svg><p><textarea><img src="</textarea><img src=x abc=1//">');
            if (doc.querySelector('svg img')) {
              useDOMParser = true;
            }
          } catch (error) {}
        })();

        (function () {
          try {
            var doc = _initDocument('<x/><title>&lt;/title&gt;&lt;img&gt;');
            if (regExpTest(/<\/title/, doc.querySelector('title').innerHTML)) {
              removeTitle = true;
            }
          } catch (error) {}
        })();
      }

      /**
       * _createIterator
       *
       * @param  {Document} root document/fragment to create iterator for
       * @return {Iterator} iterator instance
       */
      var _createIterator = function _createIterator(root) {
        return createNodeIterator.call(root.ownerDocument || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, function () {
          return NodeFilter.FILTER_ACCEPT;
        }, false);
      };

      /**
       * _isClobbered
       *
       * @param  {Node} elm element to check for clobbering attacks
       * @return {Boolean} true if clobbered, false if safe
       */
      var _isClobbered = function _isClobbered(elm) {
        if (elm instanceof Text || elm instanceof Comment) {
          return false;
        }

        if (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string') {
          return true;
        }

        return false;
      };

      /**
       * _isNode
       *
       * @param  {Node} obj object to check whether it's a DOM node
       * @return {Boolean} true is object is a DOM node
       */
      var _isNode = function _isNode(obj) {
        return (typeof Node === 'undefined' ? 'undefined' : _typeof(Node)) === 'object' ? obj instanceof Node : obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && typeof obj.nodeType === 'number' && typeof obj.nodeName === 'string';
      };

      /**
       * _executeHook
       * Execute user configurable hooks
       *
       * @param  {String} entryPoint  Name of the hook's entry point
       * @param  {Node} currentNode node to work on with the hook
       * @param  {Object} data additional hook parameters
       */
      var _executeHook = function _executeHook(entryPoint, currentNode, data) {
        if (!hooks[entryPoint]) {
          return;
        }

        arrayForEach(hooks[entryPoint], function (hook) {
          hook.call(DOMPurify, currentNode, data, CONFIG);
        });
      };

      /**
       * _sanitizeElements
       *
       * @protect nodeName
       * @protect textContent
       * @protect removeChild
       *
       * @param   {Node} currentNode to check for permission to exist
       * @return  {Boolean} true if node was killed, false if left alive
       */
      // eslint-disable-next-line complexity
      var _sanitizeElements = function _sanitizeElements(currentNode) {
        var content = void 0;

        /* Execute a hook if present */
        _executeHook('beforeSanitizeElements', currentNode, null);

        /* Check if element is clobbered or can clobber */
        if (_isClobbered(currentNode)) {
          _forceRemove(currentNode);
          return true;
        }

        /* Now let's check the element's type and name */
        var tagName = stringToLowerCase(currentNode.nodeName);

        /* Execute a hook if present */
        _executeHook('uponSanitizeElement', currentNode, {
          tagName: tagName,
          allowedTags: ALLOWED_TAGS
        });

        /* Take care of an mXSS pattern using p, br inside svg, math */
        if ((tagName === 'svg' || tagName === 'math') && currentNode.querySelectorAll('p, br').length !== 0) {
          _forceRemove(currentNode);
          return true;
        }

        /* Remove element if anything forbids its presence */
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          /* Keep content except for black-listed elements */
          if (KEEP_CONTENT && !FORBID_CONTENTS[tagName] && typeof currentNode.insertAdjacentHTML === 'function') {
            try {
              var htmlToInsert = currentNode.innerHTML;
              currentNode.insertAdjacentHTML('AfterEnd', trustedTypesPolicy ? trustedTypesPolicy.createHTML(htmlToInsert) : htmlToInsert);
            } catch (error) {}
          }

          _forceRemove(currentNode);
          return true;
        }

        /* Remove in case a noscript/noembed XSS is suspected */
        if (tagName === 'noscript' && regExpTest(/<\/noscript/i, currentNode.innerHTML)) {
          _forceRemove(currentNode);
          return true;
        }

        if (tagName === 'noembed' && regExpTest(/<\/noembed/i, currentNode.innerHTML)) {
          _forceRemove(currentNode);
          return true;
        }

        /* Convert markup to cover jQuery behavior */
        if (SAFE_FOR_JQUERY && !currentNode.firstElementChild && (!currentNode.content || !currentNode.content.firstElementChild) && regExpTest(/</g, currentNode.textContent)) {
          arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
          if (currentNode.innerHTML) {
            currentNode.innerHTML = stringReplace(currentNode.innerHTML, /</g, '&lt;');
          } else {
            currentNode.innerHTML = stringReplace(currentNode.textContent, /</g, '&lt;');
          }
        }

        /* Sanitize element content to be template-safe */
        if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
          /* Get the element's text content */
          content = currentNode.textContent;
          content = stringReplace(content, MUSTACHE_EXPR$$1, ' ');
          content = stringReplace(content, ERB_EXPR$$1, ' ');
          if (currentNode.textContent !== content) {
            arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
            currentNode.textContent = content;
          }
        }

        /* Execute a hook if present */
        _executeHook('afterSanitizeElements', currentNode, null);

        return false;
      };

      /**
       * _isValidAttribute
       *
       * @param  {string} lcTag Lowercase tag name of containing element.
       * @param  {string} lcName Lowercase attribute name.
       * @param  {string} value Attribute value.
       * @return {Boolean} Returns true if `value` is valid, otherwise false.
       */
      // eslint-disable-next-line complexity
      var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
        /* Make sure attribute cannot clobber */
        if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
          return false;
        }

        /* Allow valid data-* attributes: At least one character after "-"
            (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
            XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
            We don't need to check the value; it's always URI safe. */
        if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$$1, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$$1, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
          return false;

          /* Check value is safe. First, is attr inert? If so, is safe */
        } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if (!value) ; else {
          return false;
        }

        return true;
      };

      /**
       * _sanitizeAttributes
       *
       * @protect attributes
       * @protect nodeName
       * @protect removeAttribute
       * @protect setAttribute
       *
       * @param  {Node} currentNode to sanitize
       */
      // eslint-disable-next-line complexity
      var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
        var attr = void 0;
        var value = void 0;
        var lcName = void 0;
        var idAttr = void 0;
        var l = void 0;
        /* Execute a hook if present */
        _executeHook('beforeSanitizeAttributes', currentNode, null);

        var attributes = currentNode.attributes;

        /* Check if we have attributes; if not we might have a text node */

        if (!attributes) {
          return;
        }

        var hookEvent = {
          attrName: '',
          attrValue: '',
          keepAttr: true,
          allowedAttributes: ALLOWED_ATTR
        };
        l = attributes.length;

        /* Go backwards over all attributes; safely remove bad ones */
        while (l--) {
          attr = attributes[l];
          var _attr = attr,
              name = _attr.name,
              namespaceURI = _attr.namespaceURI;

          value = stringTrim(attr.value);
          lcName = stringToLowerCase(name);

          /* Execute a hook if present */
          hookEvent.attrName = lcName;
          hookEvent.attrValue = value;
          hookEvent.keepAttr = true;
          hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
          _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
          value = hookEvent.attrValue;
          /* Did the hooks approve of the attribute? */
          if (hookEvent.forceKeepAttr) {
            continue;
          }

          /* Remove attribute */
          // Safari (iOS + Mac), last tested v8.0.5, crashes if you try to
          // remove a "name" attribute from an <img> tag that has an "id"
          // attribute at the time.
          if (lcName === 'name' && currentNode.nodeName === 'IMG' && attributes.id) {
            idAttr = attributes.id;
            attributes = arraySlice(attributes, []);
            _removeAttribute('id', currentNode);
            _removeAttribute(name, currentNode);
            if (arrayIndexOf(attributes, idAttr) > l) {
              currentNode.setAttribute('id', idAttr.value);
            }
          } else if (
          // This works around a bug in Safari, where input[type=file]
          // cannot be dynamically set after type has been removed
          currentNode.nodeName === 'INPUT' && lcName === 'type' && value === 'file' && hookEvent.keepAttr && (ALLOWED_ATTR[lcName] || !FORBID_ATTR[lcName])) {
            continue;
          } else {
            // This avoids a crash in Safari v9.0 with double-ids.
            // The trick is to first set the id to be empty and then to
            // remove the attribute
            if (name === 'id') {
              currentNode.setAttribute(name, '');
            }

            _removeAttribute(name, currentNode);
          }

          /* Did the hooks approve of the attribute? */
          if (!hookEvent.keepAttr) {
            continue;
          }

          /* Work around a security issue in jQuery 3.0 */
          if (SAFE_FOR_JQUERY && regExpTest(/\/>/i, value)) {
            _removeAttribute(name, currentNode);
            continue;
          }

          /* Take care of an mXSS pattern using namespace switches */
          if (regExpTest(/svg|math/i, currentNode.namespaceURI) && regExpTest(regExpCreate('</(' + arrayJoin(objectKeys(FORBID_CONTENTS), '|') + ')', 'i'), value)) {
            _removeAttribute(name, currentNode);
            continue;
          }

          /* Sanitize attribute content to be template-safe */
          if (SAFE_FOR_TEMPLATES) {
            value = stringReplace(value, MUSTACHE_EXPR$$1, ' ');
            value = stringReplace(value, ERB_EXPR$$1, ' ');
          }

          /* Is `value` valid for this attribute? */
          var lcTag = currentNode.nodeName.toLowerCase();
          if (!_isValidAttribute(lcTag, lcName, value)) {
            continue;
          }

          /* Handle invalid data-* attribute set by try-catching it */
          try {
            if (namespaceURI) {
              currentNode.setAttributeNS(namespaceURI, name, value);
            } else {
              /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
              currentNode.setAttribute(name, value);
            }

            arrayPop(DOMPurify.removed);
          } catch (error) {}
        }

        /* Execute a hook if present */
        _executeHook('afterSanitizeAttributes', currentNode, null);
      };

      /**
       * _sanitizeShadowDOM
       *
       * @param  {DocumentFragment} fragment to iterate over recursively
       */
      var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
        var shadowNode = void 0;
        var shadowIterator = _createIterator(fragment);

        /* Execute a hook if present */
        _executeHook('beforeSanitizeShadowDOM', fragment, null);

        while (shadowNode = shadowIterator.nextNode()) {
          /* Execute a hook if present */
          _executeHook('uponSanitizeShadowNode', shadowNode, null);

          /* Sanitize tags and elements */
          if (_sanitizeElements(shadowNode)) {
            continue;
          }

          /* Deep shadow DOM detected */
          if (shadowNode.content instanceof DocumentFragment) {
            _sanitizeShadowDOM(shadowNode.content);
          }

          /* Check attributes, sanitize if necessary */
          _sanitizeAttributes(shadowNode);
        }

        /* Execute a hook if present */
        _executeHook('afterSanitizeShadowDOM', fragment, null);
      };

      /**
       * Sanitize
       * Public method providing core sanitation functionality
       *
       * @param {String|Node} dirty string or DOM node
       * @param {Object} configuration object
       */
      // eslint-disable-next-line complexity
      DOMPurify.sanitize = function (dirty, cfg) {
        var body = void 0;
        var importedNode = void 0;
        var currentNode = void 0;
        var oldNode = void 0;
        var returnNode = void 0;
        /* Make sure we have a string to sanitize.
          DO NOT return early, as this will return the wrong type if
          the user has requested a DOM object rather than a string */
        if (!dirty) {
          dirty = '<!-->';
        }

        /* Stringify, in case dirty is an object */
        if (typeof dirty !== 'string' && !_isNode(dirty)) {
          // eslint-disable-next-line no-negated-condition
          if (typeof dirty.toString !== 'function') {
            throw typeErrorCreate('toString is not a function');
          } else {
            dirty = dirty.toString();
            if (typeof dirty !== 'string') {
              throw typeErrorCreate('dirty is not a string, aborting');
            }
          }
        }

        /* Check we can run. Otherwise fall back or ignore */
        if (!DOMPurify.isSupported) {
          if (_typeof(window.toStaticHTML) === 'object' || typeof window.toStaticHTML === 'function') {
            if (typeof dirty === 'string') {
              return window.toStaticHTML(dirty);
            }

            if (_isNode(dirty)) {
              return window.toStaticHTML(dirty.outerHTML);
            }
          }

          return dirty;
        }

        /* Assign config vars */
        if (!SET_CONFIG) {
          _parseConfig(cfg);
        }

        /* Clean up removed elements */
        DOMPurify.removed = [];

        /* Check if dirty is correctly typed for IN_PLACE */
        if (typeof dirty === 'string') {
          IN_PLACE = false;
        }

        if (IN_PLACE) ; else if (dirty instanceof Node) {
          /* If dirty is a DOM element, append to an empty document to avoid
             elements being stripped by the parser */
          body = _initDocument('<!-->');
          importedNode = body.ownerDocument.importNode(dirty, true);
          if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
            /* Node is already a body, use as is */
            body = importedNode;
          } else if (importedNode.nodeName === 'HTML') {
            body = importedNode;
          } else {
            // eslint-disable-next-line unicorn/prefer-node-append
            body.appendChild(importedNode);
          }
        } else {
          /* Exit directly if we have nothing to do */
          if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && RETURN_TRUSTED_TYPE && dirty.indexOf('<') === -1) {
            return trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
          }

          /* Initialize the document to work on */
          body = _initDocument(dirty);

          /* Check we have a DOM node from the data */
          if (!body) {
            return RETURN_DOM ? null : emptyHTML;
          }
        }

        /* Remove first element node (ours) if FORCE_BODY is set */
        if (body && FORCE_BODY) {
          _forceRemove(body.firstChild);
        }

        /* Get node iterator */
        var nodeIterator = _createIterator(IN_PLACE ? dirty : body);

        /* Now start iterating over the created document */
        while (currentNode = nodeIterator.nextNode()) {
          /* Fix IE's strange behavior with manipulated textNodes #89 */
          if (currentNode.nodeType === 3 && currentNode === oldNode) {
            continue;
          }

          /* Sanitize tags and elements */
          if (_sanitizeElements(currentNode)) {
            continue;
          }

          /* Shadow DOM detected, sanitize it */
          if (currentNode.content instanceof DocumentFragment) {
            _sanitizeShadowDOM(currentNode.content);
          }

          /* Check attributes, sanitize if necessary */
          _sanitizeAttributes(currentNode);

          oldNode = currentNode;
        }

        oldNode = null;

        /* If we sanitized `dirty` in-place, return it. */
        if (IN_PLACE) {
          return dirty;
        }

        /* Return sanitized string or DOM */
        if (RETURN_DOM) {
          if (RETURN_DOM_FRAGMENT) {
            returnNode = createDocumentFragment.call(body.ownerDocument);

            while (body.firstChild) {
              // eslint-disable-next-line unicorn/prefer-node-append
              returnNode.appendChild(body.firstChild);
            }
          } else {
            returnNode = body;
          }

          if (RETURN_DOM_IMPORT) {
            /* AdoptNode() is not used because internal state is not reset
                   (e.g. the past names map of a HTMLFormElement), this is safe
                   in theory but we would rather not risk another attack vector.
                   The state that is cloned by importNode() is explicitly defined
                   by the specs. */
            returnNode = importNode.call(originalDocument, returnNode, true);
          }

          return returnNode;
        }

        var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;

        /* Sanitize final string template-safe */
        if (SAFE_FOR_TEMPLATES) {
          serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR$$1, ' ');
          serializedHTML = stringReplace(serializedHTML, ERB_EXPR$$1, ' ');
        }

        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
      };

      /**
       * Public method to set the configuration once
       * setConfig
       *
       * @param {Object} cfg configuration object
       */
      DOMPurify.setConfig = function (cfg) {
        _parseConfig(cfg);
        SET_CONFIG = true;
      };

      /**
       * Public method to remove the configuration
       * clearConfig
       *
       */
      DOMPurify.clearConfig = function () {
        CONFIG = null;
        SET_CONFIG = false;
      };

      /**
       * Public method to check if an attribute value is valid.
       * Uses last set config, if any. Otherwise, uses config defaults.
       * isValidAttribute
       *
       * @param  {string} tag Tag name of containing element.
       * @param  {string} attr Attribute name.
       * @param  {string} value Attribute value.
       * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
       */
      DOMPurify.isValidAttribute = function (tag, attr, value) {
        /* Initialize shared config vars if necessary. */
        if (!CONFIG) {
          _parseConfig({});
        }

        var lcTag = stringToLowerCase(tag);
        var lcName = stringToLowerCase(attr);
        return _isValidAttribute(lcTag, lcName, value);
      };

      /**
       * AddHook
       * Public method to add DOMPurify hooks
       *
       * @param {String} entryPoint entry point for the hook to add
       * @param {Function} hookFunction function to execute
       */
      DOMPurify.addHook = function (entryPoint, hookFunction) {
        if (typeof hookFunction !== 'function') {
          return;
        }

        hooks[entryPoint] = hooks[entryPoint] || [];
        arrayPush(hooks[entryPoint], hookFunction);
      };

      /**
       * RemoveHook
       * Public method to remove a DOMPurify hook at a given entryPoint
       * (pops it from the stack of hooks if more are present)
       *
       * @param {String} entryPoint entry point for the hook to remove
       */
      DOMPurify.removeHook = function (entryPoint) {
        if (hooks[entryPoint]) {
          arrayPop(hooks[entryPoint]);
        }
      };

      /**
       * RemoveHooks
       * Public method to remove all DOMPurify hooks at a given entryPoint
       *
       * @param  {String} entryPoint entry point for the hooks to remove
       */
      DOMPurify.removeHooks = function (entryPoint) {
        if (hooks[entryPoint]) {
          hooks[entryPoint] = [];
        }
      };

      /**
       * RemoveAllHooks
       * Public method to remove all DOMPurify hooks
       *
       */
      DOMPurify.removeAllHooks = function () {
        hooks = {};
      };

      return DOMPurify;
    }

    var purify = createDOMPurify();

    return purify;

    })));
    //# sourceMappingURL=purify.js.map
    });

    const DOMPurify = purify(window);

    function toMarkdown(input) {
        return marked_1(DOMPurify.sanitize(input))
    }

    /* src\components\widgets\stickyTypes\Text.svelte generated by Svelte v3.7.1 */

    const file$5 = "src\\components\\widgets\\stickyTypes\\Text.svelte";

    // (11:0) {:else}
    function create_else_block$1(ctx) {
    	var article, raw_value = toMarkdown(ctx.$_data), dispose;

    	return {
    		c: function create() {
    			article = element("article");
    			attr(article, "class", "svelte-1fms91f");
    			add_location(article, file$5, 11, 1, 354);
    			dispose = listen(article, "click", ctx.click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, article, anchor);
    			article.innerHTML = raw_value;
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$_data) && raw_value !== (raw_value = toMarkdown(ctx.$_data))) {
    				article.innerHTML = raw_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(article);
    			}

    			dispose();
    		}
    	};
    }

    // (9:0) {#if editing}
    function create_if_block$2(ctx) {
    	var textarea, dispose;

    	return {
    		c: function create() {
    			textarea = element("textarea");
    			textarea.autofocus = true;
    			attr(textarea, "class", "svelte-1fms91f");
    			add_location(textarea, file$5, 9, 1, 235);

    			dispose = [
    				listen(textarea, "input", ctx.textarea_input_handler),
    				listen(textarea, "change", ctx.disableEditIfNoFocus),
    				listen(textarea, "blur", ctx.blur_handler)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, textarea, anchor);

    			textarea.value = ctx.$_data;

    			textarea.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.$_data) textarea.value = ctx.$_data;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(textarea);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	var if_block_anchor;

    	function select_block_type(ctx) {
    		if (ctx.editing) return create_if_block$2;
    		return create_else_block$1;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $_data;

    	let { _data } = $$props; validate_store(_data, '_data'); component_subscribe($$self, _data, $$value => { $_data = $$value; $$invalidate('$_data', $_data); });
    	let editing = true;
    	const disableEditIfNoFocus = () => { if (this !== document.activeElement) $$invalidate('editing', editing = false); };

    	const writable_props = ['_data'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Text> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		_data.set(this.value);
    	}

    	function blur_handler() {
    		const $$result = editing = false;
    		$$invalidate('editing', editing);
    		return $$result;
    	}

    	function click_handler() {
    		const $$result = editing = true;
    		$$invalidate('editing', editing);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('_data' in $$props) $$invalidate('_data', _data = $$props._data);
    	};

    	return {
    		_data,
    		editing,
    		disableEditIfNoFocus,
    		$_data,
    		textarea_input_handler,
    		blur_handler,
    		click_handler
    	};
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["_data"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx._data === undefined && !('_data' in props)) {
    			console.warn("<Text> was created without expected prop '_data'");
    		}
    	}

    	get _data() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set _data(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function detectInputType(data) {
        if (data && data.length > 0) {
            return 'Text';
        }
        else {
            return undefined
        }
        // TODO after prototype is finished: check first for date, image, link, todo types
    }

    /* src\components\widgets\Sticky.svelte generated by Svelte v3.7.1 */

    const file$6 = "src\\components\\widgets\\Sticky.svelte";

    // (15:0) {:else}
    function create_else_block$2(ctx) {
    	var textarea, dispose;

    	return {
    		c: function create() {
    			textarea = element("textarea");
    			attr(textarea, "class", "svelte-2d7427");
    			add_location(textarea, file$6, 15, 4, 398);
    			dispose = listen(textarea, "input", ctx.textarea_input_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, textarea, anchor);

    			textarea.value = ctx.$_data;
    		},

    		p: function update(changed, ctx) {
    			if (changed.$_data) textarea.value = ctx.$_data;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(textarea);
    			}

    			dispose();
    		}
    	};
    }

    // (13:0) {#if type === 'Text'}
    function create_if_block$3(ctx) {
    	var current;

    	var text_1 = new Text({
    		props: { _data: ctx._data },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			text_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var text_1_changes = {};
    			if (changed._data) text_1_changes._data = ctx._data;
    			text_1.$set(text_1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$3,
    		create_else_block$2
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.type === 'Text') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $_data;

    	
        let { _data } = $$props; validate_store(_data, '_data'); component_subscribe($$self, _data, $$value => { $_data = $$value; $$invalidate('$_data', $_data); });
        let type;
        beforeUpdate(() => {
    		$$invalidate('type', type = detectInputType($_data));
    	});

    	const writable_props = ['_data'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Sticky> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		_data.set(this.value);
    	}

    	$$self.$set = $$props => {
    		if ('_data' in $$props) $$invalidate('_data', _data = $$props._data);
    	};

    	return {
    		_data,
    		type,
    		$_data,
    		textarea_input_handler
    	};
    }

    class Sticky extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["_data"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx._data === undefined && !('_data' in props)) {
    			console.warn("<Sticky> was created without expected prop '_data'");
    		}
    	}

    	get _data() {
    		throw new Error("<Sticky>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set _data(value) {
    		throw new Error("<Sticky>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\widgets\Widget.svelte generated by Svelte v3.7.1 */

    const file$7 = "src\\components\\widgets\\Widget.svelte";

    // (32:2) {:else}
    function create_else_block_1$1(ctx) {
    	var h2, t, dispose;

    	return {
    		c: function create() {
    			h2 = element("h2");
    			t = text(ctx.$_title);
    			attr(h2, "class", "svelte-2ldzqw");
    			add_location(h2, file$7, 32, 4, 1155);
    			dispose = listen(h2, "click", ctx.click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, h2, anchor);
    			append(h2, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.$_title) {
    				set_data(t, ctx.$_title);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h2);
    			}

    			dispose();
    		}
    	};
    }

    // (30:2) {#if editingTitle}
    function create_if_block_1$1(ctx) {
    	var input, dispose;

    	return {
    		c: function create() {
    			input = element("input");
    			attr(input, "type", "text");
    			input.autofocus = true;
    			attr(input, "class", "svelte-2ldzqw");
    			add_location(input, file$7, 30, 4, 1023);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(input, "blur", ctx.blur_handler),
    				listen(input, "keypress", handleEnter)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, input, anchor);

    			input.value = ctx.$_title;

    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.$_title && (input.value !== ctx.$_title)) input.value = ctx.$_title;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(input);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (37:6) {:else}
    function create_else_block$3(ctx) {
    	var div, t0, t1;

    	return {
    		c: function create() {
    			div = element("div");
    			t0 = text(ctx.type);
    			t1 = text(" Widget type not yet implemented");
    			attr(div, "class", "svelte-2ldzqw");
    			add_location(div, file$7, 37, 6, 1295);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, t1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (35:2) {#if type === 'Sticky'}
    function create_if_block$4(ctx) {
    	var current;

    	var sticky = new Sticky({
    		props: { _data: ctx._data },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			sticky.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(sticky, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var sticky_changes = {};
    			if (changed._data) sticky_changes._data = ctx._data;
    			sticky.$set(sticky_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(sticky.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(sticky.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(sticky, detaching);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	var div, t0, current_block_type_index, if_block1, t1, span, t2, img, div_transition, current;

    	function select_block_type(ctx) {
    		if (ctx.editingTitle) return create_if_block_1$1;
    		return create_else_block_1$1;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block0 = current_block_type(ctx);

    	var if_block_creators = [
    		create_if_block$4,
    		create_else_block$3
    	];

    	var if_blocks = [];

    	function select_block_type_1(ctx) {
    		if (ctx.type === 'Sticky') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	var trash = new Trash({ $$inline: true });
    	trash.$on("trash", ctx.removeSelf);

    	return {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    			span = element("span");
    			trash.$$.fragment.c();
    			t2 = space();
    			img = element("img");
    			attr(span, "class", "svelte-2ldzqw");
    			add_location(span, file$7, 39, 2, 1357);
    			attr(img, "class", "resize-icon svelte-2ldzqw");
    			attr(img, "src", "/images/resizeIcon.svg");
    			attr(img, "alt", "-");
    			add_location(img, file$7, 40, 2, 1405);
    			attr(div, "class", "svelte-2ldzqw");
    			add_location(div, file$7, 28, 0, 935);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			if_block0.m(div, null);
    			append(div, t0);
    			if_blocks[current_block_type_index].m(div, null);
    			append(div, t1);
    			append(div, span);
    			mount_component(trash, span, null);
    			append(div, t2);
    			append(div, img);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(changed, ctx);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);
    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			}

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block1 = if_blocks[current_block_type_index];
    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}
    				transition_in(if_block1, 1);
    				if_block1.m(div, t1);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);

    			transition_in(trash.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, flip, {duration: 300, easing: quintOut }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(trash.$$.fragment, local);

    			if (!div_transition) div_transition = create_bidirectional_transition(div, flip, {duration: 300, easing: quintOut }, false);
    			div_transition.run(0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if_block0.d();
    			if_blocks[current_block_type_index].d();

    			destroy_component(trash);

    			if (detaching) {
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function flip(node, { delay = 0, duration = 400, easing: easing$1 = easing.cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const width = parseFloat(style.width);
        return {
            delay,
            duration,
            easing: easing$1,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `transform: rotateY(${(t - 1) * 90}deg)`
        };
      }

    function instance$7($$self, $$props, $$invalidate) {
    	let $_title;

    	
        let { ref } = $$props;
        let {_title, _data, type} = getWidget(ref); validate_store(_title, '_title'); component_subscribe($$self, _title, $$value => { $_title = $$value; $$invalidate('$_title', $_title); });
        let editingTitle = false;
        const removeSelf = () => {
          removeWidget(ref);
        };

    	const writable_props = ['ref'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Widget> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		_title.set(this.value);
    	}

    	function blur_handler() {
    		const $$result = editingTitle = false;
    		$$invalidate('editingTitle', editingTitle);
    		return $$result;
    	}

    	function click_handler() {
    		const $$result = editingTitle = true;
    		$$invalidate('editingTitle', editingTitle);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('ref' in $$props) $$invalidate('ref', ref = $$props.ref);
    	};

    	return {
    		ref,
    		_title,
    		_data,
    		type,
    		editingTitle,
    		removeSelf,
    		$_title,
    		input_input_handler,
    		blur_handler,
    		click_handler
    	};
    }

    class Widget extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["ref"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.ref === undefined && !('ref' in props)) {
    			console.warn("<Widget> was created without expected prop 'ref'");
    		}
    	}

    	get ref() {
    		throw new Error("<Widget>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<Widget>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const debounce = (fn, ms = 0) => {
      let timeoutId;
      return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
      };
    };

    function getTranslate(str) {
      str = str.slice(10, -3);

      var getIndex = str.indexOf("px, ");

      var x = +str.slice(0, getIndex);

      var y = +str.slice(getIndex + 4);
      return { x, y };
    }

    function getCordinates(event) {
      const pageX = event.changedTouches ? event.changedTouches[0].pageX : event.pageX;
      const pageY = event.changedTouches ? event.changedTouches[0].pageY : event.pageY;
      return { pageX, pageY };
    }

    function getRowsCount(items) {
      return Math.max(...items.map(val => val.y + val.h), 1);
    }

    const getColumnFromBreakpoints = (breakpoints, windowWidth, cols, initCols) => {
      var found = false,
        tempCols = cols;
      if (breakpoints) {
        for (var i = breakpoints.length - 1; i >= 0; i--) {
          const [resolution, cols] = breakpoints[i];

          if (windowWidth <= resolution) {
            found = true;
            tempCols = cols;
            break;
          }
        }
      }

      if (!found) {
        tempCols = initCols;
      }

      return tempCols;
    };

    const makeMatrix = (rows, cols) => Array.from(Array(rows), () => new Array(cols)); // make 2d array

    function findCloseBlocks(items, matrix, curObject) {
      const {
        w,
        h,
        x,
        y,
        responsive: { valueW },
      } = curObject;
      const tempR = matrix.slice(y, y + h);
      let result = []; // new Set()
      for (var i = 0; i < tempR.length; i++) {
        let tempA = tempR[i].slice(x, x + (w - valueW));
        result = [...result, ...tempA.map(val => val && val.id).filter(val => val)];
      }
      return [...result.filter((item, pos) => result.indexOf(item) == pos)];
      // return [...new Set(result)];
    }

    function makeMatrixFromItemsIgnore(
      items,
      ignoreList,
      _row, //= getRowsCount(items)
      _col,
    ) {
      let matrix = makeMatrix(_row, _col);
      for (var i = 0; i < items.length; i++) {
        const value = items[i];
        const {
          x,
          y,
          w,
          h,
          id,
          responsive: { valueW },
        } = value;

        if (ignoreList.indexOf(id) === -1) {
          for (var j = y; j < y + h; j++) {
            const row = matrix[j];
            if (row) {
              for (var k = x; k < x + (w - valueW); k++) {
                row[k] = value;
              }
            }
          }
        }
      }
      return matrix;
    }

    function findItemsById(closeBlocks, items) {
      return items.filter(value => closeBlocks.indexOf(value.id) !== -1);
    }

    function adjustItem(matrix, item, items = [], cols) {
      const { w: width } = item;

      let valueW = item.responsive.valueW;
      for (var i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        for (var j = 0; j < row.length; j++) {
          const empty = row.findIndex(val => val === undefined); // super dirty to check (empty for undefined)
          if (empty !== -1) {
            var z = row.slice(empty);
            var n = z.length;
            for (var x = 0; x < z.length; x++) {
              if (z[x] !== undefined) {
                n = x;
                break;
              }
            } // super dirty to check (empty for undefined)

            valueW = Math.max(width - n, 0);

            return {
              y: i,
              x: empty,
              responsive: { valueW },
            };
          }
        }
      }

      valueW = Math.max(width - cols, 0);
      return {
        y: getRowsCount(items),
        x: 0,
        responsive: { valueW },
      };
    }

    function resizeItems(items, col, rows = getRowsCount(items)) {
      let matrix = makeMatrix(rows, col);
      items.forEach((item, index) => {
        let ignore = items.slice(index + 1).map(val => val.id);
        let position = adjustItem(matrix, item, items, col);

        items = items.map(value => (value.id === item.id ? { ...item, ...position } : value));

        matrix = makeMatrixFromItemsIgnore(items, ignore, getRowsCount(items), col);
      });

      return items;
    }

    function getItemById(id, items) {
      const index = items.findIndex(value => value.id === id);

      return {
        index,
        item: items[index],
      };
    }

    function findFreeSpaceForItem(matrix, item, items = []) {
      const cols = matrix[0].length;
      let xNtime = cols - (item.w - item.responsive.valueW);

      for (var i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        for (var j = 0; j < xNtime + 1; j++) {
          const sliceA = row.slice(j, j + (item.w - item.responsive.valueW));
          const empty = sliceA.every(val => val === undefined);
          if (empty) {
            const isEmpty = matrix.slice(i, i + item.h).every(a => a.slice(j, j + (item.w - item.responsive.valueW)).every(n => n === undefined));

            if (isEmpty) {
              return { y: i, x: j };
            }
          }
        }
      }

      return {
        y: getRowsCount(items),
        x: 0,
      };
    }

    function assignPosition(item, position, value) {
      return value.id === item.id ? { ...item, ...position } : value;
    }

    const replaceItem = (item, cachedItem, value) => (value.id === item.id ? cachedItem : value);

    function moveItem($item, items, cols, originalItem) {
      let matrix = makeMatrixFromItemsIgnore(items, [$item.id], getRowsCount(items), cols);

      const closeBlocks = findCloseBlocks(items, matrix, $item);
      let closeObj = findItemsById(closeBlocks, items);

      const statics = closeObj.find(value => value.static);

      if (statics) {
        if (originalItem) {
          return items.map(replaceItem.bind(null, $item, originalItem));
        }
      }

      matrix = makeMatrixFromItemsIgnore(items, closeBlocks, getRowsCount(items), cols);

      let tempItems = items;

      let tempCloseBlocks = closeBlocks;

      let exclude = [];

      closeObj.forEach(item => {
        let position = findFreeSpaceForItem(matrix, item, tempItems);

        exclude.push(item.id);

        if (position) {
          tempItems = tempItems.map(assignPosition.bind(null, item, position));
          let getIgnoreItems = tempCloseBlocks.filter(value => exclude.indexOf(value) === -1);

          matrix = makeMatrixFromItemsIgnore(tempItems, getIgnoreItems, getRowsCount(items), cols);
        }
      });

      return tempItems;
    }

    function getContainerHeight(items, yPerPx) {
      return Math.max(getRowsCount(items), 2) * yPerPx;
    }

    /* node_modules\svelte-grid\src\index.svelte generated by Svelte v3.7.1 */
    const { console: console_1, window: window_1 } = globals;

    const file$8 = "node_modules\\svelte-grid\\src\\index.svelte";

    const get_default_slot_changes = ({ item, items, i }) => ({ item: items, index: items });
    const get_default_slot_context = ({ item, items, i }) => ({
    	item: item,
    	index: i
    });

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (58:10) {#if item.resizable}
    function create_if_block_1$2(ctx) {
    	var div, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", "svlt-grid-resizer svelte-14tbpr7");
    			add_location(div, file$8, 58, 12, 1827);

    			dispose = [
    				listen(div, "touchstart", ctx.resizeOnMouseDown.bind(this,ctx.item.id)),
    				listen(div, "mousedown", ctx.resizeOnMouseDown.bind(this,ctx.item.id))
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (45:2) {#each items as item, i (item.id)}
    function create_each_block$1(key_1, ctx) {
    	var div, t, div_style_value, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, get_default_slot_context);

    	var if_block = (ctx.item.resizable) && create_if_block_1$2(ctx);

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();

    			attr(div, "class", "svlt-grid-item svelte-14tbpr7");
    			attr(div, "style", div_style_value = "" + (ctx.useTransform ? `transform: translate(${ctx.item.drag.dragging ? ctx.item.drag.left : (ctx.item.x * ctx.xPerPx) + ctx.gap}px, ${ctx.item.drag.dragging ? ctx.item.drag.top : (ctx.item.y * ctx.yPerPx + ctx.gap)}px);` : '') + ";\n        " + (!ctx.useTransform ? `top: ${ctx.item.drag.dragging ? ctx.item.drag.top : (ctx.item.y * ctx.yPerPx) + ctx.gap}px` : '') + ";\n        " + (!ctx.useTransform ? `left: ${ctx.item.drag.dragging ? ctx.item.drag.left : (ctx.item.x * ctx.xPerPx) + ctx.gap}px` : '') + ";\n        width: " + (ctx.item.resize.resizing ? ctx.item.resize.width : ((ctx.item.w * ctx.xPerPx) - ctx.gap * 2) - (ctx.item.responsive.valueW*ctx.xPerPx)) + "px;\n        height: " + (ctx.item.resize.resizing ? ctx.item.resize.height : (ctx.item.h * ctx.yPerPx) - ctx.gap * 2) + "px;\n        z-index: " + (ctx.item.drag.dragging || ctx.item.resize.resizing ? 3 : 1) + ";\n        opacity: " + (ctx.item.resize.resizing ? 0.5 : 1));
    			add_location(div, file$8, 46, 4, 805);

    			dispose = [
    				listen(div, "mousedown", ctx.item.draggable ? ctx.dragOnMouseDown.bind(this, ctx.item.id) : null),
    				listen(div, "touchstart", ctx.item.draggable ? ctx.dragOnMouseDown.bind(this, ctx.item.id) : null)
    			];

    			this.first = div;
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;

    			if (default_slot && default_slot.p && (changed.$$scope || changed.items)) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, get_default_slot_changes),
    					get_slot_context(default_slot_template, ctx, get_default_slot_context)
    				);
    			}

    			if (ctx.item.resizable) {
    				if (!if_block) {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((!current || changed.useTransform || changed.items || changed.xPerPx || changed.gap) && div_style_value !== (div_style_value = "" + (ctx.useTransform ? `transform: translate(${ctx.item.drag.dragging ? ctx.item.drag.left : (ctx.item.x * ctx.xPerPx) + ctx.gap}px, ${ctx.item.drag.dragging ? ctx.item.drag.top : (ctx.item.y * ctx.yPerPx + ctx.gap)}px);` : '') + ";\n        " + (!ctx.useTransform ? `top: ${ctx.item.drag.dragging ? ctx.item.drag.top : (ctx.item.y * ctx.yPerPx) + ctx.gap}px` : '') + ";\n        " + (!ctx.useTransform ? `left: ${ctx.item.drag.dragging ? ctx.item.drag.left : (ctx.item.x * ctx.xPerPx) + ctx.gap}px` : '') + ";\n        width: " + (ctx.item.resize.resizing ? ctx.item.resize.width : ((ctx.item.w * ctx.xPerPx) - ctx.gap * 2) - (ctx.item.responsive.valueW*ctx.xPerPx)) + "px;\n        height: " + (ctx.item.resize.resizing ? ctx.item.resize.height : (ctx.item.h * ctx.yPerPx) - ctx.gap * 2) + "px;\n        z-index: " + (ctx.item.drag.dragging || ctx.item.resize.resizing ? 3 : 1) + ";\n        opacity: " + (ctx.item.resize.resizing ? 0.5 : 1))) {
    				attr(div, "style", div_style_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    // (69:2) {#if shadow.active}
    function create_if_block$5(ctx) {
    	var div, div_style_value;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", "svlt-grid-shadow svelte-14tbpr7");
    			attr(div, "style", div_style_value = "" + (ctx.useTransform ? `transform: translate(${ctx.shadow.drag.dragging ? ctx.shadow.drag.left : (ctx.shadow.x * ctx.xPerPx) + ctx.gap}px, ${ctx.shadow.drag.dragging ? ctx.shadow.drag.top : (ctx.shadow.y * ctx.yPerPx + ctx.gap)}px);` : '') + ";\n        " + (!ctx.useTransform ? `top: ${ctx.shadow.drag.dragging ? ctx.shadow.drag.top : (ctx.shadow.y * ctx.yPerPx) + ctx.gap}px` : '') + ";\n        " + (!ctx.useTransform ? `left: ${ctx.shadow.drag.dragging ? ctx.shadow.drag.left : (ctx.shadow.x * ctx.xPerPx) + ctx.gap}px` : '') + ";\n    width:" + (((ctx.shadow.w * ctx.xPerPx) - ctx.gap * 2) - (ctx.shadow.responsive.valueW*ctx.xPerPx)) + "px;\n    height:" + ((ctx.shadow.h * ctx.yPerPx) - ctx.gap * 2) + "px;");
    			add_location(div, file$8, 69, 4, 2071);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.useTransform || changed.shadow || changed.xPerPx || changed.gap) && div_style_value !== (div_style_value = "" + (ctx.useTransform ? `transform: translate(${ctx.shadow.drag.dragging ? ctx.shadow.drag.left : (ctx.shadow.x * ctx.xPerPx) + ctx.gap}px, ${ctx.shadow.drag.dragging ? ctx.shadow.drag.top : (ctx.shadow.y * ctx.yPerPx + ctx.gap)}px);` : '') + ";\n        " + (!ctx.useTransform ? `top: ${ctx.shadow.drag.dragging ? ctx.shadow.drag.top : (ctx.shadow.y * ctx.yPerPx) + ctx.gap}px` : '') + ";\n        " + (!ctx.useTransform ? `left: ${ctx.shadow.drag.dragging ? ctx.shadow.drag.left : (ctx.shadow.x * ctx.xPerPx) + ctx.gap}px` : '') + ";\n    width:" + (((ctx.shadow.w * ctx.xPerPx) - ctx.gap * 2) - (ctx.shadow.responsive.valueW*ctx.xPerPx)) + "px;\n    height:" + ((ctx.shadow.h * ctx.yPerPx) - ctx.gap * 2) + "px;")) {
    				attr(div, "style", div_style_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map(), t, current, dispose;

    	var each_value = ctx.items;

    	const get_key = ctx => ctx.item.id;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	var if_block = (ctx.shadow.active) && create_if_block$5(ctx);

    	return {
    		c: function create() {
    			div = element("div");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();

    			t = space();
    			if (if_block) if_block.c();
    			attr(div, "class", "svlt-grid-container svelte-14tbpr7");
    			set_style(div, "height", "" + ctx.ch + "px");
    			toggle_class(div, "svlt-grid-transition", !ctx.focuesdItem);
    			add_location(div, file$8, 43, 0, 644);
    			dispose = listen(window_1, "resize", debounce(ctx.onResize,300));
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div, null);

    			append(div, t);
    			if (if_block) if_block.m(div, null);
    			ctx.div_binding(div);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.items;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, t, get_each_context$1);
    			check_outros();

    			if (ctx.shadow.active) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || changed.ch) {
    				set_style(div, "height", "" + ctx.ch + "px");
    			}

    			if (changed.focuesdItem) {
    				toggle_class(div, "svlt-grid-transition", !ctx.focuesdItem);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();

    			if (if_block) if_block.d();
    			ctx.div_binding(null);
    			dispose();
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	

    let { useTransform = false, items = [], cols = 0, dragDebounceMs = 350, gap = 0, rowHeight = 150, breakpoints, fillEmpty = true } = $$props;

    let container,
      focuesdItem,
      bound,
      xPerPx,
      currentItemIndex,
      getComputedCols,
      documentWidth,
      resizeNoDynamicCalc,
      yPerPx = rowHeight,
      initCols = cols,
      shadow = {
        w: 0,
        h: 0,
        x: 0,
        y: 0,
        active: false,
        id: null,
        responsive: { valueW: 0 },
        min: {},
        max: {}
      },
      ch = getContainerHeight(items, yPerPx);

    const dispatch = createEventDispatcher();

    const getDocWidth = () => document.documentElement.clientWidth;

    function onResize() {

      let w = document.documentElement.clientWidth;

      if(w !== documentWidth) {
        documentWidth = w;
        
        bound = container.getBoundingClientRect();

        let getCols = getColumnFromBreakpoints(breakpoints,w,cols,initCols);
        
        getComputedCols = getCols;

        $$invalidate('xPerPx', xPerPx = bound.width / getCols);

        dispatch('resize', {
          cols:getCols,
          xPerPx,
          yPerPx // same as rowHeight
        });

        if(breakpoints) {
        	$$invalidate('items', items = resizeItems(items, getCols));
        }

      } 

    }


    onMount(() => {
      bound = container.getBoundingClientRect();

      let getCols = getColumnFromBreakpoints(breakpoints, getDocWidth(), cols, initCols);
      
      getComputedCols = getCols;

      documentWidth = document.documentElement.clientWidth;

      if(breakpoints) {
        $$invalidate('items', items = resizeItems(items, getCols));
      }

      $$invalidate('xPerPx', xPerPx = bound.width / getCols);

      dispatch('mount', {
        cols: getCols,
        xPerPx,
        yPerPx // same as rowHeight
      });

    });

    // resize

    let resizeStartX, resizeStartY, resizeStartWidth, resizeStartHeight;

    function resizeOnMouseDown(id, e) {
      e.stopPropagation();

      let {pageX,pageY} = getCordinates(e);

      const { item, index } = getItemById(id, items);

      currentItemIndex = index;

      $$invalidate('focuesdItem', focuesdItem = item);

      cacheItem = {...item};

      resizeNoDynamicCalc = item.h + item.y === getRowsCount(items);

      $$invalidate('shadow', shadow = {...shadow,...focuesdItem,...{active:true}});

      resizeStartX = pageX - bound.x;
      resizeStartY = pageY - bound.y;

      resizeStartWidth = (item.w * xPerPx) - (gap * 2) - (focuesdItem.responsive.valueW * xPerPx);

      resizeStartHeight = (item.h * yPerPx) - (gap * 2);

      getComputedCols = getColumnFromBreakpoints(breakpoints, getDocWidth(), cols, initCols);

      window.addEventListener("mousemove", resizeOnMouseMove, false);
      window.addEventListener("touchmove", resizeOnMouseMove, false);

      window.addEventListener("mouseup", resizeOnMouseUp, false);
      window.addEventListener("touchend", resizeOnMouseUp, false);
    }

    function resizeOnMouseMove(e) {

      let {pageX,pageY}=getCordinates(e);

      pageX = pageX - bound.x;
      pageY = pageY - bound.y;

      const height = resizeStartHeight + pageY - resizeStartY;
      const width = resizeStartWidth + (pageX - resizeStartX);

      const {responsive:{valueW} } = focuesdItem;

      let wRes = Math.round(width / xPerPx) + valueW;

      const {h:minHeight=1,w:minWidth=1} = focuesdItem.min;
      const {h:maxHeight,w:maxWidth = ((getComputedCols - focuesdItem.x)+valueW)} = focuesdItem.max;

      wRes = Math.min(Math.max(wRes,minWidth),maxWidth);/* min max*/

      let hRes = Math.round(height/yPerPx);
      if(maxHeight) {
        hRes = Math.min(hRes,maxHeight);
      }
      hRes = Math.max(hRes,minHeight);

      $$invalidate('shadow', shadow = {...shadow, ...{w:wRes, h:hRes}}); 

      let assignItem = items[currentItemIndex];
      items[currentItemIndex] = {
        ...assignItem,
        resize: {
          resizing:true,
          width,
          height
        },
        w:wRes,
        h:hRes
      }; $$invalidate('items', items);

      if (!resizeNoDynamicCalc) {
        debounceRecalculateGridPosition();
      }
    }

    function resizeOnMouseUp(e) {
      e.stopPropagation();

      let assignItem = items[currentItemIndex];
      items[currentItemIndex] = {
        ...assignItem,
        resize:{
          resizing:false,
          width:0,
          height:0
        }
      }; $$invalidate('items', items);

      window.removeEventListener("mousemove", resizeOnMouseMove, false);
      window.removeEventListener("touchmove", resizeOnMouseMove, false);

      window.removeEventListener("mouseup", resizeOnMouseUp, false);
      window.removeEventListener("touchend", resizeOnMouseUp, false);

      $$invalidate('shadow', shadow = {...shadow, ... {w:0,h:0,x:0,y:0,active:false,id:null,responsive:{valueW:0}}, min:{},max:{} }); 

      recalculateGridPosition();

      $$invalidate('focuesdItem', focuesdItem = undefined);
      resizeNoDynamicCalc = false;
    }

    // drag
    let dragX = 0,
      dragY = 0;

    const debounceRecalculateGridPosition = debounce(recalculateGridPosition, dragDebounceMs);

    let cacheItem = {};

    function dragOnMouseDown(id, e) {
      e.stopPropagation();
      let {pageX,pageY} = getCordinates(e);

      const { item, index } = getItemById(id, items);
      
      currentItemIndex = index;


      $$invalidate('focuesdItem', focuesdItem = item);
      cacheItem = {...item};
      
      $$invalidate('shadow', shadow = { ...shadow, ...item, active: true }); 

      

      let { currentTarget } = e;

      let offsetLeft, offsetTop;

      if(useTransform) {
        const { x, y } = getTranslate(currentTarget.style.transform);
        offsetLeft = x;
        offsetTop = y;
      } else {
        offsetLeft = currentTarget.offsetLeft;
        offsetTop = currentTarget.offsetTop;
      }

      pageX = pageX - bound.x;
      pageY = pageY - bound.y;

      dragX = pageX - offsetLeft;

      dragY = pageY - offsetTop;

      getComputedCols = getColumnFromBreakpoints(breakpoints, getDocWidth(), cols, initCols);


      if (item) {
        window.addEventListener("mousemove", dragOnMove, false);
        window.addEventListener("touchmove", dragOnMove, false);

        window.addEventListener("mouseup", dragOnMouseUp, false);
        window.addEventListener("touchend", dragOnMouseUp, false);
      } else {
        console.warn("Can not get item");
      }
    }


    function dragOnMove(e) {
      e.stopPropagation();

      let {pageX,pageY} = getCordinates(e);

      const y = pageY - bound.y;
      const x = pageX - bound.x;

      let xRes = Math.round((x - dragX) / xPerPx);
      let yRes = Math.round((y - dragY) / yPerPx);

      xRes = Math.max(Math.min(xRes,getComputedCols-(focuesdItem.w- focuesdItem.responsive.valueW)),0);

      yRes = Math.max(yRes, 0);

      let assignItem = items[currentItemIndex];

      items[currentItemIndex] = {
        ...assignItem,
        drag:{
          dragging:true,
          top:y - dragY,
          left:x - dragX
        },
        x:xRes,
        y:yRes
      }; $$invalidate('items', items);

      $$invalidate('shadow', shadow = {...shadow, ...{x:xRes,y:yRes}});

      debounceRecalculateGridPosition();
    }

    function dragOnMouseUp(e) {
      window.removeEventListener("mousemove", dragOnMove, false);
      window.removeEventListener("touchmove", dragOnMove, false);

      window.removeEventListener("mouseup", dragOnMouseUp, false);
      window.removeEventListener("touchend", dragOnMouseUp, false);

      let assignItem = items[currentItemIndex];
      items[currentItemIndex] = {
        ...assignItem,
        drag: {
          dragging: false,
          top: 0,
          left: 0
        },
      }; $$invalidate('items', items);

      dragX = 0;
      dragY = 0;

      $$invalidate('shadow', shadow = {...shadow, ...{w:0,h:0,x:0,y:0,active:false,id:null}}); 
      
      recalculateGridPosition();

      $$invalidate('focuesdItem', focuesdItem = undefined);
    }


    // Will work on this, need to make code cleaner
    function recalculateGridPosition(action) {
      const dragItem = items[currentItemIndex];

      let getCols = getColumnFromBreakpoints(breakpoints, getDocWidth(), cols, initCols);
      let result = moveItem(dragItem, items, getCols, cacheItem);

      if(fillEmpty) {

        result.forEach(value => {
          if (value.id !== dragItem.id) {
            result = result.map($val =>
              $val.id === value.id
                ? {
                    ...$val,
                    ...findFreeSpaceForItem(
                      makeMatrixFromItemsIgnore(result, [value.id], getRowsCount(result), getCols),
                      value,
                      result
                    )
                  }
                : $val
            );
          }
        });
      }

      $$invalidate('items', items = result);

      dispatch('adjust', {
        focuesdItem: dragItem
      });

    }

    beforeUpdate(() => {
      if (!focuesdItem) {
        $$invalidate('ch', ch = getContainerHeight(items, yPerPx));
        if(cols !== initCols) {
          if(bound) {
            $$invalidate('xPerPx', xPerPx = bound.width/cols);
            initCols = cols;
          }
        }
      }
    });

    	const writable_props = ['useTransform', 'items', 'cols', 'dragDebounceMs', 'gap', 'rowHeight', 'breakpoints', 'fillEmpty'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<Src> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('container', container = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('useTransform' in $$props) $$invalidate('useTransform', useTransform = $$props.useTransform);
    		if ('items' in $$props) $$invalidate('items', items = $$props.items);
    		if ('cols' in $$props) $$invalidate('cols', cols = $$props.cols);
    		if ('dragDebounceMs' in $$props) $$invalidate('dragDebounceMs', dragDebounceMs = $$props.dragDebounceMs);
    		if ('gap' in $$props) $$invalidate('gap', gap = $$props.gap);
    		if ('rowHeight' in $$props) $$invalidate('rowHeight', rowHeight = $$props.rowHeight);
    		if ('breakpoints' in $$props) $$invalidate('breakpoints', breakpoints = $$props.breakpoints);
    		if ('fillEmpty' in $$props) $$invalidate('fillEmpty', fillEmpty = $$props.fillEmpty);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		useTransform,
    		items,
    		cols,
    		dragDebounceMs,
    		gap,
    		rowHeight,
    		breakpoints,
    		fillEmpty,
    		container,
    		focuesdItem,
    		xPerPx,
    		yPerPx,
    		shadow,
    		ch,
    		onResize,
    		resizeOnMouseDown,
    		dragOnMouseDown,
    		div_binding,
    		$$slots,
    		$$scope
    	};
    }

    class Src extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, ["useTransform", "items", "cols", "dragDebounceMs", "gap", "rowHeight", "breakpoints", "fillEmpty"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.breakpoints === undefined && !('breakpoints' in props)) {
    			console_1.warn("<Src> was created without expected prop 'breakpoints'");
    		}
    	}

    	get useTransform() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useTransform(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cols() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cols(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dragDebounceMs() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dragDebounceMs(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gap() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gap(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rowHeight() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rowHeight(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get breakpoints() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set breakpoints(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fillEmpty() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillEmpty(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function getRowsCount$1(items) {
      return Math.max(...items.map(val => val.y + val.h), 1);
    }

    const makeMatrix$1 = (rows, cols) => Array.from(Array(rows), () => new Array(cols)); // make 2d array

    function makeMatrixFromItems(items, _row = getRowsCount$1(items), _col) {
      let matrix = makeMatrix$1(_row, _col);
      for (var i = 0; i < items.length; i++) {
        const value = items[i];
        const {
          x,
          y,
          w,
          h,
          responsive: { valueW },
        } = value;

        for (var j = y; j < y + h; j++) {
          const row = matrix[j];
          for (var k = x; k < x + (w - valueW); k++) {
            row[k] = value;
          }
        }
      }
      return matrix;
    }

    function findCloseBlocks$1(items, matrix, curObject) {
      const {
        w,
        h,
        x,
        y,
        responsive: { valueW },
      } = curObject;
      const tempR = matrix.slice(y, y + h);
      let result = []; // new Set()
      for (var i = 0; i < tempR.length; i++) {
        let tempA = tempR[i].slice(x, x + (w - valueW));
        result = [...result, ...tempA.map(val => val && val.id).filter(val => val)];
      }
      return [...result.filter((item, pos) => result.indexOf(item) == pos)];
      // return [...new Set(result)];
    }

    function makeMatrixFromItemsIgnore$1(
      items,
      ignoreList,
      _row, //= getRowsCount(items)
      _col,
    ) {
      let matrix = makeMatrix$1(_row, _col);
      for (var i = 0; i < items.length; i++) {
        const value = items[i];
        const {
          x,
          y,
          w,
          h,
          id,
          responsive: { valueW },
        } = value;

        if (ignoreList.indexOf(id) === -1) {
          for (var j = y; j < y + h; j++) {
            const row = matrix[j];
            if (row) {
              for (var k = x; k < x + (w - valueW); k++) {
                row[k] = value;
              }
            }
          }
        }
      }
      return matrix;
    }

    function findItemsById$1(closeBlocks, items) {
      return items.filter(value => closeBlocks.indexOf(value.id) !== -1);
    }

    function adjustItem$1(matrix, item, items = [], cols) {
      const { w: width } = item;

      let valueW = item.responsive.valueW;
      for (var i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        for (var j = 0; j < row.length; j++) {
          const empty = row.findIndex(val => val === undefined); // super dirty to check (empty for undefined)
          if (empty !== -1) {
            var z = row.slice(empty);
            var n = z.length;
            for (var x = 0; x < z.length; x++) {
              if (z[x] !== undefined) {
                n = x;
                break;
              }
            } // super dirty to check (empty for undefined)

            valueW = Math.max(width - n, 0);

            return {
              y: i,
              x: empty,
              responsive: { valueW },
            };
          }
        }
      }

      valueW = Math.max(width - cols, 0);
      return {
        y: getRowsCount$1(items),
        x: 0,
        responsive: { valueW },
      };
    }

    function resizeItems$1(items, col, rows = getRowsCount$1(items)) {
      let matrix = makeMatrix$1(rows, col);
      items.forEach((item, index) => {
        let ignore = items.slice(index + 1).map(val => val.id);
        let position = adjustItem$1(matrix, item, items, col);

        items = items.map(value => (value.id === item.id ? { ...item, ...position } : value));

        matrix = makeMatrixFromItemsIgnore$1(items, ignore, getRowsCount$1(items), col);
      });

      return items;
    }

    function findFreeSpaceForItem$1(matrix, item, items = []) {
      const cols = matrix[0].length;
      let xNtime = cols - (item.w - item.responsive.valueW);

      for (var i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        for (var j = 0; j < xNtime + 1; j++) {
          const sliceA = row.slice(j, j + (item.w - item.responsive.valueW));
          const empty = sliceA.every(val => val === undefined);
          if (empty) {
            const isEmpty = matrix.slice(i, i + item.h).every(a => a.slice(j, j + (item.w - item.responsive.valueW)).every(n => n === undefined));

            if (isEmpty) {
              return { y: i, x: j };
            }
          }
        }
      }

      return {
        y: getRowsCount$1(items),
        x: 0,
      };
    }

    function assignPosition$1(item, position, value) {
      return value.id === item.id ? { ...item, ...position } : value;
    }

    const replaceItem$1 = (item, cachedItem, value) => (value.id === item.id ? cachedItem : value);

    function moveItem$1($item, items, cols, originalItem) {
      let matrix = makeMatrixFromItemsIgnore$1(items, [$item.id], getRowsCount$1(items), cols);

      const closeBlocks = findCloseBlocks$1(items, matrix, $item);
      let closeObj = findItemsById$1(closeBlocks, items);

      const statics = closeObj.find(value => value.static);

      if (statics) {
        if (originalItem) {
          return items.map(replaceItem$1.bind(null, $item, originalItem));
        }
      }

      matrix = makeMatrixFromItemsIgnore$1(items, closeBlocks, getRowsCount$1(items), cols);

      let tempItems = items;

      let tempCloseBlocks = closeBlocks;

      let exclude = [];

      closeObj.forEach(item => {
        let position = findFreeSpaceForItem$1(matrix, item, tempItems);

        exclude.push(item.id);

        if (position) {
          tempItems = tempItems.map(assignPosition$1.bind(null, item, position));
          let getIgnoreItems = tempCloseBlocks.filter(value => exclude.indexOf(value) === -1);

          matrix = makeMatrixFromItemsIgnore$1(tempItems, getIgnoreItems, getRowsCount$1(items), cols);
        }
      });

      return tempItems;
    }

    function makeItem(item) {
      return {
        drag: {
          top: null,
          left: null,
          dragging: false,
        },
        resize: {
          width: null,
          height: null,
          resizing: false,
        },
        responsive: {
          valueW: 0,
        },
        static: false,
        resizable: !item.static,
        draggable: !item.static,
        min: { ...item.min },
        max: { ...item.max },
        ...item,
      };
    }

    const gridHelp = {
      findSpaceForItem(item, items, cols) {
        let matrix = makeMatrixFromItems(items, getRowsCount$1(items), cols);

        let position = findFreeSpaceForItem$1(matrix, item, items);
        return position;
      },

      appendItem(item, items, cols) {
        return moveItem$1(item, [...items, ...[item]], cols);
      },

      resizeItems(items, col, rows) {
        return resizeItems$1(items, col, rows);
      },

      item(obj) {
        return makeItem(obj);
      },
    };

    /* src\components\Dash.svelte generated by Svelte v3.7.1 */
    const { Object: Object_1 } = globals;

    const file$9 = "src\\components\\Dash.svelte";

    // (109:2) <Grid {fillEmpty} items={itemsArr} bind:items={itemsArr} cols={cols} let:item rowHeight={50} gap={20} on:adjust={handleAdjust} on:resize={handleWindowResize} on:mount={handleWindowResize}>
    function create_default_slot(ctx) {
    	var current;

    	var widget = new Widget({
    		props: { ref: ctx.item.id },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			widget.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(widget, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var widget_changes = {};
    			if (changed.item) widget_changes.ref = ctx.item.id;
    			widget.$set(widget_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(widget.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(widget.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(widget, detaching);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	var div, updating_items, current;

    	function grid_items_binding(value) {
    		ctx.grid_items_binding.call(null, value);
    		updating_items = true;
    		add_flush_callback(() => updating_items = false);
    	}

    	let grid_props = {
    		fillEmpty: ctx.fillEmpty,
    		items: ctx.itemsArr,
    		cols: ctx.cols,
    		rowHeight: 50,
    		gap: 20,
    		$$slots: {
    		default: [create_default_slot, ({ item }) => ({ item })]
    	},
    		$$scope: { ctx }
    	};
    	if (ctx.itemsArr !== void 0) {
    		grid_props.items = ctx.itemsArr;
    	}
    	var grid = new Src({ props: grid_props, $$inline: true });

    	binding_callbacks.push(() => bind(grid, 'items', grid_items_binding));
    	grid.$on("adjust", ctx.handleAdjust);
    	grid.$on("resize", ctx.handleWindowResize);
    	grid.$on("mount", ctx.handleWindowResize);

    	return {
    		c: function create() {
    			div = element("div");
    			grid.$$.fragment.c();
    			attr(div, "id", "gridContainer");
    			attr(div, "class", "grid-container svelte-1fifaui");
    			add_location(div, file$9, 107, 0, 3798);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(grid, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var grid_changes = {};
    			if (changed.fillEmpty) grid_changes.fillEmpty = ctx.fillEmpty;
    			if (changed.itemsArr) grid_changes.items = ctx.itemsArr;
    			if (changed.cols) grid_changes.cols = ctx.cols;
    			if (changed.$$scope) grid_changes.$$scope = { changed, ctx };
    			if (!updating_items && changed.itemsArr) {
    				grid_changes.items = ctx.itemsArr;
    			}
    			grid.$set(grid_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(grid.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(grid.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(grid);
    		}
    	};
    }

    const findSpaceForAll = false;

    const approxColumnSizePx = 50;

    function isSameSizeAndPos ({x, y, w, h}, {x: x2, y: y2, w: w2, h: h2}) {
      return x === x2 && y === y2 && w === w2 && h === h2
    }

    function getHighestColumnInUse(arr) {
      return Math.max(...arr.map(item => item.x + item.w))
    }

    function getNOfCols() {
      const gridWidth = document.getElementById('gridContainer').clientWidth;
      const nColsFitInWindow = Math.round(gridWidth/approxColumnSizePx);
      return nColsFitInWindow - (nColsFitInWindow%2);
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $_activeDashIndex, $_widgetsCount, $$unsubscribe__widgetsCount = noop, $$subscribe__widgetsCount = () => { $$unsubscribe__widgetsCount(); $$unsubscribe__widgetsCount = subscribe(_widgetsCount, $$value => { $_widgetsCount = $$value; $$invalidate('$_widgetsCount', $_widgetsCount); }); };

    	validate_store(_activeDashIndex, '_activeDashIndex');
    	component_subscribe($$self, _activeDashIndex, $$value => { $_activeDashIndex = $$value; $$invalidate('$_activeDashIndex', $_activeDashIndex); });

    	$$self.$$.on_destroy.push(() => $$unsubscribe__widgetsCount());

    	

      let { clearWidgets = false } = $$props; // fallback for no dashboards
      let widgets = [];
      let itemsArr = [];
      let prevDashIndex = $_activeDashIndex;

      let fillEmpty = false;
      const generateGridItems = (widgets, cols) => {
        let arr = [];
        widgets.forEach((ref, i) => {
          const widget = getWidget(ref);
          let {w, h, x, y} = widget.sizeAndPos[getClosestStoredColMatch(widget.sizeAndPos)];
          if (w > cols) {
            w = cols;
            $$invalidate('fillEmpty', fillEmpty = true);
          }
          else {
            $$invalidate('fillEmpty', fillEmpty = false);
          }
          let newItem = gridHelp.item({w, h, x, y, id: ref});
          if (x+w > cols || findSpaceForAll) {
            newItem = {...newItem, ...gridHelp.findSpaceForItem(newItem, arr, cols)};
          }
          arr = gridHelp.appendItem(newItem, arr, cols);
        });
        return centerGridItems(arr);
      };

      const handleWindowResize = () => {
        $$invalidate('cols', cols = getNOfCols());
        $$invalidate('itemsArr', itemsArr = generateGridItems(widgets, cols));
      };

      let prevItemsLookup = {};
      const handleAdjust = function storeWidgetSizeAndPos() {
        const changedItems = itemsArr.filter(item => !prevItemsLookup[item.id] || !isSameSizeAndPos(item, prevItemsLookup[item.id]));
        if (changedItems.length > 0) {
          const highestColumnInUse = getHighestColumnInUse(itemsArr);
          changedItems.forEach(item => {
            const {w, h, x, y} = item;
            setWidgetSizeAndPos(highestColumnInUse, item.id, {w, h, x, y});
            const currentClosestMatch = getClosestStoredColMatch(getWidget(item.id).sizeAndPos);
            if (currentClosestMatch > highestColumnInUse) {
              removeWidgetSizeAndPos(item.id, currentClosestMatch);
            }
          });
          itemsArr.forEach(item => { const $$result = prevItemsLookup[item.id] = item; return $$result; });
        }
      };

      const centerGridItems = arr => {
        const highestXPos = getHighestColumnInUse(arr);
        const halfDiff = Math.floor(((cols) - highestXPos) / 2);
        return arr.map(item => { 
          return  {...item, ...{x: item.x + halfDiff}}
        });
      };
      
      onMount(() => {
        itemsArr.forEach(item => { const $$result = prevItemsLookup[item.id] = item; return $$result; }); 
      });

      function getClosestStoredColMatch(sizeAndPos) {
        const accendingDiffArr = Object.keys(sizeAndPos).sort((a,b) => {
          const diffOfFirstVal = Math.abs(cols - a);
          const diffOfSecondVal = Math.abs(cols - b);
          return diffOfFirstVal - diffOfSecondVal
        });
        return accendingDiffArr[0]
      }

    	const writable_props = ['clearWidgets'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Dash> was created with unknown prop '${key}'`);
    	});

    	function grid_items_binding(value) {
    		itemsArr = value;
    		$$invalidate('itemsArr', itemsArr), $$invalidate('$_widgetsCount', $_widgetsCount), $$invalidate('widgets', widgets), $$invalidate('$_activeDashIndex', $_activeDashIndex), $$invalidate('prevDashIndex', prevDashIndex), $$invalidate('cols', cols), $$invalidate('clearWidgets', clearWidgets);
    	}

    	$$self.$set = $$props => {
    		if ('clearWidgets' in $$props) $$invalidate('clearWidgets', clearWidgets = $$props.clearWidgets);
    	};

    	let _widgetsCount, cols;

    	$$self.$$.update = ($$dirty = { $_activeDashIndex: 1, $_widgetsCount: 1, widgets: 1, prevDashIndex: 1, cols: 1, clearWidgets: 1 }) => {
    		if ($$dirty.$_activeDashIndex) { _widgetsCount = dashboards[$_activeDashIndex] ? dashboards[$_activeDashIndex]._widgetsCount : writable(0); $$subscribe__widgetsCount(), $$invalidate('_widgetsCount', _widgetsCount); }
    		if ($$dirty.$_widgetsCount || $$dirty.widgets || $$dirty.$_activeDashIndex || $$dirty.prevDashIndex || $$dirty.cols) { {
            if ($_widgetsCount !== widgets.length || $_activeDashIndex !== prevDashIndex) {
              $$invalidate('prevDashIndex', prevDashIndex = $_activeDashIndex);
              $$invalidate('widgets', widgets = Array.from(dashboards[$_activeDashIndex].widgets.keys()));
              $$invalidate('itemsArr', itemsArr = generateGridItems(widgets, cols));
            }
          } }
    		if ($$dirty.clearWidgets) { {
            if (clearWidgets) {
              $$invalidate('itemsArr', itemsArr = []);
            }
          } }
    	};

    	$$invalidate('cols', cols = 0);

    	return {
    		clearWidgets,
    		itemsArr,
    		fillEmpty,
    		handleWindowResize,
    		handleAdjust,
    		_widgetsCount,
    		cols,
    		grid_items_binding
    	};
    }

    class Dash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, ["clearWidgets"]);
    	}

    	get clearWidgets() {
    		throw new Error("<Dash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clearWidgets(value) {
    		throw new Error("<Dash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\WidgetMenu.svelte generated by Svelte v3.7.1 */

    const file$a = "src\\components\\WidgetMenu.svelte";

    // (37:6) {#if menuIsOpen}
    function create_if_block$6(ctx) {
    	var img0, t0, div, button, h3, t2, img1, dispose;

    	return {
    		c: function create() {
    			img0 = element("img");
    			t0 = space();
    			div = element("div");
    			button = element("button");
    			h3 = element("h3");
    			h3.textContent = "Sticky";
    			t2 = space();
    			img1 = element("img");
    			attr(img0, "class", "cancel svelte-yvtqbx");
    			attr(img0, "src", "/images/cancelIcon.svg");
    			attr(img0, "alt", "x");
    			add_location(img0, file$a, 37, 8, 1209);
    			attr(h3, "class", "svelte-yvtqbx");
    			add_location(h3, file$a, 40, 12, 1361);
    			attr(img1, "src", "/images/addIcon.svg");
    			attr(img1, "alt", "+");
    			add_location(img1, file$a, 41, 12, 1391);
    			attr(button, "class", "svelte-yvtqbx");
    			add_location(button, file$a, 39, 10, 1308);
    			attr(div, "class", "menu svelte-yvtqbx");
    			add_location(div, file$a, 38, 8, 1278);
    			dispose = listen(button, "click", ctx.click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img0, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, button);
    			append(button, h3);
    			append(button, t2);
    			append(button, img1);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img0);
    				detach(t0);
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	var nav, t0, t1, h2, t3, nav_class_value, current;

    	var trash = new Trash({
    		props: { active: ctx.trashActive },
    		$$inline: true
    	});
    	trash.$on("trash", ctx.toggleTrash);
    	trash.$on("trash", ctx.trash_handler);

    	var if_block = (ctx.menuIsOpen) && create_if_block$6(ctx);

    	var add_1 = new Add({
    		props: { active: ctx.menuIsOpen },
    		$$inline: true
    	});
    	add_1.$on("add", ctx.menu.toggle);

    	return {
    		c: function create() {
    			nav = element("nav");
    			trash.$$.fragment.c();
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Widgets";
    			t3 = space();
    			add_1.$$.fragment.c();
    			attr(h2, "class", "svelte-yvtqbx");
    			add_location(h2, file$a, 45, 4, 1488);
    			attr(nav, "class", nav_class_value = "" + null_to_empty((ctx.isAtBottom ? 'bottom' : '')) + " svelte-yvtqbx");
    			add_location(nav, file$a, 34, 2, 1007);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, nav, anchor);
    			mount_component(trash, nav, null);
    			append(nav, t0);
    			if (if_block) if_block.m(nav, null);
    			append(nav, t1);
    			append(nav, h2);
    			append(nav, t3);
    			mount_component(add_1, nav, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var trash_changes = {};
    			if (changed.trashActive) trash_changes.active = ctx.trashActive;
    			trash.$set(trash_changes);

    			if (ctx.menuIsOpen) {
    				if (!if_block) {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(nav, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			var add_1_changes = {};
    			if (changed.menuIsOpen) add_1_changes.active = ctx.menuIsOpen;
    			add_1.$set(add_1_changes);

    			if ((!current || changed.isAtBottom) && nav_class_value !== (nav_class_value = "" + null_to_empty((ctx.isAtBottom ? 'bottom' : '')) + " svelte-yvtqbx")) {
    				attr(nav, "class", nav_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(trash.$$.fragment, local);

    			transition_in(add_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(trash.$$.fragment, local);
    			transition_out(add_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(nav);
    			}

    			destroy_component(trash);

    			if (if_block) if_block.d();

    			destroy_component(add_1);
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	

      let menuIsOpen = false;
      const menu = new Toggler(state => { const $$result = menuIsOpen = state; $$invalidate('menuIsOpen', menuIsOpen); return $$result; });
      let trashActive = false;
      const toggleTrash = () => {$$invalidate('trashActive', trashActive = !trashActive);};
      const add = type => {
        addWidget(type);
      };

      let isAtBottom = false;

      onMount(() => {
        let observer = new IntersectionObserver(entries => {
          console.log(entries[0]);
          if (entries[0].isIntersecting) {
            document.body.classList.add("header-not-at-top");
            $$invalidate('isAtBottom', isAtBottom = true);
          } else {
            document.body.classList.remove("header-not-at-top");
            $$invalidate('isAtBottom', isAtBottom = false);
          }
        }, );
        let footer = document.querySelector('#footer');
        observer.observe(footer); 
        return () => observer.unobserve(footer); 
      });

    	function trash_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler() {
    		return add('Sticky');
    	}

    	return {
    		menuIsOpen,
    		menu,
    		trashActive,
    		toggleTrash,
    		add,
    		isAtBottom,
    		trash_handler,
    		click_handler
    	};
    }

    class WidgetMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, []);
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.7.1 */

    const file$b = "src\\components\\Footer.svelte";

    function create_fragment$b(ctx) {
    	var footer, img, t0, a, div0, t2, div1, t3, br0, t4, br1, t5, t6, div2, span, br2, t8;

    	return {
    		c: function create() {
    			footer = element("footer");
    			img = element("img");
    			t0 = space();
    			a = element("a");
    			div0 = element("div");
    			div0.textContent = "about";
    			t2 = space();
    			div1 = element("div");
    			t3 = text("v16");
    			br0 = element("br");
    			t4 = text("-geckos-");
    			br1 = element("br");
    			t5 = text("02");
    			t6 = space();
    			div2 = element("div");
    			span = element("span");
    			span.textContent = "GitHub";
    			br2 = element("br");
    			t8 = text("repo");
    			attr(img, "src", "/images/logo.svg");
    			attr(img, "alt", "Dashy");
    			attr(img, "class", "svelte-8gbz5b");
    			add_location(img, file$b, 3, 4, 30);
    			add_location(div0, file$b, 5, 8, 151);
    			add_location(br0, file$b, 6, 28, 197);
    			add_location(br1, file$b, 6, 41, 210);
    			attr(div1, "class", "v16 svelte-8gbz5b");
    			add_location(div1, file$b, 6, 8, 177);
    			attr(span, "class", "svelte-8gbz5b");
    			add_location(span, file$b, 7, 13, 238);
    			add_location(br2, file$b, 7, 32, 257);
    			add_location(div2, file$b, 7, 8, 233);
    			attr(a, "href", "https://github.com/chingu-voyages/v16-geckos-team-02");
    			attr(a, "class", "svelte-8gbz5b");
    			add_location(a, file$b, 4, 4, 78);
    			attr(footer, "id", "footer");
    			attr(footer, "class", "svelte-8gbz5b");
    			add_location(footer, file$b, 2, 0, 4);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, footer, anchor);
    			append(footer, img);
    			append(footer, t0);
    			append(footer, a);
    			append(a, div0);
    			append(a, t2);
    			append(a, div1);
    			append(div1, t3);
    			append(div1, br0);
    			append(div1, t4);
    			append(div1, br1);
    			append(div1, t5);
    			append(a, t6);
    			append(a, div2);
    			append(div2, span);
    			append(div2, br2);
    			append(div2, t8);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(footer);
    			}
    		}
    	};
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$b, safe_not_equal, []);
    	}
    }

    /* src\App.svelte generated by Svelte v3.7.1 */

    const file$c = "src\\App.svelte";

    function create_fragment$c(ctx) {
    	var main, t0, t1, main_class_value, t2, current;

    	var dashnav = new DashNav({ $$inline: true });
    	dashnav.$on("changingDash", ctx.clearDash);

    	var dash = new Dash({
    		props: { clearWidgets: ctx.clearWidgets },
    		$$inline: true
    	});

    	var widgetmenu = new WidgetMenu({ $$inline: true });
    	widgetmenu.$on("trash", ctx.activateTrash);

    	var footer = new Footer({ $$inline: true });

    	return {
    		c: function create() {
    			main = element("main");
    			dashnav.$$.fragment.c();
    			t0 = space();
    			dash.$$.fragment.c();
    			t1 = space();
    			widgetmenu.$$.fragment.c();
    			t2 = space();
    			footer.$$.fragment.c();
    			attr(main, "class", main_class_value = "" + null_to_empty((ctx.trashActive ? 'trash' : '')) + " svelte-tgpksj");
    			add_location(main, file$c, 16, 0, 469);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(dashnav, main, null);
    			append(main, t0);
    			mount_component(dash, main, null);
    			append(main, t1);
    			mount_component(widgetmenu, main, null);
    			insert(target, t2, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var dash_changes = {};
    			if (changed.clearWidgets) dash_changes.clearWidgets = ctx.clearWidgets;
    			dash.$set(dash_changes);

    			if ((!current || changed.trashActive) && main_class_value !== (main_class_value = "" + null_to_empty((ctx.trashActive ? 'trash' : '')) + " svelte-tgpksj")) {
    				attr(main, "class", main_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(dashnav.$$.fragment, local);

    			transition_in(dash.$$.fragment, local);

    			transition_in(widgetmenu.$$.fragment, local);

    			transition_in(footer.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(dashnav.$$.fragment, local);
    			transition_out(dash.$$.fragment, local);
    			transition_out(widgetmenu.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(main);
    			}

    			destroy_component(dashnav);

    			destroy_component(dash);

    			destroy_component(widgetmenu);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(footer, detaching);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	
    	let trashActive = false;
    	let clearWidgets = false;
    	const clearDash = event => {
    		$$invalidate('clearWidgets', clearWidgets = true);
    		setTimeout(() => { const $$result = clearWidgets = false; $$invalidate('clearWidgets', clearWidgets); return $$result; }, 0);
    	};
    	const activateTrash = event => {
    		$$invalidate('trashActive', trashActive = event.detail.active);
    	};

    	return {
    		trashActive,
    		clearWidgets,
    		clearDash,
    		activateTrash
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$c, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
