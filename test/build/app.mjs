function noop() { }
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
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
    if (!src_url_equal_anchor) {
        src_url_equal_anchor = document.createElement('a');
    }
    src_url_equal_anchor.href = url;
    return element_src === src_url_equal_anchor.href;
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
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}
function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
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
function construct_svelte_component(component, props) {
    return new component(props);
}

let current_component;
function set_current_component(component) {
    current_component = component;
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

const e=/(?<key>(?<mod>\w+:)?(?<name>[\$\@\w\-]+)(\[(?<args>.*?)\])?)/g,t={"(":1,")":-1},r=e=>{const r=e.trim().replace(/__|_/g,(e=>"__"===e?"_":" "));if(""===r)return [];const o=r.split("").reduce(((e,o,l)=>","===o&&0===e.p?(e.args.push(r.substring(e.s,l).trim()),e.s=l,e):(e.p+=t[o]??0,e)),{args:[],p:0,s:0});return [...o.args,r.slice(o.s).trim()]},o=(e,t)=>void 0===t?"":`${e}: ${(e=>!0===e.startsWith("&")?`var(--${e.slice(1)})`:e)(t)}`,l=e=>t=>[o(e,t)],a=(...e)=>t=>e.map((e=>o(e,t)));var i=Object.freeze({__proto__:null,cssprop:o,multi:a,simple:l,wsx:e=>Object.entries(e).reduce(((e,[t,r])=>{if(null==r||!1===r)return e;const o=!0===r?t:`${t}[${(e=>e.replace(/( )|(_)/g,((e,t)=>t?"_":"__")))(r)}]`;return e.push(o),e}),[]).join(" ")});const n={area:l("grid-area"),bd:l("border"),"bd-c":l("border-color"),"bd-s":l("border-style"),"bd-w":l("border-width"),bg:l("background"),"bg-a":l("background-attachment"),"bg-c":l("background-color"),"bg-img":l("background-image"),block:()=>o("display","block"),c:l("color"),col:l("grid-column"),cur:l("cursor"),flex:(e="column")=>[o("display","flex"),o("flex-direction",e)],"fl-center":()=>[o("align-items","center"),o("justify-content","center")],"fl-cr-a":l("align-items"),"fl-dir":l("flex-direction"),"fl-wr":l("flex-wrap"),"fl-m-a":l("justify-content"),font:l("font-family"),gap:l("gap"),grid:(e="row")=>[o("display","grid"),o("grid-auto-flow",e)],"gr-col":l("grid-template-columns"),"gr-row":l("grid-template-rows"),"gr-acol":l("grid-auto-columns"),"gr-arow":l("grid-auto-rows"),"gr-flow":l("grid-auto-flow"),h:l("height"),"h-max":l("max-height"),"h-min":l("min-height"),hide:()=>[o("display","none")],iblock:()=>[o("display","inline-block")],iflex:(e="column")=>[o("display","inline-flex"),o("flex-direction",e)],igrid:(e="row")=>[o("display","inline-grid"),o("grid-auto-flow",e)],inset:a("top","left","bottom","right"),"inset-x":a("left","right"),"inset-y":a("top","bottom"),m:l("margin"),"m-b":l("margin-bottom"),"m-l":l("margin-left"),"m-r":l("margin-right"),"m-t":l("margin-top"),over:l("overflow"),"over-x":l("overflow-x"),"over-y":l("overflow-y"),p:l("padding"),"p-b":l("padding-bottom"),"p-l":l("padding-left"),"p-r":l("padding-right"),"p-t":l("padding-top"),"p-x":a("padding-left","padding-right"),"p-y":a("padding-top","padding-bottom"),pos:l("position"),r:l("border-radius"),"r-tl":l("border-top-left-radius"),"r-tr":l("border-top-right-radius"),"r-bl":l("border-bottom-left-radius"),"r-br":l("border-bottom-right-radius"),"r-t":a("border-top-left-radius","border-top-right-radius"),"r-r":a("border-top-right-radius","border-bottom-right-radius"),"r-l":a("border-bottom-left-radius","border-top-left-radius"),"r-b":a("border-bottom-right-radius","border-bottom-left-radius"),row:l("grid-row"),shdw:l("box-shadow"),"t-a":l("text-align"),"t-br":l("word-break"),"t-c":l("color"),"t-deco":l("text-decoration"),"t-lh":l("line-height"),"t-over":l("text-overflow"),"t-sz":l("font-size"),"t-tr":l("text-transform"),"t-wght":l("font-weight"),"t-ws":l("white-space"),theme:()=>[o("background","var(--background)"),o("color","var(--text-color-normal)"),o("font-family","var(--font)"),o("font-size","var(--text-size-normal)")],tr:l("transform"),w:l("width"),"w-max":l("max-width"),"w-min":l("min-width"),x:l("left"),y:l("top"),"-x":l("right"),"-y":l("bottom"),z:l("z-index"),$color:e=>[o("--color",`&${e}`),o("--ripple-color",`&${e}-ripple`)],$adorn:e=>[o("grid-area",e),o("display","flex"),o("justify-content","center"),o("align-items","center"),o("padding","2px")],$compact:()=>[o("padding","0px 8px")],"@flat":()=>[o("border-width","0px"),o("--border-size","0px")],"@outline":()=>[o("border-width","1px"),o("border-color","&color")],"@fill":()=>[o("--ripple-color","var(--ripple-dark) !important"),o("--text-color","&text-color-fill"),o("background-color","&color"),o("color","&text-color-fill")],"@left":e=>[o("--screen-width",e)],"@center":e=>[o("--screen-width",e)],"@stack":e=>[o("--stack",e)]};var s=[{name:"baseline",style:'@import url(https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Roboto:ital,wght@0,400;0,500;0,700;0,900;1,400;1,500;1,700;1,900&display=swap);@import url(https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.13.0/tabler-icons.min.css);*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}:where([ws-x]){border-style:solid;border-width:0;border-color:var(--text-color-normal)}body,html{padding:0;margin:0;width:100%;height:100%;-webkit-tap-highlight-color:transparent}body[ws-x~="@app"]{overflow:hidden;position:fixed;touch-action:pan-x pan-y}'},{name:"avatar",style:"ws-avatar{--color:transparent;--size:36px;display:inline-flex;overflow:hidden;border-radius:500px;align-items:center;justify-content:center;width:var(--size);height:var(--size);background-color:var(--color);color:var(--text-color-fill);vertical-align:text-bottom}ws-avatar>img{width:100%}"},{name:"badge",style:"ws-badge{--color:var(--primary);position:relative;display:inline-grid;overflow:visible}ws-badge::after{position:absolute;content:attr(ws-text);right:-10px;top:0;transform:translateY(-50%);background-color:var(--color);pointer-events:none;border-radius:20px;padding:4px;min-width:20px;height:20px;box-sizing:border-box;text-align:center;font-size:var(--text-size-subtitle);color:var(--text-color-fill);line-height:14px;z-index:5}"},{name:"button",style:'button:where([ws-x~="@flat"],[ws-x~="@fill"],[ws-x~="@outline"]),label:where([ws-x~="@button"]){--color:var(--text-color-normal);--ripple-color:var(--ripple-normal);border:0 solid var(--color);color:var(--color);font-family:var(--font);background-color:transparent;border-radius:4px;cursor:pointer;padding:8px 16px;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;position:relative;user-select:none}button:where([ws-x~="@flat"],[ws-x~="@fill"],[ws-x~="@outline"]):where(:not([disabled]))::after,label:where([ws-x~="@button"]):where(:not([disabled]))::after{content:"";position:absolute;top:0;left:0;bottom:0;right:0;transition:background-color 150ms linear;pointer-events:none}button:where([ws-x~="@flat"],[ws-x~="@fill"],[ws-x~="@outline"]):where(:not([disabled])):active::after,label:where([ws-x~="@button"]):where(:not([disabled])):active::after{transition:none;background-color:var(--ripple-color)}button:where([ws-x~="@flat"],[ws-x~="@fill"],[ws-x~="@outline"]):where([disabled]),label:where([ws-x~="@button"]):where([disabled]){opacity:.6;background-color:rgba(200,200,200,.4)}'},{name:"chip",style:'ws-chip{display:inline-flex;align-items:center;justify-content:center;border-radius:100px;padding:4px 12px;user-select:none;vertical-align:text-bottom}ws-chip:where([ws-x~="$click"]){cursor:pointer;overflow:hidden;position:relative;user-select:none}ws-chip:where([ws-x~="$click"]):where(:not([disabled]))::after{content:"";position:absolute;top:0;left:0;bottom:0;right:0;transition:background-color 150ms linear;pointer-events:none}ws-chip:where([ws-x~="$click"]):where(:not([disabled])):active::after{transition:none;background-color:var(--ripple-color)}'},{name:"control",style:'label[ws-x~="@control"]{--color:var(--default);--ripple-color:var(--default-ripple);position:relative;display:inline-grid;grid-template-areas:"label label label"" start control end""extra extra extra";grid-template-rows:minmax(0,min-content) auto minmax(0,min-content);grid-template-columns:minmax(0,min-content) auto minmax(0,min-content);border:1px solid var(--color);border-radius:4px;user-select:none;overflow:hidden}label[ws-x~="@control"]:focus-within{outline:2px solid var(--primary)}label[ws-x~="@control"]>select{--color:var(--text-color-normal);border:0 solid var(--color);padding:8px;height:36px;background-color:transparent;color:var(--color);font:var(--font);font-size:var(--text-size-normal);cursor:pointer;background-color:var(--background-layer);grid-area:control}label[ws-x~="@control"]>input:focus,label[ws-x~="@control"]>select:focus,label[ws-x~="@control"]>textarea:focus{outline:0}label[ws-x~="@control"]>select>option{background-color:var(--background-layer);border-color:var(--background-layer);color:var(--text-color-normal);font-size:var(--text-size-normal);font-family:Arial}label[ws-x~="@control"]>input,label[ws-x~="@control"]>textarea{border-width:0;background:0 0;color:var(--text-normal-color);font-family:var(--font);min-width:24px;min-height:36px;width:100%;height:100%;grid-area:control;padding:4px;background-color:var(--background-layer)}label[ws-x~="@control"]>input[type=file]{position:relative;padding:0}label[ws-x~="@control"]>input[type=file]::file-selector-button{font-family:var(--font);height:100%;margin:0 4px 0 0;padding:4px;color:var(--text-normal-color);background-color:var(--background-layer);border-width:0;border-right:1px solid var(--color);text-decoration:underline}label[ws-x~="@control"]>[ws-x~="$text"]{grid-area:label;padding:4px;display:flex;align-items:center;border-bottom:var(--border-size, 1px) solid var(--color);color:var(--color)}label[ws-x~="@control"]>:where([ws-x~="slot[start]"],[slot=start]){grid-area:start}label[ws-x~="@control"]>:where([ws-x~="slot[end]"],[slot=end]){grid-area:end}'},{name:"flex",style:"ws-flex{display:flex;flex-direction:column;gap:4px;padding:4px;overflow:hidden}ws-flex>*{flex-shrink:0}"},{name:"grid",style:"ws-grid{display:grid;overflow:hidden;gap:4px;padding:4px;grid-auto-rows:min-content}"},{name:"icon",style:"ws-icon{display:inline-block}ws-icon:where(:not(:empty))::before{margin-right:2px}ws-icon::before{font-size:18px;font-family:tabler-icons!important;speak:none;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;line-height:1;display:contents;-webkit-font-smoothing:antialiased}"},{name:"modal",style:'ws-modal{position:fixed;top:0;left:0;bottom:0;right:0;background-color:rgba(0,0,0,.35);z-index:500;display:none}ws-modal>label:first-child{position:absolute;width:100%;height:100%;cursor:pointer}ws-modal[ws-x~="$show"]{display:block}input[type=checkbox]:not(:checked)+ws-modal{display:none}input[type=checkbox]:checked+ws-modal{display:block}ws-modal>:where(:not(label:first-child)){position:absolute;min-width:15vw}ws-modal>:where(:not(label:first-child)):where([ws-x~="@menu"]){top:0;left:0;height:100%}ws-modal>:where(:not(label:first-child)):where([ws-x~="@action"]){top:0;right:0;height:100%}ws-modal>:where(:not(label:first-child)):where([ws-x~="@select"]){top:0;left:50%;transform:translateX(-50%);max-height:75vh;max-width:min(90vw,720px)}ws-modal>:where(:not(label:first-child)):where([ws-x~="@dialog"]){top:50%;left:50%;transform:translate(-50%,-50%)}'},{name:"notification",style:'ws-notification{--background-color:var(--background-layer);--color:var(--text-color-normal);background-color:var(--background-color);color:var(--color);padding:8px;display:inline-flex;flex-direction:row;justify-content:space-between;align-items:center;border-radius:4px;cursor:pointer;user-select:none;border:1px solid var(--text-color-secondary)}ws-notification[ws-x*="$color"]{background-color:var(--color);color:var(--text-color-fill)}ws-notification[ws-x~="$info"]::before{content:"hi"}'},{name:"paper",style:'ws-paper{--color:var(--layer-border-color);display:grid;border-radius:4px;box-shadow:0 2px 4px var(--shadow-color);overflow:hidden;grid-template-columns:1fr;grid-template-rows:min-content auto min-content;grid-template-areas:"header""content""footer";background-color:var(--background-layer)}ws-paper::before{content:"";grid-area:header}ws-paper::after{content:"";grid-area:footer}ws-paper>:where([ws-x~="slot[content]"],[slot=content]){grid-area:content}ws-paper>:where([ws-x~="slot[header]"],[slot=header]){grid-area:header;font-size:var(--text-size-header)}ws-paper>:where([ws-x~="slot[footer]"],[slot=footer]){grid-area:footer}'},{name:"popover",style:'ws-popover{display:grid;position:relative}ws-popover:not(:visibile)>:where([ws-x~="slot[content]"],[slot=content]){display:none}ws-popover>:where([ws-x~="slot[content]"],[slot=content]){position:absolute;z-index:250;display:none}ws-popover[ws-x~="$show"]>:where([ws-x~="slot[content]"],[slot=content]){display:block}ws-popover>input:where([type=checkbox]):checked+:where([ws-x~="slot[content]"],[slot=content]){display:block}ws-popover>input:where([type=checkbox]):not(:checked)+:where([ws-x~="slot[content]"],[slot=content]){display:none}'},{name:"progress",style:'label[ws-x~="@progress"]{--color:var(--text-color-normal);--border-size:0px;display:inline-grid;grid-template-columns:1fr;grid-template-rows:min-content auto;border-radius:4px;overflow:hidden;user-select:none}label[ws-x~="@progress"][ws-x~="$row"]{grid-template-columns:min-content auto;grid-template-rows:1fr}label[ws-x~="@progress"]>[ws-x~="$text"]{padding:4px;display:flex;border-bottom:var(--border-size, 1px) solid var(--color);color:var(--color)}label[ws-x~="@progress"]>progress{min-height:20px;height:100%;width:100%;border:0;background-color:var(--background-layer)}label[ws-x~="@progress"]>progress::-moz-progress-bar{background-color:var(--color);border-radius:0}label[ws-x~="@progress"]>progress::-webkit-progress-bar{background-color:var(--background-layer);border-radius:0}label[ws-x~="@progress"]>progress::-webkit-progress-value{background-color:var(--color);border-radius:0}'},{name:"screen",style:'ws-screen{--stack:0;--screen-width:min(720px, 100%);display:grid;width:calc(100% - var(--sub-pixel-offset));height:calc(100% - 1px);overflow:hidden;position:absolute;background-color:rgba(0,0,0,.5);grid-template-columns:auto calc(var(--screen-width) - 16px*var(--stack)) auto;grid-template-rows:min-content auto min-content;grid-template-areas:". title ."". content ."". footer .";padding-top:calc(8px*var(--stack))}ws-screen[ws-x^="@left"]{grid-template-columns:calc(8px*var(--stack)) calc(var(--screen-width) - 16px*var(--stack)) auto}ws-screen>:where([ws-x~="slot[content]"],[slot=content]){grid-area:content;height:100%;overflow:hidden}ws-screen>:where([ws-x~="slot[title]"],[slot=title]){grid-area:title}ws-screen>:where([ws-x~="slot[footer]"],[slot=footer]){grid-area:footer}'},{name:"table",style:"table:where([ws-x]){--border-color:var(--color);border-spacing:0;position:relative}table:where([ws-x]) thead :is(td,th){background-color:var(--color);color:var(--text-color-fill);font-weight:700}table:where([ws-x]) :is(td,th){padding:8px;white-space:nowrap;background-color:var(--background-layer);border-bottom:1px solid var(--color)}table:where([ws-x]) :where(th:first-child){position:sticky;left:0;z-index:15}table:where([ws-x]) :where(td:first-child,th:first-child){border-left:1px solid var(--color)}table:where([ws-x]) :where(td:last-child,th:last-child){border-right:1px solid var(--color)}"},{name:"tabs",style:'ws-tabs{--color:var(--primary);display:flex;flex-direction:row;justify-content:stretch;align-items:stretch;user-select:none;cursor:pointer;gap:2px;padding:2px}ws-tabs[ws-x~="$vert"]{flex-direction:column;justify-content:flex-start}ws-tabs[ws-x~="$vert"]>ws-tab{border-bottom-width:0;border-right-width:2px;flex-grow:0}ws-tabs[ws-x~="@solid"]>ws-tab:where([tab-selected]){color:var(--text-color-fill);background-color:var(--color)}ws-tabs>ws-tab{display:flex;justify-content:center;align-items:center;flex-grow:1;padding:8px;border-color:var(--text-color-secondary);border-width:0 0 2px;border-style:solid}ws-tabs>ws-tab:where([tab-selected]){color:var(--color);border-color:var(--color)}'},{name:"titlebar",style:'ws-titlebar{--text-color:var(--text-color-normal);display:grid;height:48px;grid-template-columns:min-content auto min-content;grid-template-areas:"menu title action";user-select:none}ws-titlebar:where(:not([ws-x~="@fill"])){border-bottom:1px solid var(--color, var(--text-color-normal))}ws-titlebar>:where([ws-x~="slot[title]"],[slot=title]){grid-area:title;display:flex;flex-direction:column;justify-content:center;padding:4px}ws-titlebar>:where([ws-x~="slot[title]"],[slot=title])>[ws-x~="$title-text"],ws-titlebar>:where([ws-x~="slot[title]"],[slot=title])[ws-x~="$title-text"]{font-size:var(--text-size-title);font-weight:700}ws-titlebar>:where([ws-x~="slot[title]"],[slot=title])>[ws-x~="$subtitle"],ws-titlebar>:where([ws-x~="slot[title]"],[slot=title])[ws-x~="$subtitle"]{font-size:var(--text-size-subtitle)}ws-titlebar>:where([ws-x~="slot[menu]"],[slot=menu]){grid-area:menu;--text-color-normal:var(--text-color)}ws-titlebar>:where([ws-x~="slot[action]"],[slot=action]){grid-area:action;--text-color-normal:var(--text-color)}'},{name:"toaster",style:'ws-toaster{position:fixed;z-index:50;display:inline-flex;flex-direction:column;padding:4px;gap:4px}ws-toaster[ws-x~="$tl"]{top:0;left:0}ws-toaster[ws-x~="$tc"]{top:0;left:50%;transform:translateX(-50%)}ws-toaster[ws-x~="$tr"]{top:0;right:0}ws-toaster[ws-x~="$ml"]{top:50%;left:0;transform:translateY(-50%)}ws-toaster[ws-x~="$mr"]{top:50%;right:0;transform:translateY(-50%)}ws-toaster[ws-x~="$bl"]{bottom:0;left:0}ws-toaster[ws-x~="$bc"]{bottom:0;left:50%;transform:translateX(-50%)}ws-toaster[ws-x~="$br"]{bottom:0;right:0}'},{name:"toggle",style:'label[ws-x~="@toggle"]{--color:var(--default);--ripple-color:var(--default-ripple);cursor:pointer;display:inline-flex;align-items:center;justify-content:space-between;padding:4px;border-radius:4px;overflow:hidden;position:relative;user-select:none}label[ws-x~="@toggle"]:where(:not([disabled]))::after{content:"";position:absolute;top:0;left:0;bottom:0;right:0;transition:background-color 150ms linear;pointer-events:none}label[ws-x~="@toggle"]:where(:not([disabled])):active::after{transition:none;background-color:var(--ripple-color)}label[ws-x~="@toggle"]:focus-within{outline:2px solid var(--primary)}label[ws-x~="@toggle"]>input{position:relative;min-width:20px;min-height:20px;-webkit-appearance:none;appearance:none;margin:0}label[ws-x~="@toggle"]>input:focus{outline:0}label[ws-x~="@toggle"]>input:checked{color:var(--text-color-invert)}label[ws-x~="@toggle"]>input:checked::after{background-color:var(--color)}label[ws-x~="@toggle"]>input::after{content:"";position:absolute;font-size:18px;font-family:tabler-icons!important;speak:none;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;top:50%;left:50%;width:20px;height:20px;transform:translate(-50%,-50%);display:flex;border:1px solid var(--color);border-radius:4px;align-items:center;justify-content:center;overflow:hidden}label[ws-x~="@toggle"]>input[type=radio]::after{border-radius:50%}label[ws-x~="@toggle"]>input[type=radio]:checked::after{content:""}label[ws-x~="@toggle"]>input[type=checkbox]:checked::after{content:""}label[ws-x~="@toggle"]>input[type=checkbox][ws-x~="$switch"]{position:relative;border:1px solid var(--color);height:24px;width:44px;border-radius:12px}label[ws-x~="@toggle"]>input[type=checkbox][ws-x~="$switch"]::after{content:"";background-color:var(--text-color-secondary);position:absolute;width:18px;height:18px;border-radius:10px;top:2px;left:2px;transform:none;border-width:0;transition:left 100ms linear,color 100ms linear}label[ws-x~="@toggle"]>input[type=checkbox][ws-x~="$switch"]:checked::after{background-color:var(--color);left:22px}'},{name:"tooltip",style:'ws-tooltip{position:relative;display:inline-grid;overflow:visible}ws-tooltip::after{position:absolute;content:attr(ws-text);left:50%;bottom:calc(100% + 2px);transform:translateX(-50%);height:20px;background-color:var(--background-layer);opacity:0;transition:opacity 100ms linear;pointer-events:none;border-radius:4px;border:1px solid var(--text-color-secondary);padding:2px 8px;font-size:var(--text-size-subtitle);width:60%;display:flex;align-items:center;justify-content:center;z-index:50}ws-tooltip:hover::after{opacity:1}ws-tooltip[ws-x~="$bottom"]::after{bottom:unset;top:calc(100% + 2px)}'},{name:"dark",style:'[ws-x~="theme[dark]"]{--font:Roboto;--text-light:white;--text-dark:black;--text-color-normal:var(--text-light);--text-color-secondary:#a0a0a0;--text-color-invert:var(--text-dark);--text-color-fill:var(--text-dark);--text-size-normal:14px;--text-size-title:18px;--text-size-header:16px;--text-size-info:13px;--text-size-subtitle:12px;--text-size-data:10px;--background:#161616;--background-layer:#333333;--layer-border-width:1px;--layer-border-color:#505050;--default:var(--text-color-normal);--default-ripple:var(--ripple-normal);--primary:#00aaff;--primary-ripple:#00aaff60;--secondary:#2fbc2f;--secondary-ripple:#2fbc2f60;--danger:#df5348;--danger-ripple:#df534860;--warning:#ffff00;--warning-ripple:#ffff0060;--accent:#ff4dff;--accent-ripple:#ff4dff60;--button-filled-text-color:var(--text-color-normal);--ripple-dark:#00000060;--ripple-light:#FFFFFF60;--ripple-normal:var(--ripple-light);--ripple-invert:var(--ripple-dark);--shadow-color:rgb(0, 0, 0, 0.25)}'},{name:"light",style:'[ws-x~="theme[light]"]{--font:Roboto;--text-light:white;--text-dark:black;--text-color-normal:var(--text-dark);--text-color-secondary:#505050;--text-color-invert:var(--text-light);--text-color-fill:var(--text-dark);--text-size-normal:14px;--text-size-title:18px;--text-size-header:16px;--text-size-info:13px;--text-size-subtitle:12px;--text-size-data:10px;--background:#e9e9e9;--background-layer:#ffffff;--layer-border-width:1px;--layer-border-color:#aaaaaa;--default:var(--text-color-normal);--default-ripple:var(--ripple-normal);--primary:#1d62d5;--primary-ripple:#1d62d560;--secondary:#128f12;--secondary-ripple:#128f1260;--danger:#F44336;--danger-ripple:#F4433660;--warning:#db990d;--warning-ripple:#db990d60;--accent:#cf00cf;--accent-ripple:#cf00cf60;--button-filled-text-color:var(--text-color-invert);--ripple-dark:#00000060;--ripple-light:#FFFFFF60;--ripple-normal:var(--ripple-dark);--ripple-invert:var(--ripple-light);--shadow-color:rgb(0, 0, 0, 0.25)}'},{name:"tron",style:'[ws-x~="theme[tron]"]{--font:Orbitron;--text-light:white;--text-dark:black;--text-color-normal:var(--text-light);--text-color-secondary:#a0a0a0;--text-color-invert:var(--text-dark);--text-color-fill:var(--text-dark);--text-size-normal:14px;--text-size-title:18px;--text-size-header:16px;--text-size-info:13px;--text-size-subtitle:12px;--text-size-data:10px;--background:#030303;--background-layer:#04080C;--layer-border-width:1px;--layer-border-color:#00EEEE;--default:var(--text-color-normal);--default-ripple:var(--ripple-normal);--primary:#00aaff;--primary-ripple:#00aaff60;--secondary:#2fbc2f;--secondary-ripple:#2fbc2f60;--danger:#df5348;--danger-ripple:#df534860;--warning:#ffff00;--warning-ripple:#ffff0060;--accent:#ff4dff;--accent-ripple:#ff4dff60;--button-filled-text-color:var(--text-normal);--ripple-dark:#00000060;--ripple-light:#FFFFFF60;--ripple-normal:var(--ripple-light);--ripple-invert:var(--ripple-dark);--shadow-color:rgb(255, 255, 255, 0.25)}'}];const d=document.head,c=document.createElement("style"),p=Math.ceil(screen.width*devicePixelRatio*10)%10>=5;s.push({name:"correction",style:`body {--sub-pixel-offset:${p?1:0}px}`});for(const{name:e,style:t}of s){const r=document.createElement("style");r.setAttribute("ws-name",e),r.innerHTML=t,d.appendChild(r);}d.appendChild(c),c.setAttribute("ws-calculated","");const x=c.sheet,w={},b=e=>{if(null===e)return;if(void 0!==w[e.key]||void 0===n[e.name])return;const t=n[e.name],r=void 0!==e.mod?`:${e.mod.slice(0,-1)}`:"",o=t(...e.args);x.insertRule(`[ws-x][ws-x~="${e.key}"]${r} {\n${o.join(";\n")};\n}`,x.cssRules.length),w[e.key]=x.cssRules[x.cssRules.length-1];},g=t=>{const o=t.getAttribute("ws-x");if(null===o)return;const l=((t,o)=>[...t.matchAll(e)].map((e=>{const{groups:t}=e;return {name:t.name,mod:t.mod,args:r(t.args??""),key:e[0],node:o}})))(o,t);l.forEach(b);},f={childList(e){if(0!==e.addedNodes.length)for(const t of e.addedNodes){(void 0===t.tagName?[]:[t,...t.querySelectorAll("*")]).forEach(g);}},attributes(e){g(e.target);}};new MutationObserver((e=>e.forEach((e=>f[e.type](e))))).observe(document.body,{subtree:!0,attributes:!0,childList:!0,attributeFilter:["ws-x"]});for(const e of document.querySelectorAll("*"))g(e);

const { wsx } = i;

var wsx$1 = (node, props) => {
    const update = (props) => node.setAttribute(
        "ws-x",
        wsx(props)
    );
    update(props);
    return { update }
};

/* src\avatar.svelte generated by Svelte v3.58.0 */

function create_else_block$1(ctx) {
	let t;

	return {
		c() {
			t = text(/*text*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*text*/ 2) set_data(t, /*text*/ ctx[1]);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (16:4) {#if image !== null}
function create_if_block$2(ctx) {
	let img;
	let img_src_value;

	return {
		c() {
			img = element("img");
			if (!src_url_equal(img.src, img_src_value = /*image*/ ctx[0])) attr(img, "src", img_src_value);
			attr(img, "alt", /*alt*/ ctx[2]);
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*image*/ 1 && !src_url_equal(img.src, img_src_value = /*image*/ ctx[0])) {
				attr(img, "src", img_src_value);
			}

			if (dirty & /*alt*/ 4) {
				attr(img, "alt", /*alt*/ ctx[2]);
			}
		},
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

function create_fragment$e(ctx) {
	let ws_avatar;
	let wsx_action;
	let mounted;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*image*/ ctx[0] !== null) return create_if_block$2;
		return create_else_block$1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			ws_avatar = element("ws-avatar");
			if_block.c();
		},
		m(target, anchor) {
			insert(target, ws_avatar, anchor);
			if_block.m(ws_avatar, null);

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_avatar, /*wind*/ ctx[3]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(ws_avatar, null);
				}
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 8) wsx_action.update.call(null, /*wind*/ ctx[3]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(ws_avatar);
			if_block.d();
			mounted = false;
			dispose();
		}
	};
}

function instance$e($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["image","text","alt","color"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { image = null } = $$props;
	let { text = "" } = $$props;
	let { alt = "" } = $$props;
	let { color = false } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('image' in $$new_props) $$invalidate(0, image = $$new_props.image);
		if ('text' in $$new_props) $$invalidate(1, text = $$new_props.text);
		if ('alt' in $$new_props) $$invalidate(2, alt = $$new_props.alt);
		if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
	};

	$$self.$$.update = () => {
		$$invalidate(3, wind = { $color: color, ...$$restProps });
	};

	return [image, text, alt, wind, color];
}

class Avatar extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$e, create_fragment$e, safe_not_equal, { image: 0, text: 1, alt: 2, color: 4 });
	}
}

