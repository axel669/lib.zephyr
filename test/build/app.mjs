(function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	const identity = (x) => x;

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	/** @returns {boolean} */
	function not_equal(a, b) {
		return a != a ? b == b : a !== b;
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	function subscribe(store, ...callbacks) {
		if (store == null) {
			for (const callback of callbacks) {
				callback(undefined);
			}
			return noop;
		}
		const unsub = store.subscribe(...callbacks);
		return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}

	/** @returns {void} */
	function component_subscribe(component, store, callback) {
		component.$$.on_destroy.push(subscribe(store, callback));
	}

	function create_slot(definition, ctx, $$scope, fn) {
		if (definition) {
			const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
			return definition[0](slot_ctx);
		}
	}

	function get_slot_context(definition, ctx, $$scope, fn) {
		return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
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

	/** @returns {void} */
	function update_slot_base(
		slot,
		slot_definition,
		ctx,
		$$scope,
		slot_changes,
		get_slot_context_fn
	) {
		if (slot_changes) {
			const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
			slot.p(slot_context, slot_changes);
		}
	}

	/** @returns {any[] | -1} */
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

	/** @returns {{}} */
	function exclude_internal_props(props) {
		const result = {};
		for (const k in props) if (k[0] !== '$') result[k] = props[k];
		return result;
	}

	/** @returns {{}} */
	function compute_rest_props(props, keys) {
		const rest = {};
		keys = new Set(keys);
		for (const k in props) if (!keys.has(k) && k[0] !== '$') rest[k] = props[k];
		return rest;
	}

	/** @returns {{}} */
	function compute_slots(slots) {
		const result = {};
		for (const key in slots) {
			result[key] = true;
		}
		return result;
	}

	function set_store_value(store, ret, value) {
		store.set(value);
		return ret;
	}

	function action_destroyer(action_result) {
		return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
	}

	/** @param {number | string} value
	 * @returns {[number, string]}
	 */
	function split_css_unit(value) {
		const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
		return split ? [parseFloat(split[1]), split[2] || 'px'] : [/** @type {number} */ (value), 'px'];
	}

	const is_client = typeof window !== 'undefined';

	/** @type {() => number} */
	let now = is_client ? () => window.performance.now() : () => Date.now();

	let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;

	const tasks = new Set();

	/**
	 * @param {number} now
	 * @returns {void}
	 */
	function run_tasks(now) {
		tasks.forEach((task) => {
			if (!task.c(now)) {
				tasks.delete(task);
				task.f();
			}
		});
		if (tasks.size !== 0) raf(run_tasks);
	}

	/**
	 * Creates a new task that runs on each raf frame
	 * until it returns a falsy value or is aborted
	 * @param {import('./private.js').TaskCallback} callback
	 * @returns {import('./private.js').Task}
	 */
	function loop(callback) {
		/** @type {import('./private.js').TaskEntry} */
		let task;
		if (tasks.size === 0) raf(run_tasks);
		return {
			promise: new Promise((fulfill) => {
				tasks.add((task = { c: callback, f: fulfill }));
			}),
			abort() {
				tasks.delete(task);
			}
		};
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} node
	 * @returns {ShadowRoot | Document}
	 */
	function get_root_for_style(node) {
		if (!node) return document;
		const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
		if (root && /** @type {ShadowRoot} */ (root).host) {
			return /** @type {ShadowRoot} */ (root);
		}
		return node.ownerDocument;
	}

	/**
	 * @param {Node} node
	 * @returns {CSSStyleSheet}
	 */
	function append_empty_stylesheet(node) {
		const style_element = element('style');
		// For transitions to work without 'style-src: unsafe-inline' Content Security Policy,
		// these empty tags need to be allowed with a hash as a workaround until we move to the Web Animations API.
		// Using the hash for the empty string (for an empty tag) works in all browsers except Safari.
		// So as a workaround for the workaround, when we append empty style tags we set their content to /* empty */.
		// The hash 'sha256-9OlNO0DNEeaVzHL4RZwCLsBHA8WBQ8toBp/4F5XV2nc=' will then work even in Safari.
		style_element.textContent = '/* empty */';
		append_stylesheet(get_root_for_style(node), style_element);
		return style_element.sheet;
	}

	/**
	 * @param {ShadowRoot | Document} node
	 * @param {HTMLStyleElement} style
	 * @returns {CSSStyleSheet}
	 */
	function append_stylesheet(node, style) {
		append(/** @type {Document} */ (node).head || node, style);
		return style.sheet;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @returns {(event: any) => any} */
	function stop_propagation(fn) {
		return function (event) {
			event.stopPropagation();
			// @ts-ignore
			return fn.call(this, event);
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @returns {void} */
	function set_custom_element_data(node, prop, value) {
		const lower = prop.toLowerCase(); // for backwards compatibility with existing behavior we do lowercase first
		if (lower in node) {
			node[lower] = typeof node[lower] === 'boolean' && value === '' ? true : value;
		} else if (prop in node) {
			node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
		} else {
			attr(node, prop, value);
		}
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data(text, data) {
		data = '' + data;
		if (text.data === data) return;
		text.data = /** @type {string} */ (data);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function set_style(node, key, value, important) {
		if (value == null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, important ? 'important' : '');
		}
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	function construct_svelte_component(component, props) {
		return new component(props);
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	// we need to store the information for multiple documents because a Svelte application could also contain iframes
	// https://github.com/sveltejs/svelte/issues/3624
	/** @type {Map<Document | ShadowRoot, import('./private.d.ts').StyleInformation>} */
	const managed_styles = new Map();

	let active = 0;

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	/**
	 * @param {string} str
	 * @returns {number}
	 */
	function hash$1(str) {
		let hash = 5381;
		let i = str.length;
		while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
		return hash >>> 0;
	}

	/**
	 * @param {Document | ShadowRoot} doc
	 * @param {Element & ElementCSSInlineStyle} node
	 * @returns {{ stylesheet: any; rules: {}; }}
	 */
	function create_style_information(doc, node) {
		const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
		managed_styles.set(doc, info);
		return info;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {number} a
	 * @param {number} b
	 * @param {number} duration
	 * @param {number} delay
	 * @param {(t: number) => number} ease
	 * @param {(t: number, u: number) => string} fn
	 * @param {number} uid
	 * @returns {string}
	 */
	function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
		const step = 16.666 / duration;
		let keyframes = '{\n';
		for (let p = 0; p <= 1; p += step) {
			const t = a + (b - a) * ease(p);
			keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
		}
		const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
		const name = `__svelte_${hash$1(rule)}_${uid}`;
		const doc = get_root_for_style(node);
		const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
		if (!rules[name]) {
			rules[name] = true;
			stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
		}
		const animation = node.style.animation || '';
		node.style.animation = `${
		animation ? `${animation}, ` : ''
	}${name} ${duration}ms linear ${delay}ms 1 both`;
		active += 1;
		return name;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {string} [name]
	 * @returns {void}
	 */
	function delete_rule(node, name) {
		const previous = (node.style.animation || '').split(', ');
		const next = previous.filter(
			name
				? (anim) => anim.indexOf(name) < 0 // remove specific animation
				: (anim) => anim.indexOf('__svelte') === -1 // remove all Svelte animations
		);
		const deleted = previous.length - next.length;
		if (deleted) {
			node.style.animation = next.join(', ');
			active -= deleted;
			if (!active) clear_rules();
		}
	}

	/** @returns {void} */
	function clear_rules() {
		raf(() => {
			if (active) return;
			managed_styles.forEach((info) => {
				const { ownerNode } = info.stylesheet;
				// there is no ownerNode if it runs on jsdom.
				if (ownerNode) detach(ownerNode);
			});
			managed_styles.clear();
		});
	}

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
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
	 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
	 * ```ts
	 * const dispatch = createEventDispatcher<{
	 *  loaded: never; // does not take a detail argument
	 *  change: string; // takes a detail argument of type string, which is required
	 *  optional: number | null; // takes an optional detail argument of type number
	 * }>();
	 * ```
	 *
	 * https://svelte.dev/docs/svelte#createeventdispatcher
	 * @template {Record<string, any>} [EventMap=any]
	 * @returns {import('./public.js').EventDispatcher<EventMap>}
	 */
	function createEventDispatcher() {
		const component = get_current_component();
		return (type, detail, { cancelable = false } = {}) => {
			const callbacks = component.$$.callbacks[type];
			if (callbacks) {
				// TODO are there situations where events could be dispatched
				// in a server (non-DOM) environment?
				const event = custom_event(/** @type {string} */ (type), detail, { cancelable });
				callbacks.slice().forEach((fn) => {
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
	 * https://svelte.dev/docs/svelte#setcontext
	 * @template T
	 * @param {any} key
	 * @param {T} context
	 * @returns {T}
	 */
	function setContext(key, context) {
		get_current_component().$$.context.set(key, context);
		return context;
	}

	/**
	 * Retrieves the context that belongs to the closest parent component with the specified `key`.
	 * Must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#getcontext
	 * @template T
	 * @param {any} key
	 * @returns {T}
	 */
	function getContext(key) {
		return get_current_component().$$.context.get(key);
	}

	// TODO figure out if we still want to support
	// shorthand events, or if we want to implement
	// a real bubbling mechanism
	/**
	 * @param component
	 * @param event
	 * @returns {void}
	 */
	function bubble(component, event) {
		const callbacks = component.$$.callbacks[event.type];
		if (callbacks) {
			// @ts-ignore
			callbacks.slice().forEach((fn) => fn.call(this, event));
		}
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {Promise<void>} */
	function tick() {
		schedule_update();
		return resolved_promise;
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	/** @returns {void} */
	function add_flush_callback(fn) {
		flush_callbacks.push(fn);
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

	/** @returns {void} */
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
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
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

	/** @returns {void} */
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
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	/**
	 * @type {Promise<void> | null}
	 */
	let promise;

	/**
	 * @returns {Promise<void>}
	 */
	function wait() {
		if (!promise) {
			promise = Promise.resolve();
			promise.then(() => {
				promise = null;
			});
		}
		return promise;
	}

	/**
	 * @param {Element} node
	 * @param {INTRO | OUTRO | boolean} direction
	 * @param {'start' | 'end'} kind
	 * @returns {void}
	 */
	function dispatch(node, direction, kind) {
		node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/**
	 * @type {import('../transition/public.js').TransitionConfig}
	 */
	const null_transition = { duration: 0 };

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {TransitionFn} fn
	 * @param {any} params
	 * @param {boolean} intro
	 * @returns {{ run(b: 0 | 1): void; end(): void; }}
	 */
	function create_bidirectional_transition(node, fn, params, intro) {
		/**
		 * @type {TransitionOptions} */
		const options = { direction: 'both' };
		let config = fn(node, params, options);
		let t = intro ? 0 : 1;

		/**
		 * @type {Program | null} */
		let running_program = null;

		/**
		 * @type {PendingProgram | null} */
		let pending_program = null;
		let animation_name = null;

		/** @type {boolean} */
		let original_inert_value;

		/**
		 * @returns {void} */
		function clear_animation() {
			if (animation_name) delete_rule(node, animation_name);
		}

		/**
		 * @param {PendingProgram} program
		 * @param {number} duration
		 * @returns {Program}
		 */
		function init(program, duration) {
			const d = /** @type {Program['d']} */ (program.b - t);
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

		/**
		 * @param {INTRO | OUTRO} b
		 * @returns {void}
		 */
		function go(b) {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop,
				css
			} = config || null_transition;

			/**
			 * @type {PendingProgram} */
			const program = {
				start: now() + delay,
				b
			};

			if (!b) {
				// @ts-ignore todo: improve typings
				program.group = outros;
				outros.r += 1;
			}

			if ('inert' in node) {
				if (b) {
					if (original_inert_value !== undefined) {
						// aborted/reversed outro — restore previous inert value
						node.inert = original_inert_value;
					}
				} else {
					original_inert_value = /** @type {HTMLElement} */ (node).inert;
					node.inert = true;
				}
			}

			if (running_program || pending_program) {
				pending_program = program;
			} else {
				// if this is an intro, and there's a delay, we need to do
				// an initial tick and/or apply CSS animation immediately
				if (css) {
					clear_animation();
					animation_name = create_rule(node, t, b, duration, delay, easing, css);
				}
				if (b) tick(0, 1);
				running_program = init(program, duration);
				add_render_callback(() => dispatch(node, b, 'start'));
				loop((now) => {
					if (pending_program && now > pending_program.start) {
						running_program = init(pending_program, duration);
						pending_program = null;
						dispatch(node, running_program.b, 'start');
						if (css) {
							clear_animation();
							animation_name = create_rule(
								node,
								t,
								running_program.b,
								running_program.duration,
								0,
								easing,
								config.css
							);
						}
					}
					if (running_program) {
						if (now >= running_program.end) {
							tick((t = running_program.b), 1 - t);
							dispatch(node, running_program.b, 'end');
							if (!pending_program) {
								// we're done
								if (running_program.b) {
									// intro — we can tidy up immediately
									clear_animation();
								} else {
									// outro — needs to be coordinated
									if (!--running_program.group.r) run_all(running_program.group.c);
								}
							}
							running_program = null;
						} else if (now >= running_program.start) {
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
						const opts = { direction: b ? 'in' : 'out' };
						// @ts-ignore
						config = config(opts);
						go(b);
					});
				} else {
					go(b);
				}
			},
			end() {
				clear_animation();
				running_program = pending_program = null;
			}
		};
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {{}} */
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
					if (!(key in n)) to_null_out[key] = 1;
				}
				for (const key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}
				levels[i] = n;
			} else {
				for (const key in o) {
					accounted_for[key] = 1;
				}
			}
		}
		for (const key in to_null_out) {
			if (!(key in update)) update[key] = undefined;
		}
		return update;
	}

	function get_spread_object(spread_props) {
		return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
	}

	/** @returns {void} */
	function bind(component, name, callback) {
		const index = component.$$.props[name];
		if (index !== undefined) {
			component.$$.bound[index] = callback;
			callback(component.$$.ctx[index]);
		}
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
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

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
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
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
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
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify
	const PUBLIC_VERSION = '4';

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	var e=[{name:"baseline",style:'@import url(https://fonts.googleapis.com/css2?family=Share+Tech+Mono:wght@400;500;600;700;800;900&family=Roboto:ital,wght@0,400;0,500;0,700;0,900;1,400;1,500;1,700;1,900&display=swap);@import url(https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.13.0/tabler-icons.min.css);*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}:where([ws-x]){border-style:solid;border-width:0;border-color:var(--text-color-normal)}body,html{padding:0;margin:0;width:100%;height:100%;-webkit-tap-highlight-color:transparent}body[ws-x*="@theme:"]{background-color:var(--background)}[ws-x*="@theme:"]{color:var(--text-color-normal);font-family:var(--font);font-size:var(--font-size-normal)}body[ws-x~="@app"]{overflow:hidden;position:fixed;touch-action:pan-x pan-y}'},{name:"avatar",style:"ws-avatar{--color:transparent;--size:36px;display:inline-flex;overflow:hidden;border-radius:500px;align-items:center;justify-content:center;width:var(--size);height:var(--size);background-color:var(--color);color:var(--text-color-fill);vertical-align:text-bottom}ws-avatar>img{width:100%}"},{name:"badge",style:"ws-badge{--color:var(--primary);position:relative;display:inline-grid;overflow:visible}ws-badge::after{position:absolute;content:attr(ws-text);right:-10px;top:0;transform:translateY(-50%);background-color:var(--color);pointer-events:none;border-radius:20px;padding:4px;min-width:20px;height:20px;box-sizing:border-box;text-align:center;font-size:var(--text-size-subtitle);color:var(--text-color-fill);line-height:14px;z-index:5}"},{name:"button",style:':is(label,a):where([ws-x~="@button"]),button:where([ws-x~="[$flat]"],[ws-x~="[$fill]"],[ws-x~="[$outline]"]){--color:var(--text-color-normal);--fill-color:transaprent;--text-color:var(--color);border:0 solid var(--text-color);color:var(--text-color);font-family:var(--font);background-color:var(--fill-color);border-radius:4px;cursor:pointer;padding:8px 16px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;--ripple-color:var(--ripple-normal);overflow:hidden;position:relative;user-select:none}:is(label,a):where([ws-x~="@button"]):where(:not([disabled]))::after,button:where([ws-x~="[$flat]"],[ws-x~="[$fill]"],[ws-x~="[$outline]"]):where(:not([disabled]))::after{content:"";position:absolute;top:0;left:0;bottom:0;right:0;transition:background-color 150ms linear;pointer-events:none}:is(label,a):where([ws-x~="@button"]):where(:not([disabled])):active::after,button:where([ws-x~="[$flat]"],[ws-x~="[$fill]"],[ws-x~="[$outline]"]):where(:not([disabled])):active::after{transition:none;background-color:var(--ripple-color)}:is(label,a):where([ws-x~="@button"]):where([disabled]),button:where([ws-x~="[$flat]"],[ws-x~="[$fill]"],[ws-x~="[$outline]"]):where([disabled]){filter:saturate(10%) brightness(.7)}'},{name:"chip",style:'ws-chip{--color:var(--text-color-normal);--fill-color:transaprent;--text-color:var(--color);display:inline-flex;align-items:center;justify-content:center;border-radius:100px;padding:4px 12px;user-select:none;vertical-align:text-bottom;color:var(--text-color);background:var(--fill-color)}ws-chip:where([ws-x~="@click"]){cursor:pointer;--ripple-color:var(--ripple-normal);overflow:hidden;position:relative;user-select:none}ws-chip:where([ws-x~="@click"]):where(:not([disabled]))::after{content:"";position:absolute;top:0;left:0;bottom:0;right:0;transition:background-color 150ms linear;pointer-events:none}ws-chip:where([ws-x~="@click"]):where(:not([disabled])):active::after{transition:none;background-color:var(--ripple-color)}'},{name:"control",style:'label:where([ws-x~="@control"]){--color:var(--default);--border-color:var(--default);position:relative;display:inline-grid;grid-template-areas:"label label label"" start control end""extra extra extra";grid-template-rows:minmax(0,min-content) auto minmax(0,min-content);grid-template-columns:minmax(0,min-content) auto minmax(0,min-content);border:1px solid var(--border-color);border-radius:4px;user-select:none;overflow:hidden}label:where([ws-x~="@control"]):where([ws-error])::after{content:attr(ws-error);grid-row:3;grid-column:span 3;padding:4px;font-size:var(--text-size-info);background-color:var(--danger-ripple)}label:where([ws-x~="@control"]):focus-within{--border-color:var(--color)}label:where([ws-x~="@control"]):focus-within:where([ws-x~="[$flat]"])>:is(input,select){outline:2px solid var(--ripple-color);outline-offset:-2px}label:where([ws-x~="@control"]) :is(input,select,textarea):disabled{background-color:var(--disabled-background)}label:where([ws-x~="@control"])>:where(select){--color:var(--text-color-normal);border-width:0;padding:8px;min-height:36px;background-color:transparent;color:var(--color);font:var(--font);font-size:var(--text-size-normal);cursor:pointer;grid-area:control}label:where([ws-x~="@control"])>:where(input,textarea):focus,label:where([ws-x~="@control"])>:where(select):focus{outline:0}label:where([ws-x~="@control"])>:where(select) optgroup,label:where([ws-x~="@control"])>:where(select) option{background-color:var(--background-layer);border-color:var(--background-layer);color:var(--text-color-normal);font-size:var(--text-size-normal);font-family:Arial}label:where([ws-x~="@control"])>:where(input,textarea){border-width:0;background:0 0;color:var(--text-normal-color);font-family:var(--font);min-width:24px;min-height:36px;width:100%;height:100%;grid-area:control;padding:4px}label:where([ws-x~="@control"])>input[type=file]{position:relative;padding:0}label:where([ws-x~="@control"])>input[type=file]::file-selector-button{font-family:var(--font);height:100%;margin:0 4px 0 0;padding:4px;color:var(--text-normal-color);background-color:var(--background-layer);border-width:0;border-right:1px solid var(--border-color);text-decoration:underline}label:where([ws-x~="@control"])>:where([slot=label-text]){grid-area:label;padding:4px;display:flex;flex-direction:column;align-items:start;border-bottom:var(--border-size, 1px) solid var(--border-color);border-right:var(--border-size, 1px) solid var(--border-color);color:var(--color);width:min-content;white-space:nowrap;border-bottom-right-radius:4px}label:where([ws-x~="@control"])>:where([slot=label-text]):where([ws-hint])::after{font-size:var(--text-size-subtitle);content:attr(ws-hint);color:var(--text-color-secondary)}label:where([ws-x~="@control"])>:where([slot=start]){grid-area:start}label:where([ws-x~="@control"])>:where([slot=end]){grid-area:end}'},{name:"details",style:'details:where([ws-x]){--color:var(--default);border:0 solid var(--color);padding:4px;padding-left:calc(1em + 4px);border-radius:4px}details:where([ws-x])>summary{color:var(--color);position:relative;padding-left:1em;margin-left:-1em;cursor:pointer;user-select:none}details:where([ws-x])>summary::before{position:absolute;left:0;top:50%;bottom:0;width:1em;display:flex;align-items:center;justify-content:center;font-family:tabler-icons!important;speak:none;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;content:"";transform:translateY(-50%);transition:transform 100ms linear}details:where([ws-x])>summary::-webkit-details-marker,details:where([ws-x])>summary::marker{content:"";display:none}details:where([ws-x])[open]>summary::before{transform:translateY(-50%) rotate(90deg)}'},{name:"flex",style:"ws-flex{display:flex;flex-direction:column;gap:4px;padding:4px;overflow:hidden}ws-flex>*{flex-shrink:0}"},{name:"grid",style:"ws-grid{display:grid;overflow:hidden;gap:4px;padding:4px;grid-auto-rows:min-content}"},{name:"icon",style:"ws-icon{display:inline-block}ws-icon:where(:not(:empty))::before{margin-right:2px}ws-icon::before{font-family:tabler-icons!important;speak:none;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;line-height:1;display:contents;-webkit-font-smoothing:antialiased}"},{name:"link",style:"a:where([ws-x]){--color:var(--text-color-normal);--text-color:var(--color)}a:where([ws-x]),a:where([ws-x]):hover,a:where([ws-x]):visited{color:var(--text-color)}a:where([ws-x])[disabled]{pointer-events:none}"},{name:"modal",style:'ws-modal{--text-color:var(--text-color-normal);position:fixed;top:0;left:0;bottom:0;right:0;background-color:rgba(0,0,0,.55);z-index:100;color:var(--text-color-normal);cursor:default;visibility:hidden;transition:visibility var(--anim-time, 250ms) linear}ws-modal>label:first-child{position:absolute;width:100%;height:100%;cursor:pointer}ws-modal[ws-x~="[$show]"]{visibility:visible!important}ws-modal[ws-x~="[$show]"]>:where([ws-x~="@action"]),ws-modal[ws-x~="[$show]"]>:where([ws-x~="@menu"]){transform:translateX(0)}ws-modal[ws-x~="[$show]"]>:where([ws-x~="@select"]){transform:translateX(-50%) translateY(0)}ws-modal[ws-x~="[$show]"]>:where([ws-x~="@dialog"]){opacity:1}input[type=checkbox]:not(:checked)+ws-modal{visibility:hidden}input[type=checkbox]:checked+ws-modal{visibility:visible}ws-modal>:where(:not(label:first-child)){position:absolute;min-width:15vw}ws-modal>:where(:not(label:first-child)):where([ws-x~="@menu"]){top:0;left:0;height:100%;transform:translateX(-100%);transition:transform var(--anim-time, 250ms) linear}input[type=checkbox]:checked+ws-modal>:where(:not(label:first-child)):where([ws-x~="@action"]),input[type=checkbox]:checked+ws-modal>:where(:not(label:first-child)):where([ws-x~="@menu"]){transform:translateX(0)}ws-modal>:where(:not(label:first-child)):where([ws-x~="@action"]){top:0;right:0;height:100%;transform:translateX(100%);transition:transform var(--anim-time, 250ms) linear}ws-modal>:where(:not(label:first-child)):where([ws-x~="@select"]){top:0;left:50%;transform:translateX(-50%) translateY(-100%);max-height:75vh;max-width:min(90vw,720px);transition:transform var(--anim-time, 250ms) linear}input[type=checkbox]:checked+ws-modal>:where(:not(label:first-child)):where([ws-x~="@select"]){transform:translateX(-50%) translateY(0)}ws-modal>:where(:not(label:first-child)):where([ws-x~="@dialog"]){top:50%;left:50%;transform:translate(-50%,-50%);opacity:0;transition:opacity var(--anim-time, 250ms) linear}input[type=checkbox]:checked+ws-modal>:where(:not(label:first-child)):where([ws-x~="@dialog"]){opacity:1}'},{name:"notification",style:'ws-notification{--background-color:var(--background-layer);--color:var(--text-color-normal);background-color:var(--background-color);color:var(--color);padding:8px;display:inline-flex;flex-direction:row;justify-content:space-between;align-items:center;border-radius:4px;cursor:pointer;user-select:none;border:1px solid var(--text-color-secondary)}ws-notification[ws-x~="[$color"]{background-color:var(--color);color:var(--text-color-fill)}'},{name:"paper",style:'ws-paper{--color:var(--layer-border-color);display:grid;border-radius:4px;box-shadow:0 2px 4px var(--shadow-color);overflow:hidden;grid-template-columns:1fr;grid-template-rows:min-content auto min-content;grid-template-areas:"header""content""footer";background-color:var(--background-layer)}ws-paper::before{content:"";grid-area:header}ws-paper::after{content:"";grid-area:footer;pointer-events:none}ws-paper>:where([slot=content]){grid-area:content}ws-paper>:where([slot=header]){grid-area:header;font-size:var(--text-size-header)}ws-paper>:where([slot=footer]){grid-area:footer}'},{name:"popover",style:'ws-popover{display:grid;position:relative}ws-popover:not(:visibile)>:where([slot=content]){display:none}ws-popover>:where([slot=content]){position:absolute;z-index:25;display:none}ws-popover[ws-x~="[$show]"]>:where([slot=content]){display:block}ws-popover>input:where([type=checkbox]):checked+:where([slot=content]){display:block}ws-popover>input:where([type=checkbox]):not(:checked)+:where([slot=content]){display:none}'},{name:"progress",style:'label[ws-x~="@progress"]{--color:var(--text-color-normal);display:inline-grid;grid-template-columns:1fr;grid-template-rows:min-content auto;border-radius:4px;overflow:hidden;user-select:none}label[ws-x~="@progress"][ws-x~="[$row]"]{grid-template-columns:min-content auto;grid-template-rows:1fr}label[ws-x~="@progress"]>[ws-x~="[$progress-label]"]{padding:4px;display:flex;color:var(--color)}label[ws-x~="@progress"]>progress{min-height:20px;height:100%;width:100%;border:0;background-color:var(--background-layer)}label[ws-x~="@progress"]>progress::-moz-progress-bar{background-color:var(--color);border-radius:0}label[ws-x~="@progress"]>progress::-webkit-progress-bar{background-color:var(--background-layer);border-radius:0}label[ws-x~="@progress"]>progress::-webkit-progress-value{background-color:var(--color);border-radius:0}'},{name:"screen",style:'ws-screen{--stack:0;--screen-width:min(720px, 100%);display:grid;width:calc(100% - var(--sub-pixel-offset));height:calc(100% - 1px);overflow:hidden;position:fixed;top:0;left:0;z-index:200;background-color:rgba(0,0,0,.4);grid-template-columns:auto calc(var(--screen-width) - 16px*var(--stack)) auto;grid-template-areas:". content .";padding-top:calc(8px*var(--stack))}ws-screen[ws-x~="[$left]"]{grid-template-columns:calc(8px*var(--stack)) calc(var(--screen-width) - 16px*var(--stack)) auto}ws-screen>:where(*){grid-area:content;height:100%;overflow:hidden}'},{name:"spinner",style:"ws-circle-spinner,ws-hexagon-spinner{--size:100px;--color:var(--primary);--ripple-normal:var(--primary-ripple);width:var(--size);height:var(--size);display:inline-block}"},{name:"table",style:'table:where([ws-x]){--border-color:var(--color);border-spacing:0;position:relative;border-top:1px solid var(--color)}table:where([ws-x]) thead :is(td,th){color:var(--color);font-weight:700}table:where([ws-x]):where([ws-x~="[$header-fill]"]) thead :is(td,th){background-color:var(--color);color:var(--text-color-fill)}table:where([ws-x]) :is(td,th){padding:8px;white-space:nowrap;background-color:var(--background-layer);border-bottom:1px solid var(--color)}table:where([ws-x]) :where(th:first-child){position:sticky;left:0;z-index:10}table:where([ws-x]) :where(td:first-child,th:first-child){border-left:1px solid var(--color)}table:where([ws-x]) :where(td:last-child,th:last-child){border-right:1px solid var(--color)}'},{name:"tabs",style:'ws-tabs{--color:var(--primary);display:flex;flex-direction:row;justify-content:stretch;align-items:stretch;user-select:none;cursor:pointer;gap:2px;padding:2px}ws-tabs[ws-x~="[$vert]"]{flex-direction:column;justify-content:flex-start}ws-tabs[ws-x~="[$vert]"]>ws-tab{border-bottom-width:0;border-right-width:2px;flex-grow:0}ws-tabs[ws-x~="[$solid]"]>ws-tab:where([ws-x~="[$tab-selected]"]){color:var(--text-color-fill);background-color:var(--color)}ws-tabs>ws-tab{display:flex;justify-content:center;align-items:center;flex-grow:1;padding:8px;border-color:var(--text-color-secondary);border-width:0 0 2px;border-style:solid}ws-tabs>ws-tab:where([ws-x~="[$tab-selected]"]){color:var(--color);border-color:var(--color)}'},{name:"titlebar",style:'ws-titlebar{--color:var(--text-color-normal);--text-color:var(--color);--fill-color:transparent;display:grid;height:48px;grid-template-columns:min-content auto min-content;grid-template-areas:"menu title action";user-select:none;background-color:var(--fill-color);color:var(--text-color)}ws-titlebar:where(:not([ws-x~="[$fill]"])){border-bottom:1px solid var(--color, var(--text-color-normal))}ws-titlebar:where([ws-x~="[$fill]"]){--ripple-normal:var(--ripple-dark)!important}ws-titlebar>:where([slot=title]){grid-area:title}ws-titlebar>:where([slot=action]),ws-titlebar>:where([slot=menu]){grid-area:menu;--text-color-normal:var(--text-color)}ws-titlebar>:where([slot=action]){grid-area:action}'},{name:"toaster",style:'ws-toaster{position:fixed;z-index:100;display:inline-flex;flex-direction:column;padding:4px;gap:4px;height:min-content!important}ws-toaster[ws-x~="[$tl]"]{top:0;left:0}ws-toaster[ws-x~="[$tc]"]{top:0;left:50%;transform:translateX(-50%)}ws-toaster[ws-x~="[$tr]"]{top:0;right:0}ws-toaster[ws-x~="[$ml]"]{top:50%;left:0;transform:translateY(-50%)}ws-toaster[ws-x~="[$mr]"]{top:50%;right:0;transform:translateY(-50%)}ws-toaster[ws-x~="[$bl]"]{bottom:0;left:0}ws-toaster[ws-x~="[$bc]"]{bottom:0;left:50%;transform:translateX(-50%)}ws-toaster[ws-x~="[$br]"]{bottom:0;right:0}'},{name:"toggle",style:'label:where([ws-x~="@toggle"]){--color:var(--default);--ripple-color:var(--default-ripple);--border-color:var(--default);cursor:pointer;display:inline-flex;align-items:center;justify-content:space-between;padding:4px;border-radius:4px;border:1px solid var(--border-color);--ripple-color:var(--ripple-normal);overflow:hidden;position:relative;user-select:none}label:where([ws-x~="@toggle"]):where(:not([disabled]))::after{content:"";position:absolute;top:0;left:0;bottom:0;right:0;transition:background-color 150ms linear;pointer-events:none}label:where([ws-x~="@toggle"]):where(:not([disabled])):active::after{transition:none;background-color:var(--ripple-color)}label:where([ws-x~="@toggle"]):focus-within{--border-color:var(--color)}label:where([ws-x~="@toggle"]):focus-within:where([ws-x~="[$flat]"]){outline:2px solid var(--ripple-color);outline-offset:-2px}label:where([ws-x~="@toggle"])>input{position:relative;min-width:20px;min-height:20px;-webkit-appearance:none;appearance:none;margin:0}label:where([ws-x~="@toggle"])>input:focus{outline:0}label:where([ws-x~="@toggle"])>input:disabled{--color:var(--disabled-background)}label:where([ws-x~="@toggle"])>input:checked{color:var(--text-color-invert)}label:where([ws-x~="@toggle"])>input:checked::after{background-color:var(--color)}label:where([ws-x~="@toggle"])>input::after{content:"";position:absolute;font-size:18px;font-family:tabler-icons!important;speak:none;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;top:50%;left:50%;width:20px;height:20px;transform:translate(-50%,-50%);display:flex;border:1px solid var(--color);border-radius:4px;align-items:center;justify-content:center;overflow:hidden}label:where([ws-x~="@toggle"])>input[type=radio]::after{border-radius:50%}label:where([ws-x~="@toggle"])>input[type=checkbox]:disabled,label:where([ws-x~="@toggle"])>input[type=radio]:disabled::after{background-color:var(--disabled-background)}label:where([ws-x~="@toggle"])>input[type=radio]:checked::after{content:""}label:where([ws-x~="@toggle"])>input[type=checkbox]:checked::after{content:""}label:where([ws-x~="@toggle"])>input[type=checkbox]:where([ws-x~="@switch"]){position:relative;border:1px solid var(--color);height:24px;width:44px;border-radius:12px}label:where([ws-x~="@toggle"])>input[type=checkbox]:where([ws-x~="@switch"])::after{content:"";background-color:var(--text-color-secondary);position:absolute;width:18px;height:18px;border-radius:10px;top:2px;left:2px;transform:none;border-width:0;transition:left 100ms linear,color 100ms linear}label:where([ws-x~="@toggle"])>input[type=checkbox]:where([ws-x~="@switch"]):checked::after{background-color:var(--color);left:22px}'},{name:"tooltip",style:'ws-tooltip{position:relative;display:inline-grid;overflow:visible}ws-tooltip::after{position:absolute;content:attr(ws-text);left:50%;bottom:calc(100% + 2px);transform:translateX(-50%);height:20px;background-color:var(--background-layer);opacity:0;transition:opacity 100ms linear;pointer-events:none;border-radius:4px;border:1px solid var(--text-color-secondary);padding:2px 8px;font-size:var(--text-size-subtitle);width:60%;display:flex;align-items:center;justify-content:center;z-index:5}ws-tooltip:hover::after{opacity:1}ws-tooltip[ws-x~="[$bottom]"]::after{bottom:unset;top:calc(100% + 2px)}'},{name:"dark",style:'[ws-x~="@theme:dark"]{--font:Roboto;--text-light:white;--text-dark:black;--text-color-normal:var(--text-light);--text-color-secondary:#a0a0a0;--text-color-invert:var(--text-dark);--text-color-fill:var(--text-dark);--text-size-normal:14px;--text-size-title:18px;--text-size-header:16px;--text-size-info:13px;--text-size-subtitle:12px;--text-size-data:10px;--background:#161616;--background-layer:#333333;--layer-border-width:1px;--layer-border-color:#505050;--default:var(--text-color-normal);--default-ripple:var(--ripple-normal);--primary:#00aaff;--primary-ripple:#00aaff60;--secondary:#2fbc2f;--secondary-ripple:#2fbc2f60;--danger:#df5348;--danger-ripple:#df534860;--warning:#ffff00;--warning-ripple:#ffff0060;--accent:#ff4dff;--accent-ripple:#ff4dff60;--ripple-dark:#00000060;--ripple-light:#FFFFFF60;--ripple-normal:var(--ripple-light);--ripple-invert:var(--ripple-dark);--shadow-color:rgb(0, 0, 0, 0.25);--disabled-background:#606060;color-scheme:dark}'},{name:"light",style:'[ws-x~="@theme:light"]{--font:Roboto;--text-light:white;--text-dark:black;--text-color-normal:var(--text-dark);--text-color-secondary:#505050;--text-color-invert:var(--text-light);--text-color-fill:var(--text-light);--text-size-normal:14px;--text-size-title:18px;--text-size-header:16px;--text-size-info:13px;--text-size-subtitle:12px;--text-size-data:10px;--background:#e9e9e9;--background-layer:#ffffff;--layer-border-width:1px;--layer-border-color:#aaaaaa;--default:var(--text-color-normal);--default-ripple:var(--ripple-normal);--primary:#1d62d5;--primary-ripple:#1d62d560;--secondary:#128f12;--secondary-ripple:#128f1260;--danger:#F44336;--danger-ripple:#F4433660;--warning:#db990d;--warning-ripple:#db990d60;--accent:#cf00cf;--accent-ripple:#cf00cf60;--ripple-dark:#00000060;--ripple-light:#FFFFFF60;--ripple-normal:var(--ripple-dark);--ripple-invert:var(--ripple-light);--shadow-color:rgb(0, 0, 0, 0.25);--disabled-background:#c7c7c7}'},{name:"tron",style:'[ws-x~="@theme:tron"]{--font:Share Tech Mono;--text-light:white;--text-dark:black;--text-color-normal:var(--text-light);--text-color-secondary:#a0a0a0;--text-color-invert:var(--text-dark);--text-color-fill:var(--text-dark);--text-size-normal:14px;--text-size-title:18px;--text-size-header:16px;--text-size-info:13px;--text-size-subtitle:12px;--text-size-data:10px;--background:#030303;--background-layer:#04080C;--layer-border-width:1px;--layer-border-color:#00EEEE;--default:var(--text-color-normal);--default-ripple:var(--ripple-normal);--primary:#00aaff;--primary-ripple:#00aaff60;--secondary:#2fbc2f;--secondary-ripple:#2fbc2f60;--danger:#df5348;--danger-ripple:#df534860;--warning:#ffff00;--warning-ripple:#ffff0060;--accent:#ff4dff;--accent-ripple:#ff4dff60;--ripple-dark:#00000060;--ripple-light:#FFFFFF60;--ripple-normal:var(--ripple-light);--ripple-invert:var(--ripple-dark);--shadow-color:rgb(255, 255, 255, 0.25);--disabled-background:#606060;color-scheme:dark}'}];const r=document.head,t=Math.ceil(screen.width*devicePixelRatio*10)%10>=5;e.push({name:"correction",style:`body {--sub-pixel-offset:${t?1:0}px}`});for(const{name:t,style:o}of e){const e=document.createElement("style");e.setAttribute("ws-name",t),e.innerHTML=o,r.append(e);}const o=document.createElement("style");document.head.append(o);const a=o.sheet;o.setAttribute("ws-name","windstorm-generated");const l=document.createElement("style");l.setAttribute("ws-name","core macros"),l.setAttribute("ws-root",""),l.innerHTML='.ws-style {\n    --b: "border: {$}";--b\\.c: "border-color: {$}";--b\\.s: "border-style: {$}";--b\\.w: "border-width: {$}";--b\\.b: "border-bottom: {$}";--b\\.b\\.c: "border-bottom-color: {$}";--b\\.b\\.s: "border-bottom-style: {$}";--b\\.b\\.w: "border-bottom-width: {$}";--b\\.t: "border-top: {$}";--b\\.t\\.c: "border-top-color: {$}";--b\\.t\\.s: "border-top-style: {$}";--b\\.t\\.w: "border-top-width: {$}";--b\\.l: "border-left: {$}";--b\\.l\\.c: "border-left-color: {$}";--b\\.l\\.s: "border-left-style: {$}";--b\\.l\\.w: "border-left-width: {$}";--b\\.r: "border-right: {$}";--b\\.r\\.c: "border-right-color: {$}";--b\\.r\\.s: "border-right-style: {$}";--b\\.r\\.w: "border-right-width: {$}";--b\\.x: "border-left: {$}" "border-right: {$}";--b\\.y: "border-top: {$}" "border-bottom: {$}";--bg: "background: {$}";--bg\\.c: "background-color: {$}";--bg\\.img: "background-image: {$}";--bg\\.rep: "background-repeat: {$}";--bg\\.pos: "background-position: {$}";--bg\\.sz: "background-size: {$}";--c: "color: {$}";--col: "grid-column: {$}";--cur: "cursor: {$}";--disp: "display: {$}";--fl\\.cross: "align-items: {$}";--fl\\.dir: "flex-direction: {$}";--fl\\.main: "justify-content: {$}";--fl\\.wr: "flex-wrap: {$}";--font: "font-family: {$}";--gap: "gap: {$}";--gr\\.cols: "grid-template-columns: {$}";--gr\\.cols\\.a: "grid-auto-columns: {$}";--gr\\.flow: "grid-auto-flow: {$}";--gr\\.rows: "grid-template-rows: {$}";--gr\\.rows\\.a: "grid-auto-rows: {$}";--h: "height: {$}";--h\\.min: "min-height: {$}";--h\\.max: "max-height: {$}";--inset: "top: {$}" "left: {$}" "bottom: {$}" "right: {$}";--inset\\.x: "left: {$}" "right: {$}";--inset\\.y: "top: {$}" "bottom: {$}";--m: "margin: {$}";--m\\.b: "margin-bottom: {$}";--m\\.l: "margin-left: {$}";--m\\.r: "margin-right: {$}";--m\\.t: "margin-top: {$}";--outln: "outline: {$}";--over: "overflow: {$}";--over\\.x: "overflow-x: {$}";--over\\.y: "overflow-y: {$}";--p: "padding: {$}";--p\\.b: "padding-bottom: {$}";--p\\.l: "padding-left: {$}";--p\\.r: "padding-right: {$}";--p\\.t: "padding-top: {$}";--p\\.x: "padding-left: {$}" "padding-right: {$}";--p\\.y: "padding-top: {$}" "padding-bottom: {$}";--pos: "position: {$}";--r: "border-radius: {$}";--r\\.b: "border-bottom-left-radius: {$}" "border-bottom-right-radius: {$}";--r\\.bl: "border-bottom-left-radius: {$}";--r\\.br: "border-bottom-right-radius: {$}";--r\\.l: "border-top-left-radius: {$}" "border-bottom-left-radius: {$}";--r\\.r: "border-top-right-radius: {$}" "border-bottom-right-radius: {$}";--r\\.t: "border-top-left-radius: {$}" "border-top-right-radius: {$}";--r\\.tl: "border-top-left-radius: {$}";--r\\.tr: "border-top-right-radius: {$}";--row: "grid-row: {$}";--sel: "user-select: {$}";--sh\\.box: "box-shadow: {$}";--sh\\.text: "text-shadow: {$}";--t\\.a: "text-align: {$}";--t\\.br: "word-break: {$}";--t\\.c: "color: {$}";--t\\.dec: "text-decoration: {$}";--t\\.lh: "line-height: {$}";--t\\.over: "text-overflow: {$}";--t\\.sz: "font-size: {$}";--t\\.tf: "text-transform: {$}";--t\\.ws: "white-space: {$}";--t\\.wt: "font-weight: {$}";--tf: "transform: {$}";--tr: "transition: {$}";--vis: "visibility: {$}";--w: "width: {$}";--w\\.min: "min-width: {$}";--w\\.max: "max-width: {$}";--x: "left: {$}";---x: "right: {$}";--y: "top: {$}";---y: "bottom: {$}";--z: "z-index: {$}";\n    --fl-center: [fl.cross center] [fl.main center];\n    --flex: $="column" [disp flex] [fl.dir {$}];\n    --grid: $="row" [disp grid] [gr.flow {$}];\n    --hide: [disp none];\n    --invis: [vis hidden];\n    --\\$adorn: [disp flex] [fl.cross center] [fl.main center] [p 2px];\n    --\\$outline: [b.w 1px] [b.c @color];\n    --\\$color: [@color {$}] [@ripple-normal {$}-ripple];\n    --\\$compact: [p 0px 8px];\n    --\\$fill: [@text-color @text-color-fill] [@fill-color @color] [@ripple-color @ripple-dark];\n    --\\$flat: [b.w 0px] [@border-size 0px];\n    --\\$subtitle: [t.sz @text-size-subtitle] [flex] [fl.main center] [p 0px 4px];\n    --\\$title: [t.sz @text-size-title] [flex] [fl.main center] [p 4px];\n}',document.head.insertBefore(l,document.head.firstChild);const i=new RegExp([/\$="(?<def>[^"]+)"/,/\[(?<func>[\w\-\.]+)(\s+(?<arg>[^\]]+))?\]/,/\[(?<variable>@[\w\-\.]+)(\s+(?<string>[^\]]+))?\]/,/"(?<name>[\w\-]+)\s*:\s*(?<value>[^"]+?)"/].map((e=>e.source)).join("|"),"g"),n={},s={};window.styleMacro=n,window.macro=s,window.wsxSheet=a;const d=e=>void 0===e?"undefined":null===e?"null":`\`${e.replace(/\{\$\}/g,"${arg}")}\``;const c=document.createElement("template");c.innerHTML='\n<style>\n@keyframes hi{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}\ncircle{animation-name:hi;animation-iteration-count:infinite;animation-timing-function:linear;transform-origin:50% 50%;}\ncircle:nth-child(1){animation-duration:4s;}\ncircle:nth-child(2){animation-duration:3s;animation-direction:reverse;}\ncircle:nth-child(3){animation-duration:2s;}\n</style>\n<svg style="width:var(--size);height:var(--size)" viewBox="0 0 100 100"><circle stroke="var(--color)" cx="50" cy="50" stroke-width="4" fill="transparent" r="48" stroke-dasharray="0 37.7 75.4 75.4 75.4 75.4"/><circle stroke="var(--ripple-normal)" cx="50" cy="50" stroke-width="4" fill="transparent" r="40" stroke-dasharray="0 31.4 62.83 62.83 62.83 62.83"/><circle stroke="var(--color)" cx="50" cy="50" stroke-width="4" fill="transparent" r="32" stroke-dasharray="0 12.57 25.13 25.13 25.13 25.13 25.13 25.13 25.13 25.13"/></svg>',customElements.define("ws-circle-spinner",class extends HTMLElement{constructor(){super();const e=c.content.cloneNode(!0);this.attachShadow({mode:"closed"}).appendChild(e);}});const p=document.createElement("template");p.innerHTML='\n<style>\n@keyframes hi{from{transform:rotateY(0deg)}to{transform:rotateY(360deg)}}\npath{animation-name:hi;animation-iteration-count:infinite;animation-timing-function:linear;transform-origin:50% 50%;}\npath:nth-child(1){animation-duration:3s;}\npath:nth-child(2){animation-duration:2s;animation-direction:reverse;}\npath:nth-child(3){animation-duration:1s;}\n</style><svg style="width: var(--size); height: var(--size);" viewBox="0 0 100 100"><path stroke="var(--color)" stroke-width="4" fill="none" d="M91.57 26v48L50 98 8.43 74V26L50 2l41.57 24Z"/><path stroke="var(--ripple-normal)" stroke-width="4" fill="none" d="M81.177 32v36L50 86 18.823 68V32L50 14l31.177 18Z"/><path stroke="var(--color)" stroke-width="4" fill="none" d="M70.785 38v24L50 74 29.215 62V38L50 26l20.785 12Z"/></svg>',customElements.define("ws-hexagon-spinner",class extends HTMLElement{constructor(){super();const e=p.content.cloneNode(!0);this.attachShadow({mode:"closed"}).appendChild(e);}});const w=(()=>{const e={attr:document.currentScript.dataset.attr??"ws-x"},r={},t=document.querySelectorAll("[ws-root]"),o=Array.from(t).flatMap((e=>[...e.sheet.cssRules])).filter((e=>".ws-style"===e.selectorText)).flatMap((e=>Array.from(e.style,(r=>[r,e.style.getPropertyValue(r)]))));for(const[t,a]of o){const o=t.slice(2),l=[...a.matchAll(i)].map((({groups:e})=>({...e}))),c=l.find((e=>void 0!==e.def)),p=l.filter((e=>e!==c)),w=p.map((({name:e,variable:r})=>{if(void 0!==r){return `--${r.slice(1)}: var(--wsx\\\\.\\\\${r}\${varState}\\\\.\${size ?? ""}) !important`}return void 0===e?null:`${e}: var(--wsx\\\\.${e}\${varState}\\\\.\${size ?? ""}) !important`})).filter((e=>null!==e)),h=`:where([${e.attr}~="[${o}\${state}"], [${e.attr}~="[${o}\${state}]"])`,b=[...w,...p.filter((e=>void 0!==e.func)).map((e=>{const t=r[e.func];if(void 0===t)throw new Error(`Rule "${e.func}" was not defined before rule "${o}"`);return t})).flat(1)];n[o]=new Function('{ state = "", varState, sheet, size }',"sizer",`const selectorBase = \`${h}\${state}\`\n            const selector =\n                (size === undefined)\n                ? selectorBase\n                : selectorBase.replace(/ws-x~="\\[/g, s => \`\${s}\${size}|\`)\n            const css = sizer(size, \`\${selector} {\n${b.join(";")}\n}\`)\n            const rules = Array.from(sheet.cssRules)\n            const index =\n                (size === undefined)\n                ? rules.findLastIndex(rule => rule.media === undefined)\n                : rules.findLastIndex(\n                    rule => {\n                        return (\n                            rule.media !== undefined\n                            && rule.cssRules[0].selectorText > selector\n                        )\n                    }\n                )\n            sheet.insertRule(css, (index === -1) ? sheet.cssRules.length : index)`);const x=p.map((({name:e,value:r,func:t,arg:o,variable:a,string:l})=>{if(void 0!==e||void 0!==a){return `list.push([\`${void 0!==e?`--wsx.${e}\${varState}.\${size ?? ""}`:`--wsx.\\${a}\${varState}.\${size ?? ""}`}\`, format(${d(r??l)})])`}return `macro["${t}"]({list, format, macro, varState, arg: ${d(o)}, size})`})),f=new Function(`{ list, format, macro, varState = "", arg = ${JSON.stringify(c?.def)}, size }`,x.join("\n"));r[o]=b,s[o]=f;}return e})(),h=e=>e?.replace(/@([\w\-]+)/g,((e,r)=>`var(--${r})`)),b={},x={sm:"(max-width: 600px)",md:"(max-width: 1024px)",lg:"(min-width: 1025px)",lnd:"(orientation: landscape)",prt:"(orientation: portrait)"},f=(e,r)=>void 0===e?r:`@media screen and ${x[e]} { ${r} }`,m=new WeakMap,g=(e,r)=>{const{name:t,state:o,arg:l,size:i}=e.groups,d=`${t}${o??""}`;if(!0===t.startsWith("@"))return void r.push([`--${t.slice(1)}`,l]);if(void 0===s[t]){if(!0===t.startsWith("$"))return;return void console.warn(`No macro defined for ${t}`)}const c=o?.replace(/:|\|/g,"_")??"";((e,r,t)=>{const o=`${t.size??""}|${e}`;!0!==b[o]&&(n[r](t,f),b[o]=!0);})(d,t,{sheet:a,state:o,varState:c,size:i}),s[t]({list:r,format:h,macro:s,varState:c,arg:l?.trim(),size:i});},u=e=>{if(void 0===e.tagName)return;const r=e.getAttribute(w.attr),t=r?.matchAll(v)??[],o=m.get(e)??[],a=[];for(const e of t)g(e,a);const l=a.map((e=>e[0])),i=o.filter((e=>!1===l.includes(e)));for(const r of i)e.style.removeProperty(r);for(const[r,t]of a)e.style.setProperty(r,t);m.set(e,l);},v=/\[((?<size>\w+)\|)?(?<name>[\$@\w\-\.]+)(?<state>:[^\s]+)?(?<arg>[^\]]+?)?\]/g,y={childList(e){0!==e.addedNodes.length&&e.addedNodes.forEach((e=>{if(void 0===e.tagName)return;[e,...e.querySelectorAll("*")].forEach(u);}));},attributes(e){u(e.target);}};new MutationObserver((e=>e.forEach((e=>y[e.type](e))))).observe(document.body,{subtree:!0,attributes:!0,childList:!0,attributeFilter:[w.attr]});[document.body,...document.body.querySelectorAll("*")].forEach(u);var $={x:e=>Object.entries(e).reduce(((e,[r,t])=>(null==t||!1===t||e.push(((e,r)=>!0===e.startsWith("@")?!0===r?e:`${e}:${r}`:!0===r?`[${e}]`:`[${e} ${r}]`)(r,t)),e)),[]).join(" ")};

	// ws.custom("outline", (o) => ws.prop("outline", o))

	var wsx = (node, props) => {
	    const update = (props) => {
	        const { slot = null, ...goodProps } = props ?? {};
	        if (goodProps === null || goodProps === undefined) {
	            node.setAttribute("ws-x", null);
	            return
	        }
	        node.setAttribute(
	            "ws-x",
	            $.x(goodProps)
	        );
	        if (slot === null) {
	            node.removeAttribute("slot");
	            return
	        }
	        node.setAttribute("slot", slot);
	    };
	    update(props);
	    return { update }
	};

	var variant = ({ flat, fill, outline }, def = "$flat") => {
	    if (outline === true) {
	        return "$outline"
	    }
	    if (fill === true) {
	        return "$fill"
	    }
	    if (flat === true) {
	        return "$flat"
	    }
	    return def
	};

	/* src\control\button.svelte generated by Svelte v4.2.7 */

	function create_fragment$g(ctx) {
		let button;
		let wsx_action;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[9].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

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
						action_destroyer(wsx_action = wsx.call(null, button, /*wind*/ ctx[1])),
						listen(button, "click", stop_propagation(/*click_handler*/ ctx[10]))
					];

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

				if (!current || dirty & /*disabled*/ 1) {
					button.disabled = /*disabled*/ ctx[0];
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
				if (detaching) {
					detach(button);
				}

				if (default_slot) default_slot.d(detaching);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function instance$g($$self, $$props, $$invalidate) {
		let type;
		let wind;
		const omit_props_names = ["color","compact","disabled","fill","outline","flat"];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let { $$slots: slots = {}, $$scope } = $$props;
		let { color = false } = $$props;
		let { compact = false } = $$props;
		let { disabled } = $$props;
		let { fill = false } = $$props;
		let { outline = false } = $$props;
		let { flat = false } = $$props;

		function click_handler(event) {
			bubble.call(this, $$self, event);
		}

		$$self.$$set = $$new_props => {
			$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
			$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
			if ('color' in $$new_props) $$invalidate(2, color = $$new_props.color);
			if ('compact' in $$new_props) $$invalidate(3, compact = $$new_props.compact);
			if ('disabled' in $$new_props) $$invalidate(0, disabled = $$new_props.disabled);
			if ('fill' in $$new_props) $$invalidate(4, fill = $$new_props.fill);
			if ('outline' in $$new_props) $$invalidate(5, outline = $$new_props.outline);
			if ('flat' in $$new_props) $$invalidate(6, flat = $$new_props.flat);
			if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*fill, outline, flat*/ 112) {
				$$invalidate(7, type = variant({ fill, outline, flat }));
			}

			$$invalidate(1, wind = {
				[type]: true,
				"$color": color,
				$compact: compact,
				...$$restProps
			});
		};

		return [
			disabled,
			wind,
			color,
			compact,
			fill,
			outline,
			flat,
			type,
			$$scope,
			slots,
			click_handler
		];
	}

	class Button extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$g, create_fragment$g, not_equal, {
				color: 2,
				compact: 3,
				disabled: 0,
				fill: 4,
				outline: 5,
				flat: 6
			});
		}
	}

	/**
	Wraps a handler function for easy reuse.

	@param {Function} func The handler function to wrap
	*/
	const handler$ = (func) =>
	    (...args) =>
	        (_, ...extra) => func(...args, ...extra);

	/* src\layout\flex.svelte generated by Svelte v4.2.7 */

	function create_fragment$f(ctx) {
		let ws_flex;
		let wsx_action;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[8].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

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
					dispose = action_destroyer(wsx_action = wsx.call(null, ws_flex, /*wind*/ ctx[0]));
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
				if (detaching) {
					detach(ws_flex);
				}

				if (default_slot) default_slot.d(detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$f($$self, $$props, $$invalidate) {
		let wind;
		const omit_props_names = ["direction","pad","gap","cross","main","scrollable"];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let { $$slots: slots = {}, $$scope } = $$props;
		let { direction = false } = $$props;
		let { pad = false } = $$props;
		let { gap = false } = $$props;
		let { cross = "stretch" } = $$props;
		let { main = "start" } = $$props;
		let { scrollable = false } = $$props;

		$$self.$$set = $$new_props => {
			$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
			$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
			if ('direction' in $$new_props) $$invalidate(1, direction = $$new_props.direction);
			if ('pad' in $$new_props) $$invalidate(2, pad = $$new_props.pad);
			if ('gap' in $$new_props) $$invalidate(3, gap = $$new_props.gap);
			if ('cross' in $$new_props) $$invalidate(4, cross = $$new_props.cross);
			if ('main' in $$new_props) $$invalidate(5, main = $$new_props.main);
			if ('scrollable' in $$new_props) $$invalidate(6, scrollable = $$new_props.scrollable);
			if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
		};

		$$self.$$.update = () => {
			$$invalidate(0, wind = {
				"fl.dir": direction,
				"fl.cross": cross,
				"fl.main": main,
				p: pad,
				gap,
				over: scrollable === true ? "auto" : null,
				...$$restProps
			});
		};

		return [wind, direction, pad, gap, cross, main, scrollable, $$scope, slots];
	}

	class Flex extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$f, create_fragment$f, not_equal, {
				direction: 1,
				pad: 2,
				gap: 3,
				cross: 4,
				main: 5,
				scrollable: 6
			});
		}
	}

	/* src\control\tabs.svelte generated by Svelte v4.2.7 */

	function get_each_context$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[11] = list[i];
		child_ctx[13] = i;
		return child_ctx;
	}

	const get_default_slot_changes = dirty => ({
		tab: dirty & /*options*/ 1,
		selected: dirty & /*index*/ 4
	});

	const get_default_slot_context = ctx => ({
		tab: /*tab*/ ctx[11],
		selected: /*index*/ ctx[2] === /*i*/ ctx[13]
	});

	// (38:47)                  
	function fallback_block$2(ctx) {
		let t_value = /*tab*/ ctx[11].label + "";
		let t;

		return {
			c() {
				t = text(t_value);
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*options*/ 1 && t_value !== (t_value = /*tab*/ ctx[11].label + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (34:4) {#each options as tab, i}
	function create_each_block$2(ctx) {
		let ws_tab;
		let t;
		let wsx_action;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[9].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context);
		const default_slot_or_fallback = default_slot || fallback_block$2(ctx);

		return {
			c() {
				ws_tab = element("ws-tab");
				if (default_slot_or_fallback) default_slot_or_fallback.c();
				t = space();
				set_custom_element_data(ws_tab, "role", "tab");
			},
			m(target, anchor) {
				insert(target, ws_tab, anchor);

				if (default_slot_or_fallback) {
					default_slot_or_fallback.m(ws_tab, null);
				}

				append(ws_tab, t);
				current = true;

				if (!mounted) {
					dispose = [
						action_destroyer(wsx_action = wsx.call(null, ws_tab, {
							"$tab-selected": /*index*/ ctx[2] === /*i*/ ctx[13]
						})),
						listen(ws_tab, "click", function () {
							if (is_function(/*set*/ ctx[3](/*tab*/ ctx[11].value))) /*set*/ ctx[3](/*tab*/ ctx[11].value).apply(this, arguments);
						})
					];

					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;

				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope, options, index*/ 261)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[8],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, get_default_slot_changes),
							get_default_slot_context
						);
					}
				} else {
					if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*options*/ 1)) {
						default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
					}
				}

				if (wsx_action && is_function(wsx_action.update) && dirty & /*index*/ 4) wsx_action.update.call(null, {
					"$tab-selected": /*index*/ ctx[2] === /*i*/ ctx[13]
				});
			},
			i(local) {
				if (current) return;
				transition_in(default_slot_or_fallback, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot_or_fallback, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(ws_tab);
				}

				if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$e(ctx) {
		let ws_tabs;
		let wsx_action;
		let current;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*options*/ ctx[0]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				ws_tabs = element("ws-tabs");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				set_custom_element_data(ws_tabs, "role", "tablist");
			},
			m(target, anchor) {
				insert(target, ws_tabs, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ws_tabs, null);
					}
				}

				current = true;

				if (!mounted) {
					dispose = action_destroyer(wsx_action = wsx.call(null, ws_tabs, /*wind*/ ctx[1]));
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*index, set, options, $$scope*/ 269) {
					each_value = ensure_array_like(/*options*/ ctx[0]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$2(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(ws_tabs, null);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}

				if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 2) wsx_action.update.call(null, /*wind*/ ctx[1]);
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(ws_tabs);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$e($$self, $$props, $$invalidate) {
		let index;
		let wind;
		const omit_props_names = ["color","options","vertical","solid","value"];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let { $$slots: slots = {}, $$scope } = $$props;
		let { color = "@primary" } = $$props;
		let { options = [] } = $$props;
		let { vertical = false } = $$props;
		let { solid = false } = $$props;
		let { value } = $$props;

		const set = handler$(next => {
			if (value === next) {
				return;
			}

			$$invalidate(4, value = next);
		});

		$$self.$$set = $$new_props => {
			$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
			$$invalidate(10, $$restProps = compute_rest_props($$props, omit_props_names));
			if ('color' in $$new_props) $$invalidate(5, color = $$new_props.color);
			if ('options' in $$new_props) $$invalidate(0, options = $$new_props.options);
			if ('vertical' in $$new_props) $$invalidate(6, vertical = $$new_props.vertical);
			if ('solid' in $$new_props) $$invalidate(7, solid = $$new_props.solid);
			if ('value' in $$new_props) $$invalidate(4, value = $$new_props.value);
			if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*options, value*/ 17) {
				$$invalidate(2, index = options.findIndex(item => item.value === value));
			}

			$$invalidate(1, wind = {
				"$solid": solid,
				"$color": color,
				$vert: vertical,
				...$$restProps
			});
		};

		return [options, wind, index, set, value, color, vertical, solid, $$scope, slots];
	}

	class Tabs extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$e, create_fragment$e, not_equal, {
				color: 5,
				options: 0,
				vertical: 6,
				solid: 7,
				value: 4
			});
		}
	}

	/*
	Adapted from https://github.com/mattdesl
	Distributed under MIT License https://github.com/mattdesl/eases/blob/master/LICENSE.md
	*/

	/**
	 * https://svelte.dev/docs/svelte-easing
	 * @param {number} t
	 * @returns {number}
	 */
	function cubicOut(t) {
		const f = t - 1.0;
		return f * f * f + 1.0;
	}

	/**
	 * Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.
	 *
	 * https://svelte.dev/docs/svelte-transition#fly
	 * @param {Element} node
	 * @param {import('./public').FlyParams} [params]
	 * @returns {import('./public').TransitionConfig}
	 */
	function fly(
		node,
		{ delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}
	) {
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
			opacity: ${target_opacity - od * u}`
		};
	}

	/* src\data-display\table.svelte generated by Svelte v4.2.7 */

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[7] = list[i];
		child_ctx[9] = i;
		return child_ctx;
	}

	const get_row_slot_changes$1 = dirty => ({ row: dirty & /*data*/ 1 });

	const get_row_slot_context$1 = ctx => ({
		row: /*row*/ ctx[7],
		rowNum: /*rowNum*/ ctx[9]
	});

	const get_empty_row_slot_changes = dirty => ({});
	const get_empty_row_slot_context = ctx => ({ rowNum: /*rowNum*/ ctx[9] });
	const get_header_slot_changes$3 = dirty => ({});
	const get_header_slot_context$3 = ctx => ({});

	// (19:28)              
	function fallback_block_1$1(ctx) {
		let tr;

		return {
			c() {
				tr = element("tr");
				tr.innerHTML = `<th>No Header Template</th>`;
			},
			m(target, anchor) {
				insert(target, tr, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(tr);
				}
			}
		};
	}

	// (29:12) {:else}
	function create_else_block$3(ctx) {
		let current;
		const row_slot_template = /*#slots*/ ctx[5].row;
		const row_slot = create_slot(row_slot_template, ctx, /*$$scope*/ ctx[4], get_row_slot_context$1);
		const row_slot_or_fallback = row_slot || fallback_block$1();

		return {
			c() {
				if (row_slot_or_fallback) row_slot_or_fallback.c();
			},
			m(target, anchor) {
				if (row_slot_or_fallback) {
					row_slot_or_fallback.m(target, anchor);
				}

				current = true;
			},
			p(ctx, dirty) {
				if (row_slot) {
					if (row_slot.p && (!current || dirty & /*$$scope, data*/ 17)) {
						update_slot_base(
							row_slot,
							row_slot_template,
							ctx,
							/*$$scope*/ ctx[4],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
							: get_slot_changes(row_slot_template, /*$$scope*/ ctx[4], dirty, get_row_slot_changes$1),
							get_row_slot_context$1
						);
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(row_slot_or_fallback, local);
				current = true;
			},
			o(local) {
				transition_out(row_slot_or_fallback, local);
				current = false;
			},
			d(detaching) {
				if (row_slot_or_fallback) row_slot_or_fallback.d(detaching);
			}
		};
	}

	// (27:12) {#if row === undefined}
	function create_if_block$4(ctx) {
		let current;
		const empty_row_slot_template = /*#slots*/ ctx[5]["empty-row"];
		const empty_row_slot = create_slot(empty_row_slot_template, ctx, /*$$scope*/ ctx[4], get_empty_row_slot_context);

		return {
			c() {
				if (empty_row_slot) empty_row_slot.c();
			},
			m(target, anchor) {
				if (empty_row_slot) {
					empty_row_slot.m(target, anchor);
				}

				current = true;
			},
			p(ctx, dirty) {
				if (empty_row_slot) {
					if (empty_row_slot.p && (!current || dirty & /*$$scope*/ 16)) {
						update_slot_base(
							empty_row_slot,
							empty_row_slot_template,
							ctx,
							/*$$scope*/ ctx[4],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
							: get_slot_changes(empty_row_slot_template, /*$$scope*/ ctx[4], dirty, get_empty_row_slot_changes),
							get_empty_row_slot_context
						);
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(empty_row_slot, local);
				current = true;
			},
			o(local) {
				transition_out(empty_row_slot, local);
				current = false;
			},
			d(detaching) {
				if (empty_row_slot) empty_row_slot.d(detaching);
			}
		};
	}

	// (30:48)                      
	function fallback_block$1(ctx) {
		let tr;
		let t1;

		return {
			c() {
				tr = element("tr");
				tr.innerHTML = `<td>No Row Template</td>`;
				t1 = space();
			},
			m(target, anchor) {
				insert(target, tr, anchor);
				insert(target, t1, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(tr);
					detach(t1);
				}
			}
		};
	}

	// (26:8) {#each data as row, rowNum}
	function create_each_block$1(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block$4, create_else_block$3];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*row*/ ctx[7] === undefined) return 0;
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
			p(ctx, dirty) {
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
				if (detaching) {
					detach(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};
	}

	function create_fragment$d(ctx) {
		let table;
		let thead;
		let t;
		let tbody;
		let wsx_action;
		let current;
		let mounted;
		let dispose;
		const header_slot_template = /*#slots*/ ctx[5].header;
		const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[4], get_header_slot_context$3);
		const header_slot_or_fallback = header_slot || fallback_block_1$1();
		let each_value = ensure_array_like(/*data*/ ctx[0]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				table = element("table");
				thead = element("thead");
				if (header_slot_or_fallback) header_slot_or_fallback.c();
				t = space();
				tbody = element("tbody");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
			},
			m(target, anchor) {
				insert(target, table, anchor);
				append(table, thead);

				if (header_slot_or_fallback) {
					header_slot_or_fallback.m(thead, null);
				}

				append(table, t);
				append(table, tbody);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(tbody, null);
					}
				}

				current = true;

				if (!mounted) {
					dispose = action_destroyer(wsx_action = wsx.call(null, table, /*wind*/ ctx[1]));
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
							: get_slot_changes(header_slot_template, /*$$scope*/ ctx[4], dirty, get_header_slot_changes$3),
							get_header_slot_context$3
						);
					}
				}

				if (dirty & /*$$scope, data, undefined*/ 17) {
					each_value = ensure_array_like(/*data*/ ctx[0]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$1(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(tbody, null);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}

				if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 2) wsx_action.update.call(null, /*wind*/ ctx[1]);
			},
			i(local) {
				if (current) return;
				transition_in(header_slot_or_fallback, local);

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				transition_out(header_slot_or_fallback, local);
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(table);
				}

				if (header_slot_or_fallback) header_slot_or_fallback.d(detaching);
				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$d($$self, $$props, $$invalidate) {
		let wind;
		const omit_props_names = ["color","fillHeader","data"];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let { $$slots: slots = {}, $$scope } = $$props;
		let { color = false } = $$props;
		let { fillHeader = false } = $$props;
		let { data = [] } = $$props;

		$$self.$$set = $$new_props => {
			$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
			$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
			if ('color' in $$new_props) $$invalidate(2, color = $$new_props.color);
			if ('fillHeader' in $$new_props) $$invalidate(3, fillHeader = $$new_props.fillHeader);
			if ('data' in $$new_props) $$invalidate(0, data = $$new_props.data);
			if ('$$scope' in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
		};

		$$self.$$.update = () => {
			$$invalidate(1, wind = {
				"$color": color,
				"$header-fill": fillHeader,
				...$$restProps
			});
		};

		return [data, wind, color, fillHeader, $$scope, slots];
	}

	class Table extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$d, create_fragment$d, not_equal, { color: 2, fillHeader: 3, data: 0 });
		}
	}

	/* src\info\icon.svelte generated by Svelte v4.2.7 */

	function create_fragment$c(ctx) {
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
					dispose = action_destroyer(wsx_action = wsx.call(null, ws_icon, /*$$restProps*/ ctx[1]));
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
				if (detaching) {
					detach(ws_icon);
				}

				if (default_slot) default_slot.d(detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$c($$self, $$props, $$invalidate) {
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
			init(this, options, instance$c, create_fragment$c, safe_not_equal, { name: 0 });
		}
	}

	/* src\info\titlebar.svelte generated by Svelte v4.2.7 */
	const get_action_slot_changes$1 = dirty => ({});
	const get_action_slot_context$1 = ctx => ({});
	const get_title_slot_changes = dirty => ({});
	const get_title_slot_context = ctx => ({});
	const get_menu_slot_changes = dirty => ({});
	const get_menu_slot_context = ctx => ({});

	function create_fragment$b(ctx) {
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
		const action_slot = create_slot(action_slot_template, ctx, /*$$scope*/ ctx[3], get_action_slot_context$1);

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
					dispose = action_destroyer(wsx_action = wsx.call(null, ws_titlebar, /*wind*/ ctx[0]));
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
							: get_slot_changes(action_slot_template, /*$$scope*/ ctx[3], dirty, get_action_slot_changes$1),
							get_action_slot_context$1
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
				if (detaching) {
					detach(ws_titlebar);
				}

				if (menu_slot) menu_slot.d(detaching);
				if (title_slot) title_slot.d(detaching);
				if (action_slot) action_slot.d(detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$b($$self, $$props, $$invalidate) {
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
				"$color": color,
				"$fill": fill,
				...$$restProps
			});
		};

		return [wind, color, fill, $$scope, slots];
	}

	class Titlebar extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$b, create_fragment$b, safe_not_equal, { color: 1, fill: 2 });
		}
	}

	/* src\layout\paper.svelte generated by Svelte v4.2.7 */
	const get_footer_slot_changes$1 = dirty => ({});
	const get_footer_slot_context$1 = ctx => ({});
	const get_content_slot_changes = dirty => ({});
	const get_content_slot_context = ctx => ({ slot: "content" });
	const get_header_slot_changes$2 = dirty => ({});
	const get_header_slot_context$2 = ctx => ({});

	// (41:4) {:else}
	function create_else_block$2(ctx) {
		let switch_instance;
		let switch_instance_anchor;
		let current;
		const switch_instance_spread_levels = [/*layoutProps*/ ctx[2], { slot: "content" }];
		var switch_value = /*layout*/ ctx[0];

		function switch_props(ctx, dirty) {
			let switch_instance_props = {
				$$slots: { default: [create_default_slot$6] },
				$$scope: { ctx }
			};

			if (dirty !== undefined && dirty & /*layoutProps*/ 4) {
				switch_instance_props = get_spread_update(switch_instance_spread_levels, [
					get_spread_object(/*layoutProps*/ ctx[2]),
					switch_instance_spread_levels[1]
				]);
			} else {
				for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
					switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
				}
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
						switch_instance = construct_svelte_component(switch_value, switch_props(ctx, dirty));
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					const switch_instance_changes = (dirty & /*layoutProps*/ 4)
					? get_spread_update(switch_instance_spread_levels, [
							get_spread_object(/*layoutProps*/ ctx[2]),
							switch_instance_spread_levels[1]
						])
					: {};

					if (dirty & /*$$scope*/ 1024) {
						switch_instance_changes.$$scope = { dirty, ctx };
					}

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
				if (detaching) {
					detach(switch_instance_anchor);
				}

				if (switch_instance) destroy_component(switch_instance, detaching);
			}
		};
	}

	// (39:4) {#if $$slots.content}
	function create_if_block$3(ctx) {
		let current;
		const content_slot_template = /*#slots*/ ctx[9].content;
		const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[10], get_content_slot_context);

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
							: get_slot_changes(content_slot_template, /*$$scope*/ ctx[10], dirty, get_content_slot_changes),
							get_content_slot_context
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

	// (42:8) <svelte:component this={layout} {...layoutProps} slot="content">
	function create_default_slot$6(ctx) {
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

	function create_fragment$a(ctx) {
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
		const if_block_creators = [create_if_block$3, create_else_block$2];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*$$slots*/ ctx[3].content) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		const footer_slot_template = /*#slots*/ ctx[9].footer;
		const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[10], get_footer_slot_context$1);

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
					dispose = action_destroyer(wsx_action = wsx.call(null, ws_paper, /*wind*/ ctx[1]));
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
							: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[10], dirty, get_footer_slot_changes$1),
							get_footer_slot_context$1
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
				if (detaching) {
					detach(ws_paper);
				}

				if (header_slot) header_slot.d(detaching);
				if_blocks[current_block_type_index].d();
				if (footer_slot) footer_slot.d(detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$a($$self, $$props, $$invalidate) {
		let props;
		let layoutProps;
		let wind;
		const omit_props_names = ["color","card","square","layout","scrollable"];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let { $$slots: slots = {}, $$scope } = $$props;
		const $$slots = compute_slots(slots);
		let { color } = $$props;
		let { card = false } = $$props;
		let { square = false } = $$props;
		let { layout = Flex } = $$props;
		let { scrollable = true } = $$props;

		$$self.$$set = $$new_props => {
			$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
			$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
			if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
			if ('card' in $$new_props) $$invalidate(5, card = $$new_props.card);
			if ('square' in $$new_props) $$invalidate(6, square = $$new_props.square);
			if ('layout' in $$new_props) $$invalidate(0, layout = $$new_props.layout);
			if ('scrollable' in $$new_props) $$invalidate(7, scrollable = $$new_props.scrollable);
			if ('$$scope' in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
		};

		$$self.$$.update = () => {
			$$invalidate(8, props = Object.entries($$restProps).reduce(
				(p, [key, value]) => {
					const [target, name] = key.startsWith("l-") === true
					? [p.layout, key.slice(2)]
					: [p.paper, key];

					target[name] = value;
					return p;
				},
				{ layout: {}, paper: {} }
			));

			if ($$self.$$.dirty & /*scrollable, props*/ 384) {
				$$invalidate(2, layoutProps = {
					over: scrollable ? "auto" : false,
					...props.layout
				});
			}

			if ($$self.$$.dirty & /*color, card, square, props*/ 368) {
				$$invalidate(1, wind = {
					"$color": color,
					"$outline": card,
					r: square && "0px",
					...props.paper
				});
			}
		};

		return [
			layout,
			wind,
			layoutProps,
			$$slots,
			color,
			card,
			square,
			scrollable,
			props,
			slots,
			$$scope
		];
	}

	class Paper extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$a, create_fragment$a, not_equal, {
				color: 4,
				card: 5,
				square: 6,
				layout: 0,
				scrollable: 7
			});
		}
	}

	/* src\layout\drawer.svelte generated by Svelte v4.2.7 */
	const get_header_slot_changes$1 = dirty => ({});
	const get_header_slot_context$1 = ctx => ({ slot: "header" });
	const get_footer_slot_changes = dirty => ({});
	const get_footer_slot_context = ctx => ({ slot: "footer" });

	// (44:4) <Paper {...$$restProps}>
	function create_default_slot$5(ctx) {
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

	// (45:8) 
	function create_header_slot$3(ctx) {
		let current;
		const header_slot_template = /*#slots*/ ctx[5].header;
		const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[7], get_header_slot_context$1);

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
							: get_slot_changes(header_slot_template, /*$$scope*/ ctx[7], dirty, get_header_slot_changes$1),
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

	// (47:8) 
	function create_footer_slot$1(ctx) {
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

	function create_fragment$9(ctx) {
		let wind_drawer_container;
		let paper;
		let wsx_action;
		let wind_drawer_container_transition;
		let current;
		let mounted;
		let dispose;
		const paper_spread_levels = [/*$$restProps*/ ctx[2]];

		let paper_props = {
			$$slots: {
				footer: [create_footer_slot$1],
				header: [create_header_slot$3],
				default: [create_default_slot$5]
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
				create_component(paper.$$.fragment);
				set_custom_element_data(wind_drawer_container, "role", "menubar");
			},
			m(target, anchor) {
				insert(target, wind_drawer_container, anchor);
				mount_component(paper, wind_drawer_container, null);
				current = true;

				if (!mounted) {
					dispose = [
						action_destroyer(wsx_action = wsx.call(null, wind_drawer_container, /*container*/ ctx[0])),
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

				if (local) {
					add_render_callback(() => {
						if (!current) return;
						if (!wind_drawer_container_transition) wind_drawer_container_transition = create_bidirectional_transition(wind_drawer_container, /*trick*/ ctx[1], {}, true);
						wind_drawer_container_transition.run(1);
					});
				}

				current = true;
			},
			o(local) {
				transition_out(paper.$$.fragment, local);

				if (local) {
					if (!wind_drawer_container_transition) wind_drawer_container_transition = create_bidirectional_transition(wind_drawer_container, /*trick*/ ctx[1], {}, false);
					wind_drawer_container_transition.run(0);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(wind_drawer_container);
				}

				destroy_component(paper);
				if (detaching && wind_drawer_container_transition) wind_drawer_container_transition.end();
				mounted = false;
				run_all(dispose);
			}
		};
	}

	const defs = {
		select: {
			"@select": true,
			"w.min": "35vw",
			grid: true,
			over: "hidden"
		},
		menu: { "@menu": true },
		action: { "@action": true }
	};

	function instance$9($$self, $$props, $$invalidate) {
		let container;
		const omit_props_names = ["height","type"];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let { $$slots: slots = {}, $$scope } = $$props;
		let { height } = $$props;
		let { type = "menu" } = $$props;
		const trick = (node, options) => ({ delay: 0, duration: 250, css: () => "" });

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

		return [container, trick, $$restProps, height, type, slots, click_handler, $$scope];
	}

	class Drawer extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$9, create_fragment$9, not_equal, { height: 3, type: 4 });
		}
	}

	/* src\layout\grid.svelte generated by Svelte v4.2.7 */

	function create_fragment$8(ctx) {
		let ws_grid;
		let wsx_action;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[10].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

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
					dispose = action_destroyer(wsx_action = wsx.call(null, ws_grid, /*wind*/ ctx[0]));
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[9],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
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
				if (detaching) {
					detach(ws_grid);
				}

				if (default_slot) default_slot.d(detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$8($$self, $$props, $$invalidate) {
		let wind;
		const omit_props_names = ["direction","pad","gap","cols","rows","autoCol","autoRow","scrollable"];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let { $$slots: slots = {}, $$scope } = $$props;
		let { direction = false } = $$props;
		let { pad = false } = $$props;
		let { gap = false } = $$props;
		let { cols = null } = $$props;
		let { rows = null } = $$props;
		let { autoCol = false } = $$props;
		let { autoRow = false } = $$props;
		let { scrollable = false } = $$props;

		$$self.$$set = $$new_props => {
			$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
			$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
			if ('direction' in $$new_props) $$invalidate(1, direction = $$new_props.direction);
			if ('pad' in $$new_props) $$invalidate(2, pad = $$new_props.pad);
			if ('gap' in $$new_props) $$invalidate(3, gap = $$new_props.gap);
			if ('cols' in $$new_props) $$invalidate(4, cols = $$new_props.cols);
			if ('rows' in $$new_props) $$invalidate(5, rows = $$new_props.rows);
			if ('autoCol' in $$new_props) $$invalidate(6, autoCol = $$new_props.autoCol);
			if ('autoRow' in $$new_props) $$invalidate(7, autoRow = $$new_props.autoRow);
			if ('scrollable' in $$new_props) $$invalidate(8, scrollable = $$new_props.scrollable);
			if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
		};

		$$self.$$.update = () => {
			$$invalidate(0, wind = {
				"gr.flow": direction,
				"gr.cols": cols?.join?.(" ") ?? cols ?? false,
				"gr.rows": rows?.join?.(" ") ?? rows ?? false,
				"gr.cols.a": autoCol,
				"gr.rows.a": autoRow,
				p: pad,
				gap,
				over: scrollable === true ? "auto" : null,
				...$$restProps
			});
		};

		return [
			wind,
			direction,
			pad,
			gap,
			cols,
			rows,
			autoCol,
			autoRow,
			scrollable,
			$$scope,
			slots
		];
	}

	class Grid extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$8, create_fragment$8, not_equal, {
				direction: 1,
				pad: 2,
				gap: 3,
				cols: 4,
				rows: 5,
				autoCol: 6,
				autoRow: 7,
				scrollable: 8
			});
		}
	}

	/* src\layout\modal.svelte generated by Svelte v4.2.7 */

	function create_if_block$2(ctx) {
		let ws_modal;
		let switch_instance;
		let current;
		let mounted;
		let dispose;

		const switch_instance_spread_levels = [
			/*modalProps*/ ctx[1],
			{ close: /*close*/ ctx[5] },
			{ closeToTop: /*closeToTop*/ ctx[6] }
		];

		var switch_value = /*component*/ ctx[0];

		function switch_props(ctx, dirty) {
			let switch_instance_props = {};

			if (dirty !== undefined && dirty & /*modalProps, close, closeToTop*/ 98) {
				switch_instance_props = get_spread_update(switch_instance_spread_levels, [
					dirty & /*modalProps*/ 2 && get_spread_object(/*modalProps*/ ctx[1]),
					dirty & /*close*/ 32 && { close: /*close*/ ctx[5] },
					dirty & /*closeToTop*/ 64 && { closeToTop: /*closeToTop*/ ctx[6] }
				]);
			} else {
				for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
					switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
				}
			}

			return { props: switch_instance_props };
		}

		if (switch_value) {
			switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
			/*switch_instance_binding*/ ctx[10](switch_instance);
		}

		return {
			c() {
				ws_modal = element("ws-modal");
				if (switch_instance) create_component(switch_instance.$$.fragment);
				set_custom_element_data(ws_modal, "role", "dialog");
			},
			m(target, anchor) {
				insert(target, ws_modal, anchor);
				if (switch_instance) mount_component(switch_instance, ws_modal, null);
				current = true;

				if (!mounted) {
					dispose = listen(ws_modal, "click", /*cancel*/ ctx[7]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
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
						switch_instance = construct_svelte_component(switch_value, switch_props(ctx, dirty));
						/*switch_instance_binding*/ ctx[10](switch_instance);
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, ws_modal, null);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					const switch_instance_changes = (dirty & /*modalProps, close, closeToTop*/ 98)
					? get_spread_update(switch_instance_spread_levels, [
							dirty & /*modalProps*/ 2 && get_spread_object(/*modalProps*/ ctx[1]),
							dirty & /*close*/ 32 && { close: /*close*/ ctx[5] },
							dirty & /*closeToTop*/ 64 && { closeToTop: /*closeToTop*/ ctx[6] }
						])
					: {};

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
				if (detaching) {
					detach(ws_modal);
				}

				/*switch_instance_binding*/ ctx[10](null);
				if (switch_instance) destroy_component(switch_instance);
				mounted = false;
				dispose();
			}
		};
	}

	function create_fragment$7(ctx) {
		let input;
		let t;
		let if_block_anchor;
		let current;
		let if_block = /*resolver*/ ctx[2] !== null && create_if_block$2(ctx);

		return {
			c() {
				input = element("input");
				t = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				attr(input, "type", "checkbox");
				attr(input, "ws-x", "[disp none]");
			},
			m(target, anchor) {
				insert(target, input, anchor);
				/*input_binding*/ ctx[9](input);
				insert(target, t, anchor);
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
						if_block = create_if_block$2(ctx);
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
				if (detaching) {
					detach(input);
					detach(t);
					detach(if_block_anchor);
				}

				/*input_binding*/ ctx[9](null);
				if (if_block) if_block.d(detaching);
			}
		};
	}

	let topClose = null;

	function instance$7($$self, $$props, $$invalidate) {
		let { component } = $$props;
		let modalProps = null;
		let resolver = null;
		let displayed = null;

		const close = value => {
			resolver(value);
			$$invalidate(2, resolver = null);
			$$invalidate(1, modalProps = null);
			$$invalidate(4, visible.checked = false, visible);

			if (topClose !== close) {
				return;
			}

			topClose = null;
		};

		const closeToTop = value => {
			topClose(value);
		};

		const cancel = () => displayed.cancel?.();

		const show = props => new Promise(async resolve => {
				$$invalidate(1, modalProps = props ?? {});
				$$invalidate(2, resolver = resolve);
				topClose = topClose ?? close;
				await tick();
				setTimeout(() => $$invalidate(4, visible.checked = true, visible), 0);
			});

		let visible = null;

		function input_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				visible = $$value;
				$$invalidate(4, visible);
			});
		}

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
			visible,
			close,
			closeToTop,
			cancel,
			show,
			input_binding,
			switch_instance_binding
		];
	}

	class Modal extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$7, create_fragment$7, not_equal, { component: 0, show: 8 });
		}

		get show() {
			return this.$$.ctx[8];
		}
	}

	/* src\layout\screen.svelte generated by Svelte v4.2.7 */

	function create_fragment$6(ctx) {
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
					dispose = action_destroyer(wsx_action = wsx.call(null, ws_screen, /*wind*/ ctx[0]));
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

				if (local) {
					add_render_callback(() => {
						if (!current) return;
						if (!ws_screen_transition) ws_screen_transition = create_bidirectional_transition(ws_screen, fly, /*animation*/ ctx[1], true);
						ws_screen_transition.run(1);
					});
				}

				current = true;
			},
			o(local) {
				transition_out(default_slot, local);

				if (local) {
					if (!ws_screen_transition) ws_screen_transition = create_bidirectional_transition(ws_screen, fly, /*animation*/ ctx[1], false);
					ws_screen_transition.run(0);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(ws_screen);
				}

				if (default_slot) default_slot.d(detaching);
				if (detaching && ws_screen_transition) ws_screen_transition.end();
				mounted = false;
				dispose();
			}
		};
	}

	const ctxStack = Symbol("stack context");

	function instance$6($$self, $$props, $$invalidate) {
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
				"@stack": stack.toString(),
				"@screen-width": width,
				"bg.c": "transparent",
				...$$restProps
			});
		};

		return [wind, animation, width, $$scope, slots];
	}

	class Screen extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$6, create_fragment$6, not_equal, { width: 2 });
		}
	}

	/* src\text.svelte generated by Svelte v4.2.7 */

	function create_fragment$5(ctx) {
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
					dispose = action_destroyer(wsx_action = wsx.call(null, span, /*wind*/ ctx[0]));
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
				if (detaching) {
					detach(span);
				}

				if (default_slot) default_slot.d(detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$5($$self, $$props, $$invalidate) {
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

			init(this, options, instance$5, create_fragment$5, not_equal, {
				title: 1,
				subtitle: 2,
				block: 3,
				adorn: 4
			});
		}
	}

	const subscriber_queue = [];

	/**
	 * Creates a `Readable` store that allows reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#readable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Readable<T>}
	 */
	function readable(value, start) {
		return {
			subscribe: writable(value, start).subscribe
		};
	}

	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#writable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Writable<T>}
	 */
	function writable(value, start = noop) {
		/** @type {import('./public.js').Unsubscriber} */
		let stop;
		/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
		const subscribers = new Set();
		/** @param {T} new_value
		 * @returns {void}
		 */
		function set(new_value) {
			if (safe_not_equal(value, new_value)) {
				value = new_value;
				if (stop) {
					// store is ready
					const run_queue = !subscriber_queue.length;
					for (const subscriber of subscribers) {
						subscriber[1]();
						subscriber_queue.push(subscriber, value);
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

		/**
		 * @param {import('./public.js').Updater<T>} fn
		 * @returns {void}
		 */
		function update(fn) {
			set(fn(value));
		}

		/**
		 * @param {import('./public.js').Subscriber<T>} run
		 * @param {import('./private.js').Invalidator<T>} [invalidate]
		 * @returns {import('./public.js').Unsubscriber}
		 */
		function subscribe(run, invalidate = noop) {
			/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
			const subscriber = [run, invalidate];
			subscribers.add(subscriber);
			if (subscribers.size === 1) {
				stop = start(set, update) || noop;
			}
			run(value);
			return () => {
				subscribers.delete(subscriber);
				if (subscribers.size === 0 && stop) {
					stop();
					stop = null;
				}
			};
		}
		return { set, update, subscribe };
	}

	/* src\composed\data-table.svelte generated by Svelte v4.2.7 */
	const get_header_slot_changes = dirty => ({});
	const get_header_slot_context = ctx => ({});
	const get_row_slot_changes = dirty => ({ row: dirty[1] & /*row*/ 8 });
	const get_row_slot_context = ctx => ({ row: /*row*/ ctx[34] });
	const get_action_slot_changes = dirty => ({});
	const get_action_slot_context = ctx => ({});

	// (163:36)                      
	function fallback_block_1(ctx) {
		let th;

		return {
			c() {
				th = element("th");
				th.textContent = "No Header Defined";
			},
			m(target, anchor) {
				insert(target, th, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(th);
				}
			}
		};
	}

	// (162:12) 
	function create_header_slot$2(ctx) {
		let tr;
		let wsx_action;
		let current;
		let mounted;
		let dispose;
		const header_slot_template = /*#slots*/ ctx[24].header;
		const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[27], get_header_slot_context);
		const header_slot_or_fallback = header_slot || fallback_block_1();

		return {
			c() {
				tr = element("tr");
				if (header_slot_or_fallback) header_slot_or_fallback.c();
				attr(tr, "slot", "header");
			},
			m(target, anchor) {
				insert(target, tr, anchor);

				if (header_slot_or_fallback) {
					header_slot_or_fallback.m(tr, null);
				}

				current = true;

				if (!mounted) {
					dispose = action_destroyer(wsx_action = wsx.call(null, tr, /*header*/ ctx[8]));
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (header_slot) {
					if (header_slot.p && (!current || dirty[0] & /*$$scope*/ 134217728)) {
						update_slot_base(
							header_slot,
							header_slot_template,
							ctx,
							/*$$scope*/ ctx[27],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[27])
							: get_slot_changes(header_slot_template, /*$$scope*/ ctx[27], dirty, get_header_slot_changes),
							get_header_slot_context
						);
					}
				}

				if (wsx_action && is_function(wsx_action.update) && dirty[0] & /*header*/ 256) wsx_action.update.call(null, /*header*/ ctx[8]);
			},
			i(local) {
				if (current) return;
				transition_in(header_slot_or_fallback, local);
				current = true;
			},
			o(local) {
				transition_out(header_slot_or_fallback, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(tr);
				}

				if (header_slot_or_fallback) header_slot_or_fallback.d(detaching);
				mounted = false;
				dispose();
			}
		};
	}

	// (168:39)                      
	function fallback_block(ctx) {
		let th;

		return {
			c() {
				th = element("th");
				th.textContent = "No Row Defined";
			},
			m(target, anchor) {
				insert(target, th, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(th);
				}
			}
		};
	}

	// (167:12) 
	function create_row_slot$1(ctx) {
		let tr;
		let tr_ws_x_value;
		let current;
		const row_slot_template = /*#slots*/ ctx[24].row;
		const row_slot = create_slot(row_slot_template, ctx, /*$$scope*/ ctx[27], get_row_slot_context);
		const row_slot_or_fallback = row_slot || fallback_block();

		return {
			c() {
				tr = element("tr");
				if (row_slot_or_fallback) row_slot_or_fallback.c();
				attr(tr, "ws-x", tr_ws_x_value = "[h " + /*rowHeight*/ ctx[3] + "]");
				attr(tr, "slot", "row");
			},
			m(target, anchor) {
				insert(target, tr, anchor);

				if (row_slot_or_fallback) {
					row_slot_or_fallback.m(tr, null);
				}

				current = true;
			},
			p(ctx, dirty) {
				if (row_slot) {
					if (row_slot.p && (!current || dirty[0] & /*$$scope*/ 134217728 | dirty[1] & /*row*/ 8)) {
						update_slot_base(
							row_slot,
							row_slot_template,
							ctx,
							/*$$scope*/ ctx[27],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[27])
							: get_slot_changes(row_slot_template, /*$$scope*/ ctx[27], dirty, get_row_slot_changes),
							get_row_slot_context
						);
					}
				}

				if (!current || dirty[0] & /*rowHeight*/ 8 && tr_ws_x_value !== (tr_ws_x_value = "[h " + /*rowHeight*/ ctx[3] + "]")) {
					attr(tr, "ws-x", tr_ws_x_value);
				}
			},
			i(local) {
				if (current) return;
				transition_in(row_slot_or_fallback, local);
				current = true;
			},
			o(local) {
				transition_out(row_slot_or_fallback, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(tr);
				}

				if (row_slot_or_fallback) row_slot_or_fallback.d(detaching);
			}
		};
	}

	// (172:12) 
	function create_empty_row_slot(ctx) {
		let tr;
		let tr_ws_x_value;

		return {
			c() {
				tr = element("tr");
				attr(tr, "ws-x", tr_ws_x_value = "[h " + /*rowHeight*/ ctx[3] + "]");
				attr(tr, "slot", "empty-row");
			},
			m(target, anchor) {
				insert(target, tr, anchor);
			},
			p(ctx, dirty) {
				if (dirty[0] & /*rowHeight*/ 8 && tr_ws_x_value !== (tr_ws_x_value = "[h " + /*rowHeight*/ ctx[3] + "]")) {
					attr(tr, "ws-x", tr_ws_x_value);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(tr);
				}
			}
		};
	}

	// (160:4) 
	function create_content_slot$1(ctx) {
		let ws_flex;
		let table;
		let wsx_action;
		let current;
		let mounted;
		let dispose;

		const table_spread_levels = [
			{ data: /*rows*/ ctx[11] },
			{ color: /*color*/ ctx[1] },
			{ fillHeader: /*fillHeader*/ ctx[2] },
			/*$$restProps*/ ctx[16],
			{ "b.t.w": "0px" }
		];

		let table_props = {
			$$slots: {
				"empty-row": [create_empty_row_slot],
				row: [create_row_slot$1, ({ row }) => ({ 34: row }), ({ row }) => [0, row ? 8 : 0]],
				header: [create_header_slot$2]
			},
			$$scope: { ctx }
		};

		for (let i = 0; i < table_spread_levels.length; i += 1) {
			table_props = assign(table_props, table_spread_levels[i]);
		}

		table = new Table({ props: table_props });

		return {
			c() {
				ws_flex = element("ws-flex");
				create_component(table.$$.fragment);
				set_custom_element_data(ws_flex, "slot", "content");
			},
			m(target, anchor) {
				insert(target, ws_flex, anchor);
				mount_component(table, ws_flex, null);
				/*ws_flex_binding*/ ctx[26](ws_flex);
				current = true;

				if (!mounted) {
					dispose = action_destroyer(wsx_action = wsx.call(null, ws_flex, /*content*/ ctx[9]));
					mounted = true;
				}
			},
			p(ctx, dirty) {
				const table_changes = (dirty[0] & /*rows, color, fillHeader, $$restProps*/ 67590)
				? get_spread_update(table_spread_levels, [
						dirty[0] & /*rows*/ 2048 && { data: /*rows*/ ctx[11] },
						dirty[0] & /*color*/ 2 && { color: /*color*/ ctx[1] },
						dirty[0] & /*fillHeader*/ 4 && { fillHeader: /*fillHeader*/ ctx[2] },
						dirty[0] & /*$$restProps*/ 65536 && get_spread_object(/*$$restProps*/ ctx[16]),
						table_spread_levels[4]
					])
				: {};

				if (dirty[0] & /*$$scope, rowHeight, header*/ 134217992 | dirty[1] & /*row*/ 8) {
					table_changes.$$scope = { dirty, ctx };
				}

				table.$set(table_changes);
				if (wsx_action && is_function(wsx_action.update) && dirty[0] & /*content*/ 512) wsx_action.update.call(null, /*content*/ ctx[9]);
			},
			i(local) {
				if (current) return;
				transition_in(table.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(table.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(ws_flex);
				}

				destroy_component(table);
				/*ws_flex_binding*/ ctx[26](null);
				mounted = false;
				dispose();
			}
		};
	}

	// (192:8) {:else}
	function create_else_block$1(ctx) {
		let div;

		return {
			c() {
				div = element("div");
				div.textContent = "No data to show";
				attr(div, "ws-x", "[col span 3] [p.l 4px]");
			},
			m(target, anchor) {
				insert(target, div, anchor);
			},
			p: noop,
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}
			}
		};
	}

	// (177:8) {#if pageCount > 0}
	function create_if_block$1(ctx) {
		let button0;
		let t0;
		let button1;
		let t1;
		let text_1;
		let current;

		button0 = new Button({
				props: {
					disabled: /*page*/ ctx[0] === 0,
					$$slots: { default: [create_default_slot_3$1] },
					$$scope: { ctx }
				}
			});

		button0.$on("click", /*prev*/ ctx[12]);

		button1 = new Button({
				props: {
					disabled: /*page*/ ctx[0] === /*maxPage*/ ctx[10],
					$$slots: { default: [create_default_slot_2$2] },
					$$scope: { ctx }
				}
			});

		button1.$on("click", /*next*/ ctx[13]);

		text_1 = new Text({
				props: {
					adorn: true,
					"t.ws": "nowrap",
					$$slots: { default: [create_default_slot_1$3] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(button0.$$.fragment);
				t0 = space();
				create_component(button1.$$.fragment);
				t1 = space();
				create_component(text_1.$$.fragment);
			},
			m(target, anchor) {
				mount_component(button0, target, anchor);
				insert(target, t0, anchor);
				mount_component(button1, target, anchor);
				insert(target, t1, anchor);
				mount_component(text_1, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const button0_changes = {};
				if (dirty[0] & /*page*/ 1) button0_changes.disabled = /*page*/ ctx[0] === 0;

				if (dirty[0] & /*$$scope*/ 134217728) {
					button0_changes.$$scope = { dirty, ctx };
				}

				button0.$set(button0_changes);
				const button1_changes = {};
				if (dirty[0] & /*page, maxPage*/ 1025) button1_changes.disabled = /*page*/ ctx[0] === /*maxPage*/ ctx[10];

				if (dirty[0] & /*$$scope*/ 134217728) {
					button1_changes.$$scope = { dirty, ctx };
				}

				button1.$set(button1_changes);
				const text_1_changes = {};

				if (dirty[0] & /*$$scope, pageCount, jumpTarget*/ 134217920) {
					text_1_changes.$$scope = { dirty, ctx };
				}

				text_1.$set(text_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(button0.$$.fragment, local);
				transition_in(button1.$$.fragment, local);
				transition_in(text_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(button0.$$.fragment, local);
				transition_out(button1.$$.fragment, local);
				transition_out(text_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(t1);
				}

				destroy_component(button0, detaching);
				destroy_component(button1, detaching);
				destroy_component(text_1, detaching);
			}
		};
	}

	// (178:12) <Button on:click={prev} disabled={page === 0}>
	function create_default_slot_3$1(ctx) {
		let icon;
		let current;
		icon = new Icon({ props: { name: "arrow-big-left" } });

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

	// (181:12) <Button on:click={next} disabled={page === maxPage}>
	function create_default_slot_2$2(ctx) {
		let icon;
		let current;
		icon = new Icon({ props: { name: "arrow-big-right" } });

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

	// (184:12) <Text adorn t.ws="nowrap">
	function create_default_slot_1$3(ctx) {
		let t0;
		let input;
		let t1;
		let t2;
		let mounted;
		let dispose;

		return {
			c() {
				t0 = text("Page\n                ");
				input = element("input");
				t1 = text("\n                / ");
				t2 = text(/*pageCount*/ ctx[6]);
				attr(input, "ws-x", "[b 1px solid @text-color-normal] [w 36px] [r 4px]\n                [h 24px] [bg.c transaprent] [t.a center] [m.l 4px] [m.r 4px]");
				attr(input, "type", "text");
			},
			m(target, anchor) {
				insert(target, t0, anchor);
				insert(target, input, anchor);
				set_input_value(input, /*jumpTarget*/ ctx[7]);
				insert(target, t1, anchor);
				insert(target, t2, anchor);

				if (!mounted) {
					dispose = [
						listen(input, "input", /*input_input_handler*/ ctx[25]),
						listen(input, "keypress", /*jump*/ ctx[15]),
						listen(input, "blur", /*jump*/ ctx[15])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty[0] & /*jumpTarget*/ 128 && input.value !== /*jumpTarget*/ ctx[7]) {
					set_input_value(input, /*jumpTarget*/ ctx[7]);
				}

				if (dirty[0] & /*pageCount*/ 64) set_data(t2, /*pageCount*/ ctx[6]);
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(input);
					detach(t1);
					detach(t2);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (175:4) <Grid slot="footer" gr.cols="min-content min-content min-content 1fr"     rows="32px" b="1px solid @color" b.b.w="4px">
	function create_default_slot$4(ctx) {
		let current_block_type_index;
		let if_block;
		let t;
		let current;
		const if_block_creators = [create_if_block$1, create_else_block$1];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*pageCount*/ ctx[6] > 0) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		const action_slot_template = /*#slots*/ ctx[24].action;
		const action_slot = create_slot(action_slot_template, ctx, /*$$scope*/ ctx[27], get_action_slot_context);

		return {
			c() {
				if_block.c();
				t = space();
				if (action_slot) action_slot.c();
			},
			m(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, t, anchor);

				if (action_slot) {
					action_slot.m(target, anchor);
				}

				current = true;
			},
			p(ctx, dirty) {
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
					if_block.m(t.parentNode, t);
				}

				if (action_slot) {
					if (action_slot.p && (!current || dirty[0] & /*$$scope*/ 134217728)) {
						update_slot_base(
							action_slot,
							action_slot_template,
							ctx,
							/*$$scope*/ ctx[27],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[27])
							: get_slot_changes(action_slot_template, /*$$scope*/ ctx[27], dirty, get_action_slot_changes),
							get_action_slot_context
						);
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				transition_in(action_slot, local);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				transition_out(action_slot, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}

				if_blocks[current_block_type_index].d(detaching);
				if (action_slot) action_slot.d(detaching);
			}
		};
	}

	// (175:4) 
	function create_footer_slot(ctx) {
		let grid;
		let current;

		grid = new Grid({
				props: {
					slot: "footer",
					"gr.cols": "min-content min-content min-content 1fr",
					rows: "32px",
					b: "1px solid @color",
					"b.b.w": "4px",
					$$slots: { default: [create_default_slot$4] },
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

				if (dirty[0] & /*$$scope, pageCount, jumpTarget, page, maxPage*/ 134218945) {
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

	function create_fragment$4(ctx) {
		let paper;
		let current;

		paper = new Paper({
				props: {
					color: /*color*/ ctx[1],
					h: /*height*/ ctx[4],
					$$slots: {
						footer: [create_footer_slot],
						content: [create_content_slot$1]
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
				if (dirty[0] & /*color*/ 2) paper_changes.color = /*color*/ ctx[1];
				if (dirty[0] & /*height*/ 16) paper_changes.h = /*height*/ ctx[4];

				if (dirty[0] & /*$$scope, pageCount, jumpTarget, page, maxPage, scroller, content, rows, color, fillHeader, $$restProps, rowHeight, header*/ 134287343) {
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

	const applyFilters = (data, filters) => {
		if (Array.isArray(data) === false) {
			return null;
		}

		return data.filter(row => {
			for (const [filter, value] of filters) {
				if (filter(row, value) === false) {
					return false;
				}
			}

			return true;
		});
	};

	const sliceData = (data, page, pageSize, sortFunc) => {
		if (data === null) {
			return [];
		}

		const sorted = data.sort(sortFunc);
		return Array.from({ length: pageSize }, (_, i) => sorted[page * pageSize + i]);
	};

	const noSort = {
		direction: null,
		func: (a, b) => 0,
		base: null
	};

	const dtContext = Symbol("table key");

	function instance$4($$self, $$props, $$invalidate) {
		let filteredData;
		let rows;
		let rowCount;
		let pageCount;
		let maxPage;
		let content;
		let header;

		const omit_props_names = [
			"color","fillHeader","data","pageSize","page","rowHeight","scrollable","height"
		];

		let $$restProps = compute_rest_props($$props, omit_props_names);
		let $context;
		let { $$slots: slots = {}, $$scope } = $$props;
		let { color = false } = $$props;
		let { fillHeader = true } = $$props;
		let { data } = $$props;
		let { pageSize = 10 } = $$props;
		let { page = 0 } = $$props;
		let { rowHeight = "40px" } = $$props;
		let { scrollable = false } = $$props;
		let { height = null } = $$props;
		let sorting = noSort;
		let filters = new Map();
		let filterFunctions = [];
		let jumpTarget = "1";
		const prev = () => $$invalidate(0, page = Math.max(0, page - 1));
		const next = () => $$invalidate(0, page = Math.min(maxPage, page + 1));

		const updateSort = func => {
			if (sorting.base === func) {
				if (sorting.direction === "desc") {
					$$invalidate(20, sorting = noSort);
					return;
				}

				$$invalidate(20, sorting = {
					func: (a, b) => -func(a, b),
					base: func,
					direction: "desc"
				});

				return;
			}

			$$invalidate(20, sorting = { func, base: func, direction: "asc" });
		};

		const updateFilter = (func, value) => {
			if (func === null) {
				return;
			}

			filters.set(func, value);
			$$invalidate(21, filterFunctions = [...filters.entries()]);
		};

		const context = writable({});
		component_subscribe($$self, context, value => $$invalidate(28, $context = value));
		setContext(dtContext, context);
		createEventDispatcher();
		let scroller = null;

		const jump = evt => {
			if (evt.type === "keypress" && evt.key !== "Enter") {
				return;
			}

			const target = parseInt(evt.target.value);

			if (isNaN(target) === true) {
				$$invalidate(7, jumpTarget = (page + 1).toString());
				return;
			}

			$$invalidate(0, page = Math.max(Math.min(jumpTarget - 1, maxPage), 0));
			$$invalidate(7, jumpTarget = (page + 1).toString());
		};

		function input_input_handler() {
			jumpTarget = this.value;
			($$invalidate(7, jumpTarget), $$invalidate(0, page));
		}

		function ws_flex_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				scroller = $$value;
				($$invalidate(5, scroller), $$invalidate(0, page));
			});
		}

		$$self.$$set = $$new_props => {
			$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
			$$invalidate(16, $$restProps = compute_rest_props($$props, omit_props_names));
			if ('color' in $$new_props) $$invalidate(1, color = $$new_props.color);
			if ('fillHeader' in $$new_props) $$invalidate(2, fillHeader = $$new_props.fillHeader);
			if ('data' in $$new_props) $$invalidate(17, data = $$new_props.data);
			if ('pageSize' in $$new_props) $$invalidate(18, pageSize = $$new_props.pageSize);
			if ('page' in $$new_props) $$invalidate(0, page = $$new_props.page);
			if ('rowHeight' in $$new_props) $$invalidate(3, rowHeight = $$new_props.rowHeight);
			if ('scrollable' in $$new_props) $$invalidate(19, scrollable = $$new_props.scrollable);
			if ('height' in $$new_props) $$invalidate(4, height = $$new_props.height);
			if ('$$scope' in $$new_props) $$invalidate(27, $$scope = $$new_props.$$scope);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty[0] & /*data, filterFunctions*/ 2228224) {
				$$invalidate(22, filteredData = applyFilters(data, filterFunctions));
			}

			if ($$self.$$.dirty[0] & /*filteredData, page, pageSize, sorting*/ 5505025) {
				$$invalidate(11, rows = sliceData(filteredData, page, pageSize, sorting.func));
			}

			if ($$self.$$.dirty[0] & /*filteredData*/ 4194304) {
				$$invalidate(23, rowCount = filteredData?.length ?? 0);
			}

			if ($$self.$$.dirty[0] & /*rowCount, pageSize*/ 8650752) {
				$$invalidate(6, pageCount = Math.ceil(rowCount / pageSize));
			}

			if ($$self.$$.dirty[0] & /*pageCount*/ 64) {
				$$invalidate(10, maxPage = Math.max(pageCount - 1, 0));
			}

			if ($$self.$$.dirty[0] & /*page*/ 1) {
				$$invalidate(7, jumpTarget = (page + 1).toString());
			}

			if ($$self.$$.dirty[0] & /*filteredData*/ 4194304) {
				if (filteredData === null) {
					console.warn("DataTable: data is not an array");
				}
			}

			if ($$self.$$.dirty[0] & /*fillHeader, sorting*/ 1048580) {
				set_store_value(
					context,
					$context = {
						updateSort,
						fillHeader,
						sorting,
						updateFilter
					},
					$context
				);
			}

			if ($$self.$$.dirty[0] & /*scroller, page*/ 33) {
				if (scroller !== null && isNaN(page) === false) {
					$$invalidate(5, scroller.scrollTop = 0, scroller);
				}
			}

			if ($$self.$$.dirty[0] & /*scrollable*/ 524288) {
				$$invalidate(9, content = {
					"fl.cross": "stretch",
					p: "0px",
					gap: "0px",
					over: scrollable === true ? "auto" : null
				});
			}

			if ($$self.$$.dirty[0] & /*rowHeight, scrollable*/ 524296) {
				$$invalidate(8, header = {
					"h.min": rowHeight,
					y: "0px",
					z: "+10",
					pos: scrollable === true ? "sticky" : null
				});
			}
		};

		return [
			page,
			color,
			fillHeader,
			rowHeight,
			height,
			scroller,
			pageCount,
			jumpTarget,
			header,
			content,
			maxPage,
			rows,
			prev,
			next,
			context,
			jump,
			$$restProps,
			data,
			pageSize,
			scrollable,
			sorting,
			filterFunctions,
			filteredData,
			rowCount,
			slots,
			input_input_handler,
			ws_flex_binding,
			$$scope
		];
	}

	class Data_table extends SvelteComponent {
		constructor(options) {
			super();

			init(
				this,
				options,
				instance$4,
				create_fragment$4,
				not_equal,
				{
					color: 1,
					fillHeader: 2,
					data: 17,
					pageSize: 18,
					page: 0,
					rowHeight: 3,
					scrollable: 19,
					height: 4
				},
				null,
				[-1, -1]
			);
		}
	}

	/* src\composed\data-table\th.svelte generated by Svelte v4.2.7 */

	function create_else_block(ctx) {
		let button;
		let current;

		button = new Button({
				props: {
					compact: true,
					r: "0px",
					color: "primary",
					fill: /*$context*/ ctx[3].fillHeader,
					"t.wt": "inherit",
					$$slots: { default: [create_default_slot_2$1] },
					$$scope: { ctx }
				}
			});

		button.$on("click", /*setSort*/ ctx[7]);

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
				if (dirty & /*$context*/ 8) button_changes.fill = /*$context*/ ctx[3].fillHeader;

				if (dirty & /*$$scope, sortIcon*/ 1040) {
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

	// (43:8) {#if sort === null}
	function create_if_block_1(ctx) {
		let div;
		let current;
		const default_slot_template = /*#slots*/ ctx[8].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

		return {
			c() {
				div = element("div");
				if (default_slot) default_slot.c();
				attr(div, "ws-x", "[flex] [fl.cross center] [fl.main center]");
			},
			m(target, anchor) {
				insert(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
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
				if (detaching) {
					detach(div);
				}

				if (default_slot) default_slot.d(detaching);
			}
		};
	}

	// (48:12) <Button compact r="0px" color="primary" fill={$context.fillHeader}             t.wt="inherit" on:click={setSort}>
	function create_default_slot_2$1(ctx) {
		let t;
		let icon;
		let current;
		const default_slot_template = /*#slots*/ ctx[8].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

		icon = new Icon({
				props: {
					name: /*sortIcon*/ ctx[4],
					"m.l": "4px",
					"t.sz": "16px"
				}
			});

		return {
			c() {
				if (default_slot) default_slot.c();
				t = space();
				create_component(icon.$$.fragment);
			},
			m(target, anchor) {
				if (default_slot) {
					default_slot.m(target, anchor);
				}

				insert(target, t, anchor);
				mount_component(icon, target, anchor);
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

				const icon_changes = {};
				if (dirty & /*sortIcon*/ 16) icon_changes.name = /*sortIcon*/ ctx[4];
				icon.$set(icon_changes);
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}

				if (default_slot) default_slot.d(detaching);
				destroy_component(icon, detaching);
			}
		};
	}

	// (54:8) {#if filter !== null}
	function create_if_block(ctx) {
		let grid;
		let current;

		grid = new Grid({
				props: {
					gap: "0px",
					p: "0px",
					cols: "min-content 1fr",
					$$slots: { default: [create_default_slot_1$2] },
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

				if (dirty & /*$$scope, value*/ 1028) {
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

	// (55:12) <Grid gap="0px" p="0px" cols="min-content 1fr">
	function create_default_slot_1$2(ctx) {
		let icon;
		let t;
		let input;
		let current;
		let mounted;
		let dispose;
		icon = new Icon({ props: { name: "filter" } });

		return {
			c() {
				create_component(icon.$$.fragment);
				t = space();
				input = element("input");
				attr(input, "type", "text");
				attr(input, "ws-x", "[w.min 20px] [outline:focus none]");
			},
			m(target, anchor) {
				mount_component(icon, target, anchor);
				insert(target, t, anchor);
				insert(target, input, anchor);
				set_input_value(input, /*value*/ ctx[2]);
				current = true;

				if (!mounted) {
					dispose = listen(input, "input", /*input_input_handler*/ ctx[9]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*value*/ 4 && input.value !== /*value*/ ctx[2]) {
					set_input_value(input, /*value*/ ctx[2]);
				}
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
				if (detaching) {
					detach(t);
					detach(input);
				}

				destroy_component(icon, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	// (42:4) <Grid rows="40px min-content" p="0px" gap="0px">
	function create_default_slot$3(ctx) {
		let current_block_type_index;
		let if_block0;
		let t;
		let if_block1_anchor;
		let current;
		const if_block_creators = [create_if_block_1, create_else_block];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*sort*/ ctx[0] === null) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		let if_block1 = /*filter*/ ctx[1] !== null && create_if_block(ctx);

		return {
			c() {
				if_block0.c();
				t = space();
				if (if_block1) if_block1.c();
				if_block1_anchor = empty();
			},
			m(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, t, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
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
					if_block0 = if_blocks[current_block_type_index];

					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block0.c();
					} else {
						if_block0.p(ctx, dirty);
					}

					transition_in(if_block0, 1);
					if_block0.m(t.parentNode, t);
				}

				if (/*filter*/ ctx[1] !== null) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*filter*/ 2) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
					detach(if_block1_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
				if (if_block1) if_block1.d(detaching);
			}
		};
	}

	function create_fragment$3(ctx) {
		let th;
		let grid;
		let wsx_action;
		let current;
		let mounted;
		let dispose;

		grid = new Grid({
				props: {
					rows: "40px min-content",
					p: "0px",
					gap: "0px",
					$$slots: { default: [create_default_slot$3] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				th = element("th");
				create_component(grid.$$.fragment);
				set_style(th, "vertical-align", "top");
			},
			m(target, anchor) {
				insert(target, th, anchor);
				mount_component(grid, th, null);
				current = true;

				if (!mounted) {
					dispose = action_destroyer(wsx_action = wsx.call(null, th, /*wind*/ ctx[5]));
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				const grid_changes = {};

				if (dirty & /*$$scope, value, filter, sort, $context, sortIcon*/ 1055) {
					grid_changes.$$scope = { dirty, ctx };
				}

				grid.$set(grid_changes);
				if (wsx_action && is_function(wsx_action.update) && dirty & /*wind*/ 32) wsx_action.update.call(null, /*wind*/ ctx[5]);
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
				if (detaching) {
					detach(th);
				}

				destroy_component(grid);
				mounted = false;
				dispose();
			}
		};
	}

	const sortIcons = {
		"asc": "arrow-narrow-up",
		"desc": "arrow-narrow-down"
	};

	function instance$3($$self, $$props, $$invalidate) {
		let wind;
		let sortIcon;
		const omit_props_names = ["sort","filter"];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let $context;
		let { $$slots: slots = {}, $$scope } = $$props;
		let { sort = null } = $$props;
		let { filter = null } = $$props;
		const context = getContext(dtContext);
		component_subscribe($$self, context, value => $$invalidate(3, $context = value));
		const setSort = () => $context.updateSort(sort);
		let value = "";

		function input_input_handler() {
			value = this.value;
			$$invalidate(2, value);
		}

		$$self.$$set = $$new_props => {
			$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
			$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
			if ('sort' in $$new_props) $$invalidate(0, sort = $$new_props.sort);
			if ('filter' in $$new_props) $$invalidate(1, filter = $$new_props.filter);
			if ('$$scope' in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*$context, filter, value*/ 14) {
				$context.updateFilter(filter, value);
			}

			$$invalidate(5, wind = { ...$$restProps, p: "0px", sel: "none" });

			if ($$self.$$.dirty & /*$context, sort*/ 9) {
				$$invalidate(4, sortIcon = $context.sorting.base === sort
				? sortIcons[$context.sorting.direction]
				: "arrows-up-down");
			}
		};

		return [
			sort,
			filter,
			value,
			$context,
			sortIcon,
			wind,
			context,
			setSort,
			slots,
			input_input_handler,
			$$scope
		];
	}

	class Th extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$3, create_fragment$3, not_equal, { sort: 0, filter: 1 });
		}
	}

	/* src\composed\entry-button.svelte generated by Svelte v4.2.7 */

	function create_default_slot$2(ctx) {
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

	function create_fragment$2(ctx) {
		let button;
		let t;
		let switch_instance;
		let switch_instance_anchor;
		let current;
		const button_spread_levels = [/*$$restProps*/ ctx[5]];

		let button_props = {
			$$slots: { default: [create_default_slot$2] },
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

		function switch_props(ctx, dirty) {
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
					const switch_instance_changes = {};
					if (dirty & /*component*/ 1) switch_instance_changes.component = /*component*/ ctx[0];
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
				if (detaching) {
					detach(t);
					detach(switch_instance_anchor);
				}

				destroy_component(button, detaching);
				/*switch_instance_binding*/ ctx[7](null);
				if (switch_instance) destroy_component(switch_instance, detaching);
			}
		};
	}

	function instance$2($$self, $$props, $$invalidate) {
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
			init(this, options, instance$2, create_fragment$2, not_equal, { component: 0, props: 1, this: 2 });
		}
	}

	const hash = readable(
	    location.hash.slice(1),
	    (set) => {
	        setInterval(
	            () => set(location.hash.slice(1)),
	            50
	        );
	    }
	);
	hash.set = (value) => {
	    location.hash = value;
	};

	const filters = {
	    text: (propName) =>
	        (row, text) =>
	            row[propName]
	                .toLowerCase()
	                .includes(text.toLowerCase())
	};
	const sorts = {
	    natural: (propName) => {
	        const comparitor = new Intl.Collator(undefined, { numeric: true });
	        return (a, b) => comparitor.compare(a[propName], b[propName])
	    }
	};

	/* test\src\comp\menu.svelte generated by Svelte v4.2.7 */

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[2] = list[i];
		child_ctx[4] = i;
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
				if (detaching) {
					detach(t);
				}
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

				if (dirty & /*$$scope*/ 32) {
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
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (20:8) 
	function create_action_slot$1(ctx) {
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

				if (dirty & /*$$scope*/ 32) {
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
						action: [create_action_slot$1],
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

				if (dirty & /*$$scope, close*/ 33) {
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

		return {
			c() {
				div = element("div");
				div.textContent = `${/*i*/ ctx[4]}`;
			},
			m(target, anchor) {
				insert(target, div, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}
			}
		};
	}

	// (25:4) 
	function create_content_slot(ctx) {
		let div;
		let each_value = ensure_array_like(Array.from({ length: 100 }));
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
				if (detaching) {
					detach(div);
				}

				destroy_each(each_blocks, detaching);
			}
		};
	}

	function create_fragment$1(ctx) {
		let drawer;
		let current;

		drawer = new Drawer({
				props: {
					$$slots: {
						content: [create_content_slot],
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

				if (dirty & /*$$scope, close*/ 33) {
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
		const cancel = () => close(null);

		$$self.$$set = $$props => {
			if ('close' in $$props) $$invalidate(0, close = $$props.close);
		};

		return [close, cancel];
	}

	class Menu extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$1, create_fragment$1, safe_not_equal, { close: 0, cancel: 1 });
		}

		get cancel() {
			return this.$$.ctx[1];
		}
	}

	var data2 = [
	    {
	        "first": "Cell 0",
	        "second": "Cell 1",
	        "third": "Cell 2",
	        "another": "Cell 3"
	    },
	    {
	        "first": "Row 2,0",
	        "second": "Row 2,1",
	        "third": "Row 2,2",
	        "another": "Row 2,3"
	    },
	    {
	        "first": "Sq 0",
	        "second": "Sq 1",
	        "third": "Sq 4",
	        "another": "Sq 9"
	    },
	    {
	        "first": "Sub -2",
	        "second": "Sub -1",
	        "third": "Sub 0",
	        "another": "Sub 1"
	    },
	    {
	        "first": "Cell 0",
	        "second": "Cell 1",
	        "third": "Cell 2",
	        "another": "Cell 3"
	    },
	    {
	        "first": "Row 2,0",
	        "second": "Row 2,1",
	        "third": "Row 2,2",
	        "another": "Row 2,3"
	    },
	    {
	        "first": "Sq 0",
	        "second": "Sq 1",
	        "third": "Sq 4",
	        "another": "Sq 9"
	    },
	    {
	        "first": "Sub -2",
	        "second": "Sub -1",
	        "third": "Sub 0",
	        "another": "Sub 1"
	    }
	];

	/* test\src\app.svelte generated by Svelte v4.2.7 */

	function create_default_slot_10(ctx) {
		let div;
		let t0;
		let t1_value = /*selected*/ ctx[7].toString() + "";
		let t1;
		let br;
		let t2;
		let t3_value = /*tab*/ ctx[6].label + "";
		let t3;

		return {
			c() {
				div = element("div");
				t0 = text("Active: ");
				t1 = text(t1_value);
				br = element("br");
				t2 = space();
				t3 = text(t3_value);
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, t0);
				append(div, t1);
				append(div, br);
				append(div, t2);
				append(div, t3);
			},
			p(ctx, dirty) {
				if (dirty & /*selected*/ 128 && t1_value !== (t1_value = /*selected*/ ctx[7].toString() + "")) set_data(t1, t1_value);
				if (dirty & /*tab*/ 64 && t3_value !== (t3_value = /*tab*/ ctx[6].label + "")) set_data(t3, t3_value);
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}
			}
		};
	}

	// (88:16) <TH filter={filters.text("first")}>
	function create_default_slot_9(ctx) {
		let t;

		return {
			c() {
				t = text("1st");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (89:16) <TH>
	function create_default_slot_8(ctx) {
		let t;

		return {
			c() {
				t = text("Second");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (90:16) <TH sort={sorts.natural("third")}>
	function create_default_slot_7(ctx) {
		let t;

		return {
			c() {
				t = text("III");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (91:16) <TH>
	function create_default_slot_6(ctx) {
		let t;

		return {
			c() {
				t = text("d.");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (87:12) <svelte:fragment slot="header">
	function create_header_slot_1(ctx) {
		let th0;
		let t0;
		let th1;
		let t1;
		let th2;
		let t2;
		let th3;
		let current;

		th0 = new Th({
				props: {
					filter: filters.text("first"),
					$$slots: { default: [create_default_slot_9] },
					$$scope: { ctx }
				}
			});

		th1 = new Th({
				props: {
					$$slots: { default: [create_default_slot_8] },
					$$scope: { ctx }
				}
			});

		th2 = new Th({
				props: {
					sort: sorts.natural("third"),
					$$slots: { default: [create_default_slot_7] },
					$$scope: { ctx }
				}
			});

		th3 = new Th({
				props: {
					$$slots: { default: [create_default_slot_6] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(th0.$$.fragment);
				t0 = space();
				create_component(th1.$$.fragment);
				t1 = space();
				create_component(th2.$$.fragment);
				t2 = space();
				create_component(th3.$$.fragment);
			},
			m(target, anchor) {
				mount_component(th0, target, anchor);
				insert(target, t0, anchor);
				mount_component(th1, target, anchor);
				insert(target, t1, anchor);
				mount_component(th2, target, anchor);
				insert(target, t2, anchor);
				mount_component(th3, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const th0_changes = {};

				if (dirty & /*$$scope*/ 256) {
					th0_changes.$$scope = { dirty, ctx };
				}

				th0.$set(th0_changes);
				const th1_changes = {};

				if (dirty & /*$$scope*/ 256) {
					th1_changes.$$scope = { dirty, ctx };
				}

				th1.$set(th1_changes);
				const th2_changes = {};

				if (dirty & /*$$scope*/ 256) {
					th2_changes.$$scope = { dirty, ctx };
				}

				th2.$set(th2_changes);
				const th3_changes = {};

				if (dirty & /*$$scope*/ 256) {
					th3_changes.$$scope = { dirty, ctx };
				}

				th3.$set(th3_changes);
			},
			i(local) {
				if (current) return;
				transition_in(th0.$$.fragment, local);
				transition_in(th1.$$.fragment, local);
				transition_in(th2.$$.fragment, local);
				transition_in(th3.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(th0.$$.fragment, local);
				transition_out(th1.$$.fragment, local);
				transition_out(th2.$$.fragment, local);
				transition_out(th3.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(t1);
					detach(t2);
				}

				destroy_component(th0, detaching);
				destroy_component(th1, detaching);
				destroy_component(th2, detaching);
				destroy_component(th3, detaching);
			}
		};
	}

	// (93:12) <svelte:fragment slot="row" let:row>
	function create_row_slot(ctx) {
		let td0;
		let t0_value = /*row*/ ctx[5].first + "";
		let t0;
		let t1;
		let td1;
		let t2_value = /*row*/ ctx[5].second + "";
		let t2;
		let t3;
		let td2;
		let t4_value = /*row*/ ctx[5].third + "";
		let t4;
		let t5;
		let td3;
		let t6_value = /*row*/ ctx[5].another + "";
		let t6;

		return {
			c() {
				td0 = element("td");
				t0 = text(t0_value);
				t1 = space();
				td1 = element("td");
				t2 = text(t2_value);
				t3 = space();
				td2 = element("td");
				t4 = text(t4_value);
				t5 = space();
				td3 = element("td");
				t6 = text(t6_value);
			},
			m(target, anchor) {
				insert(target, td0, anchor);
				append(td0, t0);
				insert(target, t1, anchor);
				insert(target, td1, anchor);
				append(td1, t2);
				insert(target, t3, anchor);
				insert(target, td2, anchor);
				append(td2, t4);
				insert(target, t5, anchor);
				insert(target, td3, anchor);
				append(td3, t6);
			},
			p(ctx, dirty) {
				if (dirty & /*row*/ 32 && t0_value !== (t0_value = /*row*/ ctx[5].first + "")) set_data(t0, t0_value);
				if (dirty & /*row*/ 32 && t2_value !== (t2_value = /*row*/ ctx[5].second + "")) set_data(t2, t2_value);
				if (dirty & /*row*/ 32 && t4_value !== (t4_value = /*row*/ ctx[5].third + "")) set_data(t4, t4_value);
				if (dirty & /*row*/ 32 && t6_value !== (t6_value = /*row*/ ctx[5].another + "")) set_data(t6, t6_value);
			},
			d(detaching) {
				if (detaching) {
					detach(td0);
					detach(t1);
					detach(td1);
					detach(t3);
					detach(td2);
					detach(t5);
					detach(td3);
				}
			}
		};
	}

	// (100:16) <Button color="@default">
	function create_default_slot_5(ctx) {
		let t;

		return {
			c() {
				t = text("Test?");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (99:12) 
	function create_action_slot(ctx) {
		let div;
		let button;
		let current;

		button = new Button({
				props: {
					color: "@default",
					$$slots: { default: [create_default_slot_5] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				div = element("div");
				create_component(button.$$.fragment);
				attr(div, "slot", "action");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				mount_component(button, div, null);
				current = true;
			},
			p(ctx, dirty) {
				const button_changes = {};

				if (dirty & /*$$scope*/ 256) {
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
				if (detaching) {
					detach(div);
				}

				destroy_component(button);
			}
		};
	}

	// (67:4) <Paper square card l-pad="12px">
	function create_default_slot_4(ctx) {
		let tabs;
		let updating_value;
		let t;
		let datatable;
		let current;

		function tabs_value_binding(value) {
			/*tabs_value_binding*/ ctx[4](value);
		}

		let tabs_props = {
			options: /*options*/ ctx[2],
			$$slots: {
				default: [
					create_default_slot_10,
					({ tab, selected }) => ({ 6: tab, 7: selected }),
					({ tab, selected }) => (tab ? 64 : 0) | (selected ? 128 : 0)
				]
			},
			$$scope: { ctx }
		};

		if (/*activeTab*/ ctx[0] !== void 0) {
			tabs_props.value = /*activeTab*/ ctx[0];
		}

		tabs = new Tabs({ props: tabs_props });
		binding_callbacks.push(() => bind(tabs, 'value', tabs_value_binding));

		datatable = new Data_table({
				props: {
					pageSize: 10,
					color: "@primary",
					data: /*data*/ ctx[1],
					scrollable: true,
					height: "320px",
					$$slots: {
						action: [create_action_slot],
						row: [create_row_slot, ({ row }) => ({ 5: row }), ({ row }) => row ? 32 : 0],
						header: [create_header_slot_1]
					},
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(tabs.$$.fragment);
				t = space();
				create_component(datatable.$$.fragment);
			},
			m(target, anchor) {
				mount_component(tabs, target, anchor);
				insert(target, t, anchor);
				mount_component(datatable, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const tabs_changes = {};

				if (dirty & /*$$scope, tab, selected*/ 448) {
					tabs_changes.$$scope = { dirty, ctx };
				}

				if (!updating_value && dirty & /*activeTab*/ 1) {
					updating_value = true;
					tabs_changes.value = /*activeTab*/ ctx[0];
					add_flush_callback(() => updating_value = false);
				}

				tabs.$set(tabs_changes);
				const datatable_changes = {};

				if (dirty & /*$$scope, row*/ 288) {
					datatable_changes.$$scope = { dirty, ctx };
				}

				datatable.$set(datatable_changes);
			},
			i(local) {
				if (current) return;
				transition_in(tabs.$$.fragment, local);
				transition_in(datatable.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(tabs.$$.fragment, local);
				transition_out(datatable.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}

				destroy_component(tabs, detaching);
				destroy_component(datatable, detaching);
			}
		};
	}

	// (71:16) <Text subtitle>
	function create_default_slot_3(ctx) {
		let t;

		return {
			c() {
				t = text("Oh god please work for me and look good");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (69:12) <Text title slot="title">
	function create_default_slot_2(ctx) {
		let t;
		let text_1;
		let current;

		text_1 = new Text({
				props: {
					subtitle: true,
					$$slots: { default: [create_default_slot_3] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				t = text("Zephyr\n                ");
				create_component(text_1.$$.fragment);
			},
			m(target, anchor) {
				insert(target, t, anchor);
				mount_component(text_1, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const text_1_changes = {};

				if (dirty & /*$$scope*/ 256) {
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
				if (detaching) {
					detach(t);
				}

				destroy_component(text_1, detaching);
			}
		};
	}

	// (69:12) 
	function create_title_slot(ctx) {
		let text_1;
		let current;

		text_1 = new Text({
				props: {
					title: true,
					slot: "title",
					$$slots: { default: [create_default_slot_2] },
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

				if (dirty & /*$$scope*/ 256) {
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

	// (74:12) <EntryButton component={Menu} slot="menu">
	function create_default_slot_1(ctx) {
		let icon;
		let current;
		icon = new Icon({ props: { name: "menu-2" } });

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

	// (74:12) 
	function create_menu_slot(ctx) {
		let entrybutton;
		let current;

		entrybutton = new Entry_button({
				props: {
					component: Menu,
					slot: "menu",
					$$slots: { default: [create_default_slot_1] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(entrybutton.$$.fragment);
			},
			m(target, anchor) {
				mount_component(entrybutton, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const entrybutton_changes = {};

				if (dirty & /*$$scope*/ 256) {
					entrybutton_changes.$$scope = { dirty, ctx };
				}

				entrybutton.$set(entrybutton_changes);
			},
			i(local) {
				if (current) return;
				transition_in(entrybutton.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(entrybutton.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(entrybutton, detaching);
			}
		};
	}

	// (68:8) 
	function create_header_slot(ctx) {
		let titlebar;
		let current;

		titlebar = new Titlebar({
				props: {
					slot: "header",
					fill: true,
					color: "@primary",
					$$slots: {
						menu: [create_menu_slot],
						title: [create_title_slot]
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

				if (dirty & /*$$scope*/ 256) {
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

	// (66:0) <Screen>
	function create_default_slot(ctx) {
		let paper;
		let current;

		paper = new Paper({
				props: {
					square: true,
					card: true,
					"l-pad": "12px",
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

				if (dirty & /*$$scope, activeTab*/ 257) {
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
					dispose = action_destroyer(wsx.call(null, document.body, { "@theme": theme, "@app": true }));
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				const screen_changes = {};

				if (dirty & /*$$scope, activeTab*/ 257) {
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
				if (detaching) {
					detach(t0);
					detach(t1);
				}

				destroy_component(screen, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	let theme = "tron";

	function instance($$self, $$props, $$invalidate) {
		let $hash;
		component_subscribe($$self, hash, $$value => $$invalidate(3, $hash = $$value));
		const data = [].concat(data2, data2, data2);

		const options = [
			{ label: "First", value: "/games" },
			{ label: "Second", value: "/features" },
			{ label: "Default", value: "/boobs" }
		];

		let activeTab = $hash;
		window.hash = hash;

		function tabs_value_binding(value) {
			activeTab = value;
			($$invalidate(0, activeTab), $$invalidate(3, $hash));
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*$hash*/ 8) {
				console.log($hash);
			}

			if ($$self.$$.dirty & /*$hash*/ 8) {
				$$invalidate(0, activeTab = $hash);
			}

			if ($$self.$$.dirty & /*activeTab*/ 1) {
				hash.set(activeTab);
			}
		};

		return [activeTab, data, options, $hash, tabs_value_binding];
	}

	class App extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance, create_fragment, not_equal, {});
		}
	}

	window.app = new App({ target: document.body });

})();
//# sourceMappingURL=app.mjs.map
