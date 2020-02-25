
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

    const dashboards = [];
    let _activeDashIndex = writable(2); 
    const setActiveDashIndex = i => _activeDashIndex.update(() => i);
    const getActiveDash = () => dashboards[get_store_value(_activeDashIndex)];
    const getWidget = ref => getActiveDash().widgets.get(ref);

    const addDash = (title = '') => {
        try {
            const dashData = {
                _title: writable(title),
                widgets: new Map(),
                _widgetsCount: writable(0)
            };
            dashboards.push(dashData);
            setActiveDashIndex(dashboards.length-1);
        } catch (e) {
            // TODO decide how to handle the exception
        }
    };
    const addWidget = (type, title = '', data = '', sizeAndPos = {w: 8, h: 5, x: Infinity, y: 0}) => {
        try {
            const widgetData = {
                type,
                sizeAndPos,
                _title: writable(title),
                _data: writable(data)
            };
            getActiveDash().widgets.set(Symbol(), widgetData);
            getActiveDash()._widgetsCount.update(n => n + 1);
        } catch (e) {
            // TODO decide how to handle the exception
        }
    };

    const removeDash = index => {
        try {
            dashboards.splice(index, 1);
        } catch (e) {
            // TODO decide how to handle the exception
        }
    };

    const removeWidget = (widgetRef, dashRef = get_store_value(_activeDashIndex)) => {
        try {
            if(dashboards[dashRef].widgets.delete(widgetRef))
            {
                dashboards[dashRef]._widgetsCount.update(n => n - 1);
            }
        } catch (e) {
            // TODO decide how to handle the exception
        }
    };

    const setWidgetSizeAndPos = (ref, data) => {
        try {
            getActiveDash().widgets.get(ref).sizeAndPos = data;
        } catch (e) {
            // TODO decide how to handle the exception
        }
    };

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

    /* src/components/buttons/Left.svelte generated by Svelte v3.7.1 */

    const file = "src/components/buttons/Left.svelte";

    function create_fragment(ctx) {
    	var button, img, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			attr(img, "src", "/images/arrowRightIcon.svg");
    			attr(img, "alt", "prev");
    			add_location(img, file, 9, 4, 205);
    			attr(button, "class", "svelte-dnkjx7");
    			add_location(button, file, 8, 0, 176);
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

    /* src/components/buttons/Right.svelte generated by Svelte v3.7.1 */

    const file$1 = "src/components/buttons/Right.svelte";

    function create_fragment$1(ctx) {
    	var button, img, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			attr(img, "src", "/images/arrowRightIcon.svg");
    			attr(img, "alt", "next");
    			add_location(img, file$1, 9, 4, 208);
    			attr(button, "class", "svelte-k9n6h4");
    			add_location(button, file$1, 8, 0, 178);
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

    /* src/components/buttons/Trash.svelte generated by Svelte v3.7.1 */

    const file$2 = "src/components/buttons/Trash.svelte";

    // (16:4) {#if active}
    function create_if_block(ctx) {
    	var img, img_class_value, dispose;

    	return {
    		c: function create() {
    			img = element("img");
    			attr(img, "class", img_class_value = "cancel " + ctx.cancelPos + " svelte-bfam5t");
    			attr(img, "src", "/images/cancelIcon.svg");
    			attr(img, "alt", "x");
    			add_location(img, file$2, 16, 8, 384);
    			dispose = listen(img, "click", ctx.trash);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.cancelPos) && img_class_value !== (img_class_value = "cancel " + ctx.cancelPos + " svelte-bfam5t")) {
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
    			attr(img, "src", "/images/TrashIcon.svg");
    			attr(img, "alt", "-");
    			add_location(img, file$2, 18, 4, 487);
    			attr(button, "class", button_class_value = "" + null_to_empty((ctx.active ? 'active' : '')) + " svelte-bfam5t");
    			add_location(button, file$2, 14, 0, 300);
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

    			if ((changed.active) && button_class_value !== (button_class_value = "" + null_to_empty((ctx.active ? 'active' : '')) + " svelte-bfam5t")) {
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
    	let { active = false, cancelPos = 'top' } = $$props;
        const dispatch = createEventDispatcher();
        const trash = () => {
            dispatch('trash', {
    			active: !active // not sure why this inverts
    		});
        };

    	const writable_props = ['active', 'cancelPos'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Trash> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    		if ('cancelPos' in $$props) $$invalidate('cancelPos', cancelPos = $$props.cancelPos);
    	};

    	return { active, cancelPos, trash };
    }

    class Trash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["active", "cancelPos"]);
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
    }

    /* src/components/buttons/Add.svelte generated by Svelte v3.7.1 */

    const file$3 = "src/components/buttons/Add.svelte";

    function create_fragment$3(ctx) {
    	var button, img, button_class_value, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			attr(img, "src", "/images/addIcon.svg");
    			attr(img, "alt", "+");
    			add_location(img, file$3, 9, 4, 242);
    			attr(button, "class", button_class_value = "" + null_to_empty((ctx.active ? 'active' : '')) + " svelte-1g5cvn8");
    			add_location(button, file$3, 8, 0, 181);
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
    			if ((changed.active) && button_class_value !== (button_class_value = "" + null_to_empty((ctx.active ? 'active' : '')) + " svelte-1g5cvn8")) {
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

    /* src/components/DashNav.svelte generated by Svelte v3.7.1 */

    const file$4 = "src/components/DashNav.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.dashIndex = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.dash = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (103:4) {:else}
    function create_else_block_3(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", "carousel svelte-kkox1j");
    			add_location(div, file$4, 103, 8, 3808);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (74:4) {#if dashboards.length > 0}
    function create_if_block$1(ctx) {
    	var if_block_anchor;

    	function select_block_type_1(ctx) {
    		if (ctx.trashIsOpen) return create_if_block_1;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type_1(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
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

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (84:8) {:else}
    function create_else_block(ctx) {
    	var div1, div0, div0_class_value;

    	var each_value_1 = ctx.navIndexArray;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div0, "class", div0_class_value = "carousel " + ctx.animationClass + " svelte-kkox1j");
    			add_location(div0, file$4, 85, 12, 2904);
    			attr(div1, "class", "carousel-space svelte-kkox1j");
    			add_location(div1, file$4, 84, 8, 2863);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.navIndexArray || changed.$_activeDashIndex || changed.editingTitle || changed.$_title || changed.dashboards || changed.get) {
    				each_value_1 = ctx.navIndexArray;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}

    			if ((changed.animationClass) && div0_class_value !== (div0_class_value = "carousel " + ctx.animationClass + " svelte-kkox1j")) {
    				attr(div0, "class", div0_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (75:8) {#if trashIsOpen}
    function create_if_block_1(ctx) {
    	var div;

    	var each_value = dashboards;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div, "class", "trashMenu svelte-kkox1j");
    			add_location(div, file$4, 75, 12, 2539);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.get || changed.dashboards) {
    				each_value = dashboards;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (96:20) {:else}
    function create_else_block_2(ctx) {
    	var button, t_value = dashboards[ctx.dashIndex] ? get_store_value(dashboards[ctx.dashIndex]._title) : '', t, dispose;

    	function click_handler_2() {
    		return ctx.click_handler_2(ctx);
    	}

    	return {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", "nav-button-" + ctx.i + " svelte-kkox1j");
    			add_location(button, file$4, 96, 24, 3538);
    			dispose = listen(button, "click", click_handler_2);
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.navIndexArray) && t_value !== (t_value = dashboards[ctx.dashIndex] ? get_store_value(dashboards[ctx.dashIndex]._title) : '')) {
    				set_data(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    // (88:20) {#if dashIndex === $_activeDashIndex}
    function create_if_block_2(ctx) {
    	var div, t;

    	function select_block_type_3(ctx) {
    		if (ctx.editingTitle) return create_if_block_3;
    		return create_else_block_1;
    	}

    	var current_block_type = select_block_type_3(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			attr(div, "class", "current svelte-kkox1j");
    			add_location(div, file$4, 88, 24, 3081);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			if_block.m(div, null);
    			append(div, t);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if_block.d();
    		}
    	};
    }

    // (92:28) {:else}
    function create_else_block_1(ctx) {
    	var button, t, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			t = text(ctx.$_title);
    			attr(button, "class", "active-dash-title svelte-kkox1j");
    			add_location(button, file$4, 92, 32, 3331);
    			dispose = listen(button, "click", ctx.click_handler_1);
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.$_title) {
    				set_data(t, ctx.$_title);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    // (90:28) {#if editingTitle}
    function create_if_block_3(ctx) {
    	var input, dispose;

    	return {
    		c: function create() {
    			input = element("input");
    			attr(input, "type", "text");
    			input.autofocus = true;
    			attr(input, "class", "svelte-kkox1j");
    			add_location(input, file$4, 90, 32, 3182);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(input, "blur", ctx.closeEditingTitle)
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

    // (87:16) {#each navIndexArray as dashIndex, i}
    function create_each_block_1(ctx) {
    	var if_block_anchor;

    	function select_block_type_2(ctx) {
    		if (ctx.dashIndex === ctx.$_activeDashIndex) return create_if_block_2;
    		return create_else_block_2;
    	}

    	var current_block_type = select_block_type_2(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
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

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (77:12) {#each dashboards as dash, i}
    function create_each_block(ctx) {
    	var button, h3, t0_value = get_store_value(ctx.dash._title), t0, t1, img, t2, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		c: function create() {
    			button = element("button");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			attr(h3, "class", "svelte-kkox1j");
    			add_location(h3, file$4, 78, 20, 2681);
    			attr(img, "src", "/images/trashIcon.svg");
    			attr(img, "alt", "-");
    			attr(img, "class", "svelte-kkox1j");
    			add_location(img, file$4, 79, 20, 2730);
    			attr(button, "class", "svelte-kkox1j");
    			add_location(button, file$4, 77, 16, 2621);
    			dispose = listen(button, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, h3);
    			append(h3, t0);
    			append(button, t1);
    			append(button, img);
    			append(button, t2);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var nav, t0, t1, div, t2, t3, current;

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

    	function select_block_type(ctx) {
    		if (dashboards.length > 0) return create_if_block$1;
    		return create_else_block_3;
    	}

    	var current_block_type = select_block_type();
    	var if_block = current_block_type(ctx);

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
    			attr(div, "class", "container svelte-kkox1j");
    			add_location(div, file$4, 72, 4, 2445);
    			attr(nav, "class", "svelte-kkox1j");
    			add_location(nav, file$4, 69, 0, 2311);
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
    			if_block.m(div, null);
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

    			if (current_block_type === (current_block_type = select_block_type()) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(left.$$.fragment, local);

    			transition_in(trash_1.$$.fragment, local);

    			transition_in(add.$$.fragment, local);

    			transition_in(right.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(left.$$.fragment, local);
    			transition_out(trash_1.$$.fragment, local);
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

    			if_block.d();

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

    	
        
        let trashIsOpen = false;
        const trash = new Toggler(state => { const $$result = trashIsOpen = state; $$invalidate('trashIsOpen', trashIsOpen); return $$result; });
        let editingTitle = false;

        const makeNavIndexArray = (activeIndex) => {
            let arr = [];
            for (let i=0;i<5;i++) {
                if (dashboards.length < 5) { // no loop
                    arr.push((activeIndex+i-2));
                }
                else {
                    const loopedIndex = (dashboards.length + activeIndex + i - 2) % dashboards.length;
                    arr.push(loopedIndex);
                }
            }
            return arr
        }; // fallback for no dashboards

        let animationClass = '';
        const setActiveDash = shift => {
            const nextDashIndex = (dashboards.length + $_activeDashIndex + shift) % dashboards.length;
            if (shift !== 0 && nextDashIndex !== $_activeDashIndex) {
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

    	function click_handler({ i }) {
    		return deleteDash(i);
    	}

    	function input_input_handler() {
    		_title.set(this.value);
    	}

    	function click_handler_1() {
    		const $$result = editingTitle = true;
    		$$invalidate('editingTitle', editingTitle);
    		return $$result;
    	}

    	function click_handler_2({ i }) {
    		return setActiveDash(i > 3 ? 1 : -1);
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
    		click_handler,
    		input_input_handler,
    		click_handler_1,
    		click_handler_2,
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

    /* src/components/widgets/stickyTypes/Text.svelte generated by Svelte v3.7.1 */

    const file$5 = "src/components/widgets/stickyTypes/Text.svelte";

    // (10:0) {:else}
    function create_else_block$1(ctx) {
    	var article, t, dispose;

    	return {
    		c: function create() {
    			article = element("article");
    			t = text(ctx.$_data);
    			attr(article, "class", "svelte-74unb1");
    			add_location(article, file$5, 10, 1, 287);
    			dispose = listen(article, "click", ctx.click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, article, anchor);
    			append(article, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.$_data) {
    				set_data(t, ctx.$_data);
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

    // (8:0) {#if editing}
    function create_if_block$2(ctx) {
    	var textarea, dispose;

    	return {
    		c: function create() {
    			textarea = element("textarea");
    			textarea.autofocus = true;
    			attr(textarea, "class", "svelte-74unb1");
    			add_location(textarea, file$5, 8, 1, 170);

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

    /* src/components/widgets/Sticky.svelte generated by Svelte v3.7.1 */

    const file$6 = "src/components/widgets/Sticky.svelte";

    // (15:0) {:else}
    function create_else_block$2(ctx) {
    	var textarea, dispose;

    	return {
    		c: function create() {
    			textarea = element("textarea");
    			attr(textarea, "class", "svelte-nk0xsy");
    			add_location(textarea, file$6, 15, 4, 383);
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

    /* src/components/widgets/Widget.svelte generated by Svelte v3.7.1 */

    const file$7 = "src/components/widgets/Widget.svelte";

    // (32:2) {:else}
    function create_else_block_1$1(ctx) {
    	var h2, t, dispose;

    	return {
    		c: function create() {
    			h2 = element("h2");
    			t = text(ctx.$_title);
    			attr(h2, "class", "svelte-h078v");
    			add_location(h2, file$7, 32, 4, 1044);
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
    			attr(input, "class", "svelte-h078v");
    			add_location(input, file$7, 30, 4, 940);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(input, "blur", ctx.blur_handler)
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
    			attr(div, "class", "svelte-h078v");
    			add_location(div, file$7, 37, 6, 1179);
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
    	var div, t0, current_block_type_index, if_block1, t1, span, div_transition, current;

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
    			attr(span, "class", "svelte-h078v");
    			add_location(span, file$7, 39, 2, 1239);
    			attr(div, "class", "svelte-h078v");
    			add_location(div, file$7, 28, 0, 854);
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

    /* node_modules/svelte-grid/src/index.svelte generated by Svelte v3.7.1 */
    const { console: console_1, window: window_1 } = globals;

    const file$8 = "node_modules/svelte-grid/src/index.svelte";

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

    /* src/components/Dash.svelte generated by Svelte v3.7.1 */

    const file$9 = "src/components/Dash.svelte";

    // (67:2) <Grid {fillEmpty} items={items_arr} bind:items={items_arr} cols={$cols} let:item rowHeight={50} gap={20} on:adjust={event => storeWidgetSizeAndPos(event.detail.focuesdItem)} on:resize={handleWindowResize} on:mount={handleWindowResize}>
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
    		items: ctx.items_arr,
    		cols: ctx.$cols,
    		rowHeight: 50,
    		gap: 20,
    		$$slots: {
    		default: [create_default_slot, ({ item }) => ({ item })]
    	},
    		$$scope: { ctx }
    	};
    	if (ctx.items_arr !== void 0) {
    		grid_props.items = ctx.items_arr;
    	}
    	var grid = new Src({ props: grid_props, $$inline: true });

    	binding_callbacks.push(() => bind(grid, 'items', grid_items_binding));
    	grid.$on("adjust", ctx.adjust_handler);
    	grid.$on("resize", ctx.handleWindowResize);
    	grid.$on("mount", ctx.handleWindowResize);

    	return {
    		c: function create() {
    			div = element("div");
    			grid.$$.fragment.c();
    			attr(div, "id", "gridContainer");
    			attr(div, "class", "grid-container svelte-12dt8ii");
    			add_location(div, file$9, 65, 0, 2326);
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
    			if (changed.items_arr) grid_changes.items = ctx.items_arr;
    			if (changed.$cols) grid_changes.cols = ctx.$cols;
    			if (changed.$$scope) grid_changes.$$scope = { changed, ctx };
    			if (!updating_items && changed.items_arr) {
    				grid_changes.items = ctx.items_arr;
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

    function instance$9($$self, $$props, $$invalidate) {
    	let $_activeDashIndex, $_widgetsCount, $$unsubscribe__widgetsCount = noop, $$subscribe__widgetsCount = () => { $$unsubscribe__widgetsCount(); $$unsubscribe__widgetsCount = subscribe(_widgetsCount, $$value => { $_widgetsCount = $$value; $$invalidate('$_widgetsCount', $_widgetsCount); }); }, $cols;

    	validate_store(_activeDashIndex, '_activeDashIndex');
    	component_subscribe($$self, _activeDashIndex, $$value => { $_activeDashIndex = $$value; $$invalidate('$_activeDashIndex', $_activeDashIndex); });

    	$$self.$$.on_destroy.push(() => $$unsubscribe__widgetsCount());

    	 // fallback for no dashboards
      let widgets = [];
      let items_arr = []; 
      const cols = writable(40); validate_store(cols, 'cols'); component_subscribe($$self, cols, $$value => { $cols = $$value; $$invalidate('$cols', $cols); });
      let fillEmpty = false;

      const getNOfCols = () => {
        const gridWidth = document.getElementById('gridContainer').clientWidth;
        const nColsFitInWindow = Math.round(gridWidth/approxColumnSizePx);
        return nColsFitInWindow - (nColsFitInWindow%2);
      };
      const storeWidgetSizeAndPos = item => {
        const {w, h, x, y} = item;
        setWidgetSizeAndPos(item.id, {w, h, x, y});
      };
      const centerGridItems = arr => {
        // find highest x position 
        const highestXPos = Math.max(...arr.map(item => item.x + item.w));
        // diff between cols and highestXPos divided by two
        const halfDiff = Math.floor((($cols) - highestXPos) / 2);
        // shift all x positions up by halfDiff
        return arr.map(item => { 
          return  {...item, ...{x: item.x + halfDiff}}
        });
      };
      const generateGridItems = (widgets, cols) => {
        let arr = [];
        widgets.forEach((ref, i) => {
          let {w, h, x, y} = getWidget(ref).sizeAndPos;
          if (w > cols) { // width of item is larger then grid:
            w = cols; // prevent items overflowing x
            $$invalidate('fillEmpty', fillEmpty = true); // fill empty spaces
          }
          else {
            $$invalidate('fillEmpty', fillEmpty = false);
          }
          let newItem = gridHelp.item({w, h, x, y, id: ref});
          if (x+w >= cols || findSpaceForAll) {
            newItem = {...newItem, ...gridHelp.findSpaceForItem(newItem, arr, cols)};
          }
          arr = gridHelp.appendItem(newItem, arr, cols);
        });
        return centerGridItems(arr);
      };
      const handleWindowResize = () => {
        cols.update(getNOfCols);
        $$invalidate('items_arr', items_arr = generateGridItems(widgets, $cols));
      };

    	function grid_items_binding(value) {
    		items_arr = value;
    		$$invalidate('items_arr', items_arr), $$invalidate('$_widgetsCount', $_widgetsCount), $$invalidate('widgets', widgets), $$invalidate('$_activeDashIndex', $_activeDashIndex), $$invalidate('$cols', $cols);
    	}

    	function adjust_handler(event) {
    		return storeWidgetSizeAndPos(event.detail.focuesdItem);
    	}

    	let _widgetsCount;

    	$$self.$$.update = ($$dirty = { $_activeDashIndex: 1, $_widgetsCount: 1, widgets: 1, $cols: 1 }) => {
    		if ($$dirty.$_activeDashIndex) { _widgetsCount = dashboards[$_activeDashIndex] ? dashboards[$_activeDashIndex]._widgetsCount : writable(0); $$subscribe__widgetsCount(), $$invalidate('_widgetsCount', _widgetsCount); }
    		if ($$dirty.$_widgetsCount || $$dirty.widgets || $$dirty.$_activeDashIndex || $$dirty.$cols) { {
            if ($_widgetsCount !== widgets.length) {
              $$invalidate('widgets', widgets = Array.from(dashboards[$_activeDashIndex].widgets.keys()));
              $$invalidate('items_arr', items_arr = generateGridItems(widgets, $cols));
            }
          } }
    	};

    	return {
    		items_arr,
    		cols,
    		fillEmpty,
    		storeWidgetSizeAndPos,
    		handleWindowResize,
    		_widgetsCount,
    		$cols,
    		grid_items_binding,
    		adjust_handler
    	};
    }

    class Dash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, []);
    	}
    }

    /* src/components/WidgetMenu.svelte generated by Svelte v3.7.1 */

    const file$a = "src/components/WidgetMenu.svelte";

    // (19:6) {#if menuIsOpen}
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
    			attr(img0, "class", "cancel svelte-oxjxza");
    			attr(img0, "src", "/images/cancelIcon.svg");
    			attr(img0, "alt", "x");
    			add_location(img0, file$a, 19, 8, 608);
    			attr(h3, "class", "svelte-oxjxza");
    			add_location(h3, file$a, 22, 12, 757);
    			attr(img1, "src", "/images/addIcon.svg");
    			attr(img1, "alt", "+");
    			add_location(img1, file$a, 23, 12, 786);
    			attr(button, "class", "svelte-oxjxza");
    			add_location(button, file$a, 21, 10, 705);
    			attr(div, "class", "menu svelte-oxjxza");
    			add_location(div, file$a, 20, 8, 676);
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
    	var div, nav, t0, t1, h2, t3, current;

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
    			div = element("div");
    			nav = element("nav");
    			trash.$$.fragment.c();
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Widgets";
    			t3 = space();
    			add_1.$$.fragment.c();
    			attr(h2, "class", "svelte-oxjxza");
    			add_location(h2, file$a, 27, 4, 879);
    			attr(nav, "class", "svelte-oxjxza");
    			add_location(nav, file$a, 16, 2, 446);
    			attr(div, "class", "menuArea svelte-oxjxza");
    			add_location(div, file$a, 15, 0, 421);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, nav);
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
    				detach(div);
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

    /* src/App.svelte generated by Svelte v3.7.1 */

    const file$b = "src/App.svelte";

    function create_fragment$b(ctx) {
    	var main, t0, t1, main_class_value, current;

    	var dashnav = new DashNav({ $$inline: true });

    	var dash = new Dash({ $$inline: true });

    	var widgetmenu = new WidgetMenu({ $$inline: true });
    	widgetmenu.$on("trash", ctx.activateTrash);

    	return {
    		c: function create() {
    			main = element("main");
    			dashnav.$$.fragment.c();
    			t0 = space();
    			dash.$$.fragment.c();
    			t1 = space();
    			widgetmenu.$$.fragment.c();
    			attr(main, "class", main_class_value = "" + null_to_empty((ctx.trashActive ? 'trash' : '')) + " svelte-1unwpm5");
    			add_location(main, file$b, 10, 0, 276);
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
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.trashActive) && main_class_value !== (main_class_value = "" + null_to_empty((ctx.trashActive ? 'trash' : '')) + " svelte-1unwpm5")) {
    				attr(main, "class", main_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(dashnav.$$.fragment, local);

    			transition_in(dash.$$.fragment, local);

    			transition_in(widgetmenu.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(dashnav.$$.fragment, local);
    			transition_out(dash.$$.fragment, local);
    			transition_out(widgetmenu.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(main);
    			}

    			destroy_component(dashnav);

    			destroy_component(dash);

    			destroy_component(widgetmenu);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	
    	let trashActive = false;
    	const activateTrash = event => {
    		$$invalidate('trashActive', trashActive = event.detail.active);
    	};

    	return { trashActive, activateTrash };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, []);
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
