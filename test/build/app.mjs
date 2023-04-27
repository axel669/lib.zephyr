function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
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
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
        const dirty = [];
        const length = $$scope.ctx.length / 32;
        for (let i = 0; i < length; i++) {
            dirty[i] = -1;
        }
        return dirty;
    }
    return -1;
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function compute_rest_props(props, keys) {
    const rest = {};
    keys = new Set(keys);
    for (const k in props)
        if (!keys.has(k) && k[0] !== '$')
            rest[k] = props[k];
    return rest;
}
function compute_slots(slots) {
    const result = {};
    for (const key in slots) {
        result[key] = true;
    }
    return result;
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}
function split_css_unit(value) {
    const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
    return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}
function append(target, node) {
    target.appendChild(node);
}
function get_root_for_style(node) {
    if (!node)
        return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
        return root;
    }
    return node.ownerDocument;
}
function append_empty_stylesheet(node) {
    const style_element = element('style');
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element.sheet;
}
function append_stylesheet(node, style) {
    append(node.head || node, style);
    return style.sheet;
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
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
function stop_propagation(fn) {
    return function (event) {
        event.stopPropagation();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_custom_element_data(node, prop, value) {
    if (prop in node) {
        node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
    }
    else {
        attr(node, prop, value);
    }
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.data === data)
        return;
    text.data = data;
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, bubbles, cancelable, detail);
    return e;
}
function construct_svelte_component(component, props) {
    return new component(props);
}

// we need to store the information for multiple documents because a Svelte application could also contain iframes
// https://github.com/sveltejs/svelte/issues/3624
const managed_styles = new Map();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_style_information(doc, node) {
    const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
    managed_styles.set(doc, info);
    return info;
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
    const doc = get_root_for_style(node);
    const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
    if (!rules[name]) {
        rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        managed_styles.forEach(info => {
            const { ownerNode } = info.stylesheet;
            // there is no ownerNode if it runs on jsdom.
            if (ownerNode)
                detach(ownerNode);
        });
        managed_styles.clear();
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
/**
 * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
 *
 * Component events created with `createEventDispatcher` create a
 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
 * property and can contain any type of data.
 *
 * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
 */
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail, { cancelable = false } = {}) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail, { cancelable });
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
            return !event.defaultPrevented;
        }
        return true;
    };
}
/**
 * Associates an arbitrary `context` object with the current component and the specified `key`
 * and returns that object. The context is then available to children of the component
 * (including slotted content) with `getContext`.
 *
 * Like lifecycle functions, this must be called during component initialisation.
 *
 * https://svelte.dev/docs#run-time-svelte-setcontext
 */
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
    return context;
}
/**
 * Retrieves the context that belongs to the closest parent component with the specified `key`.
 * Must be called during component initialisation.
 *
 * https://svelte.dev/docs#run-time-svelte-getcontext
 */
function getContext(key) {
    return get_current_component().$$.context.get(key);
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        // @ts-ignore
        callbacks.slice().forEach(fn => fn.call(this, event));
    }
}

