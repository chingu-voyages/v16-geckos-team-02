
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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

    const dashboards = new Map();
    const activeDashId = Symbol(); // the first dashboard key
    const getActiveDash = () => dashboards.get(activeDashId);
    const getWidget = ref => getActiveDash().widgets.get(ref);

    const addDash = (title, ref = Symbol()) => {
        try {
            const dashData = {
                _title: writable(title),
                widgets: new Map(),
                _widgetsCount: writable(0)
            };
            dashboards.set(ref, dashData);
        } catch (e) {
            // TODO decide how to handle the exception
        }
    };
    const addWidget = type => {
        try {
            const widgetData = {
                type,
                sizeAndPos: {w: 2, h: 2, x: 0, y: 0},
                _title: writable(''),
                _data: writable('')
            };
            getActiveDash().widgets.set(Symbol(), widgetData);
            getActiveDash()._widgetsCount.update(n => n + 1);

        } catch (e) {
            // TODO decide how to handle the exception
        }
    };

    const removeWidget = (widgetRef, dashRef = activeDashId) => {
        try {
            if(dashboards.get(dashRef).widgets.delete(widgetRef))
            {
                dashboards.get(dashRef)._widgetsCount.update(n => n - 1);
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

    addDash('default dash', activeDashId);
    addWidget('Sticky');

    /* src\components\buttons\Left.svelte generated by Svelte v3.7.1 */

    const file = "src\\components\\buttons\\Left.svelte";

    function create_fragment(ctx) {
    	var button, img;

    	return {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			attr(img, "src", "/images/arrowRightIcon.svg");
    			attr(img, "alt", "prev");
    			add_location(img, file, 5, 4, 39);
    			attr(button, "class", "svelte-1l6716q");
    			add_location(button, file, 4, 0, 25);
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
    		}
    	};
    }

    class Left extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    	}
    }

    /* src\components\buttons\Right.svelte generated by Svelte v3.7.1 */

    const file$1 = "src\\components\\buttons\\Right.svelte";

    function create_fragment$1(ctx) {
    	var button, img;

    	return {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			attr(img, "src", "/images/arrowRightIcon.svg");
    			attr(img, "alt", "next");
    			add_location(img, file$1, 5, 4, 39);
    			attr(button, "class", "svelte-1bwa45r");
    			add_location(button, file$1, 4, 0, 25);
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
    		}
    	};
    }

    class Right extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src\components\buttons\Trash.svelte generated by Svelte v3.7.1 */

    const file$2 = "src\\components\\buttons\\Trash.svelte";

    // (13:0) {#if active}
    function create_if_block(ctx) {
    	var img, dispose;

    	return {
    		c: function create() {
    			img = element("img");
    			attr(img, "class", "cancel");
    			attr(img, "src", "/images/cancelIcon.svg");
    			attr(img, "alt", "x");
    			add_location(img, file$2, 13, 0, 283);
    			dispose = listen(img, "click", ctx.trash);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
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
    	var t, button, img, button_class_value, dispose;

    	var if_block = (ctx.active) && create_if_block(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			button = element("button");
    			img = element("img");
    			attr(img, "src", "/images/TrashIcon.svg");
    			attr(img, "alt", "-");
    			add_location(img, file$2, 15, 58, 426);
    			attr(button, "class", button_class_value = "" + null_to_empty((ctx.active ? 'active' : '')) + " svelte-9jl02c");
    			add_location(button, file$2, 15, 0, 368);
    			dispose = listen(button, "click", ctx.trash);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t, anchor);
    			insert(target, button, anchor);
    			append(button, img);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.active) {
    				if (!if_block) {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((changed.active) && button_class_value !== (button_class_value = "" + null_to_empty((ctx.active ? 'active' : '')) + " svelte-9jl02c")) {
    				attr(button, "class", button_class_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(t);
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { active } = $$props;
        const dispatch = createEventDispatcher();
        const trash = () => {
            dispatch('trash', {
    			active: !active // not sure why this inverts
    		});
        };

    	const writable_props = ['active'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Trash> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    	};

    	return { active, trash };
    }

    class Trash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$2, safe_not_equal, ["active"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.active === undefined && !('active' in props)) {
    			console.warn("<Trash> was created without expected prop 'active'");
    		}
    	}

    	get active() {
    		throw new Error("<Trash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
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
    			attr(button, "class", button_class_value = "" + null_to_empty((ctx.active ? 'active' : '')) + " svelte-9b9csn");
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
    			if ((changed.active) && button_class_value !== (button_class_value = "" + null_to_empty((ctx.active ? 'active' : '')) + " svelte-9b9csn")) {
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

    function instance$1($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$1, create_fragment$3, safe_not_equal, ["active"]);

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

    /* src\components\DashNav.svelte generated by Svelte v3.7.1 */

    const file$4 = "src\\components\\DashNav.svelte";

    // (17:8) {:else}
    function create_else_block(ctx) {
    	var a, t, dispose;

    	return {
    		c: function create() {
    			a = element("a");
    			t = text(ctx.$_title);
    			attr(a, "class", "active-dash-title svelte-1i0u2mm");
    			add_location(a, file$4, 17, 12, 544);
    			dispose = listen(a, "click", ctx.click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.$_title) {
    				set_data(t, ctx.$_title);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			dispose();
    		}
    	};
    }

    // (15:8) {#if editingTitle}
    function create_if_block$1(ctx) {
    	var input, dispose;

    	return {
    		c: function create() {
    			input = element("input");
    			attr(input, "type", "text");
    			input.autofocus = true;
    			attr(input, "class", "svelte-1i0u2mm");
    			add_location(input, file$4, 15, 12, 424);

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

    function create_fragment$4(ctx) {
    	var nav, t0, t1, div, t2, t3, current;

    	var left = new Left({ $$inline: true });

    	var trash = new Trash({ $$inline: true });

    	function select_block_type(ctx) {
    		if (ctx.editingTitle) return create_if_block$1;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	var add = new Add({ $$inline: true });

    	var right = new Right({ $$inline: true });

    	return {
    		c: function create() {
    			nav = element("nav");
    			left.$$.fragment.c();
    			t0 = space();
    			trash.$$.fragment.c();
    			t1 = space();
    			div = element("div");
    			if_block.c();
    			t2 = space();
    			add.$$.fragment.c();
    			t3 = space();
    			right.$$.fragment.c();
    			attr(div, "class", "svelte-1i0u2mm");
    			add_location(div, file$4, 13, 4, 377);
    			attr(nav, "class", "svelte-1i0u2mm");
    			add_location(nav, file$4, 10, 0, 337);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, nav, anchor);
    			mount_component(left, nav, null);
    			append(nav, t0);
    			mount_component(trash, nav, null);
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
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
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

    			transition_in(trash.$$.fragment, local);

    			transition_in(add.$$.fragment, local);

    			transition_in(right.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(left.$$.fragment, local);
    			transition_out(trash.$$.fragment, local);
    			transition_out(add.$$.fragment, local);
    			transition_out(right.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(nav);
    			}

    			destroy_component(left);

    			destroy_component(trash);

    			if_block.d();

    			destroy_component(add);

    			destroy_component(right);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $_title;

    	
        let _title = getActiveDash()._title; validate_store(_title, '_title'); component_subscribe($$self, _title, $$value => { $_title = $$value; $$invalidate('$_title', $_title); });
        let editingTitle = false;

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

    	return {
    		_title,
    		editingTitle,
    		$_title,
    		input_input_handler,
    		blur_handler,
    		click_handler
    	};
    }

    class DashNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src\components\widgets\stickyTypes\Text.svelte generated by Svelte v3.7.1 */

    const file$5 = "src\\components\\widgets\\stickyTypes\\Text.svelte";

    // (9:0) {:else}
    function create_else_block$1(ctx) {
    	var article, t, dispose;

    	return {
    		c: function create() {
    			article = element("article");
    			t = text(ctx.$_data);
    			attr(article, "class", "svelte-1mzxpf3");
    			add_location(article, file$5, 9, 1, 169);
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

    // (7:0) {#if editing}
    function create_if_block$2(ctx) {
    	var textarea, dispose;

    	return {
    		c: function create() {
    			textarea = element("textarea");
    			textarea.autofocus = true;
    			attr(textarea, "class", "svelte-1mzxpf3");
    			add_location(textarea, file$5, 7, 1, 83);

    			dispose = [
    				listen(textarea, "input", ctx.textarea_input_handler),
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

    function instance$3($$self, $$props, $$invalidate) {
    	let $_data;

    	let { _data } = $$props; validate_store(_data, '_data'); component_subscribe($$self, _data, $$value => { $_data = $$value; $$invalidate('$_data', $_data); });
    	let editing = true;

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
    		$_data,
    		textarea_input_handler,
    		blur_handler,
    		click_handler
    	};
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$5, safe_not_equal, ["_data"]);

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
    			attr(textarea, "class", "svelte-19wb5tu");
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

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$6, safe_not_equal, ["_data"]);

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

    // (16:2) {:else}
    function create_else_block_1(ctx) {
    	var h2, t, dispose;

    	return {
    		c: function create() {
    			h2 = element("h2");
    			t = text(ctx.$_title);
    			attr(h2, "class", "svelte-ikmpkg");
    			add_location(h2, file$7, 16, 4, 498);
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

    // (14:2) {#if editingTitle}
    function create_if_block_1(ctx) {
    	var input, dispose;

    	return {
    		c: function create() {
    			input = element("input");
    			attr(input, "type", "text");
    			input.autofocus = true;
    			attr(input, "class", "svelte-ikmpkg");
    			add_location(input, file$7, 14, 4, 392);

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

    // (21:6) {:else}
    function create_else_block$3(ctx) {
    	var div, t0, t1;

    	return {
    		c: function create() {
    			div = element("div");
    			t0 = text(ctx.type);
    			t1 = text(" Widget type not yet implemented");
    			attr(div, "class", "svelte-ikmpkg");
    			add_location(div, file$7, 21, 6, 638);
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

    // (19:2) {#if type === 'Sticky'}
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
    	var div, t0, current_block_type_index, if_block1, t1, span, current;

    	function select_block_type(ctx) {
    		if (ctx.editingTitle) return create_if_block_1;
    		return create_else_block_1;
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
    			attr(span, "class", "svelte-ikmpkg");
    			add_location(span, file$7, 23, 2, 700);
    			attr(div, "class", "svelte-ikmpkg");
    			add_location(div, file$7, 12, 0, 359);
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

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(trash.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if_block0.d();
    			if_blocks[current_block_type_index].d();

    			destroy_component(trash);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$7, safe_not_equal, ["ref"]);

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

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (58:10) {#if item.resizable}
    function create_if_block_1$1(ctx) {
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
    function create_each_block(key_1, ctx) {
    	var div, t, div_style_value, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, get_default_slot_context);

    	var if_block = (ctx.item.resizable) && create_if_block_1$1(ctx);

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
    					if_block = create_if_block_1$1(ctx);
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
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
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
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, t, get_each_context);
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

    function instance$6($$self, $$props, $$invalidate) {
    	

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
    		init(this, options, instance$6, create_fragment$8, safe_not_equal, ["useTransform", "items", "cols", "dragDebounceMs", "gap", "rowHeight", "breakpoints", "fillEmpty"]);

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

    const file$9 = "src\\components\\Dash.svelte";

    // (40:0) <Grid on:adjust={event => updateWidgetSizeAndPos(event.detail.focuesdItem)} items={items_arr} bind:items={items_arr} cols={cols} let:item rowHeight={100}>
    function create_default_slot(ctx) {
    	var div, current;

    	var widget = new Widget({
    		props: { ref: ctx.item.id },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			widget.$$.fragment.c();
    			attr(div, "class", "content svelte-1rzrf7c");
    			set_style(div, "background", "#ccc");
    			set_style(div, "border", "1px solid black");
    			add_location(div, file$9, 40, 2, 1335);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(widget, div, null);
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
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(widget);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	var updating_items, current;

    	function grid_items_binding(value) {
    		ctx.grid_items_binding.call(null, value);
    		updating_items = true;
    		add_flush_callback(() => updating_items = false);
    	}

    	let grid_props = {
    		items: ctx.items_arr,
    		cols: cols,
    		rowHeight: 100,
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

    	return {
    		c: function create() {
    			grid.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(grid, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var grid_changes = {};
    			if (changed.items_arr) grid_changes.items = ctx.items_arr;
    			if (changed.cols) grid_changes.cols = cols;
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
    			destroy_component(grid, detaching);
    		}
    	};
    }

    let cols = 10;

    function instance$7($$self, $$props, $$invalidate) {
    	let $_widgetsCount;

    	

        //The array of grid elements
      let items_arr = [];
      let _widgetsCount = getActiveDash()._widgetsCount; validate_store(_widgetsCount, '_widgetsCount'); component_subscribe($$self, _widgetsCount, $$value => { $_widgetsCount = $$value; $$invalidate('$_widgetsCount', $_widgetsCount); });
      const updateWidgetSizeAndPos = item => {
        const {w, h, x, y} = item;
        setWidgetSizeAndPos(item.id, {w, h, x, y});
      };
       //Grid Layout
      let widgets = [];
        beforeUpdate(() => {
          if ($_widgetsCount !== widgets.length) {
            $$invalidate('items_arr', items_arr = []);
            widgets = Array.from(getActiveDash().widgets.keys());
            widgets.forEach((ref) => {
              let {w, h, x, y} = getWidget(ref).sizeAndPos;
              let newItem = gridHelp.item({
                w,
                h,
                x,
                y,
                id: ref
              });
              $$invalidate('items_arr', items_arr = gridHelp.appendItem(newItem, items_arr, cols));
            });
            items_arr.forEach(item => {
              updateWidgetSizeAndPos(item);
            });
          }
      });

    	function grid_items_binding(value) {
    		items_arr = value;
    		$$invalidate('items_arr', items_arr);
    	}

    	function adjust_handler(event) {
    		return updateWidgetSizeAndPos(event.detail.focuesdItem);
    	}

    	return {
    		items_arr,
    		_widgetsCount,
    		updateWidgetSizeAndPos,
    		grid_items_binding,
    		adjust_handler
    	};
    }

    class Dash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$9, safe_not_equal, []);
    	}
    }

    /* src\components\WidgetMenu.svelte generated by Svelte v3.7.1 */

    const file$a = "src\\components\\WidgetMenu.svelte";

    // (32:4) {#if menuOpen}
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
    			attr(img0, "class", "cancel svelte-19k8yvu");
    			attr(img0, "src", "/images/cancelIcon.svg");
    			attr(img0, "alt", "x");
    			add_location(img0, file$a, 32, 6, 943);
    			attr(h3, "class", "svelte-19k8yvu");
    			add_location(h3, file$a, 35, 10, 1076);
    			attr(img1, "src", "/images/addIcon.svg");
    			attr(img1, "alt", "+");
    			add_location(img1, file$a, 36, 10, 1104);
    			attr(button, "class", "svelte-19k8yvu");
    			add_location(button, file$a, 34, 8, 1025);
    			attr(div, "class", "svelte-19k8yvu");
    			add_location(div, file$a, 33, 6, 1010);
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
    	var nav, t0, t1, h2, t3, current;

    	var trash = new Trash({
    		props: { active: ctx.trashActive },
    		$$inline: true
    	});
    	trash.$on("trash", ctx.toggleTrash);
    	trash.$on("trash", ctx.trash_handler);

    	var if_block = (ctx.menuOpen) && create_if_block$6(ctx);

    	var add_1 = new Add({
    		props: { active: ctx.menuOpen },
    		$$inline: true
    	});
    	add_1.$on("add", ctx.toggleMenu);

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
    			attr(h2, "class", "svelte-19k8yvu");
    			add_location(h2, file$a, 40, 2, 1193);
    			attr(nav, "class", "svelte-19k8yvu");
    			add_location(nav, file$a, 29, 0, 786);
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

    			if (ctx.menuOpen) {
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
    			if (changed.menuOpen) add_1_changes.active = ctx.menuOpen;
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
    				detach(nav);
    			}

    			destroy_component(trash);

    			if (if_block) if_block.d();

    			destroy_component(add_1);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	
      let menuOpen = false;
      let trashActive = false;
      
      const closeMenu = () => {
        setTimeout(() => { 
          if (menuOpen) { // timeout and latch so runs after toggle
            $$invalidate('menuOpen', menuOpen = false);
          }
        }, 0);
        window.removeEventListener('click', closeMenu, {capture : true});
      };
      const openMenu = () => {
        $$invalidate('menuOpen', menuOpen = true);
        window.addEventListener('click', closeMenu, {capture : true});
      };
      const toggleMenu = () => {menuOpen ? closeMenu() : openMenu();};

      const toggleTrash = () => {$$invalidate('trashActive', trashActive = !trashActive);};

      const add = type => {
        addWidget(type);
        closeMenu();
      };

    	function trash_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler() {
    		return add('Sticky');
    	}

    	return {
    		menuOpen,
    		trashActive,
    		toggleMenu,
    		toggleTrash,
    		add,
    		trash_handler,
    		click_handler
    	};
    }

    class WidgetMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$a, safe_not_equal, []);
    	}
    }

    /* src\App.svelte generated by Svelte v3.7.1 */

    const file$b = "src\\App.svelte";

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
    			attr(main, "class", main_class_value = ctx.trashActive ? 'trash' : '');
    			add_location(main, file$b, 10, 0, 286);
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
    			if ((!current || changed.trashActive) && main_class_value !== (main_class_value = ctx.trashActive ? 'trash' : '')) {
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

    function instance$9($$self, $$props, $$invalidate) {
    	
    	let trashActive = false;
    	const activateTrash = event => {
    		$$invalidate('trashActive', trashActive = event.detail.active);
    	};

    	return { trashActive, activateTrash };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$b, safe_not_equal, []);
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