/* src\badge.svelte generated by Svelte v3.58.0 */

function create_fragment$d(ctx) {
	let ws_badge;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[4].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

	return {
		c() {
			ws_badge = element("ws-badge");
			if (default_slot) default_slot.c();
			set_custom_element_data(ws_badge, "ws-text", /*text*/ ctx[0]);
		},
		m(target, anchor) {
			insert(target, ws_badge, anchor);

			if (default_slot) {
				default_slot.m(ws_badge, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_badge, /*wind*/ ctx[1]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
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

			if (!current || dirty & /*text*/ 1) {
				set_custom_element_data(ws_badge, "ws-text", /*text*/ ctx[0]);
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 2) wsx_action.update.call(null, /*wind*/ ctx[1]);
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
			if (detaching) detach(ws_badge);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$d($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["color","text"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { color = "default" } = $$props;
	let { text = "" } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('color' in $$new_props) $$invalidate(2, color = $$new_props.color);
		if ('text' in $$new_props) $$invalidate(0, text = $$new_props.text);
		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(1, wind = { $color: color, ...$$restProps });
	};

	return [text, wind, color, $$scope, slots];
}

class Badge extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$d, create_fragment$d, safe_not_equal, { color: 2, text: 0 });
	}
}

/* src\button.svelte generated by Svelte v3.58.0 */

function create_else_block(ctx) {
	let button;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	return {
		c() {
			button = element("button");
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (default_slot) {
				default_slot.m(button, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					action_destroyer(wsx_action = wsx$1.call(null, button, /*wind*/ ctx[2])),
					listen(button, "click", /*click_handler_1*/ ctx[9])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
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

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 4) wsx_action.update.call(null, /*wind*/ ctx[2]);
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

// (20:0) {#if label === true}
function create_if_block$1(ctx) {
	let label_1;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	return {
		c() {
			label_1 = element("label");
			if (default_slot) default_slot.c();
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
					action_destroyer(wsx_action = wsx$1.call(null, label_1, /*wind*/ ctx[2])),
					listen(label_1, "click", /*click_handler*/ ctx[8])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
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

			if (!current || dirty & /*_for*/ 2) {
				attr(label_1, "for", /*_for*/ ctx[1]);
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 4) wsx_action.update.call(null, /*wind*/ ctx[2]);
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

function create_fragment$c(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$1, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*label*/ ctx[0] === true) return 0;
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

function instance$c($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["variant","color","compact","label","for"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { variant = "flat" } = $$props;
	let { color = "default" } = $$props;
	let { compact = false } = $$props;
	let { label = false } = $$props;
	let { for: _for = "" } = $$props;

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	function click_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(10, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('variant' in $$new_props) $$invalidate(3, variant = $$new_props.variant);
		if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
		if ('compact' in $$new_props) $$invalidate(5, compact = $$new_props.compact);
		if ('label' in $$new_props) $$invalidate(0, label = $$new_props.label);
		if ('for' in $$new_props) $$invalidate(1, _for = $$new_props.for);
		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(2, wind = {
			[`@${variant}`]: true,
			$color: color,
			$compact: compact,
			"@button": label,
			...$$restProps
		});
	};

	return [
		label,
		_for,
		wind,
		variant,
		color,
		compact,
		$$scope,
		slots,
		click_handler,
		click_handler_1
	];
}

class Button extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
			variant: 3,
			color: 4,
			compact: 5,
			label: 0,
			for: 1
		});
	}
}

/* src\chip.svelte generated by Svelte v3.58.0 */

function create_fragment$b(ctx) {
	let ws_chip;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[5].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

	return {
		c() {
			ws_chip = element("ws-chip");
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			insert(target, ws_chip, anchor);

			if (default_slot) {
				default_slot.m(ws_chip, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					action_destroyer(wsx_action = wsx$1.call(null, ws_chip, /*wind*/ ctx[0])),
					listen(ws_chip, "click", /*click_handler*/ ctx[6])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[4],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
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
			if (detaching) detach(ws_chip);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$b($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["color","variant","click"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { color = "default" } = $$props;
	let { variant = "outline" } = $$props;
	let { click = false } = $$props;

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(7, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('color' in $$new_props) $$invalidate(1, color = $$new_props.color);
		if ('variant' in $$new_props) $$invalidate(2, variant = $$new_props.variant);
		if ('click' in $$new_props) $$invalidate(3, click = $$new_props.click);
		if ('$$scope' in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(0, wind = {
			[`@${variant}`]: true,
			$color: color,
			$click: click,
			...$$restProps
		});
	};

	return [wind, color, variant, click, $$scope, slots, click_handler];
}

class Chip extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$b, create_fragment$b, safe_not_equal, { color: 1, variant: 2, click: 3 });
	}
}

/* src\paper.svelte generated by Svelte v3.58.0 */
const get_footer_slot_changes$2 = dirty => ({});
const get_footer_slot_context$2 = ctx => ({});
const get_content_slot_changes$2 = dirty => ({});
const get_content_slot_context$2 = ctx => ({});
const get_header_slot_changes$2 = dirty => ({});
const get_header_slot_context$2 = ctx => ({});

function create_fragment$a(ctx) {
	let ws_paper;
	let t0;
	let t1;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const header_slot_template = /*#slots*/ ctx[5].header;
	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[4], get_header_slot_context$2);
	const content_slot_template = /*#slots*/ ctx[5].content;
	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[4], get_content_slot_context$2);
	const footer_slot_template = /*#slots*/ ctx[5].footer;
	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[4], get_footer_slot_context$2);

	return {
		c() {
			ws_paper = element("ws-paper");
			if (header_slot) header_slot.c();
			t0 = space();
			if (content_slot) content_slot.c();
			t1 = space();
			if (footer_slot) footer_slot.c();
		},
		m(target, anchor) {
			insert(target, ws_paper, anchor);

			if (header_slot) {
				header_slot.m(ws_paper, null);
			}

			append(ws_paper, t0);

			if (content_slot) {
				content_slot.m(ws_paper, null);
			}

			append(ws_paper, t1);

			if (footer_slot) {
				footer_slot.m(ws_paper, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_paper, /*wind*/ ctx[0]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (header_slot) {
				if (header_slot.p && (!current || dirty & /*$$scope*/ 16)) {
					update_slot_base(
						header_slot,
						header_slot_template,
						ctx,
						/*$$scope*/ ctx[4],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[4], dirty, get_header_slot_changes$2),
						get_header_slot_context$2
					);
				}
			}

			if (content_slot) {
				if (content_slot.p && (!current || dirty & /*$$scope*/ 16)) {
					update_slot_base(
						content_slot,
						content_slot_template,
						ctx,
						/*$$scope*/ ctx[4],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
						: get_slot_changes(content_slot_template, /*$$scope*/ ctx[4], dirty, get_content_slot_changes$2),
						get_content_slot_context$2
					);
				}
			}

			if (footer_slot) {
				if (footer_slot.p && (!current || dirty & /*$$scope*/ 16)) {
					update_slot_base(
						footer_slot,
						footer_slot_template,
						ctx,
						/*$$scope*/ ctx[4],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[4], dirty, get_footer_slot_changes$2),
						get_footer_slot_context$2
					);
				}
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 1) wsx_action.update.call(null, /*wind*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(header_slot, local);
			transition_in(content_slot, local);
			transition_in(footer_slot, local);
			current = true;
		},
		o(local) {
			transition_out(header_slot, local);
			transition_out(content_slot, local);
			transition_out(footer_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ws_paper);
			if (header_slot) header_slot.d(detaching);
			if (content_slot) content_slot.d(detaching);
			if (footer_slot) footer_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$a($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["color","card","square"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { color } = $$props;
	let { card = false } = $$props;
	let { square = false } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('color' in $$new_props) $$invalidate(1, color = $$new_props.color);
		if ('card' in $$new_props) $$invalidate(2, card = $$new_props.card);
		if ('square' in $$new_props) $$invalidate(3, square = $$new_props.square);
		if ('$$scope' in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(0, wind = {
			$color: color,
			"@outline": card,
			r: square && "0px",
			...$$restProps
		});
	};

	return [wind, color, card, square, $$scope, slots];
}

class Paper extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$a, create_fragment$a, safe_not_equal, { color: 1, card: 2, square: 3 });
	}
}

/* src\dialog.svelte generated by Svelte v3.58.0 */
const get_footer_slot_changes$1 = dirty => ({});
const get_footer_slot_context$1 = ctx => ({});
const get_content_slot_changes$1 = dirty => ({});
const get_content_slot_context$1 = ctx => ({});
const get_header_slot_changes$1 = dirty => ({});
const get_header_slot_context$1 = ctx => ({});

function create_fragment$9(ctx) {
	let ws_modal;
	let ws_paper;
	let t0;
	let t1;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const header_slot_template = /*#slots*/ ctx[2].header;
	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[1], get_header_slot_context$1);
	const content_slot_template = /*#slots*/ ctx[2].content;
	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[1], get_content_slot_context$1);
	const footer_slot_template = /*#slots*/ ctx[2].footer;
	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[1], get_footer_slot_context$1);

	return {
		c() {
			ws_modal = element("ws-modal");
			ws_paper = element("ws-paper");
			if (header_slot) header_slot.c();
			t0 = space();
			if (content_slot) content_slot.c();
			t1 = space();
			if (footer_slot) footer_slot.c();
			set_custom_element_data(ws_modal, "ws-x", "$show");
		},
		m(target, anchor) {
			insert(target, ws_modal, anchor);
			append(ws_modal, ws_paper);

			if (header_slot) {
				header_slot.m(ws_paper, null);
			}

			append(ws_paper, t0);

			if (content_slot) {
				content_slot.m(ws_paper, null);
			}

			append(ws_paper, t1);

			if (footer_slot) {
				footer_slot.m(ws_paper, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_paper, /*paper*/ ctx[0]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (header_slot) {
				if (header_slot.p && (!current || dirty & /*$$scope*/ 2)) {
					update_slot_base(
						header_slot,
						header_slot_template,
						ctx,
						/*$$scope*/ ctx[1],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[1], dirty, get_header_slot_changes$1),
						get_header_slot_context$1
					);
				}
			}

			if (content_slot) {
				if (content_slot.p && (!current || dirty & /*$$scope*/ 2)) {
					update_slot_base(
						content_slot,
						content_slot_template,
						ctx,
						/*$$scope*/ ctx[1],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
						: get_slot_changes(content_slot_template, /*$$scope*/ ctx[1], dirty, get_content_slot_changes$1),
						get_content_slot_context$1
					);
				}
			}

			if (footer_slot) {
				if (footer_slot.p && (!current || dirty & /*$$scope*/ 2)) {
					update_slot_base(
						footer_slot,
						footer_slot_template,
						ctx,
						/*$$scope*/ ctx[1],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[1], dirty, get_footer_slot_changes$1),
						get_footer_slot_context$1
					);
				}
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*paper*/ 1) wsx_action.update.call(null, /*paper*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(header_slot, local);
			transition_in(content_slot, local);
			transition_in(footer_slot, local);
			current = true;
		},
		o(local) {
			transition_out(header_slot, local);
			transition_out(content_slot, local);
			transition_out(footer_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ws_modal);
			if (header_slot) header_slot.d(detaching);
			if (content_slot) content_slot.d(detaching);
			if (footer_slot) footer_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$9($$self, $$props, $$invalidate) {
	let paper;
	const omit_props_names = [];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('$$scope' in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(0, paper = {
			"@dialog": true,
			"@outline": true,
			...$$restProps
		});
	};

	return [paper, $$scope, slots];
}

class Dialog extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});
	}
}

/* src\flex.svelte generated by Svelte v3.58.0 */

function create_fragment$8(ctx) {
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

function instance$8($$self, $$props, $$invalidate) {
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

		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
			direction: 1,
			pad: 2,
			gap: 3,
			cross: 4,
			main: 5
		});
	}
}

/* src\grid.svelte generated by Svelte v3.58.0 */

function create_fragment$7(ctx) {
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

function instance$7($$self, $$props, $$invalidate) {
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
			"gr-col": cols?.join(" ") ?? false,
			"gr-row": rows?.join(" ") ?? false,
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

		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
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

function create_fragment$6(ctx) {
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

function instance$6($$self, $$props, $$invalidate) {
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
		init(this, options, instance$6, create_fragment$6, safe_not_equal, { name: 0 });
	}
}

/* src\inline-dialog.svelte generated by Svelte v3.58.0 */
const get_footer_slot_changes = dirty => ({});
const get_footer_slot_context = ctx => ({ id: /*id*/ ctx[1] });
const get_content_slot_changes = dirty => ({});
const get_content_slot_context = ctx => ({ id: /*id*/ ctx[1] });
const get_header_slot_changes = dirty => ({});
const get_header_slot_context = ctx => ({ id: /*id*/ ctx[1] });
const get_toggle_slot_changes = dirty => ({});
const get_toggle_slot_context = ctx => ({ id: /*id*/ ctx[1] });

function create_fragment$5(ctx) {
	let t0;
	let input;
	let t1;
	let ws_modal;
	let ws_paper;
	let t2;
	let t3;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const toggle_slot_template = /*#slots*/ ctx[3].toggle;
	const toggle_slot = create_slot(toggle_slot_template, ctx, /*$$scope*/ ctx[2], get_toggle_slot_context);
	const header_slot_template = /*#slots*/ ctx[3].header;
	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[2], get_header_slot_context);
	const content_slot_template = /*#slots*/ ctx[3].content;
	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[2], get_content_slot_context);
	const footer_slot_template = /*#slots*/ ctx[3].footer;
	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[2], get_footer_slot_context);

	return {
		c() {
			if (toggle_slot) toggle_slot.c();
			t0 = space();
			input = element("input");
			t1 = space();
			ws_modal = element("ws-modal");
			ws_paper = element("ws-paper");
			if (header_slot) header_slot.c();
			t2 = space();
			if (content_slot) content_slot.c();
			t3 = space();
			if (footer_slot) footer_slot.c();
			attr(input, "type", "checkbox");
			attr(input, "ws-x", "hide");
			attr(input, "id", /*id*/ ctx[1]);
		},
		m(target, anchor) {
			if (toggle_slot) {
				toggle_slot.m(target, anchor);
			}

			insert(target, t0, anchor);
			insert(target, input, anchor);
			insert(target, t1, anchor);
			insert(target, ws_modal, anchor);
			append(ws_modal, ws_paper);

			if (header_slot) {
				header_slot.m(ws_paper, null);
			}

			append(ws_paper, t2);

			if (content_slot) {
				content_slot.m(ws_paper, null);
			}

			append(ws_paper, t3);

			if (footer_slot) {
				footer_slot.m(ws_paper, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, ws_paper, /*paper*/ ctx[0]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (toggle_slot) {
				if (toggle_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot_base(
						toggle_slot,
						toggle_slot_template,
						ctx,
						/*$$scope*/ ctx[2],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
						: get_slot_changes(toggle_slot_template, /*$$scope*/ ctx[2], dirty, get_toggle_slot_changes),
						get_toggle_slot_context
					);
				}
			}

			if (header_slot) {
				if (header_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot_base(
						header_slot,
						header_slot_template,
						ctx,
						/*$$scope*/ ctx[2],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[2], dirty, get_header_slot_changes),
						get_header_slot_context
					);
				}
			}

			if (content_slot) {
				if (content_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot_base(
						content_slot,
						content_slot_template,
						ctx,
						/*$$scope*/ ctx[2],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
						: get_slot_changes(content_slot_template, /*$$scope*/ ctx[2], dirty, get_content_slot_changes),
						get_content_slot_context
					);
				}
			}

			if (footer_slot) {
				if (footer_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot_base(
						footer_slot,
						footer_slot_template,
						ctx,
						/*$$scope*/ ctx[2],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[2], dirty, get_footer_slot_changes),
						get_footer_slot_context
					);
				}
			}

			if (wsx_action && is_function(wsx_action.update) && dirty & /*paper*/ 1) wsx_action.update.call(null, /*paper*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(toggle_slot, local);
			transition_in(header_slot, local);
			transition_in(content_slot, local);
			transition_in(footer_slot, local);
			current = true;
		},
		o(local) {
			transition_out(toggle_slot, local);
			transition_out(header_slot, local);
			transition_out(content_slot, local);
			transition_out(footer_slot, local);
			current = false;
		},
		d(detaching) {
			if (toggle_slot) toggle_slot.d(detaching);
			if (detaching) detach(t0);
			if (detaching) detach(input);
			if (detaching) detach(t1);
			if (detaching) detach(ws_modal);
			if (header_slot) header_slot.d(detaching);
			if (content_slot) content_slot.d(detaching);
			if (footer_slot) footer_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let paper;
	const omit_props_names = [];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	const id = Math.random().toString(16);

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(4, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(0, paper = {
			"@dialog": true,
			"@outline": true,
			...$$restProps
		});
	};

	return [paper, id, $$scope, slots];
}

class Inline_dialog extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});
	}
}

/* src\modal.svelte generated by Svelte v3.58.0 */

function create_if_block(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*modalProps*/ ctx[1], { close: /*close*/ ctx[3] }];
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
			const switch_instance_changes = (dirty & /*modalProps, close*/ 10)
			? get_spread_update(switch_instance_spread_levels, [
					dirty & /*modalProps*/ 2 && get_spread_object(/*modalProps*/ ctx[1]),
					dirty & /*close*/ 8 && { close: /*close*/ ctx[3] }
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

function create_fragment$4(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*resolver*/ ctx[2] !== null && create_if_block(ctx);

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
					if_block = create_if_block(ctx);
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

function instance$4($$self, $$props, $$invalidate) {
	let { component } = $$props;
	let modalProps = null;
	let resolver = null;

	const close = value => {
		resolver(value);
		$$invalidate(2, resolver = null);
		$$invalidate(1, modalProps = null);
	};

	const show = props => new Promise(resolve => {
			$$invalidate(1, modalProps = props ?? {});
			$$invalidate(2, resolver = resolve);
		});

	$$self.$$set = $$props => {
		if ('component' in $$props) $$invalidate(0, component = $$props.component);
	};

	return [component, modalProps, resolver, close, show];
}

class Modal extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, { component: 0, show: 4 });
	}

	get show() {
		return this.$$.ctx[4];
	}
}

/* src\text.svelte generated by Svelte v3.58.0 */

function create_fragment$3(ctx) {
	let span;
	let wsx_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[5].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

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
				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[4],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
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

function instance$3($$self, $$props, $$invalidate) {
	let wind;
	const omit_props_names = ["title","subtitle","block"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { title = false } = $$props;
	let { subtitle = false } = $$props;
	let { block = false } = $$props;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
		if ('subtitle' in $$new_props) $$invalidate(2, subtitle = $$new_props.subtitle);
		if ('block' in $$new_props) $$invalidate(3, block = $$new_props.block);
		if ('$$scope' in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		$$invalidate(0, wind = {
			"$title-text": title,
			"$subtitle": subtitle,
			block,
			...$$restProps
		});
	};

	return [wind, title, subtitle, block, $$scope, slots];
}

class Text extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$3, create_fragment$3, safe_not_equal, { title: 1, subtitle: 2, block: 3 });
	}
}

/* src\titlebar.svelte generated by Svelte v3.58.0 */
const get_action_slot_changes = dirty => ({});
const get_action_slot_context = ctx => ({});
const get_title_slot_changes = dirty => ({});
const get_title_slot_context = ctx => ({});
const get_menu_slot_changes = dirty => ({});
const get_menu_slot_context = ctx => ({});

function create_fragment$2(ctx) {
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

function instance$2($$self, $$props, $$invalidate) {
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
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { color: 1, fill: 2 });
	}
}

/* test\src\comp\test-dialog.svelte generated by Svelte v3.58.0 */

function create_default_slot_5$1(ctx) {
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

// (17:8) 
function create_action_slot(ctx) {
	let button;
	let current;

	button = new Button({
			props: {
				slot: "action",
				compact: true,
				$$slots: { default: [create_default_slot_5$1] },
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

// (20:8) <Text title slot="title">
function create_default_slot_4$1(ctx) {
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

// (20:8) 
function create_title_slot$1(ctx) {
	let text_1;
	let current;

	text_1 = new Text({
			props: {
				title: true,
				slot: "title",
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

// (16:4) 
function create_header_slot$1(ctx) {
	let titlebar;
	let current;

	titlebar = new Titlebar({
			props: {
				slot: "header",
				$$slots: {
					title: [create_title_slot$1],
					action: [create_action_slot]
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

// (26:8) <Text>
function create_default_slot_3$1(ctx) {
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

// (27:8) <Text>
function create_default_slot_2$1(ctx) {
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

// (28:8) <Text>
function create_default_slot_1$1(ctx) {
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

// (25:4) <Flex slot="content">
function create_default_slot$1(ctx) {
	let text0;
	let t0;
	let text1;
	let t1;
	let text2;
	let current;

	text0 = new Text({
			props: {
				$$slots: { default: [create_default_slot_3$1] },
				$$scope: { ctx }
			}
		});

	text1 = new Text({
			props: {
				$$slots: { default: [create_default_slot_2$1] },
				$$scope: { ctx }
			}
		});

	text2 = new Text({
			props: {
				$$slots: { default: [create_default_slot_1$1] },
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
		},
		m(target, anchor) {
			mount_component(text0, target, anchor);
			insert(target, t0, anchor);
			mount_component(text1, target, anchor);
			insert(target, t1, anchor);
			mount_component(text2, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text0_changes = {};

			if (dirty & /*$$scope*/ 2) {
				text0_changes.$$scope = { dirty, ctx };
			}

			text0.$set(text0_changes);
			const text1_changes = {};

			if (dirty & /*$$scope*/ 2) {
				text1_changes.$$scope = { dirty, ctx };
			}

			text1.$set(text1_changes);
			const text2_changes = {};

			if (dirty & /*$$scope*/ 2) {
				text2_changes.$$scope = { dirty, ctx };
			}

			text2.$set(text2_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text0.$$.fragment, local);
			transition_in(text1.$$.fragment, local);
			transition_in(text2.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text0.$$.fragment, local);
			transition_out(text1.$$.fragment, local);
			transition_out(text2.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text0, detaching);
			if (detaching) detach(t0);
			destroy_component(text1, detaching);
			if (detaching) detach(t1);
			destroy_component(text2, detaching);
		}
	};
}

// (25:4) 
function create_content_slot$1(ctx) {
	let flex;
	let current;

	flex = new Flex({
			props: {
				slot: "content",
				$$slots: { default: [create_default_slot$1] },
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

			if (dirty & /*$$scope*/ 2) {
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

function create_fragment$1(ctx) {
	let dialog;
	let current;

	dialog = new Dialog({
			props: {
				$$slots: {
					content: [create_content_slot$1],
					header: [create_header_slot$1]
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

			if (dirty & /*$$scope, close*/ 3) {
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

function instance$1($$self, $$props, $$invalidate) {
	let { close } = $$props;

	$$self.$$set = $$props => {
		if ('close' in $$props) $$invalidate(0, close = $$props.close);
	};

	return [close];
}

class Test_dialog extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { close: 0 });
	}
}

/* test\src\app.svelte generated by Svelte v3.58.0 */

function create_default_slot_16(ctx) {
	let t;

	return {
		c() {
			t = text("Things Clicked");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (47:0) <Badge text={clicks} color="primary">
function create_default_slot_15(ctx) {
	let icon;
	let current;

	icon = new Icon({
			props: {
				name: "abacus",
				$$slots: { default: [create_default_slot_16] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(icon.$$.fragment);
		},
		m(target, anchor) {
			mount_component(icon, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const icon_changes = {};

			if (dirty & /*$$scope*/ 512) {
				icon_changes.$$scope = { dirty, ctx };
			}

			icon.$set(icon_changes);
		},
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

// (51:0) <Button on:click={openDialog}>
function create_default_slot_14(ctx) {
	let t;

	return {
		c() {
			t = text("Please Open Dialog");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (55:4) <Flex slot="content">
function create_default_slot_13(ctx) {
	let div0;
	let t1;
	let div1;
	let t3;
	let div2;
	let t5;
	let div3;

	return {
		c() {
			div0 = element("div");
			div0.textContent = "0";
			t1 = space();
			div1 = element("div");
			div1.textContent = "1";
			t3 = space();
			div2 = element("div");
			div2.textContent = "2";
			t5 = space();
			div3 = element("div");
			div3.textContent = "3";
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			insert(target, t1, anchor);
			insert(target, div1, anchor);
			insert(target, t3, anchor);
			insert(target, div2, anchor);
			insert(target, t5, anchor);
			insert(target, div3, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div0);
			if (detaching) detach(t1);
			if (detaching) detach(div1);
			if (detaching) detach(t3);
			if (detaching) detach(div2);
			if (detaching) detach(t5);
			if (detaching) detach(div3);
		}
	};
}

// (55:4) 
function create_content_slot_1(ctx) {
	let flex;
	let current;

	flex = new Flex({
			props: {
				slot: "content",
				$$slots: { default: [create_default_slot_13] },
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

			if (dirty & /*$$scope*/ 512) {
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

// (63:12) <Text title>
function create_default_slot_12(ctx) {
	let t;

	return {
		c() {
			t = text("Testing");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (64:12) <Text subtitle>
function create_default_slot_11(ctx) {
	let t;

	return {
		c() {
			t = text("subtitle?");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (62:8) <Flex slot="title">
function create_default_slot_10(ctx) {
	let text0;
	let t;
	let text1;
	let current;

	text0 = new Text({
			props: {
				title: true,
				$$slots: { default: [create_default_slot_12] },
				$$scope: { ctx }
			}
		});

	text1 = new Text({
			props: {
				subtitle: true,
				$$slots: { default: [create_default_slot_11] },
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

			if (dirty & /*$$scope*/ 512) {
				text0_changes.$$scope = { dirty, ctx };
			}

			text0.$set(text0_changes);
			const text1_changes = {};

			if (dirty & /*$$scope*/ 512) {
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

// (62:8) 
function create_title_slot(ctx) {
	let flex;
	let current;

	flex = new Flex({
			props: {
				slot: "title",
				$$slots: { default: [create_default_slot_10] },
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

			if (dirty & /*$$scope*/ 512) {
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

// (61:4) 
function create_header_slot(ctx) {
	let titlebar;
	let current;

	titlebar = new Titlebar({
			props: {
				slot: "header",
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

			if (dirty & /*$$scope*/ 512) {
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

// (71:4) <Button variant="outline" color="primary" on:click={toggle}>
function create_default_slot_9(ctx) {
	let t;

	return {
		c() {
			t = text("Toggle");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (78:4) <Chip color="accent" click on:click={inc}>
function create_default_slot_8(ctx) {
	let t;

	return {
		c() {
			t = text("Testing?");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (83:8) <Button slot="toggle" variant="fill" color="warning" for={id} label>
function create_default_slot_7(ctx) {
	let t;

	return {
		c() {
			t = text("Dialog?");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (83:8) 
function create_toggle_slot(ctx) {
	let button;
	let current;

	button = new Button({
			props: {
				slot: "toggle",
				variant: "fill",
				color: "warning",
				for: /*id*/ ctx[8],
				label: true,
				$$slots: { default: [create_default_slot_7] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const button_changes = {};
			if (dirty & /*id*/ 256) button_changes.for = /*id*/ ctx[8];

			if (dirty & /*$$scope*/ 512) {
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

// (88:12) <Text>
function create_default_slot_6(ctx) {
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

// (89:12) <Button variant="fill" color="accent" for={id} label>
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

// (87:8) <Flex slot="content">
function create_default_slot_4(ctx) {
	let text_1;
	let t;
	let button;
	let current;

	text_1 = new Text({
			props: {
				$$slots: { default: [create_default_slot_6] },
				$$scope: { ctx }
			}
		});

	button = new Button({
			props: {
				variant: "fill",
				color: "accent",
				for: /*id*/ ctx[8],
				label: true,
				$$slots: { default: [create_default_slot_5] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(text_1.$$.fragment);
			t = space();
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			mount_component(text_1, target, anchor);
			insert(target, t, anchor);
			mount_component(button, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const text_1_changes = {};

			if (dirty & /*$$scope*/ 512) {
				text_1_changes.$$scope = { dirty, ctx };
			}

			text_1.$set(text_1_changes);
			const button_changes = {};
			if (dirty & /*id*/ 256) button_changes.for = /*id*/ ctx[8];

			if (dirty & /*$$scope*/ 512) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
		},
		i(local) {
			if (current) return;
			transition_in(text_1.$$.fragment, local);
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(text_1.$$.fragment, local);
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(text_1, detaching);
			if (detaching) detach(t);
			destroy_component(button, detaching);
		}
	};
}

// (87:8) 
function create_content_slot(ctx) {
	let flex;
	let current;

	flex = new Flex({
			props: {
				slot: "content",
				$$slots: { default: [create_default_slot_4] },
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

			if (dirty & /*$$scope, id*/ 768) {
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

// (69:0) <Flex theme="dark">
function create_default_slot_3(ctx) {
	let modal;
	let t0;
	let button;
	let t1;
	let avatar0;
	let t2;
	let avatar1;
	let t3;
	let chip;
	let t4;
	let inlinedialog;
	let current;
	let modal_props = { component: Test_dialog };
	modal = new Modal({ props: modal_props });
	/*modal_binding*/ ctx[6](modal);

	button = new Button({
			props: {
				variant: "outline",
				color: "primary",
				$$slots: { default: [create_default_slot_9] },
				$$scope: { ctx }
			}
		});

	button.$on("click", /*toggle*/ ctx[3]);

	avatar0 = new Avatar({
			props: {
				text: "69",
				color: "secondary",
				"t-sz": "18px"
			}
		});

	avatar1 = new Avatar({ props: { image } });

	chip = new Chip({
			props: {
				color: "accent",
				click: true,
				$$slots: { default: [create_default_slot_8] },
				$$scope: { ctx }
			}
		});

	chip.$on("click", /*inc*/ ctx[4]);

	inlinedialog = new Inline_dialog({
			props: {
				$$slots: {
					content: [create_content_slot, ({ id }) => ({ 8: id }), ({ id }) => id ? 256 : 0],
					toggle: [create_toggle_slot, ({ id }) => ({ 8: id }), ({ id }) => id ? 256 : 0]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(modal.$$.fragment);
			t0 = space();
			create_component(button.$$.fragment);
			t1 = space();
			create_component(avatar0.$$.fragment);
			t2 = space();
			create_component(avatar1.$$.fragment);
			t3 = space();
			create_component(chip.$$.fragment);
			t4 = space();
			create_component(inlinedialog.$$.fragment);
		},
		m(target, anchor) {
			mount_component(modal, target, anchor);
			insert(target, t0, anchor);
			mount_component(button, target, anchor);
			insert(target, t1, anchor);
			mount_component(avatar0, target, anchor);
			insert(target, t2, anchor);
			mount_component(avatar1, target, anchor);
			insert(target, t3, anchor);
			mount_component(chip, target, anchor);
			insert(target, t4, anchor);
			mount_component(inlinedialog, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const modal_changes = {};
			modal.$set(modal_changes);
			const button_changes = {};

			if (dirty & /*$$scope*/ 512) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
			const chip_changes = {};

			if (dirty & /*$$scope*/ 512) {
				chip_changes.$$scope = { dirty, ctx };
			}

			chip.$set(chip_changes);
			const inlinedialog_changes = {};

			if (dirty & /*$$scope, id*/ 768) {
				inlinedialog_changes.$$scope = { dirty, ctx };
			}

			inlinedialog.$set(inlinedialog_changes);
		},
		i(local) {
			if (current) return;
			transition_in(modal.$$.fragment, local);
			transition_in(button.$$.fragment, local);
			transition_in(avatar0.$$.fragment, local);
			transition_in(avatar1.$$.fragment, local);
			transition_in(chip.$$.fragment, local);
			transition_in(inlinedialog.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(modal.$$.fragment, local);
			transition_out(button.$$.fragment, local);
			transition_out(avatar0.$$.fragment, local);
			transition_out(avatar1.$$.fragment, local);
			transition_out(chip.$$.fragment, local);
			transition_out(inlinedialog.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			/*modal_binding*/ ctx[6](null);
			destroy_component(modal, detaching);
			if (detaching) detach(t0);
			destroy_component(button, detaching);
			if (detaching) detach(t1);
			destroy_component(avatar0, detaching);
			if (detaching) detach(t2);
			destroy_component(avatar1, detaching);
			if (detaching) detach(t3);
			destroy_component(chip, detaching);
			if (detaching) detach(t4);
			destroy_component(inlinedialog, detaching);
		}
	};
}

// (96:4) <Button variant="outline" color="primary" on:click={toggle}>
function create_default_slot_2(ctx) {
	let t;

	return {
		c() {
			t = text("Toggle");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (103:4) <Chip color="accent" click on:click={inc}>
function create_default_slot_1(ctx) {
	let t;

	return {
		c() {
			t = text("Testing?");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (95:0) <Grid cols={["1fr", "1fr"]} autoRow="50px">
function create_default_slot(ctx) {
	let button;
	let t0;
	let avatar0;
	let t1;
	let avatar1;
	let t2;
	let chip;
	let current;

	button = new Button({
			props: {
				variant: "outline",
				color: "primary",
				$$slots: { default: [create_default_slot_2] },
				$$scope: { ctx }
			}
		});

	button.$on("click", /*toggle*/ ctx[3]);

	avatar0 = new Avatar({
			props: {
				text: "69",
				color: "secondary",
				"t-sz": "18px"
			}
		});

	avatar1 = new Avatar({ props: { image } });

	chip = new Chip({
			props: {
				color: "accent",
				click: true,
				$$slots: { default: [create_default_slot_1] },
				$$scope: { ctx }
			}
		});

	chip.$on("click", /*inc*/ ctx[4]);

	return {
		c() {
			create_component(button.$$.fragment);
			t0 = space();
			create_component(avatar0.$$.fragment);
			t1 = space();
			create_component(avatar1.$$.fragment);
			t2 = space();
			create_component(chip.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			insert(target, t0, anchor);
			mount_component(avatar0, target, anchor);
			insert(target, t1, anchor);
			mount_component(avatar1, target, anchor);
			insert(target, t2, anchor);
			mount_component(chip, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const button_changes = {};

			if (dirty & /*$$scope*/ 512) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
			const chip_changes = {};

			if (dirty & /*$$scope*/ 512) {
				chip_changes.$$scope = { dirty, ctx };
			}

			chip.$set(chip_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			transition_in(avatar0.$$.fragment, local);
			transition_in(avatar1.$$.fragment, local);
			transition_in(chip.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			transition_out(avatar0.$$.fragment, local);
			transition_out(avatar1.$$.fragment, local);
			transition_out(chip.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
			if (detaching) detach(t0);
			destroy_component(avatar0, detaching);
			if (detaching) detach(t1);
			destroy_component(avatar1, detaching);
			if (detaching) detach(t2);
			destroy_component(chip, detaching);
		}
	};
}

function create_fragment(ctx) {
	let wsx_action;
	let t0;
	let div;
	let t1;
	let badge;
	let t2;
	let button;
	let t3;
	let paper;
	let t4;
	let flex;
	let t5;
	let grid;
	let current;
	let mounted;
	let dispose;

	badge = new Badge({
			props: {
				text: /*clicks*/ ctx[1],
				color: "primary",
				$$slots: { default: [create_default_slot_15] },
				$$scope: { ctx }
			}
		});

	button = new Button({
			props: {
				$$slots: { default: [create_default_slot_14] },
				$$scope: { ctx }
			}
		});

	button.$on("click", /*openDialog*/ ctx[5]);

	paper = new Paper({
			props: {
				card: true,
				$$slots: {
					header: [create_header_slot],
					content: [create_content_slot_1]
				},
				$$scope: { ctx }
			}
		});

	flex = new Flex({
			props: {
				theme: "dark",
				$$slots: { default: [create_default_slot_3] },
				$$scope: { ctx }
			}
		});

	grid = new Grid({
			props: {
				cols: ["1fr", "1fr"],
				autoRow: "50px",
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			t0 = space();
			div = element("div");
			t1 = space();
			create_component(badge.$$.fragment);
			t2 = space();
			create_component(button.$$.fragment);
			t3 = space();
			create_component(paper.$$.fragment);
			t4 = space();
			create_component(flex.$$.fragment);
			t5 = space();
			create_component(grid.$$.fragment);
			attr(div, "ws-x", "h[20px]");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, div, anchor);
			insert(target, t1, anchor);
			mount_component(badge, target, anchor);
			insert(target, t2, anchor);
			mount_component(button, target, anchor);
			insert(target, t3, anchor);
			mount_component(paper, target, anchor);
			insert(target, t4, anchor);
			mount_component(flex, target, anchor);
			insert(target, t5, anchor);
			mount_component(grid, target, anchor);
			current = true;

			if (!mounted) {
				dispose = action_destroyer(wsx_action = wsx$1.call(null, document.body, { theme: /*theme*/ ctx[0] }));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (wsx_action && is_function(wsx_action.update) && dirty & /*theme*/ 1) wsx_action.update.call(null, { theme: /*theme*/ ctx[0] });
			const badge_changes = {};
			if (dirty & /*clicks*/ 2) badge_changes.text = /*clicks*/ ctx[1];

			if (dirty & /*$$scope*/ 512) {
				badge_changes.$$scope = { dirty, ctx };
			}

			badge.$set(badge_changes);
			const button_changes = {};

			if (dirty & /*$$scope*/ 512) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
			const paper_changes = {};

			if (dirty & /*$$scope*/ 512) {
				paper_changes.$$scope = { dirty, ctx };
			}

			paper.$set(paper_changes);
			const flex_changes = {};

			if (dirty & /*$$scope, dialog*/ 516) {
				flex_changes.$$scope = { dirty, ctx };
			}

			flex.$set(flex_changes);
			const grid_changes = {};

			if (dirty & /*$$scope*/ 512) {
				grid_changes.$$scope = { dirty, ctx };
			}

			grid.$set(grid_changes);
		},
		i(local) {
			if (current) return;
			transition_in(badge.$$.fragment, local);
			transition_in(button.$$.fragment, local);
			transition_in(paper.$$.fragment, local);
			transition_in(flex.$$.fragment, local);
			transition_in(grid.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(badge.$$.fragment, local);
			transition_out(button.$$.fragment, local);
			transition_out(paper.$$.fragment, local);
			transition_out(flex.$$.fragment, local);
			transition_out(grid.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(div);
			if (detaching) detach(t1);
			destroy_component(badge, detaching);
			if (detaching) detach(t2);
			destroy_component(button, detaching);
			if (detaching) detach(t3);
			destroy_component(paper, detaching);
			if (detaching) detach(t4);
			destroy_component(flex, detaching);
			if (detaching) detach(t5);
			destroy_component(grid, detaching);
			mounted = false;
			dispose();
		}
	};
}

const image = "https://freepngimg.com/save/109659-kingdom-hearts-sora-photos-free-transparent-image-hd/801x816";

function instance($$self, $$props, $$invalidate) {
	const reverse = { dark: "tron", tron: "dark" };
	let theme = "tron";
	const toggle = () => $$invalidate(0, theme = reverse[theme]);
	let clicks = 0;
	const inc = () => $$invalidate(1, clicks += 1);
	let dialog = null;

	const openDialog = async () => {
		console.log(await dialog.show());
	};

	function modal_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			dialog = $$value;
			$$invalidate(2, dialog);
		});
	}

	return [theme, clicks, dialog, toggle, inc, openDialog, modal_binding];
}

class App extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

window.app = new App({ target: document.body });