const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    // Do not reenter flush while dirty components are updated, as this can
    // result in an infinite loop. Instead, let the inner flush handle it.
    // Reentrancy is ok afterwards for bindings etc.
    if (flushidx !== 0) {
        return;
    }
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        try {
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
        }
        catch (e) {
            // reset dirty state to not end up in a deadlocked state and then rethrow
            dirty_components.length = 0;
            flushidx = 0;
            throw e;
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 */
function flush_render_callbacks(fns) {
    const filtered = [];
    const targets = [];
    render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
    targets.forEach((c) => c());
    render_callbacks = filtered;
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
    else if (callback) {
        callback();
    }
}
const null_transition = { duration: 0 };
function create_bidirectional_transition(node, fn, params, intro) {
    const options = { direction: 'both' };
    let config = fn(node, params, options);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = (program.b - t);
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
        if (running_program || pending_program) {
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
                    config = config(options);
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

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
            // if the component was destroyed immediately
            // it will update the `$$.on_destroy` reference to `null`.
            // the destructured on_destroy may still reference to the old array
            if (component.$$.on_destroy) {
                component.$$.on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        flush_render_callbacks($$.after_update);
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: [],
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        if (!is_function(callback)) {
            return noop;
        }
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

const e=/(?<key>(?<mod>\w+:)?(?<name>[\$\@\&\w\-]+)(\[(?<args>.*?)\])?)/g,t={"(":1,")":-1},r=e=>{const r=e.trim().replace(/__|_/g,(e=>"__"===e?"_":" "));if(""===r)return [];const o=r.split("").reduce(((e,o,a)=>","===o&&0===e.p?(e.args.push(r.substring(e.s,a).trim()),e.s=a,e):(e.p+=t[o]??0,e)),{args:[],p:0,s:0});return [...o.args,r.slice(o.s).trim()]},o=(e,t)=>void 0===t?"":`${e}: ${(e=>!0===e.startsWith("&")?`var(--${e.slice(1)})`:e)(t)}`,a=e=>(t,r)=>[o(e,r)],l=(...e)=>(t,r)=>e.map((e=>o(e,r)));var i=Object.freeze({__proto__:null,cssprop:o,multi:l,simple:a,wsx:e=>Object.entries(e).reduce(((e,[t,r])=>{if(null==r||!1===r)return e;const o=!0===r?t:`${t}[${(e=>e.replace(/( )|(_)/g,((e,t)=>t?"_":"__")))(r)}]`;return e.push(o),e}),[]).join(" ")});const n={area:a("grid-area"),b:a("border"),"b-c":a("border-color"),"b-s":a("border-style"),"b-w":a("border-width"),"b-t":a("border-top"),"b-t-c":a("border-top-color"),"b-t-s":a("border-top-style"),"b-t-w":a("border-top-width"),"b-b":a("border-bottom"),"b-b-c":a("border-bottom-color"),"b-b-s":a("border-bottom-style"),"b-b-w":a("border-bottom-width"),"b-l":a("border-left"),"b-l-c":a("border-left-color"),"b-l-s":a("border-left-style"),"b-l-w":a("border-left-width"),"b-r":a("border-right"),"b-r-c":a("border-right-color"),"b-r-s":a("border-right-style"),"b-r-w":a("border-right-width"),bg:a("background"),"bg-a":a("background-attachment"),"bg-c":a("background-color"),"bg-img":a("background-image"),block:()=>o("display","block"),c:a("color"),col:a("grid-column"),cur:a("cursor"),flex:(e,t="column")=>[o("display","flex"),o("flex-direction",t)],"fl-center":()=>[o("align-items","center"),o("justify-content","center")],"fl-cr-a":a("align-items"),"fl-dir":a("flex-direction"),"fl-wr":a("flex-wrap"),"fl-m-a":a("justify-content"),font:a("font-family"),gap:a("gap"),grid:(e,t="row")=>[o("display","grid"),o("grid-auto-flow",t)],"gr-col":a("grid-template-columns"),"gr-row":a("grid-template-rows"),"gr-acol":a("grid-auto-columns"),"gr-arow":a("grid-auto-rows"),"gr-flow":a("grid-auto-flow"),h:a("height"),"h-max":a("max-height"),"h-min":a("min-height"),hide:()=>[o("display","none")],iblock:()=>[o("display","inline-block")],iflex:(e,t="column")=>[o("display","inline-flex"),o("flex-direction",t)],igrid:(e,t="row")=>[o("display","inline-grid"),o("grid-auto-flow",t)],inset:l("top","left","bottom","right"),"inset-x":l("left","right"),"inset-y":l("top","bottom"),m:a("margin"),"m-b":a("margin-bottom"),"m-l":a("margin-left"),"m-r":a("margin-right"),"m-t":a("margin-top"),over:a("overflow"),"over-x":a("overflow-x"),"over-y":a("overflow-y"),p:a("padding"),"p-b":a("padding-bottom"),"p-l":a("padding-left"),"p-r":a("padding-right"),"p-t":a("padding-top"),"p-x":l("padding-left","padding-right"),"p-y":l("padding-top","padding-bottom"),pos:a("position"),r:a("border-radius"),"r-tl":a("border-top-left-radius"),"r-tr":a("border-top-right-radius"),"r-bl":a("border-bottom-left-radius"),"r-br":a("border-bottom-right-radius"),"r-t":l("border-top-left-radius","border-top-right-radius"),"r-r":l("border-top-right-radius","border-bottom-right-radius"),"r-l":l("border-bottom-left-radius","border-top-left-radius"),"r-b":l("border-bottom-right-radius","border-bottom-left-radius"),row:a("grid-row"),sel:a("user-select"),shdw:a("box-shadow"),"t-a":a("text-align"),"t-br":a("word-break"),"t-deco":a("text-decoration"),"t-lh":a("line-height"),"t-over":a("text-overflow"),"t-sz":a("font-size"),"t-tr":a("text-transform"),"t-wght":a("font-weight"),"t-ws":a("white-space"),theme:()=>[o("color","var(--text-color-normal)"),o("font-family","var(--font)"),o("font-size","var(--text-size-normal)")],tr:a("transform"),w:a("width"),"w-max":a("max-width"),"w-min":a("min-width"),x:a("left"),y:a("top"),"-x":a("right"),"-y":a("bottom"),z:a("z-index"),$color:(e,t)=>[o("--color",`&${t}`),o("--ripple-color",`&${t}-ripple`)],$adorn:()=>[o("display","flex"),o("justify-content","center"),o("align-items","center"),o("padding","2px")],$compact:()=>[o("padding","0px 8px")],$title:()=>[o("font-size","&text-size-title"),o("font-weight","700")],$subtitle:()=>[o("font-size","&text-size-subtitle")],"@flat":()=>[o("border-width","0px"),o("--border-size","0px")],"@outline":()=>[o("border-width","1px"),o("border-color","&color")],"@fill":()=>[o("--ripple-color","var(--ripple-dark) !important"),o("--text-color","&text-color-fill"),o("background-color","&color"),o("color","&text-color-fill")]};var s=[{name:"baseline",style:'@import url(https://fonts.googleapis.com/css2?family=Share+Tech+Mono:wght@400;500;600;700;800;900&family=Roboto:ital,wght@0,400;0,500;0,700;0,900;1,400;1,500;1,700;1,900&display=swap);@import url(https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.13.0/tabler-icons.min.css);*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}:where([ws-x]){border-style:solid;border-width:0;border-color:var(--text-color-normal)}body,html{padding:0;margin:0;width:100%;height:100%;-webkit-tap-highlight-color:transparent}body[ws-x*="theme["]{background-color:var(--background)}body[ws-x~="@app"]{overflow:hidden;position:fixed;touch-action:pan-x pan-y}'},{name:"avatar",style:"ws-avatar{--color:transparent;--size:36px;display:inline-flex;overflow:hidden;border-radius:500px;align-items:center;justify-content:center;width:var(--size);height:var(--size);background-color:var(--color);color:var(--text-color-fill);vertical-align:text-bottom}ws-avatar>img{width:100%}"},{name:"badge",style:"ws-badge{--color:var(--primary);position:relative;display:inline-grid;overflow:visible}ws-badge::after{position:absolute;content:attr(ws-text);right:-10px;top:0;transform:translateY(-50%);background-color:var(--color);pointer-events:none;border-radius:20px;padding:4px;min-width:20px;height:20px;box-sizing:border-box;text-align:center;font-size:var(--text-size-subtitle);color:var(--text-color-fill);line-height:14px;z-index:5}"},{name:"button",style:':is(label,a):where([ws-x~="@button"]),button:where([ws-x~="@flat"],[ws-x~="@fill"],[ws-x~="@outline"]){--color:var(--text-color-normal);--ripple-color:var(--ripple-normal);border:0 solid var(--color);color:var(--color);font-family:var(--font);background-color:transparent;border-radius:4px;cursor:pointer;padding:8px 16px;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;position:relative;user-select:none}:is(label,a):where([ws-x~="@button"]):where(:not([disabled]))::after,button:where([ws-x~="@flat"],[ws-x~="@fill"],[ws-x~="@outline"]):where(:not([disabled]))::after{content:"";position:absolute;top:0;left:0;bottom:0;right:0;transition:background-color 150ms linear;pointer-events:none}:is(label,a):where([ws-x~="@button"]):where(:not([disabled])):active::after,button:where([ws-x~="@flat"],[ws-x~="@fill"],[ws-x~="@outline"]):where(:not([disabled])):active::after{transition:none;background-color:var(--ripple-color)}:is(label,a):where([ws-x~="@button"]):where([disabled]),button:where([ws-x~="@flat"],[ws-x~="@fill"],[ws-x~="@outline"]):where([disabled]){opacity:.6;background-color:rgba(200,200,200,.4)}'},{name:"chip",style:'ws-chip{display:inline-flex;align-items:center;justify-content:center;border-radius:100px;padding:4px 12px;user-select:none;vertical-align:text-bottom}ws-chip:where([ws-x~="$click"]){cursor:pointer;overflow:hidden;position:relative;user-select:none}ws-chip:where([ws-x~="$click"]):where(:not([disabled]))::after{content:"";position:absolute;top:0;left:0;bottom:0;right:0;transition:background-color 150ms linear;pointer-events:none}ws-chip:where([ws-x~="$click"]):where(:not([disabled])):active::after{transition:none;background-color:var(--ripple-color)}'},{name:"control",style:'label:where([ws-x~="@control"]){--color:var(--default);--border-color:var(--default);position:relative;display:inline-grid;grid-template-areas:"label label label"" start control end""extra extra extra";grid-template-rows:minmax(0,min-content) auto minmax(0,min-content);grid-template-columns:minmax(0,min-content) auto minmax(0,min-content);border:1px solid var(--border-color);border-radius:4px;user-select:none;overflow:hidden}label:where([ws-x~="@control"]):where([ws-error])::after{content:attr(ws-error);grid-row:3;grid-column:span 3;padding:4px;font-size:var(--text-size-info);background-color:var(--danger-ripple)}label:where([ws-x~="@control"]):focus-within{--border-color:var(--color)}label:where([ws-x~="@control"]):focus-within:where([ws-x~="@flat"])>:is(input,select){outline:2px solid var(--ripple-color);outline-offset:-2px}label:where([ws-x~="@control"]) :is(input,select,textarea):disabled{background-color:var(--disabled-background)}label:where([ws-x~="@control"])>:where(select){--color:var(--text-color-normal);border-width:0;padding:8px;min-height:36px;background-color:transparent;color:var(--color);font:var(--font);font-size:var(--text-size-normal);cursor:pointer;background-color:var(--background-layer);grid-area:control}label:where([ws-x~="@control"])>:where(input,textarea):focus,label:where([ws-x~="@control"])>:where(select):focus{outline:0}label:where([ws-x~="@control"])>:where(select) optgroup,label:where([ws-x~="@control"])>:where(select) option{background-color:var(--background-layer);border-color:var(--background-layer);color:var(--text-color-normal);font-size:var(--text-size-normal);font-family:Arial}label:where([ws-x~="@control"])>:where(input,textarea){border-width:0;background:0 0;color:var(--text-normal-color);font-family:var(--font);min-width:24px;min-height:36px;width:100%;height:100%;grid-area:control;padding:4px;background-color:var(--background-layer)}label:where([ws-x~="@control"])>input[type=file]{position:relative;padding:0}label:where([ws-x~="@control"])>input[type=file]::file-selector-button{font-family:var(--font);height:100%;margin:0 4px 0 0;padding:4px;color:var(--text-normal-color);background-color:var(--background-layer);border-width:0;border-right:1px solid var(--border-color);text-decoration:underline}label:where([ws-x~="@control"])>:where([ws-x~="$text"]){grid-area:label;padding:4px;display:flex;align-items:center;border-bottom:var(--border-size, 1px) solid var(--border-color);border-right:var(--border-size, 1px) solid var(--border-color);color:var(--color);width:min-content;white-space:nowrap;border-bottom-right-radius:4px}label:where([ws-x~="@control"])>:where([ws-x~="$text"]):where([ws-hint])::after{font-size:var(--text-size-subtitle);content:"\\a"attr(ws-hint);color:var(--text-color-secondary);white-space:pre;display:contents}label:where([ws-x~="@control"])>:where([ws-x~="slot[start]"],[slot=start]){grid-area:start}label:where([ws-x~="@control"])>:where([ws-x~="slot[end]"],[slot=end]){grid-area:end}'},{name:"flex",style:"ws-flex{display:flex;flex-direction:column;gap:4px;padding:4px;overflow:hidden}ws-flex>*{flex-shrink:0}"},{name:"grid",style:"ws-grid{display:grid;overflow:hidden;gap:4px;padding:4px;grid-auto-rows:min-content}"},{name:"icon",style:"ws-icon{display:inline-block}ws-icon:where(:not(:empty))::before{margin-right:2px}ws-icon::before{font-family:tabler-icons!important;speak:none;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;line-height:1;display:contents;-webkit-font-smoothing:antialiased}"},{name:"link",style:"a:where([ws-x]){--color:var(--text-color-normal)}a:where([ws-x]),a:where([ws-x]):hover,a:where([ws-x]):visited{color:var(--color)}"},{name:"modal",style:'ws-modal{position:fixed;top:0;left:0;bottom:0;right:0;background-color:rgba(0,0,0,.35);z-index:100;display:none}ws-modal>label:first-child{position:absolute;width:100%;height:100%;cursor:pointer}ws-modal[ws-x~="$show"]{display:block}input[type=checkbox]:not(:checked)+ws-modal{display:none}input[type=checkbox]:checked+ws-modal{display:block}ws-modal>:where(:not(label:first-child)){position:absolute;min-width:15vw}ws-modal>:where(:not(label:first-child)):where([ws-x~="@menu"]){top:0;left:0;height:100%}ws-modal>:where(:not(label:first-child)):where([ws-x~="@action"]){top:0;right:0;height:100%}ws-modal>:where(:not(label:first-child)):where([ws-x~="@select"]){top:0;left:50%;transform:translateX(-50%);max-height:75vh;max-width:min(90vw,720px)}ws-modal>:where(:not(label:first-child)):where([ws-x~="@dialog"]){top:50%;left:50%;transform:translate(-50%,-50%)}'},{name:"notification",style:'ws-notification{--background-color:var(--background-layer);--color:var(--text-color-normal);background-color:var(--background-color);color:var(--color);padding:8px;display:inline-flex;flex-direction:row;justify-content:space-between;align-items:center;border-radius:4px;cursor:pointer;user-select:none;border:1px solid var(--text-color-secondary)}ws-notification[ws-x*="$color"]{background-color:var(--color);color:var(--text-color-fill)}'},{name:"paper",style:'ws-paper{--color:var(--layer-border-color);display:grid;border-radius:4px;box-shadow:0 2px 4px var(--shadow-color);overflow:hidden;grid-template-columns:1fr;grid-template-rows:min-content auto min-content;grid-template-areas:"header""content""footer";background-color:var(--background-layer)}ws-paper::before{content:"";grid-area:header}ws-paper::after{content:"";grid-area:footer;pointer-events:none}ws-paper>:where([ws-x~="slot[content]"],[slot=content]){grid-area:content}ws-paper>:where([ws-x~="slot[header]"],[slot=header]){grid-area:header;font-size:var(--text-size-header)}ws-paper>:where([ws-x~="slot[footer]"],[slot=footer]){grid-area:footer}'},{name:"popover",style:'ws-popover{display:grid;position:relative}ws-popover:not(:visibile)>:where([ws-x~="slot[content]"],[slot=content]){display:none}ws-popover>:where([ws-x~="slot[content]"],[slot=content]){position:absolute;z-index:25;display:none}ws-popover[ws-x~="$show"]>:where([ws-x~="slot[content]"],[slot=content]){display:block}ws-popover>input:where([type=checkbox]):checked+:where([ws-x~="slot[content]"],[slot=content]){display:block}ws-popover>input:where([type=checkbox]):not(:checked)+:where([ws-x~="slot[content]"],[slot=content]){display:none}'},{name:"progress",style:'label[ws-x~="@progress"]{--color:var(--text-color-normal);--border-size:0px;display:inline-grid;grid-template-columns:1fr;grid-template-rows:min-content auto;border-radius:4px;overflow:hidden;user-select:none}label[ws-x~="@progress"][ws-x~="$row"]{grid-template-columns:min-content auto;grid-template-rows:1fr}label[ws-x~="@progress"]>[ws-x~="$text"]{padding:4px;display:flex;border-bottom:var(--border-size, 1px) solid var(--color);color:var(--color)}label[ws-x~="@progress"]>progress{min-height:20px;height:100%;width:100%;border:0;background-color:var(--background-layer)}label[ws-x~="@progress"]>progress::-moz-progress-bar{background-color:var(--color);border-radius:0}label[ws-x~="@progress"]>progress::-webkit-progress-bar{background-color:var(--background-layer);border-radius:0}label[ws-x~="@progress"]>progress::-webkit-progress-value{background-color:var(--color);border-radius:0}'},{name:"screen",style:'ws-screen{--stack:0;--screen-width:min(720px, 100%);display:grid;width:calc(100% - var(--sub-pixel-offset));height:calc(100% - 1px);overflow:hidden;position:fixed;top:0;left:0;z-index:200;background-color:rgba(0,0,0,.4);grid-template-columns:auto calc(var(--screen-width) - 16px*var(--stack)) auto;grid-template-areas:". content .";padding-top:calc(8px*var(--stack))}ws-screen[ws-x~="@left"]{grid-template-columns:calc(8px*var(--stack)) calc(var(--screen-width) - 16px*var(--stack)) auto}ws-screen>:where(*){grid-area:content;height:100%;overflow:hidden}'},{name:"spinner",style:"ws-circle-spinner,ws-hexagon-spinner{--size:100px;--color:var(--primary);--ripple-color:var(--primary-ripple);width:var(--size);height:var(--size);display:inline-block}"},{name:"table",style:"table:where([ws-x]){--border-color:var(--color);border-spacing:0;position:relative}table:where([ws-x]) thead :is(td,th){background-color:var(--color);color:var(--text-color-fill);font-weight:700}table:where([ws-x]) :is(td,th){padding:8px;white-space:nowrap;background-color:var(--background-layer);border-bottom:1px solid var(--color)}table:where([ws-x]) :where(th:first-child){position:sticky;left:0;z-index:10}table:where([ws-x]) :where(td:first-child,th:first-child){border-left:1px solid var(--color)}table:where([ws-x]) :where(td:last-child,th:last-child){border-right:1px solid var(--color)}"},{name:"tabs",style:'ws-tabs{--color:var(--primary);display:flex;flex-direction:row;justify-content:stretch;align-items:stretch;user-select:none;cursor:pointer;gap:2px;padding:2px}ws-tabs[ws-x~="$vert"]{flex-direction:column;justify-content:flex-start}ws-tabs[ws-x~="$vert"]>ws-tab{border-bottom-width:0;border-right-width:2px;flex-grow:0}ws-tabs[ws-x~="@solid"]>ws-tab:where([tab-selected]){color:var(--text-color-fill);background-color:var(--color)}ws-tabs>ws-tab{display:flex;justify-content:center;align-items:center;flex-grow:1;padding:8px;border-color:var(--text-color-secondary);border-width:0 0 2px;border-style:solid}ws-tabs>ws-tab:where([tab-selected]){color:var(--color);border-color:var(--color)}'},{name:"titlebar",style:'ws-titlebar{--text-color:var(--text-color-normal);display:grid;height:48px;grid-template-columns:min-content auto min-content;grid-template-areas:"menu title action";user-select:none}ws-titlebar:where(:not([ws-x~="@fill"])){border-bottom:1px solid var(--color, var(--text-color-normal))}ws-titlebar>:where([ws-x~="slot[title]"],[slot=title]){grid-area:title;display:flex;flex-direction:column;justify-content:center;padding:4px}ws-titlebar>:where([ws-x~="slot[menu]"],[slot=menu]){grid-area:menu;--text-color-normal:var(--text-color)}ws-titlebar>:where([ws-x~="slot[action]"],[slot=action]){grid-area:action;--text-color-normal:var(--text-color)}'},{name:"toaster",style:'ws-toaster{position:fixed;z-index:100;display:inline-flex;flex-direction:column;padding:4px;gap:4px;height:min-content!important}ws-toaster[ws-x~="$tl"]{top:0;left:0}ws-toaster[ws-x~="$tc"]{top:0;left:50%;transform:translateX(-50%)}ws-toaster[ws-x~="$tr"]{top:0;right:0}ws-toaster[ws-x~="$ml"]{top:50%;left:0;transform:translateY(-50%)}ws-toaster[ws-x~="$mr"]{top:50%;right:0;transform:translateY(-50%)}ws-toaster[ws-x~="$bl"]{bottom:0;left:0}ws-toaster[ws-x~="$bc"]{bottom:0;left:50%;transform:translateX(-50%)}ws-toaster[ws-x~="$br"]{bottom:0;right:0}'},{name:"toggle",style:'label[ws-x~="@toggle"]{--color:var(--default);--ripple-color:var(--default-ripple);--border-color:var(--default);cursor:pointer;display:inline-flex;align-items:center;justify-content:space-between;padding:4px;border-radius:4px;border:1px solid var(--border-color);overflow:hidden;position:relative;user-select:none}label[ws-x~="@toggle"]:where(:not([disabled]))::after{content:"";position:absolute;top:0;left:0;bottom:0;right:0;transition:background-color 150ms linear;pointer-events:none}label[ws-x~="@toggle"]:where(:not([disabled])):active::after{transition:none;background-color:var(--ripple-color)}label[ws-x~="@toggle"]:focus-within{--border-color:var(--color)}label[ws-x~="@toggle"]:focus-within:where([ws-x~="@flat"]){outline:2px solid var(--ripple-color);outline-offset:-2px}label[ws-x~="@toggle"]>input{position:relative;min-width:20px;min-height:20px;-webkit-appearance:none;appearance:none;margin:0}label[ws-x~="@toggle"]>input:focus{outline:0}label[ws-x~="@toggle"]>input:disabled{--color:var(--disabled-background)}label[ws-x~="@toggle"]>input:checked{color:var(--text-color-invert)}label[ws-x~="@toggle"]>input:checked::after{background-color:var(--color)}label[ws-x~="@toggle"]>input::after{content:"";position:absolute;font-size:18px;font-family:tabler-icons!important;speak:none;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;top:50%;left:50%;width:20px;height:20px;transform:translate(-50%,-50%);display:flex;border:1px solid var(--color);border-radius:4px;align-items:center;justify-content:center;overflow:hidden}label[ws-x~="@toggle"]>input[type=radio]::after{border-radius:50%}label[ws-x~="@toggle"]>input[type=checkbox]:disabled,label[ws-x~="@toggle"]>input[type=radio]:disabled::after{background-color:var(--disabled-background)}label[ws-x~="@toggle"]>input[type=radio]:checked::after{content:""}label[ws-x~="@toggle"]>input[type=checkbox]:checked::after{content:""}label[ws-x~="@toggle"]>input[type=checkbox][ws-x~="$switch"]{position:relative;border:1px solid var(--color);height:24px;width:44px;border-radius:12px}label[ws-x~="@toggle"]>input[type=checkbox][ws-x~="$switch"]::after{content:"";background-color:var(--text-color-secondary);position:absolute;width:18px;height:18px;border-radius:10px;top:2px;left:2px;transform:none;border-width:0;transition:left 100ms linear,color 100ms linear}label[ws-x~="@toggle"]>input[type=checkbox][ws-x~="$switch"]:checked::after{background-color:var(--color);left:22px}'},{name:"tooltip",style:'ws-tooltip{position:relative;display:inline-grid;overflow:visible}ws-tooltip::after{position:absolute;content:attr(ws-text);left:50%;bottom:calc(100% + 2px);transform:translateX(-50%);height:20px;background-color:var(--background-layer);opacity:0;transition:opacity 100ms linear;pointer-events:none;border-radius:4px;border:1px solid var(--text-color-secondary);padding:2px 8px;font-size:var(--text-size-subtitle);width:60%;display:flex;align-items:center;justify-content:center;z-index:5}ws-tooltip:hover::after{opacity:1}ws-tooltip[ws-x~="$bottom"]::after{bottom:unset;top:calc(100% + 2px)}'},{name:"dark",style:'[ws-x~="theme[dark]"]{--font:Roboto;--text-light:white;--text-dark:black;--text-color-normal:var(--text-light);--text-color-secondary:#a0a0a0;--text-color-invert:var(--text-dark);--text-color-fill:var(--text-dark);--text-size-normal:14px;--text-size-title:18px;--text-size-header:16px;--text-size-info:13px;--text-size-subtitle:12px;--text-size-data:10px;--background:#161616;--background-layer:#333333;--layer-border-width:1px;--layer-border-color:#505050;--default:var(--text-color-normal);--default-ripple:var(--ripple-normal);--primary:#00aaff;--primary-ripple:#00aaff60;--secondary:#2fbc2f;--secondary-ripple:#2fbc2f60;--danger:#df5348;--danger-ripple:#df534860;--warning:#ffff00;--warning-ripple:#ffff0060;--accent:#ff4dff;--accent-ripple:#ff4dff60;--button-filled-text-color:var(--text-color-normal);--ripple-dark:#00000060;--ripple-light:#FFFFFF60;--ripple-normal:var(--ripple-light);--ripple-invert:var(--ripple-dark);--shadow-color:rgb(0, 0, 0, 0.25);--disabled-background:#606060;color-scheme:dark}'},{name:"light",style:'[ws-x~="theme[light]"]{--font:Roboto;--text-light:white;--text-dark:black;--text-color-normal:var(--text-dark);--text-color-secondary:#505050;--text-color-invert:var(--text-light);--text-color-fill:var(--text-light);--text-size-normal:14px;--text-size-title:18px;--text-size-header:16px;--text-size-info:13px;--text-size-subtitle:12px;--text-size-data:10px;--background:#e9e9e9;--background-layer:#ffffff;--layer-border-width:1px;--layer-border-color:#aaaaaa;--default:var(--text-color-normal);--default-ripple:var(--ripple-normal);--primary:#1d62d5;--primary-ripple:#1d62d560;--secondary:#128f12;--secondary-ripple:#128f1260;--danger:#F44336;--danger-ripple:#F4433660;--warning:#db990d;--warning-ripple:#db990d60;--accent:#cf00cf;--accent-ripple:#cf00cf60;--button-filled-text-color:var(--text-color-invert);--ripple-dark:#00000060;--ripple-light:#FFFFFF60;--ripple-normal:var(--ripple-dark);--ripple-invert:var(--ripple-light);--shadow-color:rgb(0, 0, 0, 0.25);--disabled-background:#c7c7c7}'},{name:"tron",style:'[ws-x~="theme[tron]"]{--font:Share Tech Mono;--text-light:white;--text-dark:black;--text-color-normal:var(--text-light);--text-color-secondary:#a0a0a0;--text-color-invert:var(--text-dark);--text-color-fill:var(--text-dark);--text-size-normal:14px;--text-size-title:18px;--text-size-header:16px;--text-size-info:13px;--text-size-subtitle:12px;--text-size-data:10px;--background:#030303;--background-layer:#04080C;--layer-border-width:1px;--layer-border-color:#00EEEE;--default:var(--text-color-normal);--default-ripple:var(--ripple-normal);--primary:#00aaff;--primary-ripple:#00aaff60;--secondary:#2fbc2f;--secondary-ripple:#2fbc2f60;--danger:#df5348;--danger-ripple:#df534860;--warning:#ffff00;--warning-ripple:#ffff0060;--accent:#ff4dff;--accent-ripple:#ff4dff60;--button-filled-text-color:var(--text-normal);--ripple-dark:#00000060;--ripple-light:#FFFFFF60;--ripple-normal:var(--ripple-light);--ripple-invert:var(--ripple-dark);--shadow-color:rgb(255, 255, 255, 0.25);--disabled-background:#606060;color-scheme:dark}'}];const d=document.head,c=document.createElement("style"),p=Math.ceil(screen.width*devicePixelRatio*10)%10>=5;s.push({name:"correction",style:`body {--sub-pixel-offset:${p?1:0}px}`});for(const{name:e,style:t}of s){const r=document.createElement("style");r.setAttribute("ws-name",e),r.innerHTML=t,d.appendChild(r);}d.appendChild(c),c.setAttribute("ws-calculated","");const b=c.sheet,w={},x=(e,t)=>[o(`--${e.name.slice(1)}`,t)],h=e=>{if(null===e)return;const t=void 0!==w[e.key],r=void 0===n[e.name]&&!1===e.name.startsWith("&");if(!0===t||!0===r)return;const o=!0===e.name.startsWith("&")?x:n[e.name],a=void 0!==e.mod?`:${e.mod.slice(0,-1)}`:"",l=o(e,...e.args);b.insertRule(`[ws-x][ws-x~="${e.key}"]${a} {\n${l.join(";\n")};\n}`,b.cssRules.length),w[e.key]=b.cssRules[b.cssRules.length-1];},g=t=>{const o=t.getAttribute("ws-x");if(null===o)return;const a=((t,o)=>[...t.matchAll(e)].map((e=>{const{groups:t}=e;return {name:t.name,mod:t.mod,args:r(t.args??""),key:e[0],node:o}})))(o,t);a.forEach(h);},f=document.createElement("template");f.innerHTML='\n<style>\n@keyframes hi{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}\ncircle{animation-name:hi;animation-iteration-count:infinite;animation-timing-function:linear;transform-origin:50% 50%;}\ncircle:nth-child(1){animation-duration:4s;}\ncircle:nth-child(2){animation-duration:3s;animation-direction:reverse;}\ncircle:nth-child(3){animation-duration:2s;}\n</style>\n<svg style="width:var(--size);height:var(--size)" viewBox="0 0 100 100"><circle stroke="var(--color)" cx="50" cy="50" stroke-width="4" fill="transparent" r="48" stroke-dasharray="0 37.7 75.4 75.4 75.4 75.4"/><circle stroke="var(--ripple-color)" cx="50" cy="50" stroke-width="4" fill="transparent" r="40" stroke-dasharray="0 31.4 62.83 62.83 62.83 62.83"/><circle stroke="var(--color)" cx="50" cy="50" stroke-width="4" fill="transparent" r="32" stroke-dasharray="0 12.57 25.13 25.13 25.13 25.13 25.13 25.13 25.13 25.13"/></svg>',customElements.define("ws-circle-spinner",class extends HTMLElement{constructor(){super();const e=f.content.cloneNode(!0);this.attachShadow({mode:"closed"}).appendChild(e);}});const m=document.createElement("template");m.innerHTML='\n<style>\n@keyframes hi{from{transform:rotateY(0deg)}to{transform:rotateY(360deg)}}\npath{animation-name:hi;animation-iteration-count:infinite;animation-timing-function:linear;transform-origin:50% 50%;}\npath:nth-child(1){animation-duration:3s;}\npath:nth-child(2){animation-duration:2s;animation-direction:reverse;}\npath:nth-child(3){animation-duration:1s;}\n</style><svg style="width: var(--size); height: var(--size);" viewBox="0 0 100 100"><path stroke="var(--color)" stroke-width="4" fill="none" d="M91.57 26v48L50 98 8.43 74V26L50 2l41.57 24Z"/><path stroke="var(--ripple-color)" stroke-width="4" fill="none" d="M81.177 32v36L50 86 18.823 68V32L50 14l31.177 18Z"/><path stroke="var(--color)" stroke-width="4" fill="none" d="M70.785 38v24L50 74 29.215 62V38L50 26l20.785 12Z"/></svg>',customElements.define("ws-hexagon-spinner",class extends HTMLElement{constructor(){super();const e=m.content.cloneNode(!0);this.attachShadow({mode:"closed"}).appendChild(e);}});const u={childList(e){if(0!==e.addedNodes.length)for(const t of e.addedNodes){(void 0===t.tagName?[]:[t,...t.querySelectorAll("*")]).forEach(g);}},attributes(e){g(e.target);}};new MutationObserver((e=>e.forEach((e=>u[e.type](e))))).observe(document.body,{subtree:!0,attributes:!0,childList:!0,attributeFilter:["ws-x"]});for(const e of document.body.querySelectorAll("*"))g(e);

const { wsx } = i;

/*md
[@] Actions/wsx

# wsx Action

The wsx action can be used to set the `ws-x` attribute on a DOM element by using
an object as the source rather than trying to do the string manipulation
directly.
- `null`, `undefined`, and `false` will not insert the wind function
- `true` will insert the wind function with no args
- any string value will insert the wind function with the arguments formatted
    for the parser (replace spaces and underscores as needed).

## Usage
```js
// will generate ws-x="grid gr-col[1fr_1fr]"
$: windStff = {
    grid: true,
    gr-col: "1fr 1fr",
    p: false
}
```
```svelte
<div use:wsx={windStuff}>
</div>
```
*/

var wsx$1 = (node, props) => {
    const update = (props) => {
        if (props === null || props === undefined) {
            node.setAttribute("ws-x", null);
            return
        }
        node.setAttribute(
            "ws-x",
            wsx(props)
        );
    };
    update(props);
    return { update }
};

/* src\button.svelte generated by Svelte v3.58.0 */

function create_else_block$1(ctx) {
	let button;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[8].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

	return {
		c() {
			button = element("button");
			if (default_slot) default_slot.c();
			button.disabled = /*disabled*/ ctx[0];
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (default_slot) {
				default_slot.m(button, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					action_destroyer(wsx_action = wsx$1.call(null, button, /*wind*/ ctx[3])),
					listen(button, "click", stop_propagation(/*click_handler_1*/ ctx[10]))
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[7],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*disabled*/ 1) {
				button.disabled = /*disabled*/ ctx[0];
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 8) wsx_action.update.call(null, /*wind*/ ctx[3]);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(button);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (72:0) {#if label === true}
function create_if_block$3(ctx) {
	let label_1;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[8].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

	return {
		c() {
			label_1 = element("label");
			if (default_slot) default_slot.c();
			attr(label_1, "disabled", /*disabled*/ ctx[0]);
			attr(label_1, "for", /*_for*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, label_1, anchor);

			if (default_slot) {
				default_slot.m(label_1, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					action_destroyer(wsx_action = wsx$1.call(null, label_1, /*wind*/ ctx[3])),
					listen(label_1, "click", stop_propagation(/*click_handler*/ ctx[9]))
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[7],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*disabled*/ 1) {
				attr(label_1, "disabled", /*disabled*/ ctx[0]);
			}

			if (!current || dirty & /*_for*/ 2) {
				attr(label_1, "for", /*_for*/ ctx[1]);
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 8) wsx_action.update.call(null, /*wind*/ ctx[3]);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(label_1);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

function create_fragment$l(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$3, create_else_block$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*label*/ ctx[2] === true) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
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
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$l($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["color","compact","variant","disabled","for","label"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { color = "default" } = $$props;
	let { compact = false } = $$props;
	let { variant = "flat" } = $$props;
	let { disabled } = $$props;
	let { for: _for = "" } = $$props;
	let { label = false } = $$props;

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	function click_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
		if ('compact' in $$new_props) $$invalidate(5, compact = $$new_props.compact);
		if ('variant' in $$new_props) $$invalidate(6, variant = $$new_props.variant);
		if ('disabled' in $$new_props) $$invalidate(0, disabled = $$new_props.disabled);
		if ('for' in $$new_props) $$invalidate(1, _for = $$new_props.for);
		if ('label' in $$new_props) $$invalidate(2, label = $$new_props.label);
		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(3, wind = {
			[`@${variant}`]: true,
			$color: color,
			$compact: compact,
			"@button": label,
			...$$restProps
		});
	};

	return [
		disabled,
		_for,
		label,
		wind,
		color,
		compact,
		variant,
		$$scope,
		slots,
		click_handler,
		click_handler_1
	];
}

class Button extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
			color: 4,
			compact: 5,
			variant: 6,
			disabled: 0,
			for: 1,
			label: 2
		});
	}
}

function cubicOut(t) {
    const f = t - 1.0;
    return f * f * f + 1.0;
}

function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
    const o = +getComputedStyle(node).opacity;
    return {
        delay,
        duration,
        easing,
        css: t => `opacity: ${t * o}`
    };
}
function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;
    const od = target_opacity * (1 - opacity);
    const [xValue, xUnit] = split_css_unit(x);
    const [yValue, yUnit] = split_css_unit(y);
    return {
        delay,
        duration,
        easing,
        css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - (od * u)}`
    };
}

/* src\flex.svelte generated by Svelte v3.58.0 */

function create_fragment$k(ctx) {
	let ws_flex;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	return {
		c() {
			ws_flex = element("ws-flex");
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			insert(target, ws_flex, anchor);

			if (default_slot) {
				default_slot.m(ws_flex, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_flex, /*wind*/ ctx[0]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
						null
					);
				}
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 1) wsx_action.update.call(null, /*wind*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ws_flex);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$k($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["direction","pad","gap","cross","main"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { direction = false } = $$props;
	let { pad = false } = $$props;
	let { gap = false } = $$props;
	let { cross = "start" } = $$props;
	let { main = "start" } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('direction' in $$new_props) $$invalidate(1, direction = $$new_props.direction);
		if ('pad' in $$new_props) $$invalidate(2, pad = $$new_props.pad);
		if ('gap' in $$new_props) $$invalidate(3, gap = $$new_props.gap);
		if ('cross' in $$new_props) $$invalidate(4, cross = $$new_props.cross);
		if ('main' in $$new_props) $$invalidate(5, main = $$new_props.main);
		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(0, wind = {
			"fl-dir": direction,
			"fl-cr-a": cross,
			"fl-m-a": main,
			p: pad,
			gap,
			...$$restProps
		});
	};

	return [wind, direction, pad, gap, cross, main, $$scope, slots];
}

class Flex extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
			direction: 1,
			pad: 2,
			gap: 3,
			cross: 4,
			main: 5
		});
	}
}

/* src\paper.svelte generated by Svelte v3.58.0 */
const get_footer_slot_changes$2 = dirty => ({});
const get_footer_slot_context$2 = ctx => ({});
const get_content_slot_changes$1 = dirty => ({});
const get_content_slot_context$1 = ctx => ({ slot: "content" });
const get_header_slot_changes$2 = dirty => ({});
const get_header_slot_context$2 = ctx => ({});

// (108:4) {:else}
function create_else_block(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*props*/ ctx[2], { slot: "content" }];
	var switch_value = /*layout*/ ctx[0];

	function switch_props(ctx) {
		let switch_instance_props = {
			$$slots: { default: [create_default_slot$9] },
			$$scope: { ctx }
		};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) mount_component(switch_instance, target, anchor);
			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = (dirty & /*props*/ 4)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2]), switch_instance_spread_levels[1]])
			: {};

			if (dirty & /*$$scope*/ 1024) {
				switch_instance_changes.$$scope = { dirty, ctx };
			}

			if (dirty & /*layout*/ 1 && switch_value !== (switch_value = /*layout*/ ctx[0])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

// (106:4) {#if $$slots.content}
function create_if_block$2(ctx) {
	let current;
	const content_slot_template = /*#slots*/ ctx[9].content;
	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[10], get_content_slot_context$1);

	return {
		c() {
			if (content_slot) content_slot.c();
		},
		m(target, anchor) {
			if (content_slot) {
				content_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (content_slot) {
				if (content_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
					update_slot_base(
						content_slot,
						content_slot_template,
						ctx,
						/*$$scope*/ ctx[10],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
						: get_slot_changes(content_slot_template, /*$$scope*/ ctx[10], dirty, get_content_slot_changes$1),
						get_content_slot_context$1
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(content_slot, local);
			current = true;
		},
		o(local) {
			transition_out(content_slot, local);
			current = false;
		},
		d(detaching) {
			if (content_slot) content_slot.d(detaching);
		}
	};
}

// (109:8) <svelte:component this={layout} {...props} slot="content">
function create_default_slot$9(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[9].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

	return {
		c() {
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[10],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function create_fragment$j(ctx) {
	let ws_paper;
	let t0;
	let current_block_type_index;
	let if_block;
	let t1;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const header_slot_template = /*#slots*/ ctx[9].header;
	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[10], get_header_slot_context$2);
	const if_block_creators = [create_if_block$2, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*$$slots*/ ctx[3].content) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	const footer_slot_template = /*#slots*/ ctx[9].footer;
	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[10], get_footer_slot_context$2);

	return {
		c() {
			ws_paper = element("ws-paper");
			if (header_slot) header_slot.c();
			t0 = space();
			if_block.c();
			t1 = space();
			if (footer_slot) footer_slot.c();
		},
		m(target, anchor) {
			insert(target, ws_paper, anchor);

			if (header_slot) {
				header_slot.m(ws_paper, null);
			}

			append(ws_paper, t0);
			if_blocks[current_block_type_index].m(ws_paper, null);
			append(ws_paper, t1);

			if (footer_slot) {
				footer_slot.m(ws_paper, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_paper, /*wind*/ ctx[1]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (header_slot) {
				if (header_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
					update_slot_base(
						header_slot,
						header_slot_template,
						ctx,
						/*$$scope*/ ctx[10],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[10], dirty, get_header_slot_changes$2),
						get_header_slot_context$2
					);
				}
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
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
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(ws_paper, t1);
			}

			if (footer_slot) {
				if (footer_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
					update_slot_base(
						footer_slot,
						footer_slot_template,
						ctx,
						/*$$scope*/ ctx[10],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[10], dirty, get_footer_slot_changes$2),
						get_footer_slot_context$2
					);
				}
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 2) wsx_action.update.call(null, /*wind*/ ctx[1]);
		},
		i(local) {
			if (current) return;
			transition_in(header_slot, local);
			transition_in(if_block);
			transition_in(footer_slot, local);
			current = true;
		},
		o(local) {
			transition_out(header_slot, local);
			transition_out(if_block);
			transition_out(footer_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ws_paper);
			if (header_slot) header_slot.d(detaching);
			if_blocks[current_block_type_index].d();
			if (footer_slot) footer_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$j($$self, $$props, $$invalidate) {
	let props;
	let wind;
	const omit_props_names = ["color","card","square","layout","scrollable","lprops"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	const $$slots = compute_slots(slots);
	let { color } = $$props;
	let { card = false } = $$props;
	let { square = false } = $$props;
	let { layout = Flex } = $$props;
	let { scrollable = false } = $$props;
	let { lprops = {} } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
		if ('card' in $$new_props) $$invalidate(5, card = $$new_props.card);
		if ('square' in $$new_props) $$invalidate(6, square = $$new_props.square);
		if ('layout' in $$new_props) $$invalidate(0, layout = $$new_props.layout);
		if ('scrollable' in $$new_props) $$invalidate(7, scrollable = $$new_props.scrollable);
		if ('lprops' in $$new_props) $$invalidate(8, lprops = $$new_props.lprops);
		if ('$$scope' in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*scrollable, lprops*/ 384) {
			$$invalidate(2, props = {
				over: scrollable ? "auto" : false,
				...lprops
			});
		}

		$$invalidate(1, wind = {
			$color: color,
			"@outline": card,
			r: square && "0px",
			...$$restProps
		});
	};

	return [
		layout,
		wind,
		props,
		$$slots,
		color,
		card,
		square,
		scrollable,
		lprops,
		slots,
		$$scope
	];
}

class Paper extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
			color: 4,
			card: 5,
			square: 6,
			layout: 0,
			scrollable: 7,
			lprops: 8
		});
	}
}

/* src\dialog.svelte generated by Svelte v3.58.0 */
const get_header_slot_changes$1 = dirty => ({});
const get_header_slot_context$1 = ctx => ({ slot: "header" });
const get_footer_slot_changes$1 = dirty => ({});
const get_footer_slot_context$1 = ctx => ({ slot: "footer" });

// (48:4) <Paper {...$$props}>
function create_default_slot$8(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[1].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

	return {
		c() {
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[2],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (49:8) 
function create_header_slot$7(ctx) {
	let current;
	const header_slot_template = /*#slots*/ ctx[1].header;
	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[2], get_header_slot_context$1);

	return {
		c() {
			if (header_slot) header_slot.c();
		},
		m(target, anchor) {
			if (header_slot) {
				header_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (header_slot) {
				if (header_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot_base(
						header_slot,
						header_slot_template,
						ctx,
						/*$$scope*/ ctx[2],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[2], dirty, get_header_slot_changes$1),
						get_header_slot_context$1
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(header_slot, local);
			current = true;
		},
		o(local) {
			transition_out(header_slot, local);
			current = false;
		},
		d(detaching) {
			if (header_slot) header_slot.d(detaching);
		}
	};
}

// (51:8) 
function create_footer_slot$3(ctx) {
	let current;
	const footer_slot_template = /*#slots*/ ctx[1].footer;
	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[2], get_footer_slot_context$1);

	return {
		c() {
			if (footer_slot) footer_slot.c();
		},
		m(target, anchor) {
			if (footer_slot) {
				footer_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (footer_slot) {
				if (footer_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot_base(
						footer_slot,
						footer_slot_template,
						ctx,
						/*$$scope*/ ctx[2],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[2], dirty, get_footer_slot_changes$1),
						get_footer_slot_context$1
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(footer_slot, local);
			current = true;
		},
		o(local) {
			transition_out(footer_slot, local);
			current = false;
		},
		d(detaching) {
			if (footer_slot) footer_slot.d(detaching);
		}
	};
}

function create_fragment$i(ctx) {
	let wind_wrapper;
	let paper;
	let wind_wrapper_transition;
	let current;
	const paper_spread_levels = [/*$$props*/ ctx[0]];

	let paper_props = {
		$$slots: {
			footer: [create_footer_slot$3],
			header: [create_header_slot$7],
			default: [create_default_slot$8]
		},
		$$scope: { ctx }
	};

	for (let i = 0; i < paper_spread_levels.length; i += 1) {
		paper_props = assign(paper_props, paper_spread_levels[i]);
	}

	paper = new Paper({ props: paper_props });

	return {
		c() {
			wind_wrapper = element("wind-wrapper");
			create_component(paper.$$.fragment);
			set_custom_element_data(wind_wrapper, "ws-x", "@dialog grid");
		},
		m(target, anchor) {
			insert(target, wind_wrapper, anchor);
			mount_component(paper, wind_wrapper, null);
			current = true;
		},
		p(ctx, [dirty]) {
			const paper_changes = (dirty & /*$$props*/ 1)
			? get_spread_update(paper_spread_levels, [get_spread_object(/*$$props*/ ctx[0])])
			: {};

			if (dirty & /*$$scope*/ 4) {
				paper_changes.$$scope = { dirty, ctx };
			}

			paper.$set(paper_changes);
		},
		i(local) {
			if (current) return;
			transition_in(paper.$$.fragment, local);

			add_render_callback(() => {
				if (!current) return;
				if (!wind_wrapper_transition) wind_wrapper_transition = create_bidirectional_transition(wind_wrapper, fade, { duration: 200 }, true);
				wind_wrapper_transition.run(1);
			});

			current = true;
		},
		o(local) {
			transition_out(paper.$$.fragment, local);
			if (!wind_wrapper_transition) wind_wrapper_transition = create_bidirectional_transition(wind_wrapper, fade, { duration: 200 }, false);
			wind_wrapper_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(wind_wrapper);
			destroy_component(paper);
			if (detaching && wind_wrapper_transition) wind_wrapper_transition.end();
		}
	};
}

function instance$i($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;

	$$self.$$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
	};

	$$props = exclude_internal_props($$props);
	return [$$props, slots, $$scope];
}

class Dialog extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});
	}
}

/* src\drawer.svelte generated by Svelte v3.58.0 */
const get_header_slot_changes = dirty => ({});
const get_header_slot_context = ctx => ({ slot: "header" });
const get_footer_slot_changes = dirty => ({});
const get_footer_slot_context = ctx => ({ slot: "footer" });

// (115:8) <Paper {...$$restProps}>
function create_default_slot$7(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[5].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

	return {
		c() {
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[7],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (116:12) 
function create_header_slot$6(ctx) {
	let current;
	const header_slot_template = /*#slots*/ ctx[5].header;
	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[7], get_header_slot_context);

	return {
		c() {
			if (header_slot) header_slot.c();
		},
		m(target, anchor) {
			if (header_slot) {
				header_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (header_slot) {
				if (header_slot.p && (!current || dirty & /*$$scope*/ 128)) {
					update_slot_base(
						header_slot,
						header_slot_template,
						ctx,
						/*$$scope*/ ctx[7],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[7], dirty, get_header_slot_changes),
						get_header_slot_context
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(header_slot, local);
			current = true;
		},
		o(local) {
			transition_out(header_slot, local);
			current = false;
		},
		d(detaching) {
			if (header_slot) header_slot.d(detaching);
		}
	};
}

// (118:12) 
function create_footer_slot$2(ctx) {
	let current;
	const footer_slot_template = /*#slots*/ ctx[5].footer;
	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[7], get_footer_slot_context);

	return {
		c() {
			if (footer_slot) footer_slot.c();
		},
		m(target, anchor) {
			if (footer_slot) {
				footer_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (footer_slot) {
				if (footer_slot.p && (!current || dirty & /*$$scope*/ 128)) {
					update_slot_base(
						footer_slot,
						footer_slot_template,
						ctx,
						/*$$scope*/ ctx[7],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[7], dirty, get_footer_slot_changes),
						get_footer_slot_context
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(footer_slot, local);
			current = true;
		},
		o(local) {
			transition_out(footer_slot, local);
			current = false;
		},
		d(detaching) {
			if (footer_slot) footer_slot.d(detaching);
		}
	};
}

function create_fragment$h(ctx) {
	let wind_drawer_container;
	let wind_transition;
	let paper;
	let wind_transition_transition;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const paper_spread_levels = [/*$$restProps*/ ctx[2]];

	let paper_props = {
		$$slots: {
			footer: [create_footer_slot$2],
			header: [create_header_slot$6],
			default: [create_default_slot$7]
		},
		$$scope: { ctx }
	};

	for (let i = 0; i < paper_spread_levels.length; i += 1) {
		paper_props = assign(paper_props, paper_spread_levels[i]);
	}

	paper = new Paper({ props: paper_props });

	return {
		c() {
			wind_drawer_container = element("wind-drawer-container");
			wind_transition = element("wind-transition");
			create_component(paper.$$.fragment);
			set_custom_element_data(wind_transition, "ws-x", "grid");
		},
		m(target, anchor) {
			insert(target, wind_drawer_container, anchor);
			append(wind_drawer_container, wind_transition);
			mount_component(paper, wind_transition, null);
			current = true;

			if (!mounted) {
				dispose = [
					action_destroyer(wsx_action = wsx$1.call(null, wind_drawer_container, /*container*/ ctx[0])),
					listen(wind_drawer_container, "click", stop_propagation(/*click_handler*/ ctx[6]))
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			const paper_changes = (dirty & /*$$restProps*/ 4)
			? get_spread_update(paper_spread_levels, [get_spread_object(/*$$restProps*/ ctx[2])])
			: {};

			if (dirty & /*$$scope*/ 128) {
				paper_changes.$$scope = { dirty, ctx };
			}

			paper.$set(paper_changes);
			if (wsx_action && is_function(wsx_action.update) && dirty & /*container*/ 1) wsx_action.update.call(null, /*container*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(paper.$$.fragment, local);

			add_render_callback(() => {
				if (!current) return;
				if (!wind_transition_transition) wind_transition_transition = create_bidirectional_transition(wind_transition, /*slide*/ ctx[1], {}, true);
				wind_transition_transition.run(1);
			});

			current = true;
		},
		o(local) {
			transition_out(paper.$$.fragment, local);
			if (!wind_transition_transition) wind_transition_transition = create_bidirectional_transition(wind_transition, /*slide*/ ctx[1], {}, false);
			wind_transition_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(wind_drawer_container);
			destroy_component(paper);
			if (detaching && wind_transition_transition) wind_transition_transition.end();
			mounted = false;
			run_all(dispose);
		}
	};
}

const defs = {
	select: {
		"@select": true,
		"w-min": "35vw",
		grid: true,
		over: "hidden"
	},
	menu: { "@menu": true, w: "15vw" },
	action: { "@action": true, w: "15vw" }
};

const css = {
	select: (t, u) => `
            transform: translateY(-${u * 100}%);
            opacity: ${t};
        `,
	menu: (t, u) => `
            transform: translateX(-${u * 100}%);
            opacity: ${t};
        `,
	action: (t, u) => `
            transform: translateX(${u * 100}%);
            opacity: ${t};
        `
};

function instance$h($$self, $$props, $$invalidate) {
	let container;
	const omit_props_names = ["height","type"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { height } = $$props;
	let { type = "menu" } = $$props;
	const slide = (node, options) => ({ delay: 0, duration: 200, css: css[type] });

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(2, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('height' in $$new_props) $$invalidate(3, height = $$new_props.height);
		if ('type' in $$new_props) $$invalidate(4, type = $$new_props.type);
		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*type, height*/ 24) {
			$$invalidate(0, container = {
				...defs[type],
				h: type === "select" ? height : "100%",
				grid: true
			});
		}
	};

	return [container, slide, $$restProps, height, type, slots, click_handler, $$scope];
}

class Drawer extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$h, create_fragment$h, safe_not_equal, { height: 3, type: 4 });
	}
}

/* src\grid.svelte generated by Svelte v3.58.0 */

function create_fragment$g(ctx) {
	let ws_grid;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[9].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

	return {
		c() {
			ws_grid = element("ws-grid");
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			insert(target, ws_grid, anchor);

			if (default_slot) {
				default_slot.m(ws_grid, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_grid, /*wind*/ ctx[0]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[8],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
						null
					);
				}
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 1) wsx_action.update.call(null, /*wind*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ws_grid);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$g($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["direction","pad","gap","cols","rows","autoCol","autoRow"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { direction = false } = $$props;
	let { pad = false } = $$props;
	let { gap = false } = $$props;
	let { cols = null } = $$props;
	let { rows = null } = $$props;
	let { autoCol = false } = $$props;
	let { autoRow = false } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(10, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('direction' in $$new_props) $$invalidate(1, direction = $$new_props.direction);
		if ('pad' in $$new_props) $$invalidate(2, pad = $$new_props.pad);
		if ('gap' in $$new_props) $$invalidate(3, gap = $$new_props.gap);
		if ('cols' in $$new_props) $$invalidate(4, cols = $$new_props.cols);
		if ('rows' in $$new_props) $$invalidate(5, rows = $$new_props.rows);
		if ('autoCol' in $$new_props) $$invalidate(6, autoCol = $$new_props.autoCol);
		if ('autoRow' in $$new_props) $$invalidate(7, autoRow = $$new_props.autoRow);
		if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(0, wind = {
			"gr-dir": direction,
			"gr-col": cols?.join?.(" ") ?? cols ?? false,
			"gr-row": rows?.join?.(" ") ?? rows ?? false,
			"gr-acol": autoCol,
			"gr-arow": autoRow,
			p: pad,
			gap,
			...$$restProps
		});
	};

	return [wind, direction, pad, gap, cols, rows, autoCol, autoRow, $$scope, slots];
}

class Grid extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
			direction: 1,
			pad: 2,
			gap: 3,
			cols: 4,
			rows: 5,
			autoCol: 6,
			autoRow: 7
		});
	}
}

/* src\icon.svelte generated by Svelte v3.58.0 */

function create_fragment$f(ctx) {
	let ws_icon;
	let ws_icon_class_value;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[3].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

	return {
		c() {
			ws_icon = element("ws-icon");
			if (default_slot) default_slot.c();
			set_custom_element_data(ws_icon, "class", ws_icon_class_value = "ti-" + /*name*/ ctx[0]);
		},
		m(target, anchor) {
			insert(target, ws_icon, anchor);

			if (default_slot) {
				default_slot.m(ws_icon, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_icon, /*$$restProps*/ ctx[1]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[2],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*name*/ 1 && ws_icon_class_value !== (ws_icon_class_value = "ti-" + /*name*/ ctx[0])) {
				set_custom_element_data(ws_icon, "class", ws_icon_class_value);
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*$$restProps*/ 2) wsx_action.update.call(null, /*$$restProps*/ ctx[1]);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ws_icon);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$f($$self, $$props, $$invalidate) {
	const omit_props_names = ["name"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { name } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('name' in $$new_props) $$invalidate(0, name = $$new_props.name);
		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
	};

	return [name, $$restProps, $$scope, slots];
}

class Icon extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$f, create_fragment$f, safe_not_equal, { name: 0 });
	}
}

/* src\link.svelte generated by Svelte v3.58.0 */

function create_fragment$e(ctx) {
	let a;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[8].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

	return {
		c() {
			a = element("a");
			if (default_slot) default_slot.c();
			attr(a, "href", /*href*/ ctx[0]);
			attr(a, "target", /*target*/ ctx[2]);
			attr(a, "rel", /*rel*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, a, anchor);

			if (default_slot) {
				default_slot.m(a, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, a, /*wind*/ ctx[3]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[7],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*href*/ 1) {
				attr(a, "href", /*href*/ ctx[0]);
			}

			if (!current || dirty & /*target*/ 4) {
				attr(a, "target", /*target*/ ctx[2]);
			}

			if (!current || dirty & /*rel*/ 2) {
				attr(a, "rel", /*rel*/ ctx[1]);
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 8) wsx_action.update.call(null, /*wind*/ ctx[3]);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(a);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$e($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["button","variant","color","href","rel","target"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { button = false } = $$props;
	let { variant = "flat" } = $$props;
	let { color = "default" } = $$props;
	let { href = "" } = $$props;
	let { rel = "noreferrer" } = $$props;
	let { target = null } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('button' in $$new_props) $$invalidate(4, button = $$new_props.button);
		if ('variant' in $$new_props) $$invalidate(5, variant = $$new_props.variant);
		if ('color' in $$new_props) $$invalidate(6, color = $$new_props.color);
		if ('href' in $$new_props) $$invalidate(0, href = $$new_props.href);
		if ('rel' in $$new_props) $$invalidate(1, rel = $$new_props.rel);
		if ('target' in $$new_props) $$invalidate(2, target = $$new_props.target);
		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(3, wind = {
			"@button": button,
			[`@${variant}`]: true,
			$color: color,
			...$$restProps
		});
	};

	return [href, rel, target, wind, button, variant, color, $$scope, slots];
}

class Link extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
			button: 4,
			variant: 5,
			color: 6,
			href: 0,
			rel: 1,
			target: 2
		});
	}
}

/* src\modal.svelte generated by Svelte v3.58.0 */

function create_if_block$1(ctx) {
	let ws_modal;
	let switch_instance;
	let current;
	let mounted;
	let dispose;
	const switch_instance_spread_levels = [/*modalProps*/ ctx[1], { close: /*close*/ ctx[4] }];
	var switch_value = /*component*/ ctx[0];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = construct_svelte_component(switch_value, switch_props());
		/*switch_instance_binding*/ ctx[7](switch_instance);
	}

	return {
		c() {
			ws_modal = element("ws-modal");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			set_custom_element_data(ws_modal, "ws-x", "$show");
		},
		m(target, anchor) {
			insert(target, ws_modal, anchor);
			if (switch_instance) mount_component(switch_instance, ws_modal, null);
			current = true;

			if (!mounted) {
				dispose = listen(ws_modal, "click", /*cancel*/ ctx[5]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			const switch_instance_changes = (dirty & /*modalProps, close*/ 18)
			? get_spread_update(switch_instance_spread_levels, [
					dirty & /*modalProps*/ 2 && get_spread_object(/*modalProps*/ ctx[1]),
					dirty & /*close*/ 16 && { close: /*close*/ ctx[4] }
				])
			: {};

			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = construct_svelte_component(switch_value, switch_props());
					/*switch_instance_binding*/ ctx[7](switch_instance);
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, ws_modal, null);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ws_modal);
			/*switch_instance_binding*/ ctx[7](null);
			if (switch_instance) destroy_component(switch_instance);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$d(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*resolver*/ ctx[2] !== null && create_if_block$1(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*resolver*/ ctx[2] !== null) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*resolver*/ 4) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$d($$self, $$props, $$invalidate) {
	let { component } = $$props;
	let modalProps = null;
	let resolver = null;
	let displayed = null;

	const close = value => {
		resolver(value);
		$$invalidate(2, resolver = null);
		$$invalidate(1, modalProps = null);
	};

	const cancel = () => displayed.cancel?.();

	const show = props => new Promise(resolve => {
			$$invalidate(1, modalProps = props ?? {});
			$$invalidate(2, resolver = resolve);
		});

	function switch_instance_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			displayed = $$value;
			$$invalidate(3, displayed);
		});
	}

	$$self.$$set = $$props => {
		if ('component' in $$props) $$invalidate(0, component = $$props.component);
	};

	return [
		component,
		modalProps,
		resolver,
		displayed,
		close,
		cancel,
		show,
		switch_instance_binding
	];
}

class Modal extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$d, create_fragment$d, safe_not_equal, { component: 0, show: 6 });
	}

	get show() {
		return this.$$.ctx[6];
	}
}

/* src\popover.svelte generated by Svelte v3.58.0 */
const get_content_slot_changes = dirty => ({});

const get_content_slot_context = ctx => ({
	hide: /*hide*/ ctx[3],
	show: /*show*/ ctx[2]
});

const get_default_slot_changes = dirty => ({});
const get_default_slot_context = ctx => ({ show: /*show*/ ctx[2] });

// (55:4) {#if visible}
function create_if_block(ctx) {
	let wind_content;
	let wind_content_transition;
	let current;
	const content_slot_template = /*#slots*/ ctx[6].content;
	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[5], get_content_slot_context);

	return {
		c() {
			wind_content = element("wind-content");
			if (content_slot) content_slot.c();
			set_custom_element_data(wind_content, "ws-x", "slot[content] inset[0px]");
		},
		m(target, anchor) {
			insert(target, wind_content, anchor);

			if (content_slot) {
				content_slot.m(wind_content, null);
			}

			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (content_slot) {
				if (content_slot.p && (!current || dirty & /*$$scope*/ 32)) {
					update_slot_base(
						content_slot,
						content_slot_template,
						ctx,
						/*$$scope*/ ctx[5],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
						: get_slot_changes(content_slot_template, /*$$scope*/ ctx[5], dirty, get_content_slot_changes),
						get_content_slot_context
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(content_slot, local);

			add_render_callback(() => {
				if (!current) return;
				if (!wind_content_transition) wind_content_transition = create_bidirectional_transition(wind_content, fade, /*anim*/ ctx[4], true);
				wind_content_transition.run(1);
			});

			current = true;
		},
		o(local) {
			transition_out(content_slot, local);
			if (!wind_content_transition) wind_content_transition = create_bidirectional_transition(wind_content, fade, /*anim*/ ctx[4], false);
			wind_content_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(wind_content);
			if (content_slot) content_slot.d(detaching);
			if (detaching && wind_content_transition) wind_content_transition.end();
		}
	};
}

function create_fragment$c(ctx) {
	let ws_popover;
	let t;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context);
	let if_block = /*visible*/ ctx[0] && create_if_block(ctx);

	return {
		c() {
			ws_popover = element("ws-popover");
			if (default_slot) default_slot.c();
			t = space();
			if (if_block) if_block.c();
		},
		m(target, anchor) {
			insert(target, ws_popover, anchor);

			if (default_slot) {
				default_slot.m(ws_popover, null);
			}

			append(ws_popover, t);
			if (if_block) if_block.m(ws_popover, null);
			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_popover, /*wind*/ ctx[1]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[5],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, get_default_slot_changes),
						get_default_slot_context
					);
				}
			}

			if (/*visible*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*visible*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(ws_popover, null);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 2) wsx_action.update.call(null, /*wind*/ ctx[1]);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ws_popover);
			if (default_slot) default_slot.d(detaching);
			if (if_block) if_block.d();
			mounted = false;
			dispose();
		}
	};
}

function instance$c($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = [];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let visible = false;
	const show = () => $$invalidate(0, visible = true);
	const hide = () => $$invalidate(0, visible = false);
	const anim = { duration: 200 };

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(7, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(1, wind = { $show: true, ...$$restProps });
	};

	return [visible, wind, show, hide, anim, $$scope, slots];
}

class Popover extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});
	}
}

// let crypto = null
(typeof window !== "undefined")
    ? window.crypto
    : (await import('node:crypto')).default;

BigInt(8640000000000000);

const alphabet = "0123456789abcdefghijklmnopqrstuv";
[...alphabet].reduce(
    (map, ch, index) => {
        map[ch] = BigInt(index);
        return map
    },
    {}
);

/*md
[@] Event Handlers

# Event Handlers

Zephyr provides a couple of functions to help make event handlers look
nicer and bind arguments easier.
*/


/*md
## handler$

Wraps a function for currying as an event handler. The curried function does
not pass the event into final function call.

### Usage
```js
const clicked = handler$(
    (buttonName) => console.log(buttonName)
)
```
```svelte
<!-- logs "first" when clicked -->
<Button on:click={clicked("first")}>
    First
</Button>
<!-- logs "second" when clicked -->
<Button on:click={clicked("second")}>
    Second
</Button>
```
*/
const handler$ = (func) =>
    (...args) =>
        (_, ...extra) => func(...args, ...extra);

/* src\screen.svelte generated by Svelte v3.58.0 */

function create_fragment$b(ctx) {
	let ws_screen;
	let wsx_action;
	let ws_screen_transition;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[4].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

	return {
		c() {
			ws_screen = element("ws-screen");
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			insert(target, ws_screen, anchor);

			if (default_slot) {
				default_slot.m(ws_screen, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_screen, /*wind*/ ctx[0]));
				mounted = true;
			}
		},
		p(new_ctx, [dirty]) {
			ctx = new_ctx;

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[3],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
						null
					);
				}
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 1) wsx_action.update.call(null, /*wind*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);

			add_render_callback(() => {
				if (!current) return;
				if (!ws_screen_transition) ws_screen_transition = create_bidirectional_transition(ws_screen, fly, /*animation*/ ctx[1], true);
				ws_screen_transition.run(1);
			});

			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			if (!ws_screen_transition) ws_screen_transition = create_bidirectional_transition(ws_screen, fly, /*animation*/ ctx[1], false);
			ws_screen_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ws_screen);
			if (default_slot) default_slot.d(detaching);
			if (detaching && ws_screen_transition) ws_screen_transition.end();
			mounted = false;
			dispose();
		}
	};
}

const ctxStack = Symbol("stack context");

function instance$b($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["width"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { width = false } = $$props;
	const stack = getContext(ctxStack) ?? 0;
	const animation = { y: window.innerHeight, duration: 350 };
	setContext(ctxStack, stack + 1);

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('width' in $$new_props) $$invalidate(2, width = $$new_props.width);
		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(0, wind = {
			"&stack": stack.toString(),
			"&screen-width": width,
			"bg-c": "transparent",
			...$$restProps
		});
	};

	return [wind, animation, width, $$scope, slots];
}

class Screen extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$b, create_fragment$b, safe_not_equal, { width: 2 });
	}
}

/* src\text.svelte generated by Svelte v3.58.0 */

function create_fragment$a(ctx) {
	let span;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

	return {
		c() {
			span = element("span");
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			insert(target, span, anchor);

			if (default_slot) {
				default_slot.m(span, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, span, /*wind*/ ctx[0]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[5],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
						null
					);
				}
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 1) wsx_action.update.call(null, /*wind*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(span);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$a($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["title","subtitle","block","adorn"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { title = false } = $$props;
	let { subtitle = false } = $$props;
	let { block = false } = $$props;
	let { adorn = false } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(7, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
		if ('subtitle' in $$new_props) $$invalidate(2, subtitle = $$new_props.subtitle);
		if ('block' in $$new_props) $$invalidate(3, block = $$new_props.block);
		if ('adorn' in $$new_props) $$invalidate(4, adorn = $$new_props.adorn);
		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(0, wind = {
			"$title": title,
			"$subtitle": subtitle,
			"$adorn": adorn,
			block,
			...$$restProps
		});
	};

	return [wind, title, subtitle, block, adorn, $$scope, slots];
}

class Text extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
			title: 1,
			subtitle: 2,
			block: 3,
			adorn: 4
		});
	}
}

/* src\titlebar.svelte generated by Svelte v3.58.0 */
const get_action_slot_changes = dirty => ({});
const get_action_slot_context = ctx => ({});
const get_title_slot_changes = dirty => ({});
const get_title_slot_context = ctx => ({});
const get_menu_slot_changes = dirty => ({});
const get_menu_slot_context = ctx => ({});

function create_fragment$9(ctx) {
	let ws_titlebar;
	let t0;
	let t1;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const menu_slot_template = /*#slots*/ ctx[4].menu;
	const menu_slot = create_slot(menu_slot_template, ctx, /*$$scope*/ ctx[3], get_menu_slot_context);
	const title_slot_template = /*#slots*/ ctx[4].title;
	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[3], get_title_slot_context);
	const action_slot_template = /*#slots*/ ctx[4].action;
	const action_slot = create_slot(action_slot_template, ctx, /*$$scope*/ ctx[3], get_action_slot_context);

	return {
		c() {
			ws_titlebar = element("ws-titlebar");
			if (menu_slot) menu_slot.c();
			t0 = space();
			if (title_slot) title_slot.c();
			t1 = space();
			if (action_slot) action_slot.c();
		},
		m(target, anchor) {
			insert(target, ws_titlebar, anchor);

			if (menu_slot) {
				menu_slot.m(ws_titlebar, null);
			}

			append(ws_titlebar, t0);

			if (title_slot) {
				title_slot.m(ws_titlebar, null);
			}

			append(ws_titlebar, t1);

			if (action_slot) {
				action_slot.m(ws_titlebar, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_titlebar, /*wind*/ ctx[0]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (menu_slot) {
				if (menu_slot.p && (!current || dirty & /*$$scope*/ 8)) {
					update_slot_base(
						menu_slot,
						menu_slot_template,
						ctx,
						/*$$scope*/ ctx[3],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
						: get_slot_changes(menu_slot_template, /*$$scope*/ ctx[3], dirty, get_menu_slot_changes),
						get_menu_slot_context
					);
				}
			}

			if (title_slot) {
				if (title_slot.p && (!current || dirty & /*$$scope*/ 8)) {
					update_slot_base(
						title_slot,
						title_slot_template,
						ctx,
						/*$$scope*/ ctx[3],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
						: get_slot_changes(title_slot_template, /*$$scope*/ ctx[3], dirty, get_title_slot_changes),
						get_title_slot_context
					);
				}
			}

			if (action_slot) {
				if (action_slot.p && (!current || dirty & /*$$scope*/ 8)) {
					update_slot_base(
						action_slot,
						action_slot_template,
						ctx,
						/*$$scope*/ ctx[3],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
						: get_slot_changes(action_slot_template, /*$$scope*/ ctx[3], dirty, get_action_slot_changes),
						get_action_slot_context
					);
				}
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 1) wsx_action.update.call(null, /*wind*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(menu_slot, local);
			transition_in(title_slot, local);
			transition_in(action_slot, local);
			current = true;
		},
		o(local) {
			transition_out(menu_slot, local);
			transition_out(title_slot, local);
			transition_out(action_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ws_titlebar);
			if (menu_slot) menu_slot.d(detaching);
			if (title_slot) title_slot.d(detaching);
			if (action_slot) action_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$9($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["color","fill"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { color } = $$props;
	let { fill = false } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('color' in $$new_props) $$invalidate(1, color = $$new_props.color);
		if ('fill' in $$new_props) $$invalidate(2, fill = $$new_props.fill);
		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(0, wind = {
			$color: color,
			"@fill": fill,
			...$$restProps
		});
	};

	return [wind, color, fill, $$scope, slots];
}

class Titlebar extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$9, create_fragment$9, safe_not_equal, { color: 1, fill: 2 });
	}
}

/* src\circle-spinner.svelte generated by Svelte v3.58.0 */

function create_fragment$8(ctx) {
	let ws_circle_spinner;
	let wsx_action;
	let mounted;
	let dispose;

	return {
		c() {
			ws_circle_spinner = element("ws-circle-spinner");
		},
		m(target, anchor) {
			insert(target, ws_circle_spinner, anchor);

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_circle_spinner, /*wind*/ ctx[0]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 1) wsx_action.update.call(null, /*wind*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(ws_circle_spinner);
			mounted = false;
			dispose();
		}
	};
}

function instance$8($$self, $$props, $$invalidate) {
	let wind;
	let { size = "100px" } = $$props;
	let { color = "primary" } = $$props;

	$$self.$$set = $$props => {
		if ('size' in $$props) $$invalidate(1, size = $$props.size);
		if ('color' in $$props) $$invalidate(2, color = $$props.color);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*size, color*/ 6) {
			$$invalidate(0, wind = { "&size": size, $color: color });
		}
	};

	return [wind, size, color];
}

class Circle_spinner extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$8, create_fragment$8, safe_not_equal, { size: 1, color: 2 });
	}
}

/* src\hexagon-spinner.svelte generated by Svelte v3.58.0 */

function create_fragment$7(ctx) {
	let ws_hexagon_spinner;
	let wsx_action;
	let mounted;
	let dispose;

	return {
		c() {
			ws_hexagon_spinner = element("ws-hexagon-spinner");
		},
		m(target, anchor) {
			insert(target, ws_hexagon_spinner, anchor);

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_hexagon_spinner, /*wind*/ ctx[0]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 1) wsx_action.update.call(null, /*wind*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(ws_hexagon_spinner);
			mounted = false;
			dispose();
		}
	};
}

function instance$7($$self, $$props, $$invalidate) {
	let wind;
	let { size = "100px" } = $$props;
	let { color = "primary" } = $$props;

	$$self.$$set = $$props => {
		if ('size' in $$props) $$invalidate(1, size = $$props.size);
		if ('color' in $$props) $$invalidate(2, color = $$props.color);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*size, color*/ 6) {
			$$invalidate(0, wind = { "&size": size, $color: color });
		}
	};

	return [wind, size, color];
}

class Hexagon_spinner extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$7, create_fragment$7, safe_not_equal, { size: 1, color: 2 });
	}
}

/* src\dialogs\alert.svelte generated by Svelte v3.58.0 */

function create_default_slot_4$4(ctx) {
	let t;

	return {
		c() {
			t = text(/*message*/ ctx[3]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*message*/ 8) set_data(t, /*message*/ ctx[3]);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (16:0) <Dialog card {color}>
function create_default_slot_3$4(ctx) {
	let text_1;
	let current;

	text_1 = new Text({
			props: {
				$$slots: { default: [create_default_slot_4$4] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(text_1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(text_1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text_1_changes = {};

			if (dirty & /*$$scope, message*/ 72) {
				text_1_changes.$$scope = { dirty, ctx };
			}

			text_1.$set(text_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text_1, detaching);
		}
	};
}

// (19:12) <Icon name={icon}>
function create_default_slot_2$4(ctx) {
	let t;

	return {
		c() {
			t = text(/*title*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*title*/ 2) set_data(t, /*title*/ ctx[1]);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (18:8) <Text title slot="title">
function create_default_slot_1$5(ctx) {
	let icon_1;
	let current;

	icon_1 = new Icon({
			props: {
				name: /*icon*/ ctx[2],
				$$slots: { default: [create_default_slot_2$4] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(icon_1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(icon_1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const icon_1_changes = {};
			if (dirty & /*icon*/ 4) icon_1_changes.name = /*icon*/ ctx[2];

			if (dirty & /*$$scope, title*/ 66) {
				icon_1_changes.$$scope = { dirty, ctx };
			}

			icon_1.$set(icon_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(icon_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(icon_1, detaching);
		}
	};
}

// (18:8) 
function create_title_slot$5(ctx) {
	let text_1;
	let current;

	text_1 = new Text({
			props: {
				title: true,
				slot: "title",
				$$slots: { default: [create_default_slot_1$5] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(text_1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(text_1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text_1_changes = {};

			if (dirty & /*$$scope, icon, title*/ 70) {
				text_1_changes.$$scope = { dirty, ctx };
			}

			text_1.$set(text_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text_1, detaching);
		}
	};
}

// (17:4) 
function create_header_slot$5(ctx) {
	let titlebar;
	let current;

	titlebar = new Titlebar({
			props: {
				slot: "header",
				color: /*color*/ ctx[5],
				$$slots: { title: [create_title_slot$5] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(titlebar.$$.fragment);
		},
		m(target, anchor) {
			mount_component(titlebar, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const titlebar_changes = {};
			if (dirty & /*color*/ 32) titlebar_changes.color = /*color*/ ctx[5];

			if (dirty & /*$$scope, icon, title*/ 70) {
				titlebar_changes.$$scope = { dirty, ctx };
			}

			titlebar.$set(titlebar_changes);
		},
		i(local) {
			if (current) return;
			transition_in(titlebar.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(titlebar.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(titlebar, detaching);
		}
	};
}

// (29:4) <Button slot="footer" on:click={close} {color}>
function create_default_slot$6(ctx) {
	let t;

	return {
		c() {
			t = text(/*okText*/ ctx[4]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*okText*/ 16) set_data(t, /*okText*/ ctx[4]);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (29:4) 
function create_footer_slot$1(ctx) {
	let button;
	let current;

	button = new Button({
			props: {
				slot: "footer",
				color: /*color*/ ctx[5],
				$$slots: { default: [create_default_slot$6] },
				$$scope: { ctx }
			}
		});

	button.$on("click", function () {
		if (is_function(/*close*/ ctx[0])) /*close*/ ctx[0].apply(this, arguments);
	});

	return {
		c() {
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const button_changes = {};
			if (dirty & /*color*/ 32) button_changes.color = /*color*/ ctx[5];

			if (dirty & /*$$scope, okText*/ 80) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
		}
	};
}

function create_fragment$6(ctx) {
	let dialog;
	let current;

	dialog = new Dialog({
			props: {
				card: true,
				color: /*color*/ ctx[5],
				$$slots: {
					footer: [create_footer_slot$1],
					header: [create_header_slot$5],
					default: [create_default_slot_3$4]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(dialog.$$.fragment);
		},
		m(target, anchor) {
			mount_component(dialog, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const dialog_changes = {};
			if (dirty & /*color*/ 32) dialog_changes.color = /*color*/ ctx[5];

			if (dirty & /*$$scope, color, close, okText, icon, title, message*/ 127) {
				dialog_changes.$$scope = { dirty, ctx };
			}

			dialog.$set(dialog_changes);
		},
		i(local) {
			if (current) return;
			transition_in(dialog.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(dialog.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(dialog, detaching);
		}
	};
}

function instance$6($$self, $$props, $$invalidate) {
	let { close } = $$props;
	let { title = "Alert" } = $$props;
	let { icon } = $$props;
	let { message } = $$props;
	let { okText = "OK" } = $$props;
	let { color = "primary" } = $$props;

	$$self.$$set = $$props => {
		if ('close' in $$props) $$invalidate(0, close = $$props.close);
		if ('title' in $$props) $$invalidate(1, title = $$props.title);
		if ('icon' in $$props) $$invalidate(2, icon = $$props.icon);
		if ('message' in $$props) $$invalidate(3, message = $$props.message);
		if ('okText' in $$props) $$invalidate(4, okText = $$props.okText);
		if ('color' in $$props) $$invalidate(5, color = $$props.color);
	};

	return [close, title, icon, message, okText, color];
}

class Alert extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
			close: 0,
			title: 1,
			icon: 2,
			message: 3,
			okText: 4,
			color: 5
		});
	}
}

/* src\dialogs\confirm.svelte generated by Svelte v3.58.0 */

function create_default_slot_6$2(ctx) {
	let t;

	return {
		c() {
			t = text(/*message*/ ctx[2]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*message*/ 4) set_data(t, /*message*/ ctx[2]);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (22:0) <Dialog card {color}>
function create_default_slot_5$2(ctx) {
	let text_1;
	let current;

	text_1 = new Text({
			props: {
				$$slots: { default: [create_default_slot_6$2] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(text_1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(text_1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text_1_changes = {};

			if (dirty & /*$$scope, message*/ 260) {
				text_1_changes.$$scope = { dirty, ctx };
			}

			text_1.$set(text_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text_1, detaching);
		}
	};
}

// (25:12) <Icon name={icon}>
function create_default_slot_4$3(ctx) {
	let t;

	return {
		c() {
			t = text(/*title*/ ctx[0]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*title*/ 1) set_data(t, /*title*/ ctx[0]);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (24:8) <Text title slot="title">
function create_default_slot_3$3(ctx) {
	let icon_1;
	let current;

	icon_1 = new Icon({
			props: {
				name: /*icon*/ ctx[1],
				$$slots: { default: [create_default_slot_4$3] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(icon_1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(icon_1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const icon_1_changes = {};
			if (dirty & /*icon*/ 2) icon_1_changes.name = /*icon*/ ctx[1];

			if (dirty & /*$$scope, title*/ 257) {
				icon_1_changes.$$scope = { dirty, ctx };
			}

			icon_1.$set(icon_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(icon_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(icon_1, detaching);
		}
	};
}

// (24:8) 
function create_title_slot$4(ctx) {
	let text_1;
	let current;

	text_1 = new Text({
			props: {
				title: true,
				slot: "title",
				$$slots: { default: [create_default_slot_3$3] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(text_1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(text_1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text_1_changes = {};

			if (dirty & /*$$scope, icon, title*/ 259) {
				text_1_changes.$$scope = { dirty, ctx };
			}

			text_1.$set(text_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text_1, detaching);
		}
	};
}

// (23:4) 
function create_header_slot$4(ctx) {
	let titlebar;
	let current;

	titlebar = new Titlebar({
			props: {
				slot: "header",
				color: /*color*/ ctx[5],
				$$slots: { title: [create_title_slot$4] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(titlebar.$$.fragment);
		},
		m(target, anchor) {
			mount_component(titlebar, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const titlebar_changes = {};
			if (dirty & /*color*/ 32) titlebar_changes.color = /*color*/ ctx[5];

			if (dirty & /*$$scope, icon, title*/ 259) {
				titlebar_changes.$$scope = { dirty, ctx };
			}

			titlebar.$set(titlebar_changes);
		},
		i(local) {
			if (current) return;
			transition_in(titlebar.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(titlebar.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(titlebar, detaching);
		}
	};
}

// (36:8) <Button on:click={cls(false)} color="danger">
function create_default_slot_2$3(ctx) {
	let t;

	return {
		c() {
			t = text(/*cancelText*/ ctx[4]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*cancelText*/ 16) set_data(t, /*cancelText*/ ctx[4]);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (39:8) <Button on:click={cls(true)} color="secondary">
function create_default_slot_1$4(ctx) {
	let t;

	return {
		c() {
			t = text(/*okText*/ ctx[3]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*okText*/ 8) set_data(t, /*okText*/ ctx[3]);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (35:4) <Grid cols="1fr 1fr" slot="footer" pad="0px">
function create_default_slot$5(ctx) {
	let button0;
	let t;
	let button1;
	let current;

	button0 = new Button({
			props: {
				color: "danger",
				$$slots: { default: [create_default_slot_2$3] },
				$$scope: { ctx }
			}
		});

	button0.$on("click", /*cls*/ ctx[6](false));

	button1 = new Button({
			props: {
				color: "secondary",
				$$slots: { default: [create_default_slot_1$4] },
				$$scope: { ctx }
			}
		});

	button1.$on("click", /*cls*/ ctx[6](true));

	return {
		c() {
			create_component(button0.$$.fragment);
			t = space();
			create_component(button1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button0, target, anchor);
			insert(target, t, anchor);
			mount_component(button1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const button0_changes = {};

			if (dirty & /*$$scope, cancelText*/ 272) {
				button0_changes.$$scope = { dirty, ctx };
			}

			button0.$set(button0_changes);
			const button1_changes = {};

			if (dirty & /*$$scope, okText*/ 264) {
				button1_changes.$$scope = { dirty, ctx };
			}

			button1.$set(button1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button0.$$.fragment, local);
			transition_in(button1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button0.$$.fragment, local);
			transition_out(button1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button0, detaching);
			if (detaching) detach(t);
			destroy_component(button1, detaching);
		}
	};
}

// (35:4) 
function create_footer_slot(ctx) {
	let grid;
	let current;

	grid = new Grid({
			props: {
				cols: "1fr 1fr",
				slot: "footer",
				pad: "0px",
				$$slots: { default: [create_default_slot$5] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(grid.$$.fragment);
		},
		m(target, anchor) {
			mount_component(grid, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const grid_changes = {};

			if (dirty & /*$$scope, okText, cancelText*/ 280) {
				grid_changes.$$scope = { dirty, ctx };
			}

			grid.$set(grid_changes);
		},
		i(local) {
			if (current) return;
			transition_in(grid.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(grid.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(grid, detaching);
		}
	};
}

function create_fragment$5(ctx) {
	let dialog;
	let current;

	dialog = new Dialog({
			props: {
				card: true,
				color: /*color*/ ctx[5],
				$$slots: {
					footer: [create_footer_slot],
					header: [create_header_slot$4],
					default: [create_default_slot_5$2]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(dialog.$$.fragment);
		},
		m(target, anchor) {
			mount_component(dialog, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const dialog_changes = {};
			if (dirty & /*color*/ 32) dialog_changes.color = /*color*/ ctx[5];

			if (dirty & /*$$scope, okText, cancelText, color, icon, title, message*/ 319) {
				dialog_changes.$$scope = { dirty, ctx };
			}

			dialog.$set(dialog_changes);
		},
		i(local) {
			if (current) return;
			transition_in(dialog.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(dialog.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(dialog, detaching);
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let { close } = $$props;
	let { title = "Confirm" } = $$props;
	let { icon } = $$props;
	let { message } = $$props;
	let { okText = "OK" } = $$props;
	let { cancelText = "Cancel" } = $$props;
	let { color = "primary" } = $$props;
	const cls = handler$(close);

	$$self.$$set = $$props => {
		if ('close' in $$props) $$invalidate(7, close = $$props.close);
		if ('title' in $$props) $$invalidate(0, title = $$props.title);
		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
		if ('message' in $$props) $$invalidate(2, message = $$props.message);
		if ('okText' in $$props) $$invalidate(3, okText = $$props.okText);
		if ('cancelText' in $$props) $$invalidate(4, cancelText = $$props.cancelText);
		if ('color' in $$props) $$invalidate(5, color = $$props.color);
	};

	return [title, icon, message, okText, cancelText, color, cls, close];
}

class Confirm extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
			close: 7,
			title: 0,
			icon: 1,
			message: 2,
			okText: 3,
			cancelText: 4,
			color: 5
		});
	}
}

/* src\composed\entry-button.svelte generated by Svelte v3.58.0 */

function create_default_slot$4(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

	return {
		c() {
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[8],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function create_fragment$4(ctx) {
	let button;
	let t;
	let switch_instance;
	let switch_instance_anchor;
	let current;
	const button_spread_levels = [/*$$restProps*/ ctx[5]];

	let button_props = {
		$$slots: { default: [create_default_slot$4] },
		$$scope: { ctx }
	};

	for (let i = 0; i < button_spread_levels.length; i += 1) {
		button_props = assign(button_props, button_spread_levels[i]);
	}

	button = new Button({ props: button_props });

	button.$on("click", function () {
		if (is_function(/*open*/ ctx[4](/*props*/ ctx[1]))) /*open*/ ctx[4](/*props*/ ctx[1]).apply(this, arguments);
	});

	var switch_value = /*wrapper*/ ctx[2];

	function switch_props(ctx) {
		let switch_instance_props = { component: /*component*/ ctx[0] };
		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
		/*switch_instance_binding*/ ctx[7](switch_instance);
	}

	return {
		c() {
			create_component(button.$$.fragment);
			t = space();
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			insert(target, t, anchor);
			if (switch_instance) mount_component(switch_instance, target, anchor);
			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(new_ctx, [dirty]) {
			ctx = new_ctx;

			const button_changes = (dirty & /*$$restProps*/ 32)
			? get_spread_update(button_spread_levels, [get_spread_object(/*$$restProps*/ ctx[5])])
			: {};

			if (dirty & /*$$scope*/ 256) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
			const switch_instance_changes = {};
			if (dirty & /*component*/ 1) switch_instance_changes.component = /*component*/ ctx[0];

			if (dirty & /*wrapper*/ 4 && switch_value !== (switch_value = /*wrapper*/ ctx[2])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
					/*switch_instance_binding*/ ctx[7](switch_instance);
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
			if (detaching) detach(t);
			/*switch_instance_binding*/ ctx[7](null);
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	const omit_props_names = ["component","props","this"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { component } = $$props;
	let { props } = $$props;
	let { this: wrapper = Modal } = $$props;
	const send = createEventDispatcher();
	let element = null;

	const open = handler$(async props => {
		const elemProps = typeof props === "function" ? props() : props;
		const result = await element.show(elemProps);
		send("entry", result);
	});

	function switch_instance_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			element = $$value;
			$$invalidate(3, element);
		});
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
		if ('props' in $$new_props) $$invalidate(1, props = $$new_props.props);
		if ('this' in $$new_props) $$invalidate(2, wrapper = $$new_props.this);
		if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
	};

	return [
		component,
		props,
		wrapper,
		element,
		open,
		$$restProps,
		slots,
		switch_instance_binding,
		$$scope
	];
}

class Entry_button extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, { component: 0, props: 1, this: 2 });
	}
}

/* test\src\comp\test-dialog.svelte generated by Svelte v3.58.0 */

function create_default_slot_6$1(ctx) {
	let t;

	return {
		c() {
			t = text("First line");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (28:4) <Text>
function create_default_slot_5$1(ctx) {
	let t;

	return {
		c() {
			t = text("Second line");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (29:4) <Text>
function create_default_slot_4$2(ctx) {
	let t_value = Math.random() + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (30:4) <Text>
function create_default_slot_3$2(ctx) {
	let t;

	return {
		c() {
			t = text(/*message*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*message*/ 2) set_data(t, /*message*/ ctx[1]);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (17:0) <Dialog>
function create_default_slot_2$2(ctx) {
	let text0;
	let t0;
	let text1;
	let t1;
	let text2;
	let t2;
	let text3;
	let current;

	text0 = new Text({
			props: {
				$$slots: { default: [create_default_slot_6$1] },
				$$scope: { ctx }
			}
		});

	text1 = new Text({
			props: {
				$$slots: { default: [create_default_slot_5$1] },
				$$scope: { ctx }
			}
		});

	text2 = new Text({
			props: {
				$$slots: { default: [create_default_slot_4$2] },
				$$scope: { ctx }
			}
		});

	text3 = new Text({
			props: {
				$$slots: { default: [create_default_slot_3$2] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(text0.$$.fragment);
			t0 = space();
			create_component(text1.$$.fragment);
			t1 = space();
			create_component(text2.$$.fragment);
			t2 = space();
			create_component(text3.$$.fragment);
		},
		m(target, anchor) {
			mount_component(text0, target, anchor);
			insert(target, t0, anchor);
			mount_component(text1, target, anchor);
			insert(target, t1, anchor);
			mount_component(text2, target, anchor);
			insert(target, t2, anchor);
			mount_component(text3, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text0_changes = {};

			if (dirty & /*$$scope*/ 8) {
				text0_changes.$$scope = { dirty, ctx };
			}

			text0.$set(text0_changes);
			const text1_changes = {};

			if (dirty & /*$$scope*/ 8) {
				text1_changes.$$scope = { dirty, ctx };
			}

			text1.$set(text1_changes);
			const text2_changes = {};

			if (dirty & /*$$scope*/ 8) {
				text2_changes.$$scope = { dirty, ctx };
			}

			text2.$set(text2_changes);
			const text3_changes = {};

			if (dirty & /*$$scope, message*/ 10) {
				text3_changes.$$scope = { dirty, ctx };
			}

			text3.$set(text3_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text0.$$.fragment, local);
			transition_in(text1.$$.fragment, local);
			transition_in(text2.$$.fragment, local);
			transition_in(text3.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text0.$$.fragment, local);
			transition_out(text1.$$.fragment, local);
			transition_out(text2.$$.fragment, local);
			transition_out(text3.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text0, detaching);
			if (detaching) detach(t0);
			destroy_component(text1, detaching);
			if (detaching) detach(t1);
			destroy_component(text2, detaching);
			if (detaching) detach(t2);
			destroy_component(text3, detaching);
		}
	};
}

// (19:8) <Button slot="action" compact on:click={close}>
function create_default_slot_1$3(ctx) {
	let icon;
	let current;
	icon = new Icon({ props: { name: "x" } });

	return {
		c() {
			create_component(icon.$$.fragment);
		},
		m(target, anchor) {
			mount_component(icon, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(icon, detaching);
		}
	};
}

// (19:8) 
function create_action_slot$2(ctx) {
	let button;
	let current;

	button = new Button({
			props: {
				slot: "action",
				compact: true,
				$$slots: { default: [create_default_slot_1$3] },
				$$scope: { ctx }
			}
		});

	button.$on("click", function () {
		if (is_function(/*close*/ ctx[0])) /*close*/ ctx[0].apply(this, arguments);
	});

	return {
		c() {
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const button_changes = {};

			if (dirty & /*$$scope*/ 8) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
		}
	};
}

// (22:8) <Text title slot="title">
function create_default_slot$3(ctx) {
	let t;

	return {
		c() {
			t = text("Dialog Test");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (22:8) 
function create_title_slot$3(ctx) {
	let text_1;
	let current;

	text_1 = new Text({
			props: {
				title: true,
				slot: "title",
				$$slots: { default: [create_default_slot$3] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(text_1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(text_1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text_1_changes = {};

			if (dirty & /*$$scope*/ 8) {
				text_1_changes.$$scope = { dirty, ctx };
			}

			text_1.$set(text_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text_1, detaching);
		}
	};
}

// (18:4) 
function create_header_slot$3(ctx) {
	let titlebar;
	let current;

	titlebar = new Titlebar({
			props: {
				slot: "header",
				$$slots: {
					title: [create_title_slot$3],
					action: [create_action_slot$2]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(titlebar.$$.fragment);
		},
		m(target, anchor) {
			mount_component(titlebar, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const titlebar_changes = {};

			if (dirty & /*$$scope, close*/ 9) {
				titlebar_changes.$$scope = { dirty, ctx };
			}

			titlebar.$set(titlebar_changes);
		},
		i(local) {
			if (current) return;
			transition_in(titlebar.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(titlebar.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(titlebar, detaching);
		}
	};
}

function create_fragment$3(ctx) {
	let dialog;
	let current;

	dialog = new Dialog({
			props: {
				$$slots: {
					header: [create_header_slot$3],
					default: [create_default_slot_2$2]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(dialog.$$.fragment);
		},
		m(target, anchor) {
			mount_component(dialog, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const dialog_changes = {};

			if (dirty & /*$$scope, close, message*/ 11) {
				dialog_changes.$$scope = { dirty, ctx };
			}

			dialog.$set(dialog_changes);
		},
		i(local) {
			if (current) return;
			transition_in(dialog.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(dialog.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(dialog, detaching);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let { close } = $$props;
	let { message } = $$props;
	const cancel = () => close(null);

	$$self.$$set = $$props => {
		if ('close' in $$props) $$invalidate(0, close = $$props.close);
		if ('message' in $$props) $$invalidate(1, message = $$props.message);
	};

	return [close, message, cancel];
}

class Test_dialog extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$3, create_fragment$3, safe_not_equal, { close: 0, message: 1, cancel: 2 });
	}

	get cancel() {
		return this.$$.ctx[2];
	}
}

/* test\src\comp\test-screen.svelte generated by Svelte v3.58.0 */

function create_default_slot_4$1(ctx) {
	let t;

	return {
		c() {
			t = text("Wat");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (15:4) <Paper square>
function create_default_slot_3$1(ctx) {
	let text_1;
	let current;

	text_1 = new Text({
			props: {
				$$slots: { default: [create_default_slot_4$1] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(text_1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(text_1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text_1_changes = {};

			if (dirty & /*$$scope*/ 2) {
				text_1_changes.$$scope = { dirty, ctx };
			}

			text_1.$set(text_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text_1, detaching);
		}
	};
}

// (17:12) <Text slot="title" title>
function create_default_slot_2$1(ctx) {
	let t;

	return {
		c() {
			t = text("Blep");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (17:12) 
function create_title_slot$2(ctx) {
	let text_1;
	let current;

	text_1 = new Text({
			props: {
				slot: "title",
				title: true,
				$$slots: { default: [create_default_slot_2$1] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(text_1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(text_1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text_1_changes = {};

			if (dirty & /*$$scope*/ 2) {
				text_1_changes.$$scope = { dirty, ctx };
			}

			text_1.$set(text_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text_1, detaching);
		}
	};
}

// (19:12) <Button slot="action" on:click={close} color={false} compact>
function create_default_slot_1$2(ctx) {
	let icon;
	let current;
	icon = new Icon({ props: { name: "x" } });

	return {
		c() {
			create_component(icon.$$.fragment);
		},
		m(target, anchor) {
			mount_component(icon, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(icon, detaching);
		}
	};
}

// (19:12) 
function create_action_slot$1(ctx) {
	let button;
	let current;

	button = new Button({
			props: {
				slot: "action",
				color: false,
				compact: true,
				$$slots: { default: [create_default_slot_1$2] },
				$$scope: { ctx }
			}
		});

	button.$on("click", function () {
		if (is_function(/*close*/ ctx[0])) /*close*/ ctx[0].apply(this, arguments);
	});

	return {
		c() {
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const button_changes = {};

			if (dirty & /*$$scope*/ 2) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
		}
	};
}

// (16:8) 
function create_header_slot$2(ctx) {
	let titlebar;
	let current;

	titlebar = new Titlebar({
			props: {
				slot: "header",
				fill: true,
				color: "primary",
				$$slots: {
					action: [create_action_slot$1],
					title: [create_title_slot$2]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(titlebar.$$.fragment);
		},
		m(target, anchor) {
			mount_component(titlebar, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const titlebar_changes = {};

			if (dirty & /*$$scope, close*/ 3) {
				titlebar_changes.$$scope = { dirty, ctx };
			}

			titlebar.$set(titlebar_changes);
		},
		i(local) {
			if (current) return;
			transition_in(titlebar.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(titlebar.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(titlebar, detaching);
		}
	};
}

// (14:0) <Screen>
function create_default_slot$2(ctx) {
	let paper;
	let current;

	paper = new Paper({
			props: {
				square: true,
				$$slots: {
					header: [create_header_slot$2],
					default: [create_default_slot_3$1]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(paper.$$.fragment);
		},
		m(target, anchor) {
			mount_component(paper, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const paper_changes = {};

			if (dirty & /*$$scope, close*/ 3) {
				paper_changes.$$scope = { dirty, ctx };
			}

			paper.$set(paper_changes);
		},
		i(local) {
			if (current) return;
			transition_in(paper.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(paper.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(paper, detaching);
		}
	};
}

function create_fragment$2(ctx) {
	let screen;
	let current;

	screen = new Screen({
			props: {
				$$slots: { default: [create_default_slot$2] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(screen.$$.fragment);
		},
		m(target, anchor) {
			mount_component(screen, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const screen_changes = {};

			if (dirty & /*$$scope, close*/ 3) {
				screen_changes.$$scope = { dirty, ctx };
			}

			screen.$set(screen_changes);
		},
		i(local) {
			if (current) return;
			transition_in(screen.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(screen.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(screen, detaching);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { close } = $$props;

	$$self.$$set = $$props => {
		if ('close' in $$props) $$invalidate(0, close = $$props.close);
	};

	return [close];
}

class Test_screen extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { close: 0 });
	}
}

/* test\src\comp\menu.svelte generated by Svelte v3.58.0 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[1] = list[i];
	child_ctx[3] = i;
	return child_ctx;
}

// (19:8) <Text slot="title" title>
function create_default_slot_1$1(ctx) {
	let t;

	return {
		c() {
			t = text("Menu?");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (19:8) 
function create_title_slot$1(ctx) {
	let text_1;
	let current;

	text_1 = new Text({
			props: {
				slot: "title",
				title: true,
				$$slots: { default: [create_default_slot_1$1] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(text_1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(text_1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text_1_changes = {};

			if (dirty & /*$$scope*/ 16) {
				text_1_changes.$$scope = { dirty, ctx };
			}

			text_1.$set(text_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text_1, detaching);
		}
	};
}

// (20:8) <Button slot="action" on:click={close}>
function create_default_slot$1(ctx) {
	let t;

	return {
		c() {
			t = text("X");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (20:8) 
function create_action_slot(ctx) {
	let button;
	let current;

	button = new Button({
			props: {
				slot: "action",
				$$slots: { default: [create_default_slot$1] },
				$$scope: { ctx }
			}
		});

	button.$on("click", function () {
		if (is_function(/*close*/ ctx[0])) /*close*/ ctx[0].apply(this, arguments);
	});

	return {
		c() {
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const button_changes = {};

			if (dirty & /*$$scope*/ 16) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
		}
	};
}

// (18:4) 
function create_header_slot$1(ctx) {
	let titlebar;
	let current;

	titlebar = new Titlebar({
			props: {
				slot: "header",
				$$slots: {
					action: [create_action_slot],
					title: [create_title_slot$1]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(titlebar.$$.fragment);
		},
		m(target, anchor) {
			mount_component(titlebar, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const titlebar_changes = {};

			if (dirty & /*$$scope, close*/ 17) {
				titlebar_changes.$$scope = { dirty, ctx };
			}

			titlebar.$set(titlebar_changes);
		},
		i(local) {
			if (current) return;
			transition_in(titlebar.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(titlebar.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(titlebar, detaching);
		}
	};
}

// (26:8) {#each Array.from({ length: 100 }) as _, i}
function create_each_block(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*i*/ ctx[3]);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (25:4) 
function create_content_slot$1(ctx) {
	let div;
	let each_value = Array.from({ length: 100 });
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "slot", "content");
			attr(div, "ws-x", "over[auto]");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div, null);
				}
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
		}
	};
}

function create_fragment$1(ctx) {
	let drawer;
	let current;

	drawer = new Drawer({
			props: {
				type: "menu",
				height: "250px",
				$$slots: {
					content: [create_content_slot$1],
					header: [create_header_slot$1]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(drawer.$$.fragment);
		},
		m(target, anchor) {
			mount_component(drawer, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const drawer_changes = {};

			if (dirty & /*$$scope, close*/ 17) {
				drawer_changes.$$scope = { dirty, ctx };
			}

			drawer.$set(drawer_changes);
		},
		i(local) {
			if (current) return;
			transition_in(drawer.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(drawer.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(drawer, detaching);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { close } = $$props;

	$$self.$$set = $$props => {
		if ('close' in $$props) $$invalidate(0, close = $$props.close);
	};

	return [close];
}

class Menu extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { close: 0 });
	}
}

/* test\src\app.svelte generated by Svelte v3.58.0 */

function create_default_slot_14(ctx) {
	let t;

	return {
		c() {
			t = text("Blep");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (149:8) <Link color="primary" href="#">
function create_default_slot_13(ctx) {
	let t;

	return {
		c() {
			t = text("Test");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (153:8) <EntryButton component={TestScreen} on:entry={console.log}>
function create_default_slot_12(ctx) {
	let t;

	return {
		c() {
			t = text("Test Dialog");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (157:8) <EntryButton component={Menu} on:entry={console.log}>
function create_default_slot_11(ctx) {
	let t;

	return {
		c() {
			t = text("Test Menu");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (161:8) <EntryButton component={TestDialog} on:entry={console.log} props={testDialog}>
function create_default_slot_10(ctx) {
	let t;

	return {
		c() {
			t = text("Test Dialog");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (165:8) <EntryButton component={Alert} props={{ message: "Hi", color: "primary" }} color="secondary">
function create_default_slot_9(ctx) {
	let t;

	return {
		c() {
			t = text("Alert");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (168:8) <EntryButton          component={Confirm}          props={{ message: "Hi", color: "accent" }}          color="warning"          on:entry={e => console.log(e.detail)}          >
function create_default_slot_8(ctx) {
	let t;

	return {
		c() {
			t = text("Confirm");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (178:12) <Button on:click={show}>
function create_default_slot_7(ctx) {
	let t;

	return {
		c() {
			t = text("Pls");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (177:8) <Popover let:show let:hide>
function create_default_slot_6(ctx) {
	let button;
	let current;

	button = new Button({
			props: {
				$$slots: { default: [create_default_slot_7] },
				$$scope: { ctx }
			}
		});

	button.$on("click", function () {
		if (is_function(/*show*/ ctx[16])) /*show*/ ctx[16].apply(this, arguments);
	});

	return {
		c() {
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const button_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
		}
	};
}

// (182:16) <Button on:click={hide}>
function create_default_slot_5(ctx) {
	let t;

	return {
		c() {
			t = text("Close");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (181:12) 
function create_content_slot(ctx) {
	let div;
	let button;
	let current;

	button = new Button({
			props: {
				$$slots: { default: [create_default_slot_5] },
				$$scope: { ctx }
			}
		});

	button.$on("click", function () {
		if (is_function(/*hide*/ ctx[17])) /*hide*/ ctx[17].apply(this, arguments);
	});

	return {
		c() {
			div = element("div");
			create_component(button.$$.fragment);
			attr(div, "ws-x", "inset-x[0px] y[0px] h[100px] bg[teal]");
			attr(div, "slot", "content");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(button, div, null);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const button_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(button);
		}
	};
}

// (137:4) <Paper square card lprops={{cross: "stretch"}}>
function create_default_slot_4(ctx) {
	let button;
	let t0;
	let link;
	let t1;
	let entrybutton0;
	let t2;
	let entrybutton1;
	let t3;
	let entrybutton2;
	let t4;
	let entrybutton3;
	let t5;
	let entrybutton4;
	let t6;
	let popover;
	let t7;
	let circlespinner;
	let t8;
	let hexagonspinner;
	let current;

	button = new Button({
			props: {
				variant: "outline",
				color: "accent",
				$$slots: { default: [create_default_slot_14] },
				$$scope: { ctx }
			}
		});

	link = new Link({
			props: {
				color: "primary",
				href: "#",
				$$slots: { default: [create_default_slot_13] },
				$$scope: { ctx }
			}
		});

	entrybutton0 = new Entry_button({
			props: {
				component: Test_screen,
				$$slots: { default: [create_default_slot_12] },
				$$scope: { ctx }
			}
		});

	entrybutton0.$on("entry", console.log);

	entrybutton1 = new Entry_button({
			props: {
				component: Menu,
				$$slots: { default: [create_default_slot_11] },
				$$scope: { ctx }
			}
		});

	entrybutton1.$on("entry", console.log);

	entrybutton2 = new Entry_button({
			props: {
				component: Test_dialog,
				props: /*testDialog*/ ctx[0],
				$$slots: { default: [create_default_slot_10] },
				$$scope: { ctx }
			}
		});

	entrybutton2.$on("entry", console.log);

	entrybutton3 = new Entry_button({
			props: {
				component: Alert,
				props: { message: "Hi", color: "primary" },
				color: "secondary",
				$$slots: { default: [create_default_slot_9] },
				$$scope: { ctx }
			}
		});

	entrybutton4 = new Entry_button({
			props: {
				component: Confirm,
				props: { message: "Hi", color: "accent" },
				color: "warning",
				$$slots: { default: [create_default_slot_8] },
				$$scope: { ctx }
			}
		});

	entrybutton4.$on("entry", /*entry_handler*/ ctx[1]);

	popover = new Popover({
			props: {
				$$slots: {
					content: [
						create_content_slot,
						({ show, hide }) => ({ 16: show, 17: hide }),
						({ show, hide }) => (show ? 65536 : 0) | (hide ? 131072 : 0)
					],
					default: [
						create_default_slot_6,
						({ show, hide }) => ({ 16: show, 17: hide }),
						({ show, hide }) => (show ? 65536 : 0) | (hide ? 131072 : 0)
					]
				},
				$$scope: { ctx }
			}
		});

	circlespinner = new Circle_spinner({});
	hexagonspinner = new Hexagon_spinner({});

	return {
		c() {
			create_component(button.$$.fragment);
			t0 = space();
			create_component(link.$$.fragment);
			t1 = space();
			create_component(entrybutton0.$$.fragment);
			t2 = space();
			create_component(entrybutton1.$$.fragment);
			t3 = space();
			create_component(entrybutton2.$$.fragment);
			t4 = space();
			create_component(entrybutton3.$$.fragment);
			t5 = space();
			create_component(entrybutton4.$$.fragment);
			t6 = space();
			create_component(popover.$$.fragment);
			t7 = space();
			create_component(circlespinner.$$.fragment);
			t8 = space();
			create_component(hexagonspinner.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			insert(target, t0, anchor);
			mount_component(link, target, anchor);
			insert(target, t1, anchor);
			mount_component(entrybutton0, target, anchor);
			insert(target, t2, anchor);
			mount_component(entrybutton1, target, anchor);
			insert(target, t3, anchor);
			mount_component(entrybutton2, target, anchor);
			insert(target, t4, anchor);
			mount_component(entrybutton3, target, anchor);
			insert(target, t5, anchor);
			mount_component(entrybutton4, target, anchor);
			insert(target, t6, anchor);
			mount_component(popover, target, anchor);
			insert(target, t7, anchor);
			mount_component(circlespinner, target, anchor);
			insert(target, t8, anchor);
			mount_component(hexagonspinner, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const button_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
			const link_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				link_changes.$$scope = { dirty, ctx };
			}

			link.$set(link_changes);
			const entrybutton0_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				entrybutton0_changes.$$scope = { dirty, ctx };
			}

			entrybutton0.$set(entrybutton0_changes);
			const entrybutton1_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				entrybutton1_changes.$$scope = { dirty, ctx };
			}

			entrybutton1.$set(entrybutton1_changes);
			const entrybutton2_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				entrybutton2_changes.$$scope = { dirty, ctx };
			}

			entrybutton2.$set(entrybutton2_changes);
			const entrybutton3_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				entrybutton3_changes.$$scope = { dirty, ctx };
			}

			entrybutton3.$set(entrybutton3_changes);
			const entrybutton4_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				entrybutton4_changes.$$scope = { dirty, ctx };
			}

			entrybutton4.$set(entrybutton4_changes);
			const popover_changes = {};

			if (dirty & /*$$scope, hide, show*/ 458752) {
				popover_changes.$$scope = { dirty, ctx };
			}

			popover.$set(popover_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			transition_in(link.$$.fragment, local);
			transition_in(entrybutton0.$$.fragment, local);
			transition_in(entrybutton1.$$.fragment, local);
			transition_in(entrybutton2.$$.fragment, local);
			transition_in(entrybutton3.$$.fragment, local);
			transition_in(entrybutton4.$$.fragment, local);
			transition_in(popover.$$.fragment, local);
			transition_in(circlespinner.$$.fragment, local);
			transition_in(hexagonspinner.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			transition_out(link.$$.fragment, local);
			transition_out(entrybutton0.$$.fragment, local);
			transition_out(entrybutton1.$$.fragment, local);
			transition_out(entrybutton2.$$.fragment, local);
			transition_out(entrybutton3.$$.fragment, local);
			transition_out(entrybutton4.$$.fragment, local);
			transition_out(popover.$$.fragment, local);
			transition_out(circlespinner.$$.fragment, local);
			transition_out(hexagonspinner.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
			if (detaching) detach(t0);
			destroy_component(link, detaching);
			if (detaching) detach(t1);
			destroy_component(entrybutton0, detaching);
			if (detaching) detach(t2);
			destroy_component(entrybutton1, detaching);
			if (detaching) detach(t3);
			destroy_component(entrybutton2, detaching);
			if (detaching) detach(t4);
			destroy_component(entrybutton3, detaching);
			if (detaching) detach(t5);
			destroy_component(entrybutton4, detaching);
			if (detaching) detach(t6);
			destroy_component(popover, detaching);
			if (detaching) detach(t7);
			destroy_component(circlespinner, detaching);
			if (detaching) detach(t8);
			destroy_component(hexagonspinner, detaching);
		}
	};
}

// (140:16) <Text title>
function create_default_slot_3(ctx) {
	let t;

	return {
		c() {
			t = text("Zephyr");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (141:16) <Text subtitle>
function create_default_slot_2(ctx) {
	let t;

	return {
		c() {
			t = text("Oh god please work for me and look good");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (139:12) <Flex slot="title">
function create_default_slot_1(ctx) {
	let text0;
	let t;
	let text1;
	let current;

	text0 = new Text({
			props: {
				title: true,
				$$slots: { default: [create_default_slot_3] },
				$$scope: { ctx }
			}
		});

	text1 = new Text({
			props: {
				subtitle: true,
				$$slots: { default: [create_default_slot_2] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(text0.$$.fragment);
			t = space();
			create_component(text1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(text0, target, anchor);
			insert(target, t, anchor);
			mount_component(text1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text0_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				text0_changes.$$scope = { dirty, ctx };
			}

			text0.$set(text0_changes);
			const text1_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				text1_changes.$$scope = { dirty, ctx };
			}

			text1.$set(text1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text0.$$.fragment, local);
			transition_in(text1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text0.$$.fragment, local);
			transition_out(text1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text0, detaching);
			if (detaching) detach(t);
			destroy_component(text1, detaching);
		}
	};
}

// (139:12) 
function create_title_slot(ctx) {
	let flex;
	let current;

	flex = new Flex({
			props: {
				slot: "title",
				$$slots: { default: [create_default_slot_1] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(flex.$$.fragment);
		},
		m(target, anchor) {
			mount_component(flex, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const flex_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				flex_changes.$$scope = { dirty, ctx };
			}

			flex.$set(flex_changes);
		},
		i(local) {
			if (current) return;
			transition_in(flex.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(flex.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(flex, detaching);
		}
	};
}

// (138:8) 
function create_header_slot(ctx) {
	let titlebar;
	let current;

	titlebar = new Titlebar({
			props: {
				slot: "header",
				fill: true,
				color: "primary",
				$$slots: { title: [create_title_slot] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(titlebar.$$.fragment);
		},
		m(target, anchor) {
			mount_component(titlebar, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const titlebar_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				titlebar_changes.$$scope = { dirty, ctx };
			}

			titlebar.$set(titlebar_changes);
		},
		i(local) {
			if (current) return;
			transition_in(titlebar.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(titlebar.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(titlebar, detaching);
		}
	};
}

// (136:0) <Screen>
function create_default_slot(ctx) {
	let paper;
	let current;

	paper = new Paper({
			props: {
				square: true,
				card: true,
				lprops: { cross: "stretch" },
				$$slots: {
					header: [create_header_slot],
					default: [create_default_slot_4]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(paper.$$.fragment);
		},
		m(target, anchor) {
			mount_component(paper, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const paper_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				paper_changes.$$scope = { dirty, ctx };
			}

			paper.$set(paper_changes);
		},
		i(local) {
			if (current) return;
			transition_in(paper.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(paper.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(paper, detaching);
		}
	};
}

function create_fragment(ctx) {
	let t0;
	let t1;
	let screen;
	let current;
	let mounted;
	let dispose;

	screen = new Screen({
			props: {
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			t0 = space();
			t1 = space();
			create_component(screen.$$.fragment);
			document.title = "Zephyr";
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
			mount_component(screen, target, anchor);
			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx$1.call(null, document.body, { theme, "@app": true }));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			const screen_changes = {};

			if (dirty & /*$$scope*/ 262144) {
				screen_changes.$$scope = { dirty, ctx };
			}

			screen.$set(screen_changes);
		},
		i(local) {
			if (current) return;
			transition_in(screen.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(screen.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(t1);
			destroy_component(screen, detaching);
			mounted = false;
			dispose();
		}
	};
}

let theme = "tron";
let page = 0;

function instance($$self) {
	let bind = {};

	const options = [
		{ label: "1st", value: { a: 1 } },
		{
			label: "2nd",
			value: { a: 2 },
			$color: "primary"
		},
		{ label: "3rd", value: { a: 3 } }
	];

	let radio = options[0].value;

	// $: console.log(select)
	let tab = radio;

	[
		Array.from({ length: 4 }, (_, i) => `Cell ${i}`),
		Array.from({ length: 4 }, (_, i) => `Row 2,${i}`),
		Array.from({ length: 4 }, (_, i) => `Sq ${i ** 2}`),
		Array.from({ length: 4 }, (_, i) => `Sub ${i - 2}`),
		Array.from({ length: 4 }, (_, i) => `Cell ${i}`),
		Array.from({ length: 4 }, (_, i) => `Row 2,${i}`),
		Array.from({ length: 4 }, (_, i) => `Sq ${i ** 2}`),
		Array.from({ length: 4 }, (_, i) => `Sub ${i - 2}`)
	];
	const testDialog = () => ({ message: Math.random().toString(16) });
	const entry_handler = e => console.log(e.detail);
	console.log(bind);
	console.log(tab);
	console.log("page:", page);
	return [testDialog, entry_handler];
}

class App extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

window.app = new App({ target: document.body });
