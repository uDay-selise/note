import * as React from "react";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
// node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js
/**
* The context that `useQueryClient` reads from. `QueryClientProvider` is the normal way to set it.
*/
var QueryClientContext = React.createContext(void 0);
/**
* The `useQueryClient` hook returns the current `QueryClient` instance.
* @param queryClient - Use this to use a custom `QueryClient`. Otherwise, the one from the nearest context will
* be used.
* @returns The current `QueryClient` instance.
* @throws {Error} If no `queryClient` argument is passed and no `QueryClientProvider` is found in the
* component tree.
*/
var useQueryClient = (queryClient) => {
	const client = React.useContext(QueryClientContext);
	if (queryClient) return queryClient;
	if (!client) throw new Error("No QueryClient set, use QueryClientProvider to set one");
	return client;
};
/**
* Use the `QueryClientProvider` component to connect and provide a `QueryClient` to your application. Also
* calls `client.mount()`/`client.unmount()` as this component mounts/unmounts, which subscribes the client to
* focus/online events (resuming any paused mutations and refetching as needed when the app regains focus or
* comes back online).
* @param props - The `client` to provide, and the `children` that get access to it.
* @returns The provided `children`, wrapped so they can read the `QueryClient` via `useQueryClient`.
* @example
* ```tsx
* import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
*
* const queryClient = new QueryClient()
*
* function App() {
*   return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
* }
* ```
*/
var QueryClientProvider = ({ client, children }) => {
	React.useEffect(() => {
		client.mount();
		return () => {
			client.unmount();
		};
	}, [client]);
	return /* @__PURE__ */ jsx(QueryClientContext.Provider, {
		value: client,
		children
	});
};
// node_modules/@tanstack/query-core/build/modern/timeoutManager.js
var defaultTimeoutProvider = {
	setTimeout: (callback, delay) => setTimeout(callback, delay),
	clearTimeout: (timeoutId) => clearTimeout(timeoutId),
	setInterval: (callback, delay) => setInterval(callback, delay),
	clearInterval: (intervalId) => clearInterval(intervalId)
};
/**
* Allows customization of how timeouts are created.
*
* `@tanstack/query-core` makes liberal use of timeouts to implement `staleTime`
* and `gcTime`. The default TimeoutManager provider uses the platform's global
* `setTimeout` implementation, which is known to have scalability issues with
* thousands of timeouts on the event loop.
*
* If you hit this limitation, consider providing a custom TimeoutProvider that
* coalesces timeouts.
*/
var TimeoutManager = class {
	#provider = defaultTimeoutProvider;
	#providerCalled = false;
	/**
	* `setTimeoutProvider` can be used to set a custom implementation of the
	* `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval` functions,
	* called a `TimeoutProvider`.
	*
	* This may be useful if you notice event loop performance issues with
	* thousands of queries. A custom TimeoutProvider could also support timer
	* delays longer than the global `setTimeout` maximum delay value of about
	* 24 days.
	*
	* It is important to call `setTimeoutProvider` before creating a
	* QueryClient or queries, so that the same provider is used consistently
	* for all timers in the application, since different TimeoutProviders
	* cannot cancel each others' timers.
	* @param provider - The `TimeoutProvider` to use for all timers from now on.
	* @example
	* ```ts
	* import { timeoutManager, QueryClient } from '@tanstack/query-core'
	* import { CustomTimeoutProvider } from './CustomTimeoutProvider'
	*
	* timeoutManager.setTimeoutProvider(new CustomTimeoutProvider())
	*
	* export const queryClient = new QueryClient()
	* ```
	*/
	setTimeoutProvider(provider) {
		if (this.#providerCalled && provider !== this.#provider) console.error(`[timeoutManager]: Switching provider after calls to previous provider might result in unexpected behavior.`, {
			previous: this.#provider,
			provider
		});
		this.#provider = provider;
		this.#providerCalled = false;
	}
	/**
	* `setTimeout` schedules a callback to run after approximately `delay`
	* milliseconds, like the global `setTimeout` function. The callback can be
	* canceled with `clearTimeout`.
	*
	* It returns a timer ID, which may be a number or an object that can be
	* coerced to a number via `Symbol.toPrimitive`.
	* @param callback - The function to call when the timeout elapses.
	* @param delay - The time to wait before calling `callback`, in milliseconds.
	* @returns The timer ID, to pass to {@link TimeoutManager#clearTimeout}.
	* @example
	* ```ts
	* import { timeoutManager } from '@tanstack/query-core'
	*
	* const timeoutId = timeoutManager.setTimeout(
	*   () => console.log('ran at:', new Date()),
	*   1000,
	* )
	*
	* const timeoutIdNumber: number = Number(timeoutId)
	* ```
	*/
	setTimeout(callback, delay) {
		this.#providerCalled = true;
		return this.#provider.setTimeout(callback, delay);
	}
	/**
	* `clearTimeout` cancels a timeout callback scheduled with `setTimeout`,
	* like the global `clearTimeout` function. It should be called with a
	* timer ID returned by `setTimeout`.
	* @param timeoutId - The timer ID returned by `setTimeout`, or `undefined`.
	* @example
	* ```ts
	* import { timeoutManager } from '@tanstack/query-core'
	*
	* const timeoutId = timeoutManager.setTimeout(
	*   () => console.log('ran at:', new Date()),
	*   1000,
	* )
	*
	* timeoutManager.clearTimeout(timeoutId)
	* ```
	*/
	clearTimeout(timeoutId) {
		this.#provider.clearTimeout(timeoutId);
	}
	/**
	* `setInterval` schedules a callback to be called approximately every
	* `delay` milliseconds, like the global `setInterval` function.
	*
	* Like `setTimeout`, it returns a timer ID, which may be a number or an
	* object that can be coerced to a number via `Symbol.toPrimitive`.
	* @param callback - The function to call on every interval.
	* @param delay - The time between calls, in milliseconds.
	* @returns The timer ID, to pass to {@link TimeoutManager#clearInterval}.
	* @example
	* ```ts
	* import { timeoutManager } from '@tanstack/query-core'
	*
	* const intervalId = timeoutManager.setInterval(
	*   () => console.log('ran at:', new Date()),
	*   1000,
	* )
	* ```
	*/
	setInterval(callback, delay) {
		this.#providerCalled = true;
		return this.#provider.setInterval(callback, delay);
	}
	/**
	* `clearInterval` can be used to cancel an interval, like the global
	* `clearInterval` function. It should be called with an interval ID
	* returned by `setInterval`.
	* @param intervalId - The timer ID returned by `setInterval`, or `undefined`.
	* @example
	* ```ts
	* import { timeoutManager } from '@tanstack/query-core'
	*
	* const intervalId = timeoutManager.setInterval(
	*   () => console.log('ran at:', new Date()),
	*   1000,
	* )
	*
	* timeoutManager.clearInterval(intervalId)
	* ```
	*/
	clearInterval(intervalId) {
		this.#provider.clearInterval(intervalId);
	}
};
/**
* Singleton instance of {@link TimeoutManager}, used throughout TanStack Query to schedule and cancel timers.
*/
var timeoutManager = new TimeoutManager();
/**
* In many cases code wants to delay to the next event loop tick; this is not
* mediated by {@link timeoutManager}.
*
* This function is provided to make auditing the `tanstack/query-core` for
* incorrect use of system `setTimeout` easier.
* @param callback - The function to call on the next event loop tick.
*/
function systemSetTimeoutZero(callback) {
	setTimeout(callback, 0);
}
// node_modules/@tanstack/query-core/build/modern/utils.js
/**
* @deprecated use `environmentManager.isServer()` instead.
*/
var isServer$1 = typeof window === "undefined" || "Deno" in globalThis;
function noop() {}
/**
* Resolves an {@link Updater}: calls it with `input` if it is a function, otherwise returns it as
* is.
* @param updater - The new value, or a function that receives `input` and returns the new value.
* @param input - The current value, passed to `updater` if it is a function.
* @returns The new value.
*/
function functionalUpdate(updater, input) {
	return typeof updater === "function" ? updater(input) : updater;
}
/**
* Checks whether a value can be used as a timeout: a non-negative, finite number.
* @param value - The value to check.
* @returns `true` if `value` is a number that is `>= 0` and not `Infinity`.
*/
function isValidTimeout(value) {
	return typeof value === "number" && value >= 0 && value !== Infinity;
}
/**
* Calculates how long until data updated at `updatedAt` becomes stale.
* @param updatedAt - The timestamp, in milliseconds, at which the data was last updated.
* @param staleTime - The time, in milliseconds, after which data is considered stale. Defaults to
* `0`.
* @returns The remaining time in milliseconds, or `0` if the data is already stale.
*/
function timeUntilStale(updatedAt, staleTime) {
	return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
/**
* Resolves an option that can be given either as a value or as a function of the query, such as
* `staleTime`.
* @param value - The option value, or a function that receives `query` and returns the value.
* @param query - The query passed to `value` if it is a function.
* @returns The resolved value, or `undefined` if `value` is `undefined`.
*/
function resolveQueryValue(value, query) {
	return typeof value === "function" ? value(query) : value;
}
/**
* Checks whether a query matches the given {@link QueryFilters}.
* Every filter that is specified must match; filters that are left unspecified are ignored.
* @param filters - The filters to check the query against.
* @param query - The query to check.
* @returns `true` if the query matches every specified filter.
* @example
* ```ts
* const queryCache = queryClient.getQueryCache()
*
* const matchingQueries = queryCache
*   .getAll()
*   .filter((query) => matchQuery({ queryKey: ['posts'] }, query))
* ```
*/
function matchQuery(filters, query) {
	const { type = "all", exact, fetchStatus, predicate, queryKey, stale } = filters;
	if (queryKey) {
		if (exact) {
			if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) return false;
		} else if (!partialMatchKey(query.queryKey, queryKey)) return false;
	}
	if (type !== "all") {
		const isActive = query.isActive();
		if (type === "active" && !isActive) return false;
		if (type === "inactive" && isActive) return false;
	}
	if (typeof stale === "boolean" && query.isStale() !== stale) return false;
	if (fetchStatus && fetchStatus !== query.state.fetchStatus) return false;
	if (predicate && !predicate(query)) return false;
	return true;
}
/**
* Checks whether a mutation matches the given {@link MutationFilters}.
* Every filter that is specified must match; filters that are left unspecified are ignored.
* If a `mutationKey` filter is provided but the mutation has no `mutationKey` of its own, it does not match.
* @param filters - The filters to check the mutation against.
* @param mutation - The mutation to check.
* @returns `true` if the mutation matches every specified filter.
* @example
* ```ts
* const mutationCache = queryClient.getMutationCache()
*
* const matchingMutations = mutationCache
*   .getAll()
*   .filter((mutation) => matchMutation({ mutationKey: ['addPost'] }, mutation))
* ```
*/
function matchMutation(filters, mutation) {
	const { exact, status, predicate, mutationKey } = filters;
	if (mutationKey) {
		if (!mutation.options.mutationKey) return false;
		if (exact) {
			if (hashKey(mutation.options.mutationKey) !== hashKey(mutationKey)) return false;
		} else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) return false;
	}
	if (status && mutation.state.status !== status) return false;
	if (predicate && !predicate(mutation)) return false;
	return true;
}
/**
* Hashes a query key with the query's `queryKeyHashFn` option, falling back to {@link hashKey}.
* @param queryKey - The query key to hash.
* @param options - The query options that may provide a custom `queryKeyHashFn`.
* @returns The query hash, a string that identifies the query in the cache.
*/
function hashQueryKeyByOptions(queryKey, options) {
	return (options?.queryKeyHashFn || hashKey)(queryKey);
}
/**
* Default query & mutation keys hash function.
* Hashes the value into a stable hash.
* @param queryKey - The query or mutation key to hash.
* @returns The stable hash of the key, as a JSON string.
* @example
* ```ts
* // Object keys are sorted, so key order doesn't affect the hash:
* hashKey(['todos', { page: 1, filter: 'done' }]) // === '["todos",{"filter":"done","page":1}]'
* ```
*/
function hashKey(queryKey) {
	return JSON.stringify(queryKey, (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
		result[key] = val[key];
		return result;
	}, {}) : val);
}
function partialMatchKey(a, b) {
	if (a === b) return true;
	if (typeof a !== typeof b) return false;
	if (a && b && typeof a === "object" && typeof b === "object") {
		if (Array.isArray(a) && Array.isArray(b)) {
			if (b.length > a.length) return false;
			for (let i = 0; i < b.length; i++) if (!partialMatchKey(a[i], b[i])) return false;
			return true;
		}
		const bKeys = Object.keys(b);
		for (const key of bKeys) if (!partialMatchKey(a[key], b[key])) return false;
		return true;
	}
	return false;
}
var hasOwn = Object.prototype.hasOwnProperty;
function replaceEqualDeep(a, b, depth = 0) {
	if (a === b) return a;
	if (depth > 500) return b;
	const array = isPlainArray(a) && isPlainArray(b);
	if (!array && !(isPlainObject(a) && isPlainObject(b))) return b;
	const aSize = (array ? a : Object.keys(a)).length;
	const bItems = array ? b : Object.keys(b);
	const bSize = bItems.length;
	const copy = array ? new Array(bSize) : {};
	let equalItems = 0;
	for (let i = 0; i < bSize; i++) {
		const key = array ? i : bItems[i];
		const aItem = a[key];
		const bItem = b[key];
		if (aItem === bItem) {
			copy[key] = aItem;
			if (array ? i < aSize : hasOwn.call(a, key)) equalItems++;
			continue;
		}
		if (aItem === null || bItem === null || typeof aItem !== "object" || typeof bItem !== "object") {
			copy[key] = bItem;
			continue;
		}
		const v = replaceEqualDeep(aItem, bItem, depth + 1);
		copy[key] = v;
		if (v === aItem) equalItems++;
	}
	return aSize === bSize && equalItems === aSize ? a : copy;
}
/**
* Shallow compare objects.
* @param a - The first object.
* @param b - The second object, or `undefined`.
* @returns `true` if both objects have the same keys, with strictly equal values for each key.
*/
function shallowEqualObjects(a, b) {
	if (!b || Object.keys(a).length !== Object.keys(b).length) return false;
	for (const key of Object.keys(a)) if (!hasOwn.call(b, key) || a[key] !== b[key]) return false;
	return true;
}
/**
* Checks whether a value is an array with no holes and no extra properties.
* @param value - The value to check.
* @returns `true` if `value` is an array whose number of own keys equals its `length`.
*/
function isPlainArray(value) {
	return Array.isArray(value) && value.length === Object.keys(value).length;
}
/**
* Checks whether a value is a plain object, e.g. created with an object literal or
* `Object.create(null)`.
* @param o - The value to check.
* @returns `true` if `o` is a plain object.
*/
function isPlainObject(o) {
	if (!hasObjectPrototype(o)) return false;
	const objectPrototype = Object.getPrototypeOf(o);
	const ctor = objectPrototype?.constructor;
	if (ctor === void 0) return true;
	if (typeof ctor !== "function") return false;
	const prot = ctor.prototype;
	if (!hasObjectPrototype(prot)) return false;
	if (!prot.hasOwnProperty("isPrototypeOf")) return false;
	if (objectPrototype !== Object.prototype) return false;
	return true;
}
/**
* Checks whether a value's `Object.prototype.toString` tag is `[object Object]`.
* @param o - The value to check.
* @returns `true` if the tag is `[object Object]`.
*/
function hasObjectPrototype(o) {
	return Object.prototype.toString.call(o) === "[object Object]";
}
/**
* Waits for the given time, using the configured {@link timeoutManager}.
* @param timeout - The time to wait, in milliseconds.
* @returns A promise that resolves after `timeout` milliseconds.
*/
function sleep(timeout) {
	return new Promise((resolve) => {
		timeoutManager.setTimeout(resolve, timeout);
	});
}
/**
* Applies a query's `structuralSharing` option when writing new data.
* @param prevData - The previously cached data.
* @param data - The new data.
* @param options - The query options, whose `structuralSharing` decides how the data is merged.
* @returns The result of a custom `structuralSharing` function, `data` with its unchanged parts
* replaced by those of `prevData` by default, or `data` as is if `structuralSharing` is `false`.
* @throws {Error} The error from the default structural sharing, e.g. when the data is not JSON serializable.
* Outside production, it is also logged to the console.
*/
function replaceData(prevData, data, options) {
	if (typeof options.structuralSharing === "function") return options.structuralSharing(prevData, data);
	else if (options.structuralSharing !== false) try {
		return replaceEqualDeep(prevData, data);
	} catch (error) {
		console.error(`Structural sharing requires data to be JSON serializable. To fix this, turn off structuralSharing or return JSON-serializable data from your queryFn. [${options.queryHash}]: ${error}`);
		throw error;
	}
	return data;
}
/**
* Returns a new array with `item` added at the end. If that makes the array longer than `max`,
* excess items are removed from the start.
* @param items - The current items.
* @param item - The value to append.
* @param max - The maximum number of items to keep. `0` (the default) means no limit.
* @returns A new array with `item` added.
*/
function addToEnd(items, item, max = 0) {
	const newItems = [...items, item];
	return max && newItems.length > max ? newItems.slice(-max) : newItems;
}
/**
* Returns a new array with `item` added at the start. If that makes the array longer than `max`,
* excess items are removed from the end.
* @param items - The current items.
* @param item - The value to prepend.
* @param max - The maximum number of items to keep. `0` (the default) means no limit.
* @returns A new array with `item` added.
*/
function addToStart(items, item, max = 0) {
	const newItems = [item, ...items];
	return max && newItems.length > max ? newItems.slice(0, max) : newItems;
}
/**
* Sentinel value that can be passed as a query's `queryFn` to conditionally disable the query (equivalent
* to `enabled: false`) while preserving full type inference for the query's data. Unlike `enabled: false`,
* a query disabled via `skipToken` cannot be triggered with `refetch`.
* @example
* ```ts
* new QueryObserver(queryClient, {
*   queryKey: ['post', postId],
*   queryFn: postId != null ? () => fetchPost(postId) : skipToken,
* })
* ```
*/
var skipToken = Symbol();
/**
* Returns the function to call for a fetch. If there is no `queryFn` but the fetch was started from
* an `initialPromise`, that promise is returned instead. If there is no usable `queryFn` (missing or
* {@link skipToken}), the returned function rejects with a `Missing queryFn` error.
* @param options - The query options with the `queryFn`, and the `queryHash` used in error messages.
* @param fetchOptions - The fetch options, which may carry an `initialPromise`.
* @returns The function to call for the fetch.
*/
function ensureQueryFn(options, fetchOptions) {
	if (options.queryFn === skipToken) console.error(`Attempted to invoke queryFn when set to skipToken. This is likely a configuration error. Query hash: '${options.queryHash}'`);
	if (!options.queryFn && fetchOptions?.initialPromise) return () => fetchOptions.initialPromise;
	if (!options.queryFn || options.queryFn === skipToken) return () => Promise.reject(/* @__PURE__ */ new Error(`Missing queryFn: '${options.queryHash}'`));
	return options.queryFn;
}
/**
* Resolves a `throwOnError` option to a boolean.
* If `throwOnError` is a function, it is called with `params` (e.g. the error and, depending on the caller,
* additional context such as the query or mutation) and its result is returned, allowing the throwing
* behavior to be decided per error. Otherwise, `throwOnError` itself is coerced to a boolean (`undefined`
* resolves to `false`).
* @param throwOnError - The `throwOnError` option: a boolean, a function that decides per error, or
* `undefined`.
* @param params - The arguments passed to `throwOnError` if it is a function.
* @returns Whether the error should be thrown.
* @example
* ```ts
* const throwOnError =
*   query.state.error && typeof options.throwOnError === 'function'
*     ? shouldThrowError(options.throwOnError, [query.state.error, query])
*     : options.throwOnError
* ```
*/
function shouldThrowError(throwOnError, params) {
	if (typeof throwOnError === "function") return throwOnError(...params);
	return !!throwOnError;
}
var fetchSignal = Symbol();
/**
* Adds a lazy `signal` getter to an object, such as a query function context. The first time
* `signal` is read, `onCancelled` is registered for the signal's `abort` event (or called right
* away if it is already aborted), so cancellation is only tracked when the signal is actually used.
* @param object - The object to add the `signal` property to.
* @param getSignal - Returns the `AbortSignal`. Called once, when `signal` is first read.
* @param onCancelled - Called when the signal is aborted, if `signal` was read.
* @param internalSignal - The fetch signal to forward without consuming the getter.
* @returns The same object, with the `signal` property added.
*/
function addConsumeAwareSignal(object, getSignal, onCancelled, internalSignal) {
	let consumed = false;
	let signal;
	Object.defineProperties(object, {
		[fetchSignal]: { value: internalSignal },
		signal: {
			enumerable: true,
			get: () => {
				signal ??= getSignal();
				if (consumed) return signal;
				consumed = true;
				if (signal.aborted) onCancelled();
				else signal.addEventListener("abort", onCancelled, { once: true });
				return signal;
			}
		}
	});
	return object;
}
// node_modules/@tanstack/query-core/build/modern/environmentManager.js
var isServerFn = () => isServer$1;
/**
* Returns whether the current runtime should be treated as a server environment.
* @returns `true` if the runtime is treated as a server.
*/
var isServer = () => isServerFn();
// node_modules/@tanstack/query-core/build/modern/subscribable.js
/**
* The base class behind everything in Query that you can subscribe to: `QueryCache`, `MutationCache`,
* the observers, and the `FocusManager`/`OnlineManager` behind `focusManager` and `onlineManager`.
* Subclasses decide what a listener receives and when it is called.
*/
var Subscribable = class {
	constructor() {
		this.listeners = /* @__PURE__ */ new Set();
		this.subscribe = this.subscribe.bind(this);
	}
	/**
	* Registers a listener to be called on every update this object notifies about. Returns a function
	* that removes the listener again — call it to stop listening. The base class never drops a listener
	* on its own, though some subclasses clear all of theirs in `destroy()`.
	* @param listener - Called on each update, with whatever the subclass passes to its subscribers.
	* @returns A function that removes the listener.
	* @example
	* ```ts
	* const unsubscribe = subscribable.subscribe(() => {
	*   // react to the update
	* })
	*
	* unsubscribe()
	* ```
	*/
	subscribe(listener) {
		this.listeners.add(listener);
		this.onSubscribe();
		return () => {
			this.listeners.delete(listener);
			this.onUnsubscribe();
		};
	}
	/**
	* Returns `true` while at least one listener is registered, `false` once they have all unsubscribed.
	* @returns `true` if at least one listener is registered.
	*/
	hasListeners() {
		return this.listeners.size > 0;
	}
	/**
	* Called after a listener is added. Does nothing here; subclasses override it, e.g. to start
	* tracking what they observe once the first listener subscribes.
	*/
	onSubscribe() {}
	/**
	* Called after a listener is removed. Does nothing here; subclasses override it, e.g. to clean up
	* once the last listener unsubscribes.
	*/
	onUnsubscribe() {}
};
// node_modules/@tanstack/query-core/build/modern/focusManager.js
/**
* The `FocusManager` manages the focus state within TanStack Query.
*
* It can be used to change the default event listeners or to manually change the focus state.
*/
var FocusManager = class extends Subscribable {
	#focused;
	#cleanup;
	#setup;
	constructor() {
		super();
		this.#setup = (onFocus) => {
			if (typeof window !== "undefined" && window.addEventListener) {
				const listener = () => onFocus();
				window.addEventListener("visibilitychange", listener, false);
				return () => {
					window.removeEventListener("visibilitychange", listener);
				};
			}
		};
	}
	onSubscribe() {
		if (!this.#cleanup) this.setEventListener(this.#setup);
	}
	onUnsubscribe() {
		if (!this.hasListeners()) {
			this.#cleanup?.();
			this.#cleanup = void 0;
		}
	}
	/**
	* `setEventListener` can be used to set a custom event listener that will
	* be used to determine the focus state. The provided `setup` function
	* receives a `setFocused` callback: call it with a `boolean` to manually
	* set the focus state, or with no arguments to re-evaluate the current
	* focus state and notify subscribers.
	* @param setup - Receives the `setFocused` callback, registers the event listener, and may return
	* a cleanup function that is called when the listener is replaced or no longer needed.
	* @example
	* ```ts
	* import { focusManager } from '@tanstack/query-core'
	*
	* focusManager.setEventListener((handleFocus) => {
	*   const listener = () => handleFocus()
	*   // Listen to visibilitychange
	*   if (typeof window !== 'undefined' && window.addEventListener) {
	*     window.addEventListener('visibilitychange', listener, false)
	*   }
	*
	*   return () => {
	*     // Be sure to unsubscribe if a new handler is set
	*     window.removeEventListener('visibilitychange', listener)
	*   }
	* })
	* ```
	*/
	setEventListener(setup) {
		this.#setup = setup;
		this.#cleanup?.();
		this.#cleanup = setup((focused) => {
			if (typeof focused === "boolean") this.setFocused(focused);
			else this.onFocus();
		});
	}
	/**
	* `setFocused` can be used to manually set the focus state. Set `undefined`
	* to fall back to the default focus check.
	* @param focused - The focus state, or `undefined` to use the default focus check.
	* @example
	* ```ts
	* import { focusManager } from '@tanstack/query-core'
	*
	* // Set focused
	* focusManager.setFocused(true)
	*
	* // Set unfocused
	* focusManager.setFocused(false)
	*
	* // Fallback to the default focus check
	* focusManager.setFocused(undefined)
	* ```
	*/
	setFocused(focused) {
		if (this.#focused !== focused) {
			this.#focused = focused;
			this.onFocus();
		}
	}
	/**
	* `onFocus` notifies all subscribed listeners with the current focus state.
	*/
	onFocus() {
		const isFocused = this.isFocused();
		this.listeners.forEach((listener) => {
			listener(isFocused);
		});
	}
	/**
	* `isFocused` can be used to get the current focus state.
	* @returns The focus state set with `setFocused`, or otherwise whether the document is visible.
	*/
	isFocused() {
		if (typeof this.#focused === "boolean") return this.#focused;
		return globalThis.document?.visibilityState !== "hidden";
	}
};
/**
* Singleton instance of {@link FocusManager}, used to manage and observe the focus state within TanStack Query.
*/
var focusManager = new FocusManager();
// node_modules/@tanstack/query-core/build/modern/notifyManager.js
/**
* Default scheduling function used by the notify manager.
* Schedules the callback with the system's `setTimeout(callback, 0)`.
*/
var defaultScheduler = systemSetTimeoutZero;
/**
* Creates a notify manager, which schedules and batches notifications to subscribers. Query uses a
* single instance of it, exported as {@link notifyManager}.
* @returns A new notify manager.
*/
function createNotifyManager() {
	let queue = [];
	let transactions = 0;
	let notifyFn = (callback) => {
		callback();
	};
	let batchNotifyFn = (callback) => {
		callback();
	};
	let scheduleFn = defaultScheduler;
	const schedule = (callback) => {
		if (transactions) queue.push(callback);
		else scheduleFn(() => {
			notifyFn(callback);
		});
	};
	const flush = () => {
		const originalQueue = queue;
		queue = [];
		if (originalQueue.length) scheduleFn(() => {
			batchNotifyFn(() => {
				originalQueue.forEach((callback) => {
					notifyFn(callback);
				});
			});
		});
	};
	return {
		/**
		* Batches all updates scheduled inside the passed callback.
		* This is mainly used internally to optimize query client updating.
		* Batches can be nested; the queue is only flushed once the outermost `batch` call finishes.
		* The return value of `callback` is passed through.
		* @param callback - The function to run in the batch.
		* @returns The return value of `callback`.
		*/
		batch: (callback) => {
			let result;
			transactions++;
			try {
				result = callback();
			} finally {
				transactions--;
				if (!transactions) flush();
			}
			return result;
		},
		/**
		* All calls to the wrapped function will be batched.
		* @param callback - The function to wrap.
		* @returns A function that schedules a call to `callback` with the given arguments.
		*/
		batchCalls: (callback) => {
			return (...args) => {
				schedule(() => {
					callback(...args);
				});
			};
		},
		/**
		* Schedules a function to be run on the next batch.
		* By default, the batch is run with a `setTimeout`, but this can be configured via `setScheduler`.
		*/
		schedule,
		/**
		* Use this method to set a custom notify function.
		* This can be used to for example wrap notifications with `React.act` while running tests.
		* @param fn - Receives each notification callback and must call it.
		*/
		setNotifyFunction: (fn) => {
			notifyFn = fn;
		},
		/**
		* Use this method to set a custom function to batch notifications together into a single tick.
		* Framework adapters use this to plug in their own batching primitive, so that a single query
		* update only triggers one re-render instead of one per subscriber.
		* @param fn - Receives a function that runs a batch of notifications and must call it.
		* @example
		* ```ts
		* import { notifyManager } from '@tanstack/query-core'
		* import { batch } from 'solid-js'
		*
		* notifyManager.setBatchNotifyFunction(batch)
		* ```
		*/
		setBatchNotifyFunction: (fn) => {
			batchNotifyFn = fn;
		},
		/**
		* Configures a custom callback that schedules when the next batch runs.
		* The default behavior is `setTimeout(callback, 0)`.
		* @param fn - Receives a callback that runs the next batch, and schedules it.
		* @example
		* ```ts
		* import { notifyManager } from '@tanstack/query-core'
		*
		* // Schedule batches in the next microtask
		* notifyManager.setScheduler(queueMicrotask)
		*
		* // Schedule batches before the next frame is rendered
		* notifyManager.setScheduler(requestAnimationFrame)
		*
		* // Schedule batches some time in the future
		* notifyManager.setScheduler((cb) => setTimeout(cb, 10))
		* ```
		*/
		setScheduler: (fn) => {
			scheduleFn = fn;
		}
	};
}
/**
* Handles scheduling and batching callbacks in TanStack Query.
*/
var notifyManager = createNotifyManager();
// node_modules/@tanstack/query-core/build/modern/onlineManager.js
/**
* The `OnlineManager` manages the online state within TanStack Query. It can
* be used to change the default event listeners or to manually change the
* online state.
*
* By default, the `onlineManager` assumes an active network connection, and
* listens to the `online` and `offline` events on the `window` object to
* detect changes.
*/
var OnlineManager = class extends Subscribable {
	#online = true;
	#cleanup;
	#setup;
	constructor() {
		super();
		this.#setup = (onOnline) => {
			if (typeof window !== "undefined" && window.addEventListener) {
				const onlineListener = () => onOnline(true);
				const offlineListener = () => onOnline(false);
				window.addEventListener("online", onlineListener, false);
				window.addEventListener("offline", offlineListener, false);
				return () => {
					window.removeEventListener("online", onlineListener);
					window.removeEventListener("offline", offlineListener);
				};
			}
		};
	}
	onSubscribe() {
		if (!this.#cleanup) this.setEventListener(this.#setup);
	}
	onUnsubscribe() {
		if (!this.hasListeners()) {
			this.#cleanup?.();
			this.#cleanup = void 0;
		}
	}
	/**
	* `setEventListener` can be used to set a custom event listener that will
	* be used to determine the online state. The provided `setup` function
	* receives a `setOnline` callback that should be called with a `boolean`
	* whenever the online state changes.
	* @param setup - Receives the `setOnline` callback, registers the event listener, and may return
	* a cleanup function that is called when the listener is replaced or no longer needed.
	* @example
	* ```ts
	* import NetInfo from '@react-native-community/netinfo'
	* import { onlineManager } from '@tanstack/query-core'
	*
	* onlineManager.setEventListener((setOnline) => {
	*   return NetInfo.addEventListener((state) => {
	*     setOnline(!!state.isConnected)
	*   })
	* })
	* ```
	*/
	setEventListener(setup) {
		this.#setup = setup;
		this.#cleanup?.();
		this.#cleanup = setup(this.setOnline.bind(this));
	}
	/**
	* `setOnline` can be used to manually set the online state.
	* @param online - The online state.
	* @example
	* ```ts
	* import { onlineManager } from '@tanstack/query-core'
	*
	* // Set to online
	* onlineManager.setOnline(true)
	*
	* // Set to offline
	* onlineManager.setOnline(false)
	* ```
	*/
	setOnline(online) {
		if (this.#online !== online) {
			this.#online = online;
			this.listeners.forEach((listener) => {
				listener(online);
			});
		}
	}
	/**
	* `isOnline` can be used to get the current online state.
	* @returns `true` if online.
	*/
	isOnline() {
		return this.#online;
	}
};
/**
* Singleton instance of {@link OnlineManager}, used to manage and observe the online state within TanStack Query.
*/
var onlineManager = new OnlineManager();
// node_modules/@tanstack/query-core/build/modern/retryer.js
/**
* The default `retryDelay`: doubles with every failure, starting at 1 second, up to 30 seconds.
* @param failureCount - The number of failures so far.
* @returns The delay before the next retry, in milliseconds.
*/
function defaultRetryDelay(failureCount) {
	return Math.min(1e3 * 2 ** failureCount, 3e4);
}
/**
* Checks whether a fetch can run for the given network mode.
* @param networkMode - The `networkMode` option. Defaults to `'online'`.
* @returns `true` if the network mode is not `'online'`, or if it is and the client is online.
*/
function canFetch(networkMode) {
	return (networkMode ?? "online") === "online" ? onlineManager.isOnline() : true;
}
/**
* The error thrown by a `Retryer` (and surfaced to `query.promise`/`mutation`) when a fetch is cancelled, e.g. via
* `query.cancel()`. `revert`, if `true`, tells the caller to restore the state the query was in before the fetch
* started instead of surfacing the error. `silent`, if `true`, tells the caller to suppress this error and instead
* resolve with the promise of the fetch that triggered the cancellation.
* @example
* ```ts
* query.cancel()
*
* try {
*   await query.promise
* } catch (error) {
*   if (error instanceof CancelledError) {
*     // the fetch was cancelled, e.g. via `query.cancel()`
*   }
* }
* ```
*/
var CancelledError = class extends Error {
	constructor(options) {
		super("CancelledError");
		this.revert = options?.revert;
		this.silent = options?.silent;
	}
};
/**
* Creates a retryer, which runs a function and retries it on failure according to the `retry` and
* `retryDelay` options. It pauses while the network mode doesn't allow fetching or `canRun` returns
* `false`, and can be cancelled. Queries and mutations use it to run their `queryFn` and
* `mutationFn`.
* @param config - The function to run, the retry options, and the callbacks for failures, pausing,
* continuing, and cancellation.
* @returns The retryer, whose `promise` settles with the result of the function.
*/
function createRetryer(config) {
	let isRetryCancelled = false;
	let failureCount = 0;
	let continueFn;
	let status = "pending";
	let promiseResolve;
	let promiseReject;
	const promise = new Promise((resolve, reject) => {
		promiseResolve = resolve;
		promiseReject = reject;
	});
	promise.catch(noop);
	const isResolved = () => status !== "pending";
	const cancel = (cancelOptions) => {
		if (!isResolved()) {
			const error = new CancelledError(cancelOptions);
			reject(error);
			config.onCancel?.(error);
		}
	};
	const cancelRetry = () => {
		isRetryCancelled = true;
	};
	const continueRetry = () => {
		isRetryCancelled = false;
	};
	const canContinue = () => focusManager.isFocused() && (config.networkMode === "always" || onlineManager.isOnline()) && config.canRun();
	const canStart = () => canFetch(config.networkMode) && config.canRun();
	const resolve = (value) => {
		if (!isResolved()) {
			continueFn?.();
			status = "resolved";
			promiseResolve(value);
		}
	};
	const reject = (value) => {
		if (!isResolved()) {
			continueFn?.();
			status = "rejected";
			promiseReject(value);
		}
	};
	const pause = (canResume) => {
		return new Promise((continueResolve) => {
			continueFn = (value) => {
				if (isResolved() || canResume()) continueResolve(value);
			};
			config.onPause?.();
		}).then(() => {
			continueFn = void 0;
			if (!isResolved()) config.onContinue?.();
		});
	};
	const run = () => {
		if (isResolved()) return;
		let promiseOrValue;
		const initialPromise = failureCount === 0 ? config.initialPromise : void 0;
		try {
			promiseOrValue = initialPromise ?? config.fn();
		} catch (error) {
			promiseOrValue = Promise.reject(error);
		}
		Promise.resolve(promiseOrValue).then(resolve).catch((error) => {
			if (isResolved()) return;
			const retry = config.retry ?? (isServer() ? 0 : 3);
			const retryDelay = config.retryDelay ?? defaultRetryDelay;
			const delay = typeof retryDelay === "function" ? retryDelay(failureCount, error) : retryDelay;
			const shouldRetry = retry === true || typeof retry === "number" && failureCount < retry || typeof retry === "function" && retry(failureCount, error);
			if (isRetryCancelled || !shouldRetry) {
				reject(error);
				return;
			}
			failureCount++;
			config.onFail?.(failureCount, error);
			sleep(delay).then(() => {
				return isResolved() || canContinue() ? void 0 : pause(canContinue);
			}).then(() => {
				if (isRetryCancelled) reject(error);
				else run();
			});
		});
	};
	return {
		promise,
		status: () => status,
		cancel,
		continue: () => {
			continueFn?.();
			return promise;
		},
		cancelRetry,
		continueRetry,
		canStart,
		start: () => {
			if (canStart()) run();
			else pause(canStart).then(run);
			return promise;
		}
	};
}
// node_modules/@tanstack/query-core/build/modern/removable.js
/**
* The base class for cache entries that are garbage collected once nothing is using them —
* `Query` and `Mutation` both extend it. `gcTime` controls how long an unused entry is kept.
*/
var Removable = class {
	#gcTimeout;
	/**
	* Clears the pending garbage collection timeout, so the entry is no longer scheduled for removal.
	* A subclass may override this to release what it holds on to as well — `Query` also cancels any
	* in-flight fetch.
	*/
	destroy() {
		this.clearGcTimeout();
	}
	/**
	* Schedules the entry to be removed from its cache after `gcTime`, replacing any timeout scheduled
	* before. Nothing is scheduled if `gcTime` is `Infinity`.
	*/
	scheduleGc() {
		this.clearGcTimeout();
		if (isValidTimeout(this.gcTime)) this.#gcTimeout = timeoutManager.setTimeout(() => {
			this.optionalRemove();
		}, this.gcTime);
	}
	/**
	* Updates `gcTime`, keeping the longest one seen so far. Without a value, it defaults to 5 minutes
	* on the client and `Infinity` on the server.
	* @param newGcTime - The `gcTime` from the latest options, if any.
	*/
	updateGcTime(newGcTime) {
		this.gcTime = Math.max(this.gcTime || 0, newGcTime ?? (isServer() ? Infinity : 3e5));
	}
	/**
	* Cancels the scheduled removal, if there is one.
	*/
	clearGcTimeout() {
		if (this.#gcTimeout !== void 0) {
			timeoutManager.clearTimeout(this.#gcTimeout);
			this.#gcTimeout = void 0;
		}
	}
};
// node_modules/@tanstack/query-core/build/modern/infiniteQueryBehavior.js
/**
* Creates the behavior that fetches the pages of an infinite query: the next or previous page for
* `fetchNextPage`/`fetchPreviousPage`, or all pages again from the start on a refetch.
* @param pages - The number of pages to fetch from the start when all pages are fetched again,
* e.g. from the `pages` option of `queryClient.infiniteQuery`. Defaults to the number of cached
* pages.
* @returns The query behavior to set on an infinite query.
*/
function infiniteQueryBehavior(pages) {
	return { onFetch: (context, query) => {
		const options = context.options;
		const direction = context.fetchOptions?.meta?.fetchMore?.direction;
		const oldPages = context.state.data?.pages || [];
		const oldPageParams = context.state.data?.pageParams || [];
		let result = {
			pages: [],
			pageParams: []
		};
		let currentPage = 0;
		const fetchFn = async () => {
			let cancelled = false;
			const signalContext = context;
			const addSignalProperty = (object) => {
				addConsumeAwareSignal(object, () => context.signal, () => cancelled = true, signalContext[fetchSignal]);
			};
			const queryFn = ensureQueryFn(context.options, context.fetchOptions);
			const fetchPage = async (data, param, previous) => {
				if (cancelled) return Promise.reject(context.signal.reason);
				if (param == null && data.pages.length) return Promise.resolve(data);
				const createQueryFnContext = () => {
					const queryFnContext = {
						client: context.client,
						queryKey: context.queryKey,
						pageParam: param,
						direction: previous ? "backward" : "forward",
						meta: context.options.meta
					};
					addSignalProperty(queryFnContext);
					return queryFnContext;
				};
				const queryFnContext = createQueryFnContext();
				const page = await queryFn(queryFnContext);
				const { maxPages } = context.options;
				const addTo = previous ? addToStart : addToEnd;
				return {
					pages: addTo(data.pages, page, maxPages),
					pageParams: addTo(data.pageParams, param, maxPages)
				};
			};
			if (direction && oldPages.length) {
				const previous = direction === "backward";
				const pageParamFn = previous ? getPreviousPageParam : getNextPageParam;
				const oldData = {
					pages: oldPages,
					pageParams: oldPageParams
				};
				result = await fetchPage(oldData, pageParamFn(options, oldData), previous);
			} else {
				const remainingPages = pages ?? oldPages.length;
				do {
					const param = currentPage === 0 ? oldPageParams[0] === void 0 ? options.initialPageParam : oldPageParams[0] : getNextPageParam(options, result);
					if (currentPage > 0 && param == null) break;
					result = await fetchPage(result, param);
					currentPage++;
				} while (currentPage < remainingPages);
			}
			return result;
		};
		if (context.options.persister) context.fetchFn = () => {
			return context.options.persister?.(fetchFn, {
				client: context.client,
				queryKey: context.queryKey,
				meta: context.options.meta,
				signal: context.signal
			}, query);
		};
		else context.fetchFn = fetchFn;
	} };
}
/**
* Computes the page param of the page after the last one, with the `getNextPageParam` option.
* @param options - The infinite query options.
* @param data - The current pages and page params.
* @returns The next page param, or `undefined` if there are no pages yet.
*/
function getNextPageParam(options, { pages, pageParams }) {
	const lastIndex = pages.length - 1;
	return pages.length > 0 ? options.getNextPageParam(pages[lastIndex], pages, pageParams[lastIndex], pageParams) : void 0;
}
/**
* Computes the page param of the page before the first one, with the `getPreviousPageParam`
* option.
* @param options - The infinite query options.
* @param data - The current pages and page params.
* @returns The previous page param, or `undefined` if there are no pages yet or no
* `getPreviousPageParam` option.
*/
function getPreviousPageParam(options, { pages, pageParams }) {
	return pages.length > 0 ? options.getPreviousPageParam?.(pages[0], pages, pageParams[0], pageParams) : void 0;
}
// node_modules/@tanstack/query-core/build/modern/query.js
/**
* Represents a single cached query. A `Query` holds the query's key, options,
* state (data/error/status), and the observers currently subscribed to it.
*
* Instances are created and managed internally by `QueryCache`; application
* code typically interacts with queries indirectly through `QueryClient` or
* a framework hook like `useQuery`. Direct access to a `Query` instance is
* possible via `queryCache.find()`/`findAll()` for inspecting cache state.
* @example
* ```ts
* const queryCache = queryClient.getQueryCache()
* const query = queryCache.find({ queryKey: ['posts'] })
*
* if (query) {
*   console.log(query.state.dataUpdatedAt)
* }
* ```
*/
var Query = class extends Removable {
	#queryType;
	#initialState;
	#revertState;
	#cache;
	#client;
	#retryer;
	#fetchPromise;
	#defaultOptions;
	#abortSignalConsumed;
	constructor(config) {
		super();
		this.#abortSignalConsumed = false;
		this.#defaultOptions = config.defaultOptions;
		this.setOptions(config.options);
		this.observers = [];
		this.#client = config.client;
		this.#cache = this.#client.getQueryCache();
		this.queryKey = config.queryKey;
		this.queryHash = config.queryHash;
		this.#initialState = getDefaultState$1(this.options);
		this.state = config.state ?? this.#initialState;
		this.scheduleGc();
	}
	/**
	* The `meta` object passed in the query's options, if any.
	* @returns The query's `meta`, or `undefined` if none was set.
	*/
	get meta() {
		return this.options.meta;
	}
	/**
	* `'infinite'` for an infinite query, otherwise `undefined`.
	* @internal
	* @returns The type of the query, set from the `_type` option (e.g. `'infinite'`).
	*/
	get queryType() {
		return this.#queryType;
	}
	/**
	* The promise for the currently in-flight fetch, if the query is fetching.
	* `undefined` when the query is not fetching.
	* @returns The promise of the in-flight fetch, or `undefined`.
	*/
	get promise() {
		return this.#retryer?.promise;
	}
	/**
	* Replaces the query's options and applies their `gcTime`. If the query has no data yet, it gets
	* the `initialData` from the new options, if any.
	* @internal
	* @param options - The new query options, merged on top of the query's default options.
	*/
	setOptions(options) {
		this.options = {
			...this.#defaultOptions,
			...options
		};
		if (options?._type) this.#queryType = options._type;
		this.updateGcTime(this.options.gcTime);
		if (this.state && this.state.data === void 0) {
			const defaultState = getDefaultState$1(this.options);
			if (defaultState.data !== void 0) {
				this.setState(successState(defaultState.data, defaultState.dataUpdatedAt));
				this.#initialState = defaultState;
			}
		}
	}
	optionalRemove() {
		if (!this.observers.length && this.state.fetchStatus === "idle") this.#cache.remove(this);
	}
	/**
	* Writes new data to the query and marks it as successfully fetched.
	* @internal
	* @param newData - The data to write. Structural sharing with the current data is applied.
	* @param options - Set `updatedAt` to override the timestamp, and `manual` to mark the write as
	* manual (e.g. from `queryClient.setQueryData`).
	* @returns The data that was written.
	*/
	setData(newData, options) {
		const data = replaceData(this.state.data, newData, this.options);
		this.#dispatch({
			data,
			type: "success",
			dataUpdatedAt: options?.updatedAt,
			manual: options?.manual
		});
		return data;
	}
	/**
	* Merges the given partial state directly into this query's state, notifying observers. Used
	* by persistence and broadcast plugins to restore a state snapshot, and by devtools to let a
	* user manually trigger a loading/error state or edit the cached data.
	* @param state - The partial state to merge into the query's state.
	*/
	setState(state) {
		this.#dispatch({
			type: "setState",
			state
		});
	}
	/**
	* Cancels the query's currently in-flight fetch, if any.
	* - Returns a promise that resolves once the cancellation has settled.
	* - If no fetch is in progress, resolves immediately.
	* @param options - Set `revert` to restore the state from before the fetch started, and `silent`
	* to suppress the cancellation error when a new fetch replaces the cancelled one.
	* @returns A promise that resolves once the cancellation has settled.
	* @example
	* ```ts
	* await query.cancel()
	* ```
	*/
	cancel(options) {
		const promise = this.#retryer?.promise;
		this.#retryer?.cancel(options);
		return promise ? promise.then(noop).catch(noop) : Promise.resolve();
	}
	/**
	* Clears the query's garbage collection timeout and silently cancels any
	* in-flight fetch. Called by `QueryCache` when the query is removed from
	* the cache.
	* @see {@link Query#cancel}
	*/
	destroy() {
		super.destroy();
		this.cancel({ silent: true });
	}
	/**
	* The state the query was created with.
	* @internal
	* @returns The state the query had when it was first created, used by {@link Query#reset}.
	*/
	get resetState() {
		return this.#initialState;
	}
	/**
	* Resets the query back to its initial state (the state it had when it was
	* first created, e.g. any `initialData`), destroying it first to cancel any
	* in-flight fetch.
	*/
	reset() {
		this.destroy();
		this.setState(this.resetState);
	}
	/**
	* Returns `true` if the query has at least one observer for which `enabled`
	* does not resolve to `false`.
	* @returns `true` if the query has an enabled observer.
	*/
	isActive() {
		return this.observers.some((observer) => resolveQueryValue(observer.options.enabled, this) !== false);
	}
	/**
	* Returns `true` if the query is disabled, meaning it will not fetch
	* automatically.
	* - If the query has observers, it is disabled when none of them are active
	*   (see `isActive`).
	* - If the query has no observers, it is disabled when its `queryFn` is
	*   `skipToken` or it has never been fetched.
	* @returns `true` if the query is disabled.
	*/
	isDisabled() {
		if (this.getObserversCount() > 0) return !this.isActive();
		return this.options.queryFn === skipToken || !this.isFetched();
	}
	/**
	* Returns `true` if the query has been fetched, i.e. it has resolved with
	* either data or an error at least once.
	* @returns `true` if the query has been fetched.
	*/
	isFetched() {
		return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
	}
	/**
	* Returns `true` if the query has data and at least one observer configured with
	* `staleTime: 'static'`, meaning it is treated as never stale.
	* @returns `true` if the query is static.
	*/
	isStatic() {
		if (this.state.data === void 0) return false;
		if (this.getObserversCount() > 0) return this.observers.some((observer) => resolveQueryValue(observer.options.staleTime, this) === "static");
		return false;
	}
	/**
	* Returns `true` if the query is stale.
	* - If the query has observers, defers to whether any observer's current
	*   result reports `isStale` (which accounts for each observer's own
	*   `staleTime` and `enabled` state).
	* - If the query has no observers, it is considered stale when it has no
	*   data or has been invalidated.
	* @returns `true` if the query is stale.
	* @see {@link Query#isStaleByTime}
	* @example
	* ```ts
	* if (query.isStale()) {
	*   // refetch or otherwise treat the cached data as outdated
	* }
	* ```
	*/
	isStale() {
		if (this.getObserversCount() > 0) return this.observers.some((observer) => observer.getCurrentResult().isStale);
		return this.state.data === void 0 || this.state.isInvalidated;
	}
	/**
	* Returns `true` if the query's data is stale relative to the given
	* `staleTime` (defaults to `0`).
	* - A query with no data is always stale.
	* - `staleTime: 'static'` is never stale.
	* - An invalidated query is always stale.
	* - Otherwise, staleness is based on elapsed time since `dataUpdatedAt`.
	* @param staleTime - The time, in milliseconds, after which data is considered stale, or
	* `'static'` to never treat existing data as stale. A query without data is stale either way.
	* @returns `true` if the query's data is stale.
	* @see {@link Query#isStale}
	* @example
	* ```ts
	* const isStale = query.isStaleByTime(60 * 1000)
	* ```
	*/
	isStaleByTime(staleTime = 0) {
		if (this.state.data === void 0) return true;
		if (staleTime === "static") return false;
		if (this.state.isInvalidated) return true;
		return !timeUntilStale(this.state.dataUpdatedAt, staleTime);
	}
	/**
	* Refetches the query when the window regains focus, if an observer wants that, and continues a
	* paused fetch.
	* @internal
	*/
	onFocus() {
		this.observers.find((x) => x.shouldFetchOnWindowFocus())?.refetch({ cancelRefetch: false });
		this.#retryer?.continue();
	}
	/**
	* Refetches the query when the app reconnects, if an observer wants that, and continues a paused
	* fetch.
	* @internal
	*/
	onOnline() {
		this.observers.find((x) => x.shouldFetchOnReconnect())?.refetch({ cancelRefetch: false });
		this.#retryer?.continue();
	}
	/**
	* Subscribes an observer to the query and stops its garbage collection.
	* @internal
	* @param observer - The observer to add. Adding an observer that is already subscribed does
	* nothing.
	*/
	addObserver(observer) {
		if (!this.observers.includes(observer)) {
			this.observers.push(observer);
			this.clearGcTimeout();
			this.#cache.notify({
				type: "observerAdded",
				query: this,
				observer
			});
		}
	}
	/**
	* Unsubscribes an observer from the query.
	* @internal
	* @param observer - The observer to remove. When the last observer is removed, the in-flight
	* fetch is cancelled if its abort signal was consumed (otherwise only its retries are stopped),
	* and garbage collection is scheduled.
	*/
	removeObserver(observer) {
		const index = this.observers.indexOf(observer);
		if (index !== -1) {
			this.observers.splice(index, 1);
			if (!this.observers.length) {
				if (this.#retryer) {
					if (this.#abortSignalConsumed || this.state.fetchStatus === "paused" && this.state.status === "pending") this.#retryer.cancel({ revert: true });
					else this.#retryer.cancelRetry();
				}
				this.scheduleGc();
			}
			this.#cache.notify({
				type: "observerRemoved",
				query: this,
				observer
			});
		}
	}
	/**
	* Returns the number of observers currently subscribed to this query.
	* @returns The number of observers.
	* @example
	* ```ts
	* if (query.getObserversCount() === 0) {
	*   // no component is currently watching this query
	* }
	* ```
	*/
	getObserversCount() {
		return this.observers.length;
	}
	/**
	* Marks the query as invalidated, unless it is already invalidated. This
	* updates `state.isInvalidated` and notifies observers, but does not by
	* itself trigger a refetch.
	* @example
	* ```ts
	* query.invalidate()
	* ```
	*/
	invalidate() {
		if (!this.state.isInvalidated) this.#dispatch({ type: "invalidate" });
	}
	/**
	* Fetches the query, i.e. runs its `queryFn` (through any configured
	* retryer/behavior) and updates the query's state with the result.
	* - If a fetch is already in flight, returns its promise instead of
	*   starting a new one, unless `fetchOptions.cancelRefetch` is set and the
	*   query already has data, in which case the current fetch is silently
	*   cancelled first.
	* - If `options` is passed, it replaces the query's current options
	*   before fetching.
	* @param options - Query options that replace the query's current options before fetching. They
	* are not applied when an in-flight fetch is reused.
	* @param fetchOptions - Set `cancelRefetch` to cancel an in-flight fetch first (only if the query
	* already has data), and `meta` to pass extra information to the query's behavior.
	* @returns A promise that resolves with the fetched data, or rejects with the fetch error. If the
	* fetch is cancelled with `revert` while the query has data, it resolves with the restored data
	* instead.
	*/
	async fetch(options, fetchOptions) {
		if (this.state.fetchStatus !== "idle" && this.#retryer?.status() !== "rejected") {
			if (this.state.data !== void 0 && fetchOptions?.cancelRefetch) this.cancel({ silent: true });
			else if (this.#retryer && this.#fetchPromise) {
				this.#retryer.continueRetry();
				return this.#fetchPromise;
			}
		}
		if (options) this.setOptions(options);
		if (!this.options.queryFn) {
			const observer = this.observers.find((x) => x.options.queryFn);
			if (observer) this.setOptions(observer.options);
		}
		if (!Array.isArray(this.options.queryKey)) console.error(`As of v4, queryKey needs to be an Array. If you are using a string like 'repoData', please change it to an Array, e.g. ['repoData']`);
		const abortController = new AbortController();
		const addSignalProperty = (object) => {
			Object.defineProperties(object, {
				[fetchSignal]: {
					value: abortController.signal,
					enumerable: true
				},
				signal: {
					enumerable: true,
					get: () => {
						this.#abortSignalConsumed = true;
						return abortController.signal;
					}
				}
			});
		};
		const fetchFn = () => {
			const queryFn = ensureQueryFn(this.options, fetchOptions);
			const createQueryFnContext = () => {
				const queryFnContext = {
					client: this.#client,
					queryKey: this.queryKey,
					meta: this.meta
				};
				addSignalProperty(queryFnContext);
				return queryFnContext;
			};
			const queryFnContext = createQueryFnContext();
			this.#abortSignalConsumed = false;
			if (this.options.persister) return this.options.persister(queryFn, queryFnContext, this);
			return queryFn(queryFnContext);
		};
		const createFetchContext = () => {
			const context = {
				fetchOptions,
				options: this.options,
				queryKey: this.queryKey,
				client: this.#client,
				state: this.state,
				fetchFn
			};
			addSignalProperty(context);
			return context;
		};
		const context = createFetchContext();
		(this.#queryType === "infinite" ? infiniteQueryBehavior(this.options.pages) : this.options.behavior)?.onFetch(context, this);
		this.#revertState = this.state;
		if (this.state.fetchStatus === "idle" || this.state.fetchMeta !== context.fetchOptions?.meta) this.#dispatch({
			type: "fetch",
			meta: context.fetchOptions?.meta
		});
		const retryer = this.#retryer = createRetryer({
			initialPromise: fetchOptions?.initialPromise,
			fn: context.fetchFn,
			onCancel: (error) => {
				if (error instanceof CancelledError && error.revert) this.setState({
					...this.#revertState,
					fetchStatus: "idle"
				});
				abortController.abort();
			},
			onFail: (failureCount, error) => {
				this.#dispatch({
					type: "failed",
					failureCount,
					error
				});
			},
			onPause: () => {
				this.#dispatch({ type: "pause" });
			},
			onContinue: () => {
				this.#dispatch({ type: "continue" });
			},
			retry: context.options.retry,
			retryDelay: context.options.retryDelay,
			networkMode: context.options.networkMode,
			canRun: () => true
		});
		const fetchPromise = (async () => {
			try {
				const data = await retryer.promise;
				if (data === void 0) {
					console.error(`Query data cannot be undefined. Please make sure to return a value other than undefined from your query function. Affected query key: ${this.queryHash}`);
					throw new Error(`${this.queryHash} data is undefined`);
				}
				this.setData(data);
				this.#cache.config.onSuccess?.(data, this);
				this.#cache.config.onSettled?.(data, this.state.error, this);
				return data;
			} catch (error) {
				if (error instanceof CancelledError) {
					if (error.silent) {
						if (this.#retryer !== retryer && this.#fetchPromise) return this.#fetchPromise;
						throw error;
					} else if (error.revert) {
						if (this.state.data === void 0) throw error;
						return this.state.data;
					}
				}
				this.#dispatch({
					type: "error",
					error
				});
				this.#cache.config.onError?.(error, this);
				this.#cache.config.onSettled?.(this.state.data, error, this);
				throw error;
			} finally {
				if (this.#retryer === retryer) {
					this.#retryer = void 0;
					this.#fetchPromise = void 0;
				}
				this.scheduleGc();
			}
		})();
		this.#fetchPromise = fetchPromise;
		retryer.start();
		return fetchPromise;
	}
	#dispatch(action) {
		const reducer = (state) => {
			switch (action.type) {
				case "failed": return {
					...state,
					fetchFailureCount: action.failureCount,
					fetchFailureReason: action.error
				};
				case "pause": return {
					...state,
					fetchStatus: "paused"
				};
				case "continue": return {
					...state,
					fetchStatus: "fetching"
				};
				case "fetch": return {
					...state,
					...fetchState(state.data, this.options),
					fetchMeta: action.meta ?? null
				};
				case "success":
					const newState = {
						...state,
						...successState(action.data, action.dataUpdatedAt),
						dataUpdateCount: state.dataUpdateCount + 1,
						...!action.manual && {
							fetchStatus: "idle",
							fetchFailureCount: 0,
							fetchFailureReason: null
						}
					};
					this.#revertState = action.manual ? newState : void 0;
					return newState;
				case "error":
					const error = action.error;
					return {
						...state,
						error,
						errorUpdateCount: state.errorUpdateCount + 1,
						errorUpdatedAt: Date.now(),
						fetchFailureCount: state.fetchFailureCount + 1,
						fetchFailureReason: error,
						fetchStatus: "idle",
						status: "error",
						isInvalidated: true
					};
				case "invalidate": return {
					...state,
					isInvalidated: true
				};
				case "setState": return {
					...state,
					...action.state
				};
			}
		};
		this.state = reducer(this.state);
		notifyManager.batch(() => {
			this.observers.slice().forEach((observer) => {
				observer.onQueryUpdate();
			});
			this.#cache.notify({
				query: this,
				type: "updated",
				action
			});
		});
	}
};
/**
* Returns the state changes applied when a query starts fetching.
* @param data - The query's current data. If it is `undefined`, the query is also reset to
* `'pending'` with no error.
* @param options - The query options, whose `networkMode` decides whether the query is `'fetching'`
* or `'paused'`.
* @returns The partial query state for a starting fetch.
*/
function fetchState(data, options) {
	return {
		fetchFailureCount: 0,
		fetchFailureReason: null,
		fetchStatus: canFetch(options.networkMode) ? "fetching" : "paused",
		...data === void 0 && {
			error: null,
			status: "pending"
		}
	};
}
/**
* Returns the state changes applied when a query receives data.
* @param data - The new data.
* @param dataUpdatedAt - The timestamp the data is recorded with. Defaults to the current time.
* @returns The partial query state for a successful update.
*/
function successState(data, dataUpdatedAt) {
	return {
		data,
		dataUpdatedAt: dataUpdatedAt ?? Date.now(),
		error: null,
		isInvalidated: false,
		status: "success"
	};
}
/**
* Returns the initial state of a query, based on its `initialData` and `initialDataUpdatedAt`
* options.
* @param options - The query options.
* @returns The initial query state: `'success'` if `initialData` is set, otherwise `'pending'`.
*/
function getDefaultState$1(options) {
	const data = typeof options.initialData === "function" ? options.initialData() : options.initialData;
	const hasData = data !== void 0;
	const initialDataUpdatedAt = hasData ? typeof options.initialDataUpdatedAt === "function" ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
	return {
		data,
		dataUpdateCount: 0,
		dataUpdatedAt: hasData ? initialDataUpdatedAt ?? Date.now() : 0,
		error: null,
		errorUpdateCount: 0,
		errorUpdatedAt: 0,
		fetchFailureCount: 0,
		fetchFailureReason: null,
		fetchMeta: null,
		isInvalidated: false,
		status: hasData ? "success" : "pending",
		fetchStatus: "idle"
	};
}
// node_modules/@tanstack/query-core/build/modern/queryObserver.js
/**
* A `QueryObserver` watches a single query in the `QueryCache` and computes a
* `QueryObserverResult` from its state, recomputing and notifying subscribers
* whenever the underlying query (or the observer's options) changes. It is
* the primitive that framework adapters (e.g. `useQuery`) build their hooks
* on top of, but it can also be used directly to observe and switch between
* queries outside of any framework.
* @example
* ```ts
* const observer = new QueryObserver(queryClient, {
*   queryKey: ['posts'],
*   queryFn: fetchPosts,
* })
*
* const unsubscribe = observer.subscribe((result) => {
*   console.log(result.data)
* })
* ```
*/
var QueryObserver = class extends Subscribable {
	#client;
	#currentQuery = void 0;
	#currentQueryInitialState = void 0;
	#currentResult = void 0;
	#currentResultState;
	#currentResultOptions;
	#selectError;
	#selectFn;
	#selectResult;
	#lastQueryWithDefinedData;
	#staleTimeoutId;
	#refetchIntervalId;
	#currentRefetchInterval;
	#trackedProps = /* @__PURE__ */ new Set();
	constructor(client, options) {
		super();
		this.options = options;
		this.#client = client;
		this.#selectError = null;
		this.bindMethods();
		this.setOptions(options);
	}
	/**
	* Binds the methods of the result (`refetch`) to the observer, so they keep working when destructured
	* from it. Subclasses override it to bind their own result methods as well.
	*/
	bindMethods() {
		this.refetch = this.refetch.bind(this);
	}
	onSubscribe() {
		if (this.listeners.size === 1) {
			this.#currentQuery.addObserver(this);
			if (shouldFetchOnMount(this.#currentQuery, this.options)) this.#executeFetch();
			else this.updateResult();
			this.#updateTimers();
		}
	}
	onUnsubscribe() {
		if (!this.hasListeners()) this.destroy();
	}
	/**
	* Returns whether the observed query is currently stale and configured
	* (via the `refetchOnReconnect` option) to refetch when the network
	* reconnects.
	* @returns `true` if the observer should refetch the query on reconnect.
	*/
	shouldFetchOnReconnect() {
		return shouldFetchOn(this.#currentQuery, this.options, this.options.refetchOnReconnect);
	}
	/**
	* Returns whether the observed query is currently stale and configured
	* (via the `refetchOnWindowFocus` option) to refetch when the window
	* regains focus.
	* @returns `true` if the observer should refetch the query on window focus.
	*/
	shouldFetchOnWindowFocus() {
		return shouldFetchOn(this.#currentQuery, this.options, this.options.refetchOnWindowFocus);
	}
	/**
	* Stops observing the current query: clears all listeners, cancels the
	* stale and refetch-interval timers, and removes this observer from the
	* query it was observing.
	*/
	destroy() {
		this.listeners = /* @__PURE__ */ new Set();
		this.#clearStaleTimeout();
		this.#clearRefetchInterval();
		this.#currentQuery.removeObserver(this);
	}
	/**
	* Updates the observer's options. This will re-resolve the query being
	* observed (switching to a different query if the `queryKey` changed),
	* trigger a fetch if the new options require one and the observer has
	* subscribers, recompute the current result, and reschedule the stale and
	* refetch-interval timers as needed.
	* @param options - The new observer options. They are defaulted with {@link
	* QueryClient#defaultQueryOptions} before being applied.
	* @throws {Error} If `enabled` is neither a boolean nor a function.
	* @example
	* ```ts
	* observer.setOptions({ queryKey: ['posts', 1], queryFn: () => fetchPost(1) })
	* // later: switch to a different query, reusing the same observer
	* observer.setOptions({ queryKey: ['posts', 2], queryFn: () => fetchPost(2) })
	* ```
	*/
	setOptions(options) {
		const prevOptions = this.options;
		const prevQuery = this.#currentQuery;
		this.options = this.#client.defaultQueryOptions(options);
		if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveQueryValue(this.options.enabled, this.#currentQuery) !== "boolean") throw new Error("Expected enabled to be a boolean or a callback that returns a boolean");
		this.#updateQuery();
		this.#currentQuery.setOptions(this.options);
		if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) this.#client.getQueryCache().notify({
			type: "observerOptionsUpdated",
			query: this.#currentQuery,
			observer: this
		});
		const mounted = this.hasListeners();
		if (mounted && shouldFetchOptionally(this.#currentQuery, prevQuery, this.options, prevOptions)) this.#executeFetch();
		this.updateResult();
		if (mounted && (this.#currentQuery !== prevQuery || resolveQueryValue(this.options.enabled, this.#currentQuery) !== resolveQueryValue(prevOptions.enabled, this.#currentQuery) || resolveQueryValue(this.options.staleTime, this.#currentQuery) !== resolveQueryValue(prevOptions.staleTime, this.#currentQuery))) this.#updateStaleTimeout();
		const nextRefetchInterval = this.#computeRefetchInterval();
		if (mounted && (this.#currentQuery !== prevQuery || resolveQueryValue(this.options.enabled, this.#currentQuery) !== resolveQueryValue(prevOptions.enabled, this.#currentQuery) || nextRefetchInterval !== this.#currentRefetchInterval)) this.#updateRefetchInterval(nextRefetchInterval);
	}
	/**
	* Computes the result the observer would produce for the given (already-defaulted) options
	* right now, building the underlying `Query` if it doesn't exist yet, without waiting for a
	* subscription callback. Called by framework adapters on every render (e.g. `useQuery`) so the
	* returned value is available synchronously, ahead of `setOptions` triggering an actual fetch.
	* @param options - The defaulted observer options to compute the result for.
	* @returns The result for the given options.
	*/
	getOptimisticResult(options) {
		const query = this.#client.getQueryCache().build(this.#client, options);
		const result = this.createResult(query, options);
		if (!shallowEqualObjects(this.getCurrentResult(), result)) {
			this.#currentResult = result;
			this.#currentResultOptions = this.options;
			this.#currentResultState = this.#currentQuery.state;
		}
		return result;
	}
	/**
	* Returns the most recently computed `QueryObserverResult` for the
	* observed query. This is a point-in-time read; to be notified of updates
	* as they happen, subscribe to the observer instead (its inherited
	* `subscribe` method).
	* @returns The observer's latest result.
	* @example
	* ```ts
	* const result = observer.getCurrentResult()
	* console.log(result.status, result.data)
	* ```
	*/
	getCurrentResult() {
		return this.#currentResult;
	}
	/**
	* Wraps a `QueryObserverResult` in a `Proxy` that records which properties are read, via
	* {@link QueryObserver#trackProp} (and an optional `onPropTracked` callback). Used by framework
	* adapters when `notifyOnChangeProps` is not set, to implement its default "only re-render on
	* properties you actually read" behavior.
	* @param result - The result to wrap.
	* @param onPropTracked - Called with the name of each property that is read.
	* @returns A proxy of `result` that tracks property reads.
	*/
	trackResult(result, onPropTracked) {
		return new Proxy(result, { get: (target, key) => {
			this.trackProp(key);
			onPropTracked?.(key);
			return Reflect.get(target, key);
		} });
	}
	/**
	* Records that the given `QueryObserverResult` property was read, so a subsequent update only
	* notifies this observer if a tracked property actually changed. Normally called indirectly via
	* {@link QueryObserver#trackResult}'s proxy; exposed directly for adapters that track property
	* access themselves (e.g. through their own reactivity system) instead of via the proxy.
	* @param key - The name of the property that was read.
	*/
	trackProp(key) {
		this.#trackedProps.add(key);
	}
	/**
	* Returns the `Query` instance this observer is currently observing.
	* @returns The observed query.
	*/
	getCurrentQuery() {
		return this.#currentQuery;
	}
	/**
	* Refetches the observed query and returns a promise that resolves with
	* the resulting `QueryObserverResult`.
	* @param options - Set `cancelRefetch` to `false` to keep a running fetch instead of cancelling
	* it, and `throwOnError` to `true` to reject when the refetch fails.
	* @returns A promise that resolves with the result after the refetch.
	* @example
	* ```ts
	* const result = await observer.refetch({ cancelRefetch: false })
	* console.log(result.data)
	* ```
	*/
	refetch({ ...options } = {}) {
		return this.fetch({ ...options });
	}
	/**
	* Fetches a query defined by the given options without affecting this
	* observer's own tracked query or result, and returns a promise that
	* resolves with the `QueryObserverResult` for that fetch. This is useful
	* for prefetching data that another observer (e.g. a query about to be
	* navigated to) will need, ahead of time.
	* @param options - The observer options of the query to fetch.
	* @returns A promise that resolves with the result for the fetched query.
	* @example
	* ```ts
	* const result = await observer.fetchOptimistic({
	*   queryKey: ['posts', 2],
	*   queryFn: () => fetchPost(2),
	* })
	* console.log(result.data)
	* ```
	*/
	fetchOptimistic(options) {
		const defaultedOptions = this.#client.defaultQueryOptions(options);
		const query = this.#client.getQueryCache().build(this.#client, defaultedOptions);
		let unsubscribe = () => {};
		let resolveEarly;
		const cachePromise = new Promise((resolve) => {
			resolveEarly = resolve;
			unsubscribe = this.#client.getQueryCache().subscribe((event) => {
				if (event.type === "updated" && event.query.queryHash === query.queryHash && query.state.data !== void 0) {
					unsubscribe();
					resolve(this.createResult(query, defaultedOptions));
				}
			});
		});
		return Promise.race([query.fetch(defaultedOptions).then(() => {
			const result = this.createResult(query, defaultedOptions);
			resolveEarly?.(result);
			return result;
		}).finally(() => {
			unsubscribe();
		}), cachePromise]);
	}
	/**
	* Fetches the observed query and updates the result once the fetch settles. Used by `refetch` and,
	* in `InfiniteQueryObserver`, to fetch more pages.
	* @param fetchOptions - Options for this fetch. `cancelRefetch` defaults to `true`.
	* @returns A promise that resolves with the updated result.
	*/
	fetch(fetchOptions) {
		return this.#executeFetch({
			...fetchOptions,
			cancelRefetch: fetchOptions.cancelRefetch ?? true
		}).then(() => {
			this.updateResult();
			return this.#currentResult;
		});
	}
	#executeFetch(fetchOptions) {
		this.#updateQuery();
		let promise = this.#currentQuery.fetch(this.options, fetchOptions);
		if (!fetchOptions?.throwOnError) promise = promise.catch(noop);
		return promise;
	}
	#shouldScheduleTimer(timeout) {
		return !isServer() && resolveQueryValue(this.options.enabled, this.#currentQuery) !== false && isValidTimeout(timeout);
	}
	#updateStaleTimeout() {
		this.#clearStaleTimeout();
		const staleTime = resolveQueryValue(this.options.staleTime, this.#currentQuery);
		if (this.#currentResult.isStale || !this.#shouldScheduleTimer(staleTime)) return;
		const timeout = timeUntilStale(this.#currentResult.dataUpdatedAt, staleTime) + 1;
		this.#staleTimeoutId = timeoutManager.setTimeout(() => {
			if (!this.#currentResult.isStale) this.updateResult();
		}, timeout);
	}
	#computeRefetchInterval() {
		return resolveQueryValue(this.options.refetchInterval, this.#currentQuery) ?? false;
	}
	#updateRefetchInterval(nextInterval) {
		this.#clearRefetchInterval();
		this.#currentRefetchInterval = nextInterval;
		if (this.#currentRefetchInterval === 0 || !this.#shouldScheduleTimer(this.#currentRefetchInterval)) return;
		this.#refetchIntervalId = timeoutManager.setInterval(() => {
			if (this.options.refetchIntervalInBackground || focusManager.isFocused()) this.#executeFetch();
		}, this.#currentRefetchInterval);
	}
	#updateTimers() {
		this.#updateStaleTimeout();
		this.#updateRefetchInterval(this.#computeRefetchInterval());
	}
	#clearStaleTimeout() {
		if (this.#staleTimeoutId !== void 0) {
			timeoutManager.clearTimeout(this.#staleTimeoutId);
			this.#staleTimeoutId = void 0;
		}
	}
	#clearRefetchInterval() {
		if (this.#refetchIntervalId !== void 0) {
			timeoutManager.clearInterval(this.#refetchIntervalId);
			this.#refetchIntervalId = void 0;
		}
	}
	/**
	* Computes the result for a query and options from the query's state, applying `select`,
	* `placeholderData`, and the derived flags. Subclasses override it to add their own fields.
	* @param query - The query to compute the result for.
	* @param options - The observer options to compute the result with.
	* @returns The computed result.
	*/
	createResult(query, options) {
		const prevQuery = this.#currentQuery;
		const prevOptions = this.options;
		const prevResult = this.#currentResult;
		const prevResultState = this.#currentResultState;
		const prevResultOptions = this.#currentResultOptions;
		const queryInitialState = query !== prevQuery ? query.state : this.#currentQueryInitialState;
		const { state } = query;
		let newState = { ...state };
		let isPlaceholderData = false;
		let data;
		if (options._optimisticResults) {
			const mounted = this.hasListeners();
			const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
			const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
			if (fetchOnMount || fetchOptionally) newState = {
				...newState,
				...fetchState(state.data, query.options)
			};
			if (options._optimisticResults === "isRestoring") newState.fetchStatus = "idle";
		}
		let { error, errorUpdatedAt, status } = newState;
		data = newState.data;
		let skipSelect = false;
		if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
			let placeholderData;
			if (prevResult?.isPlaceholderData && options.placeholderData === prevResultOptions?.placeholderData) {
				placeholderData = prevResult.data;
				skipSelect = true;
			} else placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(this.#lastQueryWithDefinedData?.state.data, this.#lastQueryWithDefinedData) : options.placeholderData;
			if (placeholderData !== void 0) {
				status = "success";
				data = replaceData(prevResult?.data, placeholderData, options);
				isPlaceholderData = true;
			}
		}
		if (options.select && data !== void 0 && !skipSelect) {
			if (prevResult && data === prevResultState?.data && options.select === this.#selectFn) data = this.#selectResult;
			else try {
				this.#selectFn = options.select;
				data = options.select(data);
				data = replaceData(prevResult?.data, data, options);
				this.#selectResult = data;
				this.#selectError = null;
			} catch (selectError) {
				this.#selectError = selectError;
			}
		} else if (data === void 0) this.#selectError = null;
		if (this.#selectError) {
			error = this.#selectError;
			data = this.#selectResult;
			errorUpdatedAt = prevResult?.error === error ? prevResult.errorUpdatedAt : Date.now();
			status = "error";
			isPlaceholderData = false;
		}
		const isFetching = newState.fetchStatus === "fetching";
		const isPending = status === "pending";
		const isError = status === "error";
		const isLoading = isPending && isFetching;
		const hasData = data !== void 0;
		return {
			status,
			fetchStatus: newState.fetchStatus,
			isPending,
			isSuccess: status === "success",
			isError,
			isInitialLoading: isLoading,
			isLoading,
			data,
			dataUpdatedAt: newState.dataUpdatedAt,
			error,
			errorUpdatedAt,
			failureCount: newState.fetchFailureCount,
			failureReason: newState.fetchFailureReason,
			errorUpdateCount: newState.errorUpdateCount,
			isFetched: query.isFetched(),
			isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
			isFetching,
			isRefetching: isFetching && !isPending,
			isLoadingError: isError && !hasData,
			isPaused: newState.fetchStatus === "paused",
			isPlaceholderData,
			isRefetchError: isError && hasData,
			isStale: isStale(query, options),
			refetch: this.refetch,
			isEnabled: resolveQueryValue(options.enabled, query) !== false
		};
	}
	/**
	* Recomputes and stores the current result from the current query/options, notifying listeners
	* if it changed. Framework adapters call this right after subscribing to make sure no query
	* update was missed in the gap between creating the observer and subscribing to it.
	*/
	updateResult() {
		const prevResult = this.#currentResult;
		const nextResult = this.createResult(this.#currentQuery, this.options);
		this.#currentResultState = this.#currentQuery.state;
		this.#currentResultOptions = this.options;
		if (this.#currentResultState.data !== void 0) this.#lastQueryWithDefinedData = this.#currentQuery;
		if (shallowEqualObjects(nextResult, prevResult)) return;
		this.#currentResult = nextResult;
		const shouldNotifyListeners = () => {
			if (!prevResult) return true;
			const { notifyOnChangeProps } = this.options;
			const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
			if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !this.#trackedProps.size) return true;
			if (this.options.throwOnError && this.#currentResult.error !== prevResult.error) return true;
			for (const key of notifyOnChangePropsValue ?? this.#trackedProps) if (this.#currentResult[key] !== prevResult[key]) return true;
			return false;
		};
		const notifyListeners = shouldNotifyListeners();
		notifyManager.batch(() => {
			if (notifyListeners) this.listeners.forEach((listener) => {
				listener(this.#currentResult);
			});
			this.#client.getQueryCache().notify({
				query: this.#currentQuery,
				type: "observerResultsUpdated"
			});
		});
	}
	#updateQuery() {
		const query = this.#client.getQueryCache().build(this.#client, this.options);
		if (query === this.#currentQuery) return;
		const prevQuery = this.#currentQuery;
		this.#currentQuery = query;
		this.#currentQueryInitialState = query.state;
		if (this.hasListeners()) {
			prevQuery?.removeObserver(this);
			query.addObserver(this);
		}
	}
	/**
	* Updates the observer's result when the observed query changes, and reschedules its timers if it
	* has listeners.
	* @internal
	*/
	onQueryUpdate() {
		this.updateResult();
		if (this.hasListeners()) this.#updateTimers();
	}
};
/**
* Checks whether a query has no data yet and should do its initial load when an observer mounts.
* @param query - The query to check.
* @param options - The observer options.
* @returns `true` if the query is enabled, has no data, and isn't in an error state with
* `retryOnMount: false`.
*/
function shouldLoadOnMount(query, options) {
	return resolveQueryValue(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && resolveQueryValue(options.retryOnMount, query) === false);
}
/**
* Checks whether a query should fetch when an observer mounts: either for its initial load, or
* because it has data and `refetchOnMount` asks for a refetch.
* @param query - The query to check.
* @param options - The observer options.
* @returns `true` if the query should fetch on mount.
*/
function shouldFetchOnMount(query, options) {
	return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
/**
* Checks whether a query should fetch for a `refetchOnMount`, `refetchOnWindowFocus`, or
* `refetchOnReconnect` option.
* @param query - The query to check.
* @param options - The observer options.
* @param field - The value of the option to check.
* @returns `true` if the query is enabled, not static, and the option is `'always'`, or is not
* `false` and the query is stale.
*/
function shouldFetchOn(query, options, field) {
	if (resolveQueryValue(options.enabled, query) !== false && resolveQueryValue(options.staleTime, query) !== "static") {
		const value = resolveQueryValue(field, query);
		return value === "always" || value !== false && isStale(query, options);
	}
	return false;
}
/**
* Checks whether a query should fetch after the observer's options change.
* @param query - The query observed with the new options.
* @param prevQuery - The query observed with the previous options.
* @param options - The new observer options.
* @param prevOptions - The previous observer options.
* @returns `true` if the query changed or was disabled before, it isn't a suspense query in an
* error state, and it is stale.
*/
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
	return (query !== prevQuery || resolveQueryValue(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
/**
* Checks whether a query is stale for the given observer options.
* @param query - The query to check.
* @param options - The observer options, whose `enabled` and `staleTime` are used.
* @returns `true` if the query is enabled and its data is stale for `staleTime`.
*/
function isStale(query, options) {
	return resolveQueryValue(options.enabled, query) !== false && query.isStaleByTime(resolveQueryValue(options.staleTime, query));
}
// node_modules/@tanstack/query-core/build/modern/mutation.js
/**
* Represents a single mutation attempt. A `Mutation` holds the mutation's
* options, state (data/error/status), and the `MutationObserver`s currently
* subscribed to it.
*
* Instances are created and managed internally by `MutationCache`; application
* code typically interacts with mutations indirectly through `QueryClient` or
* a framework hook like `useMutation`. Direct access to a `Mutation` instance
* is possible via `mutationCache.find()`/`getAll()` for inspecting cache state.
* @example
* ```ts
* const mutationCache = queryClient.getMutationCache()
*
* const mutation = mutationCache.find({ mutationKey: ['addPost'] })
* ```
*/
var Mutation = class extends Removable {
	#client;
	#observers;
	#mutationCache;
	#retryer;
	constructor(config) {
		super();
		this.#client = config.client;
		this.mutationId = config.mutationId;
		this.#mutationCache = config.mutationCache;
		this.#observers = [];
		this.state = config.state || getDefaultState();
		this.setOptions(config.options);
		this.scheduleGc();
	}
	/**
	* Replaces the mutation's options and applies their `gcTime`.
	* @internal
	* @param options - The new mutation options.
	*/
	setOptions(options) {
		this.options = options;
		this.updateGcTime(this.options.gcTime);
	}
	/**
	* The `meta` object passed in the mutation's options, if any.
	* @returns The mutation's `meta`, or `undefined` if none was set.
	*/
	get meta() {
		return this.options.meta;
	}
	/**
	* Subscribes an observer to the mutation and stops its garbage collection.
	* @internal
	* @param observer - The observer to add. Adding an observer that is already subscribed does
	* nothing.
	*/
	addObserver(observer) {
		if (!this.#observers.includes(observer)) {
			this.#observers.push(observer);
			this.clearGcTimeout();
			this.#mutationCache.notify({
				type: "observerAdded",
				mutation: this,
				observer
			});
		}
	}
	/**
	* Unsubscribes an observer from the mutation.
	* @internal
	* @param observer - The observer to remove. Garbage collection is scheduled afterwards.
	*/
	removeObserver(observer) {
		this.#observers = this.#observers.filter((x) => x !== observer);
		this.scheduleGc();
		this.#mutationCache.notify({
			type: "observerRemoved",
			mutation: this,
			observer
		});
	}
	optionalRemove() {
		if (!this.#observers.length) {
			if (this.state.status === "pending") this.scheduleGc();
			else this.#mutationCache.remove(this);
		}
	}
	/**
	* Resumes a mutation that is currently paused or was restored from a
	* dehydrated, still-`pending` state.
	*
	* - If this mutation has an active retryer (it paused mid-attempt, e.g. due
	*   to the network mode or scope-based queuing), its retryer is resumed.
	* - Otherwise, if the mutation's status is still `pending` (e.g. it was
	*   dehydrated while an attempt was in flight and never got a retryer in
	*   this instance), `execute` is called again with the last known variables.
	* - Otherwise the mutation has already settled and this resolves immediately
	*   without running anything again.
	* @returns A promise that settles with the resumed mutation: it rejects if the mutation fails.
	* It resolves immediately if the mutation has already settled.
	* @see {@link Mutation#execute}
	* @example
	* ```ts
	* // typically driven by reconnect handling, e.g. queryClient.resumePausedMutations()
	* const mutation = mutationCache.find({ mutationKey: ['addPost'] })
	* await mutation?.continue()
	* ```
	*/
	continue() {
		return this.#retryer?.continue() ?? (this.state.status === "pending" ? this.execute(this.state.variables) : Promise.resolve());
	}
	/**
	* Runs the mutation function for the given variables through a retryer, and
	* drives the mutation's state and lifecycle callbacks through to settlement.
	*
	* If this mutation's state is already `pending` when `execute` is called
	* (i.e. it was restored, still in-flight, from a dehydrated state), the
	* `onMutate` step is skipped and a `continue` action is dispatched to
	* unpause it; otherwise a `pending` action is dispatched first, then the
	* mutation cache's `onMutate` and the mutation's own `onMutate` option are
	* awaited in that order, and the resulting context is stored.
	*
	* The mutation function is then run (subject to `retry`/`retryDelay`/
	* `networkMode`, and to the mutation cache's scope-based serialization).
	* On success, the cache's `onSuccess`/`onSettled` callbacks run before the
	* mutation's own `onSuccess`/`onSettled` options, a `success` action is
	* dispatched, and the resolved data is returned. On failure, the same
	* cache-then-option ordering is used for `onError`/`onSettled`, but each of
	* those four callbacks is individually caught so that a throwing callback
	* cannot mask the original error; an `error` action is then dispatched and
	* the original error is re-thrown.
	* @param variables - The variables passed to the `mutationFn`.
	* @returns A promise that resolves with the mutation's data, or rejects with its error.
	* @see {@link Mutation#continue}
	* @example
	* ```ts
	* // Called internally by `MutationObserver.mutate` and `Mutation.continue` —
	* // applications normally trigger mutations through those, not this method.
	* const data = await mutation.execute(variables)
	* ```
	*/
	async execute(variables) {
		const onContinue = () => {
			this.#dispatch({ type: "continue" });
		};
		const mutationFnContext = {
			client: this.#client,
			meta: this.options.meta,
			mutationKey: this.options.mutationKey
		};
		const retryer = this.#retryer = createRetryer({
			fn: () => {
				if (!this.options.mutationFn) return Promise.reject(/* @__PURE__ */ new Error("No mutationFn found"));
				return this.options.mutationFn(variables, mutationFnContext);
			},
			onFail: (failureCount, error) => {
				this.#dispatch({
					type: "failed",
					failureCount,
					error
				});
			},
			onPause: () => {
				this.#dispatch({ type: "pause" });
			},
			onContinue,
			retry: this.options.retry ?? 0,
			retryDelay: this.options.retryDelay,
			networkMode: this.options.networkMode,
			canRun: () => this.#mutationCache.canRun(this)
		});
		const restored = this.state.status === "pending";
		const isPaused = !retryer.canStart();
		try {
			if (restored) onContinue();
			else {
				this.#dispatch({
					type: "pending",
					variables,
					isPaused
				});
				if (this.#mutationCache.config.onMutate) await this.#mutationCache.config.onMutate(variables, this, mutationFnContext);
				const context = await this.options.onMutate?.(variables, mutationFnContext);
				if (context !== this.state.context) this.#dispatch({
					type: "pending",
					context,
					variables,
					isPaused
				});
			}
			if (this.state.isPaused && retryer.canStart()) onContinue();
			const data = await retryer.start();
			await this.#mutationCache.config.onSuccess?.(data, variables, this.state.context, this, mutationFnContext);
			await this.options.onSuccess?.(data, variables, this.state.context, mutationFnContext);
			await this.#mutationCache.config.onSettled?.(data, null, this.state.variables, this.state.context, this, mutationFnContext);
			await this.options.onSettled?.(data, null, variables, this.state.context, mutationFnContext);
			this.#dispatch({
				type: "success",
				data
			});
			return data;
		} catch (error) {
			try {
				await this.#mutationCache.config.onError?.(error, variables, this.state.context, this, mutationFnContext);
			} catch (e) {
				Promise.reject(e);
			}
			try {
				await this.options.onError?.(error, variables, this.state.context, mutationFnContext);
			} catch (e) {
				Promise.reject(e);
			}
			try {
				await this.#mutationCache.config.onSettled?.(void 0, error, this.state.variables, this.state.context, this, mutationFnContext);
			} catch (e) {
				Promise.reject(e);
			}
			try {
				await this.options.onSettled?.(void 0, error, variables, this.state.context, mutationFnContext);
			} catch (e) {
				Promise.reject(e);
			}
			this.#dispatch({
				type: "error",
				error
			});
			throw error;
		} finally {
			if (this.#retryer === retryer) this.#retryer = void 0;
			this.#mutationCache.runNext(this);
		}
	}
	#dispatch(action) {
		const reducer = (state) => {
			switch (action.type) {
				case "failed": return {
					...state,
					failureCount: action.failureCount,
					failureReason: action.error
				};
				case "pause": return {
					...state,
					isPaused: true
				};
				case "continue": return {
					...state,
					isPaused: false
				};
				case "pending": return {
					...state,
					context: action.context,
					data: void 0,
					failureCount: 0,
					failureReason: null,
					error: null,
					isPaused: action.isPaused,
					status: "pending",
					variables: action.variables,
					submittedAt: Date.now()
				};
				case "success": return {
					...state,
					data: action.data,
					failureCount: 0,
					failureReason: null,
					error: null,
					status: "success",
					isPaused: false
				};
				case "error": return {
					...state,
					data: void 0,
					error: action.error,
					failureCount: state.failureCount + 1,
					failureReason: action.error,
					isPaused: false,
					status: "error"
				};
			}
		};
		this.state = reducer(this.state);
		notifyManager.batch(() => {
			this.#observers.forEach((observer) => {
				observer.onMutationUpdate(action);
			});
			this.#mutationCache.notify({
				mutation: this,
				type: "updated",
				action
			});
		});
	}
};
/**
* Returns the initial state of a mutation: `'idle'`, with no data, error, or variables.
* @returns The initial mutation state.
*/
function getDefaultState() {
	return {
		context: void 0,
		data: void 0,
		error: null,
		failureCount: 0,
		failureReason: null,
		isPaused: false,
		status: "idle",
		variables: void 0,
		submittedAt: 0
	};
}
// node_modules/@tanstack/query-core/build/modern/mutationCache.js
/**
* The `MutationCache` is the storage for mutations.
*
* Normally, you will not interact with the `MutationCache` directly and instead use a
* `QueryClient`. You can subscribe to it (inherited from `Subscribable`) to be informed of
* safe/known updates to the cache, such as mutations being added, removed, or updated.
* @example
* ```ts
* const unsubscribe = mutationCache.subscribe((event) => {
*   console.log(event.type, event.mutation)
* })
* ```
*/
var MutationCache = class extends Subscribable {
	#mutations;
	#scopes;
	#mutationId;
	constructor(config = {}) {
		super();
		this.config = config;
		this.#mutations = /* @__PURE__ */ new Set();
		this.#scopes = /* @__PURE__ */ new Map();
		this.#mutationId = 0;
	}
	/**
	* Creates a mutation and adds it to the cache.
	* @internal
	* @param client - The client the mutation belongs to, used to default its options.
	* @param options - The mutation options. They are defaulted with {@link
	* QueryClient#defaultMutationOptions}.
	* @param state - The initial state of the mutation, e.g. when restoring a dehydrated mutation.
	* @returns The new mutation, already added to the cache.
	*/
	build(client, options, state) {
		const mutation = new Mutation({
			client,
			mutationCache: this,
			mutationId: ++this.#mutationId,
			options: client.defaultMutationOptions(options),
			state
		});
		this.add(mutation);
		return mutation;
	}
	/**
	* Adds a mutation to the cache.
	* @internal
	* @param mutation - The mutation to add. If it has a `scope`, it is queued in that scope.
	*/
	add(mutation) {
		this.#mutations.add(mutation);
		const scope = scopeFor(mutation);
		if (typeof scope === "string") {
			const scopedMutations = this.#scopes.get(scope);
			if (scopedMutations) scopedMutations.push(mutation);
			else this.#scopes.set(scope, [mutation]);
		}
		this.notify({
			type: "added",
			mutation
		});
	}
	/**
	* Removes a mutation from the cache.
	* @internal
	* @param mutation - The mutation to remove, also from its scope's queue.
	*/
	remove(mutation) {
		if (this.#mutations.delete(mutation)) {
			const scope = scopeFor(mutation);
			if (typeof scope === "string") {
				const scopedMutations = this.#scopes.get(scope);
				if (scopedMutations) {
					if (scopedMutations.length > 1) {
						const index = scopedMutations.indexOf(mutation);
						if (index !== -1) scopedMutations.splice(index, 1);
					} else if (scopedMutations[0] === mutation) this.#scopes.delete(scope);
				}
			}
		}
		this.notify({
			type: "removed",
			mutation
		});
	}
	/**
	* Checks whether a mutation can run now, given the other mutations in its `scope`.
	* @internal
	* @param mutation - The mutation to check.
	* @returns `true` if the mutation has no `scope`, or no other mutation in its scope is pending
	* ahead of it.
	*/
	canRun(mutation) {
		const scope = scopeFor(mutation);
		if (typeof scope === "string") {
			const firstPendingMutation = this.#scopes.get(scope)?.find((m) => m.state.status === "pending");
			return !firstPendingMutation || firstPendingMutation === mutation;
		} else return true;
	}
	/**
	* Continues the next paused mutation in the same `scope` after a mutation finishes.
	* @internal
	* @param mutation - The mutation that finished.
	* @returns A promise that resolves once the next paused mutation in the same scope has continued,
	* or immediately if there is none.
	*/
	runNext(mutation) {
		const scope = scopeFor(mutation);
		if (typeof scope === "string") return (this.#scopes.get(scope)?.find((m) => m !== mutation && m.state.isPaused))?.continue() ?? Promise.resolve();
		else return Promise.resolve();
	}
	/**
	* Removes all mutations from the cache.
	* @example
	* ```ts
	* const mutationCache = queryClient.getMutationCache()
	*
	* mutationCache.clear()
	* ```
	*/
	clear() {
		notifyManager.batch(() => {
			const mutations = this.getAll();
			this.#mutations.clear();
			this.#scopes.clear();
			mutations.forEach((mutation) => {
				this.notify({
					type: "removed",
					mutation
				});
			});
		});
	}
	/**
	* Returns all mutations within the cache.
	*
	* This is not typically needed for most applications, but can come in handy when needing more
	* information about a mutation in rare scenarios.
	* @returns Every mutation in the cache.
	* @example
	* ```ts
	* const mutationCache = queryClient.getMutationCache()
	*
	* const mutations = mutationCache.getAll()
	* ```
	*/
	getAll() {
		return Array.from(this.#mutations);
	}
	/**
	* A slightly more advanced method that can be used to get an existing mutation instance from
	* the cache. If the mutation does not exist, `undefined` is returned.
	*
	* This is not typically needed for most applications, but can come in handy when needing more
	* information about a mutation in rare scenarios.
	* @param filters - The filters to match. `exact` defaults to `true`.
	* @returns The first matching mutation, or `undefined`.
	* @see {@link MutationCache#findAll}
	* @example
	* ```ts
	* const mutationCache = queryClient.getMutationCache()
	*
	* const mutation = mutationCache.find({ mutationKey: ['addPost'] })
	* ```
	*/
	find(filters) {
		const defaultedFilters = {
			exact: true,
			...filters
		};
		return this.getAll().find((mutation) => matchMutation(defaultedFilters, mutation));
	}
	/**
	* An even more advanced method that can be used to get existing mutation instances from the
	* cache that match the given filters. If no mutations match, an empty array is returned.
	*
	* This is not typically needed for most applications, but can come in handy when needing more
	* information about mutations in rare scenarios.
	* @param filters - The filters to match. Without filters, every mutation is returned.
	* @returns The matching mutations.
	* @see {@link MutationCache#find}
	* @example
	* ```ts
	* const mutationCache = queryClient.getMutationCache()
	*
	* const mutations = mutationCache.findAll({ mutationKey: ['addPost'] })
	* ```
	*/
	findAll(filters = {}) {
		return this.getAll().filter((mutation) => matchMutation(filters, mutation));
	}
	/**
	* Notifies every cache listener of an event, in one batch.
	* @internal
	* @param event - The event passed to every listener.
	*/
	notify(event) {
		notifyManager.batch(() => {
			this.listeners.forEach((listener) => {
				listener(event);
			});
		});
	}
	/**
	* Continues every paused mutation, e.g. when the app comes back online.
	* @internal
	* @returns A promise that resolves once every paused mutation has continued and settled.
	*/
	resumePausedMutations() {
		const pausedMutations = this.getAll().filter((x) => x.state.isPaused);
		return notifyManager.batch(() => Promise.all(pausedMutations.map((mutation) => mutation.continue().catch(noop))));
	}
};
/**
* Returns the scope id of a mutation, used to run mutations with the same scope one after another.
* @param mutation - The mutation to read the scope of.
* @returns The mutation's `scope.id`, or `undefined` if it has no scope.
*/
function scopeFor(mutation) {
	return mutation.options.scope?.id;
}
// node_modules/@tanstack/query-core/build/modern/queriesObserver.js
/**
* Returns the items of `array1` that are not in `array2`.
* @param array1 - The items to filter.
* @param array2 - The items to exclude.
* @returns A new array with the items of `array1` that are not in `array2`.
*/
function difference(array1, array2) {
	const excludeSet = new Set(array2);
	return array1.filter((x) => !excludeSet.has(x));
}
/**
* A `QueriesObserver` watches an array of queries at once, exposing them as
* a single array of `QueryObserverResult`s (or, when a `combine` option is
* given, as a combined value derived from that array). It manages one
* internal `QueryObserver` per query, and is the primitive that framework
* adapters (e.g. `useQueries`) build their hooks on top of.
* @example
* ```ts
* const observer = new QueriesObserver(queryClient, [
*   { queryKey: ['post', 1], queryFn: fetchPost },
*   { queryKey: ['post', 2], queryFn: fetchPost },
* ])
*
* const unsubscribe = observer.subscribe((result) => {
*   console.log(result)
* })
* ```
*/
var QueriesObserver = class extends Subscribable {
	#client;
	#result;
	#queries;
	#options;
	#observers;
	#combinedResult;
	#lastCombine;
	#lastResult;
	#lastQueryHashes;
	#observerMatches = [];
	constructor(client, queries, options) {
		super();
		this.#client = client;
		this.#options = options;
		this.#queries = [];
		this.#observers = [];
		this.#result = [];
		this.setQueries(queries);
	}
	onSubscribe() {
		if (this.listeners.size === 1) this.#observers.forEach((observer) => {
			observer.subscribe((result) => {
				this.#onUpdate(observer, result);
			});
		});
	}
	onUnsubscribe() {
		if (!this.listeners.size) this.destroy();
	}
	/**
	* Stops observing all queries: clears all listeners and destroys every
	* underlying `QueryObserver` this observer manages.
	*/
	destroy() {
		this.listeners = /* @__PURE__ */ new Set();
		this.#observers.forEach((observer) => {
			observer.destroy();
		});
	}
	/**
	* Replaces the set of queries being observed. Existing `QueryObserver`s
	* are reused for queries that match an already-observed query hash;
	* observers for queries that are no longer present are destroyed, and new
	* observers are created and subscribed to for newly added queries.
	* @param queries - The options of the queries to observe.
	* @param options - Replaces the observer's options, e.g. its `combine` function.
	* @example
	* ```ts
	* observer.setQueries([
	*   { queryKey: ['post', 1], queryFn: fetchPost },
	*   { queryKey: ['post', 3], queryFn: fetchPost },
	* ])
	* ```
	*/
	setQueries(queries, options) {
		this.#queries = queries;
		this.#options = options;
		{
			const queryHashes = queries.map((query) => this.#client.defaultQueryOptions(query).queryHash);
			if (new Set(queryHashes).size !== queryHashes.length) console.warn("[QueriesObserver]: Duplicate Queries found. This might result in unexpected behavior.");
		}
		notifyManager.batch(() => {
			const prevObservers = this.#observers;
			const newObserverMatches = this.#findMatchingObservers(this.#queries);
			newObserverMatches.forEach((match) => match.observer.setOptions(match.defaultedQueryOptions));
			const newObservers = newObserverMatches.map((match) => match.observer);
			const newResult = newObservers.map((observer) => observer.getCurrentResult());
			const hasLengthChange = prevObservers.length !== newObservers.length;
			const hasIndexChange = newObservers.some((observer, index) => observer !== prevObservers[index]);
			const hasStructuralChange = hasLengthChange || hasIndexChange;
			const hasResultChange = hasStructuralChange ? true : newResult.some((result, index) => {
				const prev = this.#result[index];
				return !prev || !shallowEqualObjects(result, prev);
			});
			if (!hasStructuralChange && !hasResultChange) return;
			if (hasStructuralChange) {
				this.#observerMatches = newObserverMatches;
				this.#observers = newObservers;
			}
			this.#result = newResult;
			if (!this.hasListeners()) return;
			if (hasStructuralChange) {
				difference(prevObservers, newObservers).forEach((observer) => {
					observer.destroy();
				});
				difference(newObservers, prevObservers).forEach((observer) => {
					observer.subscribe((result) => {
						this.#onUpdate(observer, result);
					});
				});
			}
			this.#notify();
		});
	}
	/**
	* Returns the most recently computed array of `QueryObserverResult`s, one
	* per observed query, in the same order as the queries passed to the
	* constructor or `setQueries`.
	* @returns The current results.
	* @example
	* ```ts
	* const results = observer.getCurrentResult()
	* const data = results.map((result) => result.data)
	* ```
	*/
	getCurrentResult() {
		return this.#result;
	}
	/**
	* Returns the underlying `Query` instances currently being observed, in
	* the same order as the queries passed to the constructor or `setQueries`.
	* @returns The observed queries.
	*/
	getQueries() {
		return this.#observers.map((observer) => observer.getCurrentQuery());
	}
	/**
	* Returns the underlying `QueryObserver` instances this observer manages,
	* in the same order as the queries passed to the constructor or
	* `setQueries`.
	* @returns The managed query observers.
	*/
	getObservers() {
		return this.#observers;
	}
	/**
	* The `QueriesObserver` counterpart of {@link QueryObserver#getOptimisticResult} — computes
	* the result for the given (already-defaulted) queries right now, synchronously. Called by
	* framework adapters (e.g. `useQueries`) ahead of subscribing, returning a tuple of the raw
	* per-query results, a function to compute the combined result from them, and a function to
	* wrap the results for property-access tracking.
	* @param queries - The defaulted options of the queries to compute the result for.
	* @param combine - The `combine` function used by the returned `combineResult`, if any.
	* @returns A tuple of the per-query results, a function that computes the combined result, and a
	* function that returns the results wrapped for property-access tracking.
	*/
	getOptimisticResult(queries, combine) {
		const matches = this.#findMatchingObservers(queries);
		const result = matches.map((match) => match.observer.getOptimisticResult(match.defaultedQueryOptions));
		const queryHashes = matches.map((match) => match.defaultedQueryOptions.queryHash);
		return [
			result,
			(r) => {
				return this.#combineResult(r ?? result, combine, queryHashes);
			},
			() => {
				return this.#trackResult(result, matches);
			}
		];
	}
	#trackResult(result, matches) {
		const trackedProps = /* @__PURE__ */ new Set();
		return matches.map((match, index) => {
			const observerResult = result[index];
			return !match.defaultedQueryOptions.notifyOnChangeProps ? match.observer.trackResult(observerResult, (accessedProp) => {
				if (!trackedProps.has(accessedProp)) {
					trackedProps.add(accessedProp);
					matches.forEach((m) => {
						m.observer.trackProp(accessedProp);
					});
				}
			}) : observerResult;
		});
	}
	#combineResult(input, combine, queryHashes) {
		if (combine) {
			const lastHashes = this.#lastQueryHashes;
			const queryHashesChanged = queryHashes !== void 0 && lastHashes !== void 0 && (lastHashes.length !== queryHashes.length || queryHashes.some((hash, i) => hash !== lastHashes[i]));
			if (this.#result !== this.#lastResult || queryHashesChanged || combine !== this.#lastCombine) {
				this.#lastCombine = combine;
				this.#lastResult = this.#result;
				if (queryHashes !== void 0) this.#lastQueryHashes = queryHashes;
				this.#combinedResult = replaceEqualDeep(this.#combinedResult, combine(input));
			}
			return this.#combinedResult;
		}
		return input;
	}
	#shouldSkipCombine() {
		return !this.#options?.combine || this.#observers.some((observer, index) => {
			return observer.options.suspense && this.#result[index]?.data === void 0;
		});
	}
	#findMatchingObservers(queries) {
		const prevObserversMap = /* @__PURE__ */ new Map();
		this.#observers.forEach((observer) => {
			const key = observer.options.queryHash;
			if (!key) return;
			const previousObservers = prevObserversMap.get(key);
			if (previousObservers) previousObservers.push(observer);
			else prevObserversMap.set(key, [observer]);
		});
		const observers = [];
		queries.forEach((options) => {
			const defaultedOptions = this.#client.defaultQueryOptions(options);
			const observer = prevObserversMap.get(defaultedOptions.queryHash)?.shift() ?? new QueryObserver(this.#client, defaultedOptions);
			observers.push({
				defaultedQueryOptions: defaultedOptions,
				observer
			});
		});
		return observers;
	}
	#onUpdate(observer, result) {
		const index = this.#observers.indexOf(observer);
		if (index !== -1) {
			this.#result = this.#result.slice();
			this.#result[index] = result;
			this.#notify();
		}
	}
	#notify() {
		if (this.hasListeners()) {
			const shouldSkipCombine = this.#shouldSkipCombine();
			const previousResult = this.#combinedResult;
			const newResult = shouldSkipCombine ? previousResult : this.#combineResult(this.#trackResult(this.#result, this.#observerMatches), this.#options?.combine);
			if (shouldSkipCombine || previousResult !== newResult) notifyManager.batch(() => {
				this.listeners.forEach((listener) => {
					listener(this.#result);
				});
			});
		}
	}
};
// node_modules/@tanstack/query-core/build/modern/queryCache.js
/**
* The `QueryCache` is the storage mechanism for TanStack Query. It stores all the data, meta
* information, and state of the queries it contains.
*
* Normally, you will not interact with the `QueryCache` directly and instead use a `QueryClient`
* for a specific cache. You can subscribe to it (inherited from `Subscribable`) to be informed of
* safe/known updates to the cache, such as queries being added, removed, or updated — updates made
* outside of the cache's own tracked mechanisms (e.g. mutating a query's state object directly) do
* not notify subscribers.
* @example
* ```ts
* const unsubscribe = queryCache.subscribe((event) => {
*   console.log(event.type, event.query)
* })
* ```
*/
var QueryCache = class extends Subscribable {
	#queries;
	constructor(config = {}) {
		super();
		this.config = config;
		this.#queries = /* @__PURE__ */ new Map();
	}
	/**
	* Returns the existing `Query` instance for the given options' `queryKey`/`queryHash`, or
	* builds and adds a new one to the cache if none exists yet. Used by framework adapters and
	* plugins (e.g. broadcast/persistence) that need to get-or-create a `Query` directly, bypassing
	* the reactive `QueryObserver` machinery.
	* @param client - The client the query belongs to, used to default its options.
	* @param options - The query options, including the `queryKey`. A new query is created with the
	* options defaulted by {@link QueryClient#defaultQueryOptions}.
	* @param state - The initial state of a newly created query, e.g. when hydrating. Ignored if the
	* query already exists.
	* @returns The existing or newly created query.
	* @example
	* ```ts
	* const queryCache = queryClient.getQueryCache()
	*
	* const query = queryCache.build(queryClient, {
	*   queryKey: ['posts'],
	*   queryFn: fetchPosts,
	* })
	* ```
	*/
	build(client, options, state) {
		const queryKey = options.queryKey;
		const queryHash = options.queryHash ?? hashQueryKeyByOptions(queryKey, options);
		let query = this.get(queryHash);
		if (!query) {
			query = new Query({
				client,
				queryKey,
				queryHash,
				options: client.defaultQueryOptions(options),
				state,
				defaultOptions: client.getQueryDefaults(queryKey)
			});
			this.add(query);
		}
		return query;
	}
	/**
	* Adds a query to the cache.
	* @internal
	* @param query - The query to add. If a query with the same hash is already cached, nothing
	* happens.
	*/
	add(query) {
		if (!this.#queries.has(query.queryHash)) {
			this.#queries.set(query.queryHash, query);
			this.notify({
				type: "added",
				query
			});
		}
	}
	/**
	* Destroys the given `Query` and removes it from the cache, notifying subscribers with a
	* `'removed'` event. A no-op if the query is no longer the one currently stored under its hash
	* (e.g. it was already replaced). Used by plugins (e.g. the broadcast client) that mirror
	* removals across `QueryCache` instances.
	* @param query - The query to remove.
	* @example
	* ```ts
	* const queryCache = queryClient.getQueryCache()
	* const query = queryCache.find({ queryKey: ['posts'] })
	*
	* if (query) {
	*   queryCache.remove(query)
	* }
	* ```
	*/
	remove(query) {
		if (this.#queries.get(query.queryHash) === query) {
			query.destroy();
			this.#queries.delete(query.queryHash);
			this.notify({
				type: "removed",
				query
			});
		}
	}
	/**
	* Removes all queries from the cache.
	* @example
	* ```ts
	* const queryCache = queryClient.getQueryCache()
	*
	* queryCache.clear()
	* ```
	*/
	clear() {
		notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				this.remove(query);
			});
		});
	}
	/**
	* Returns the `Query` instance stored under the given `queryHash`, or `undefined` if none
	* exists. Unlike {@link QueryCache#find}, this looks up by the already-computed hash rather
	* than by `QueryFilters`. Used by plugins (e.g. broadcast/hydration) that already have a hash
	* to look up directly.
	* @param queryHash - The hash of the query to look up.
	* @returns The query stored under the hash, or `undefined`.
	* @example
	* ```ts
	* const queryCache = queryClient.getQueryCache()
	* const queryHash = hashKey(['posts'])
	*
	* const query = queryCache.get(queryHash)
	* ```
	*/
	get(queryHash) {
		return this.#queries.get(queryHash);
	}
	/**
	* Returns all queries within the cache.
	* @returns Every query in the cache.
	* @example
	* ```ts
	* const queryCache = queryClient.getQueryCache()
	*
	* const queries = queryCache.getAll()
	* ```
	*/
	getAll() {
		return [...this.#queries.values()];
	}
	/**
	* A slightly more advanced method that can be used to get an existing query instance from the
	* cache. This instance not only contains all the state for the query, but all of the instances,
	* and underlying guts of the query as well. If the query does not exist, `undefined` is
	* returned.
	*
	* This is not typically needed for most applications, but can come in handy when needing more
	* information about a query in rare scenarios (e.g. looking at `query.state.dataUpdatedAt` to
	* decide whether a query is fresh enough to be used as an initial value).
	* @param filters - The filters to match, including the required `queryKey`. `exact` defaults to
	* `true`.
	* @returns The first matching query, or `undefined`.
	* @see {@link QueryCache#findAll}
	* @example
	* ```ts
	* const queryCache = queryClient.getQueryCache()
	*
	* const query = queryCache.find({ queryKey: ['posts'] })
	* ```
	*/
	find(filters) {
		const defaultedFilters = {
			exact: true,
			...filters
		};
		return this.getAll().find((query) => matchQuery(defaultedFilters, query));
	}
	/**
	* An even more advanced method that can be used to get existing query instances from the cache
	* that partially match a query key. If no queries match, an empty array is returned.
	*
	* This is not typically needed for most applications, but can come in handy when needing more
	* information about queries in rare scenarios.
	* @param filters - The filters to match. Without filters, every query is returned.
	* @returns The matching queries.
	* @see {@link QueryCache#find}
	* @example
	* ```ts
	* const queryCache = queryClient.getQueryCache()
	*
	* const queries = queryCache.findAll({ queryKey: ['posts'] })
	* ```
	*/
	findAll(filters = {}) {
		const queries = this.getAll();
		return Object.keys(filters).length > 0 ? queries.filter((query) => matchQuery(filters, query)) : queries;
	}
	/**
	* Notifies every cache listener of an event, in one batch.
	* @internal
	* @param event - The event passed to every listener.
	*/
	notify(event) {
		notifyManager.batch(() => {
			this.listeners.forEach((listener) => {
				listener(event);
			});
		});
	}
	/**
	* Calls {@link Query#onFocus} on every cached query, in one batch.
	* @internal
	*/
	onFocus() {
		notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				query.onFocus();
			});
		});
	}
	/**
	* Calls {@link Query#onOnline} on every cached query, in one batch.
	* @internal
	*/
	onOnline() {
		notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				query.onOnline();
			});
		});
	}
};
// node_modules/@tanstack/query-core/build/modern/queryClient.js
/**
* `QueryClient` is used to interact with a cache of queries and mutations. It owns a
* `QueryCache` and a `MutationCache` (creating default ones if none are passed in) and holds
* the default options that are applied to queries and mutations created through it.
* @example
* ```ts
* const queryClient = new QueryClient({
*   defaultOptions: {
*     queries: {
*       staleTime: Infinity,
*     },
*   },
* })
*
* await queryClient.query({ queryKey: ['posts'], queryFn: fetchPosts })
* ```
*/
var QueryClient = class {
	#queryCache;
	#mutationCache;
	#defaultOptions;
	#queryDefaults;
	#mutationDefaults;
	#mountCount;
	#unsubscribeFocus;
	#unsubscribeOnline;
	constructor(config = {}) {
		this.#queryCache = config.queryCache || new QueryCache();
		this.#mutationCache = config.mutationCache || new MutationCache();
		this.#defaultOptions = config.defaultOptions || {};
		this.#queryDefaults = /* @__PURE__ */ new Map();
		this.#mutationDefaults = /* @__PURE__ */ new Map();
		this.#mountCount = 0;
	}
	/**
	* Called by a framework adapter's `QueryClientProvider`-equivalent when it mounts, to start
	* listening for focus/online events and resume paused mutations. Ref-counted via an internal
	* mount count, so nested or multiple providers sharing the same `QueryClient` don't tear down
	* the shared listeners until the last one unmounts.
	*/
	mount() {
		this.#mountCount++;
		if (this.#mountCount !== 1) return;
		this.#unsubscribeFocus = focusManager.subscribe(async (focused) => {
			if (focused) {
				await this.resumePausedMutations();
				this.#queryCache.onFocus();
			}
		});
		this.#unsubscribeOnline = onlineManager.subscribe(async (online) => {
			if (online) {
				await this.resumePausedMutations();
				this.#queryCache.onOnline();
			}
		});
	}
	/**
	* The inverse of {@link QueryClient#mount} — called by a framework adapter's
	* `QueryClientProvider`-equivalent when it unmounts. Only tears down the focus/online
	* listeners once the mount count returns to `0`.
	*/
	unmount() {
		this.#mountCount--;
		if (this.#mountCount !== 0) return;
		this.#unsubscribeFocus?.();
		this.#unsubscribeFocus = void 0;
		this.#unsubscribeOnline?.();
		this.#unsubscribeOnline = void 0;
	}
	/**
	* Returns the number of queries in the cache that are currently fetching, optionally
	* matching a set of filters. This includes background-fetching, loading new pages, and
	* loading more infinite query results.
	* @param filters - Narrows down which fetching queries are counted. Without filters, every
	* fetching query is counted.
	* @returns The number of matching queries whose `fetchStatus` is `'fetching'`.
	* @example
	* ```ts
	* if (queryClient.isFetching()) {
	*   console.log('At least one query is fetching!')
	* }
	* ```
	*/
	isFetching(filters) {
		return this.#queryCache.findAll({
			...filters,
			fetchStatus: "fetching"
		}).length;
	}
	/**
	* Returns the number of mutations in the cache that are currently pending, optionally
	* matching a set of filters.
	* @param filters - Narrows down which pending mutations are counted. Without filters, every
	* pending mutation is counted.
	* @returns The number of matching mutations whose `status` is `'pending'`.
	* @example
	* ```ts
	* if (queryClient.isMutating()) {
	*   console.log('At least one mutation is pending!')
	* }
	* ```
	*/
	isMutating(filters) {
		return this.#mutationCache.findAll({
			...filters,
			status: "pending"
		}).length;
	}
	/**
	* Imperative (non-reactive) way to retrieve data for a QueryKey.
	* Should only be used in callbacks or functions where reading the latest data is necessary, e.g. for optimistic updates.
	*
	* Hint: Do not use this function inside a component, because it won't receive updates.
	* Use `useQuery` to create a `QueryObserver` that subscribes to changes.
	* @param queryKey - The query key of the query to read.
	* @returns The cached data for the query, or `undefined` if no query with this key has been observed yet.
	* @see {@link QueryClient#getQueriesData}
	*/
	getQueryData(queryKey) {
		const options = this.defaultQueryOptions({ queryKey });
		return this.#queryCache.get(options.queryHash)?.state.data;
	}
	/**
	* Returns the cached data of a query, or fetches it if there is none. With `revalidateIfStale`,
	* stale cached data is also refetched in the background.
	* @param options - The query options. If the query has no cached data yet, it is fetched with
	* these options.
	* @returns A promise that resolves to the cached data, or to the fetched data if nothing was
	* cached yet.
	* @deprecated Use queryClient.query({ ...options, staleTime: 'static' }) instead. This method will be removed in the next major version.
	*/
	ensureQueryData(options) {
		const defaultedOptions = this.defaultQueryOptions(options);
		const query = this.#queryCache.build(this, defaultedOptions);
		const cachedData = query.state.data;
		if (cachedData === void 0) return this.fetchQuery(options);
		if (options.revalidateIfStale && query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query))) this.prefetchQuery(defaultedOptions);
		return Promise.resolve(cachedData);
	}
	/**
	* Imperative (non-reactive) way to retrieve the cached data of multiple queries at once.
	* Only queries matching the given filters are returned; if none match, an empty array is
	* returned.
	*
	* Because the matched queries can hold data of different shapes (e.g. a broad filter can match
	* queries with unrelated data types), the `TQueryFnData` generic defaults to `unknown` rather
	* than being inferred. Passing a more specific type is a convenience for call sites that know
	* every matched query holds the same shape — it is not checked against the actual cache
	* contents.
	* @param filters - The filters that select which queries to read.
	* @returns An array of query key and data pairs. The data is `undefined` for a query with no cached data.
	* @see {@link QueryClient#getQueryData}
	* @example
	* ```ts
	* const data = queryClient.getQueriesData({ queryKey: ['posts'] })
	* ```
	*/
	getQueriesData(filters) {
		return this.#queryCache.findAll(filters).map(({ queryKey, state }) => {
			return [queryKey, state.data];
		});
	}
	/**
	* Synchronous way to immediately update a query's cached data. If the updater (or the value
	* passed) resolves to `undefined`, the cache is left untouched and no query is created;
	* otherwise, if the query does not exist yet, it will be created. To update multiple queries
	* at once by partially matching query keys, use {@link QueryClient#setQueriesData} instead.
	*
	* Updates must be performed immutably: do not mutate `oldData`, or data previously retrieved
	* via {@link QueryClient#getQueryData}, in place.
	* @param queryKey - The query key to set data for.
	* @param updater - Either the new data, or a function that receives the current data (which
	* may be `undefined`) and returns the new data.
	* @param options - Set `updatedAt` to override the timestamp the written data is recorded with.
	* @returns The data that was written, or `undefined` if the updater returned `undefined` — in that case
	* the write is skipped and the cache is left unchanged.
	* @example
	* ```ts
	* queryClient.setQueryData(['posts'], newPosts)
	*
	* // Or, using an updater function that receives the current data:
	* queryClient.setQueryData(['posts'], (oldPosts) => [...oldPosts, newPost])
	* ```
	*/
	setQueryData(queryKey, updater, options) {
		const defaultedOptions = this.defaultQueryOptions({ queryKey });
		const prevData = this.#queryCache.get(defaultedOptions.queryHash)?.state.data;
		const data = functionalUpdate(updater, prevData);
		if (data === void 0) return;
		return this.#queryCache.build(this, defaultedOptions).setData(data, {
			...options,
			manual: true
		});
	}
	/**
	* Synchronous way to immediately update the cached data of multiple queries at once, using
	* filters or partial query key matching. Only queries that already exist and match the given
	* filters are updated; no new cache entries are created. Internally this calls
	* {@link QueryClient#setQueryData} for each matching query.
	* @param filters - The filters that select which existing queries to update.
	* @param updater - Either the new data, or a function that receives each matched query's current
	* data (which may be `undefined`) and returns the new data.
	* @param options - Set `updatedAt` to override the timestamp the written data is recorded with.
	* @returns One `[queryKey, data]` tuple per matched query, in the same shape and with the same
	* `undefined` case as {@link QueryClient#setQueryData}.
	* @example
	* ```ts
	* queryClient.setQueriesData({ queryKey: ['posts'] }, (oldPosts) =>
	*   oldPosts ? oldPosts.filter((post) => post.id !== deletedId) : oldPosts,
	* )
	* ```
	*/
	setQueriesData(filters, updater, options) {
		return notifyManager.batch(() => this.#queryCache.findAll(filters).map(({ queryKey }) => [queryKey, this.setQueryData(queryKey, updater, options)]));
	}
	/**
	* Imperative (non-reactive) way to retrieve an existing query's state. If the query does not
	* exist, `undefined` is returned.
	* @param queryKey - The query key of the query to read.
	* @returns The query's state, or `undefined` if no query with this key exists.
	* @example
	* ```ts
	* const state = queryClient.getQueryState(['posts'])
	* console.log(state?.dataUpdatedAt)
	* ```
	*/
	getQueryState(queryKey) {
		const options = this.defaultQueryOptions({ queryKey });
		return this.#queryCache.get(options.queryHash)?.state;
	}
	/**
	* Removes queries from the cache that match the given filters. Unlike
	* {@link QueryClient#invalidateQueries} or {@link QueryClient#refetchQueries}, this removes
	* matching queries from the cache instead of refetching them. Without filters, every query in
	* the cache is removed.
	* @param filters - The filters that select which queries to remove. Without filters, every query
	* is removed.
	* @example
	* ```ts
	* queryClient.removeQueries({ queryKey: ['posts'], exact: true })
	* ```
	*/
	removeQueries(filters) {
		const queryCache = this.#queryCache;
		notifyManager.batch(() => {
			queryCache.findAll(filters).forEach((query) => {
				queryCache.remove(query);
			});
		});
	}
	/**
	* Resets queries matching the given filters back to their initial state (e.g. any
	* `initialData`), notifying subscribers rather than removing them. Active queries among the
	* matched set are then refetched, and the returned promise resolves once that refetch settles.
	* @param filters - The filters that select which queries to reset. Without filters, every query
	* is reset.
	* @param options - Passed to the refetch of the active matched queries, e.g. `cancelRefetch` and
	* `throwOnError`.
	* @returns A promise that resolves once the refetch of the active matched queries settles.
	* @example
	* ```ts
	* await queryClient.resetQueries({ queryKey: ['posts'], exact: true })
	* ```
	*/
	resetQueries(filters, options) {
		const queryCache = this.#queryCache;
		return notifyManager.batch(() => {
			const matched = queryCache.findAll(filters);
			const queriesToRefetch = new Set(matched);
			matched.forEach((query) => {
				query.reset();
			});
			return this.refetchQueries({
				type: "active",
				predicate: (query) => queriesToRefetch.has(query)
			}, options);
		});
	}
	/**
	* Cancels outgoing fetches for queries matching the given filters. Most useful when performing
	* optimistic updates, since any outgoing refetch that resolves afterwards would otherwise
	* overwrite the optimistic update. By default (`revert: true`), a cancelled query's data is
	* reverted to its state before the outgoing fetch started.
	*
	* The returned promise never rejects, even if individual cancellations fail.
	* @param filters - The filters that select which queries to cancel. Without filters, every query
	* is cancelled.
	* @param cancelOptions - Passed to each matched query's cancellation. `revert` defaults to
	* `true`.
	* @returns A promise that resolves once every cancellation has settled.
	* @example
	* ```ts
	* await queryClient.cancelQueries({ queryKey: ['posts'], exact: true })
	* ```
	*/
	cancelQueries(filters, cancelOptions = {}) {
		const defaultedCancelOptions = {
			revert: true,
			...cancelOptions
		};
		const promises = notifyManager.batch(() => this.#queryCache.findAll(filters).map((query) => query.cancel(defaultedCancelOptions)));
		return Promise.all(promises).then(noop).catch(noop);
	}
	/**
	* Marks queries matching the given filters as invalidated. Unlike
	* {@link QueryClient#removeQueries}, invalidated queries stay in the cache.
	*
	* Unless `filters.refetchType` is `'none'`, matching queries are then refetched via
	* {@link QueryClient#refetchQueries}, using `filters.refetchType` if set, otherwise
	* `filters.type`, otherwise `'active'`.
	* @param filters - The filters that select which queries to invalidate, plus `refetchType` to
	* control which of them to refetch afterwards. Without filters, every query is invalidated.
	* @param options - Passed to {@link QueryClient#refetchQueries}, e.g. `cancelRefetch` and
	* `throwOnError`.
	* @returns A promise that resolves once the refetch settles, or immediately if `refetchType` is
	* `'none'`.
	* @example
	* ```ts
	* await queryClient.invalidateQueries({ queryKey: ['posts'], refetchType: 'active' })
	* ```
	*/
	invalidateQueries(filters, options = {}) {
		return notifyManager.batch(() => {
			this.#queryCache.findAll(filters).forEach((query) => {
				query.invalidate();
			});
			if (filters?.refetchType === "none") return Promise.resolve();
			return this.refetchQueries({
				...filters,
				type: filters?.refetchType ?? filters?.type ?? "active"
			}, options);
		});
	}
	/**
	* Refetches queries matching the given filters, regardless of whether they are stale. Without
	* filters, every query in the cache is refetched. Queries that are disabled, or static (only
	* have observers with a static `staleTime`), are never refetched.
	*
	* By default (`cancelRefetch: true`), a currently running fetch is cancelled before the new
	* one starts. The returned promise does not reject on individual query failures unless
	* `throwOnError` is `true`.
	*
	* Initially paused fetches do not delay the returned promise. Their later errors are handled
	* even when `throwOnError` is `true`.
	* @param filters - The filters that select which queries to refetch. Without filters, every query
	* in the cache is included.
	* @param options - Set `cancelRefetch` to `false` to keep a running fetch instead of cancelling
	* it, and `throwOnError` to `true` to reject when a refetch that was not initially paused fails.
	* @returns A promise that resolves once all matching refetches that were not initially paused
	* have settled.
	* @example
	* ```ts
	* // refetch all active queries partially matching a query key:
	* await queryClient.refetchQueries({ queryKey: ['posts'], type: 'active' })
	* ```
	*/
	refetchQueries(filters, options = {}) {
		const fetchOptions = {
			...options,
			cancelRefetch: options.cancelRefetch ?? true
		};
		const promises = notifyManager.batch(() => this.#queryCache.findAll(filters).filter((query) => !query.isDisabled() && !query.isStatic()).map((query) => {
			let promise = query.fetch(void 0, fetchOptions);
			const isPaused = query.state.fetchStatus === "paused";
			if (!fetchOptions.throwOnError || isPaused) promise = promise.catch(noop);
			return isPaused ? Promise.resolve() : promise;
		}));
		return Promise.all(promises).then(noop);
	}
	/**
	* Asynchronous method to fetch and cache a query, resolving with the data or throwing with
	* the error.
	*
	* If the query already exists in the cache and its data is not stale (per the given
	* `staleTime`), the cached data is returned without fetching. Otherwise, the query is fetched
	* and the promise resolves once the fetch settles. If a `select` function is provided, it is
	* applied to the data in both cases (cached or freshly fetched) before it is returned.
	*
	* Unlike a reactive observer, retries are disabled by default here (`retry: false`) unless
	* explicitly configured, since there is no component to catch a thrown error and retry through
	* re-render.
	*
	* The accepted options are `QueryObserverOptions` minus the fields that only make sense for a
	* reactive observer — `enabled`, `refetchInterval`, `refetchIntervalInBackground`,
	* `refetchOnWindowFocus`, `refetchOnReconnect`, `refetchOnMount`, `retryOnMount`,
	* `notifyOnChangeProps`, `throwOnError`, `suspense`, and `placeholderData` are not part of this
	* method's options.
	*
	* This method replaces the deprecated `fetchQuery`, and — combined with
	* `{ staleTime: 'static' }` — the deprecated `ensureQueryData`.
	* @param options - The query options, including the `queryKey` and the `queryFn` used if the
	* query needs to fetch.
	* @returns A promise that resolves to the data, or to the result of `select` if provided. It
	* rejects with the error from the fetch or from `select`.
	* @example
	* ```ts
	* try {
	*   const data = await queryClient.query({ queryKey, queryFn, staleTime: 10000 })
	* } catch (error) {
	*   console.log(error)
	* }
	* ```
	*/
	async query(options) {
		const defaultedOptions = this.defaultQueryOptions(options);
		if (defaultedOptions.retry === void 0) defaultedOptions.retry = false;
		const query = this.#queryCache.build(this, defaultedOptions);
		const queryData = query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query)) ? await query.fetch(defaultedOptions) : query.state.data;
		const select = defaultedOptions.select;
		if (select) return select(queryData);
		return queryData;
	}
	/**
	* Fetches and caches a query, or returns its cached data if it isn't stale. Unlike in observers,
	* the fetch isn't retried unless `retry` is set.
	* @param options - The query options, including the `queryKey` and the `queryFn` used if the
	* query needs to fetch.
	* @returns A promise that resolves to the cached or fetched data, or rejects with the fetch
	* error.
	* @deprecated Use queryClient.query(options) instead. This method will be removed in the next major version.
	*/
	fetchQuery(options) {
		const defaultedOptions = this.defaultQueryOptions(options);
		if (defaultedOptions.retry === void 0) defaultedOptions.retry = false;
		const query = this.#queryCache.build(this, defaultedOptions);
		return query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query)) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
	}
	/**
	* Fetches and caches a query like {@link QueryClient#fetchQuery}, but ignores the result and any
	* error.
	* @param options - The query options, including the `queryKey` and the `queryFn` used if the
	* query needs to fetch.
	* @returns A promise that resolves once the fetch settles. It never rejects.
	* @deprecated Use queryClient.query(options) instead. You can swallow errors with `.catch(noop)`. This method will be removed in the next major version.
	*/
	prefetchQuery(options) {
		return this.fetchQuery(options).then(noop).catch(noop);
	}
	/**
	* Asynchronous method to fetch and cache an infinite query, resolving with an
	* {@link InfiniteData} object or throwing with the error.
	*
	* Behaves like {@link QueryClient#query}, accepting the same options (minus
	* `initialPageParam`), plus the required `initialPageParam`, and an optional `pages` /
	* `getNextPageParam` pair used to refetch a fixed number of pages from the start.
	*
	* This method replaces the deprecated `fetchInfiniteQuery`, and — combined with
	* `{ staleTime: 'static' }` — the deprecated `ensureInfiniteQueryData`.
	* @param options - The infinite query options, including the `queryKey`, the `queryFn`, and the
	* `initialPageParam`.
	* @returns A promise that resolves to the {@link InfiniteData}, or to the result of `select` if
	* provided. It rejects with the error from the fetch or from `select`.
	* @example
	* ```ts
	* try {
	*   const data = await queryClient.infiniteQuery({ queryKey, queryFn, initialPageParam: 0 })
	*   console.log(data.pages)
	* } catch (error) {
	*   console.log(error)
	* }
	* ```
	*/
	infiniteQuery(options) {
		options._type = "infinite";
		return this.query(options);
	}
	/**
	* Fetches and caches an infinite query, or returns its cached data if it isn't stale.
	* @param options - The infinite query options, including the `queryKey`, the `queryFn`, and the
	* `initialPageParam`.
	* @returns A promise that resolves to the cached or fetched {@link InfiniteData}, or rejects with
	* the fetch error.
	* @deprecated Use queryClient.infiniteQuery(options) instead. This method will be removed in the next major version.
	*/
	fetchInfiniteQuery(options) {
		options._type = "infinite";
		return this.fetchQuery(options);
	}
	/**
	* Fetches and caches an infinite query like {@link QueryClient#fetchInfiniteQuery}, but ignores
	* the result and any error.
	* @param options - The infinite query options, including the `queryKey`, the `queryFn`, and the
	* `initialPageParam`.
	* @returns A promise that resolves once the fetch settles. It never rejects.
	* @deprecated Use queryClient.infiniteQuery(options) instead. You can swallow errors with `.catch(noop)`. This method will be removed in the next major version.
	*/
	prefetchInfiniteQuery(options) {
		return this.fetchInfiniteQuery(options).then(noop).catch(noop);
	}
	/**
	* Returns the cached data of an infinite query, or fetches it if there is none. With
	* `revalidateIfStale`, stale cached data is also refetched in the background.
	* @param options - The infinite query options. If the query has no cached data yet, it is fetched
	* with these options.
	* @returns A promise that resolves to the cached {@link InfiniteData}, or to the fetched data if
	* nothing was cached yet.
	* @deprecated Use queryClient.infiniteQuery({ ...options, staleTime: 'static' }) instead. This method will be removed in the next major version.
	*/
	ensureInfiniteQueryData(options) {
		options._type = "infinite";
		return this.ensureQueryData(options);
	}
	/**
	* Resumes mutations that were paused because there was no network connection. Does nothing
	* (resolving immediately) if the client is currently offline.
	* @returns A promise that resolves once the resumed mutations have settled.
	* @example
	* ```ts
	* import { QueryClient } from '@tanstack/query-core'
	*
	* const queryClient = new QueryClient()
	* await queryClient.resumePausedMutations()
	* ```
	*/
	resumePausedMutations() {
		if (onlineManager.isOnline()) return this.#mutationCache.resumePausedMutations();
		return Promise.resolve();
	}
	/**
	* Returns the query cache this client is connected to.
	* @returns The {@link QueryCache} instance.
	* @example
	* ```ts
	* import { QueryClient } from '@tanstack/query-core'
	*
	* const queryClient = new QueryClient()
	* const queryCache = queryClient.getQueryCache()
	* const queries = queryCache.findAll({ queryKey: ['posts'] })
	* ```
	*/
	getQueryCache() {
		return this.#queryCache;
	}
	/**
	* Returns the mutation cache this client is connected to.
	* @returns The {@link MutationCache} instance.
	* @example
	* ```ts
	* import { QueryClient } from '@tanstack/query-core'
	*
	* const queryClient = new QueryClient()
	* const mutationCache = queryClient.getMutationCache()
	* const mutations = mutationCache.findAll({ status: 'pending' })
	* ```
	*/
	getMutationCache() {
		return this.#mutationCache;
	}
	/**
	* Returns the default options that were set when creating the client, or via
	* {@link QueryClient#setDefaultOptions}.
	* @returns The client's current default options.
	* @example
	* ```ts
	* import { QueryClient } from '@tanstack/query-core'
	*
	* const queryClient = new QueryClient()
	* const defaultOptions = queryClient.getDefaultOptions()
	* ```
	*/
	getDefaultOptions() {
		return this.#defaultOptions;
	}
	/**
	* Dynamically sets the default options for this client, overwriting any previously defined
	* default options.
	* @param options - The new default options for queries and mutations.
	* @see {@link QueryClient#getDefaultOptions}
	* @example
	* ```ts
	* import { QueryClient } from '@tanstack/query-core'
	*
	* const queryClient = new QueryClient()
	* queryClient.setDefaultOptions({
	*   queries: {
	*     staleTime: Infinity,
	*   },
	* })
	* ```
	*/
	setDefaultOptions(options) {
		this.#defaultOptions = options;
	}
	/**
	* Sets default options for queries whose query key partially matches the given `queryKey`.
	*
	* If several registered query defaults match a given query key, they are merged together in
	* registration order by {@link QueryClient#getQueryDefaults}, so register defaults from the
	* most generic key to the least generic one — more specific defaults should be registered
	* after more generic ones so they take precedence.
	* @param queryKey - The query key that query keys are partially matched against.
	* @param options - The default options applied to matching queries.
	* @example
	* ```ts
	* queryClient.setQueryDefaults(['posts'], { queryFn: fetchPosts })
	*
	* await queryClient.query({ queryKey: ['posts'] })
	* ```
	*/
	setQueryDefaults(queryKey, options) {
		this.#queryDefaults.set(hashKey(queryKey), {
			queryKey,
			defaultOptions: options
		});
	}
	/**
	* Returns the default options registered for queries whose query key partially matches the
	* given `queryKey`, via {@link QueryClient#setQueryDefaults}. If multiple registered defaults
	* match, they are merged together in registration order.
	* @param queryKey - The query key to look up registered defaults for.
	* @returns The merged default options of every registration that matches, or an empty object if
	* none match.
	* @example
	* ```ts
	* const defaultOptions = queryClient.getQueryDefaults(['posts'])
	* ```
	*/
	getQueryDefaults(queryKey) {
		const defaults = [...this.#queryDefaults.values()];
		const result = {};
		defaults.forEach((queryDefault) => {
			if (partialMatchKey(queryKey, queryDefault.queryKey)) Object.assign(result, queryDefault.defaultOptions);
		});
		return result;
	}
	/**
	* Sets default options for mutations whose mutation key partially matches the given
	* `mutationKey`. As with {@link QueryClient#setQueryDefaults}, the order of registration
	* matters when several registered defaults match the same mutation key.
	* @param mutationKey - The mutation key that mutation keys are partially matched against.
	* @param options - The default options applied to matching mutations.
	* @see {@link QueryClient#getMutationDefaults}
	* @example
	* ```ts
	* queryClient.setMutationDefaults(['addPost'], { mutationFn: addPost })
	* ```
	*/
	setMutationDefaults(mutationKey, options) {
		this.#mutationDefaults.set(hashKey(mutationKey), {
			mutationKey,
			defaultOptions: options
		});
	}
	/**
	* Returns the default options registered for mutations whose mutation key partially matches
	* the given `mutationKey`, via {@link QueryClient#setMutationDefaults}. If multiple registered
	* defaults match, they are merged together in registration order.
	* @param mutationKey - The mutation key to look up registered defaults for.
	* @returns The merged default options of every registration that matches, or an empty object if
	* none match.
	* @example
	* ```ts
	* const defaultOptions = queryClient.getMutationDefaults(['addPost'])
	* ```
	*/
	getMutationDefaults(mutationKey) {
		const defaults = [...this.#mutationDefaults.values()];
		const result = {};
		defaults.forEach((queryDefault) => {
			if (partialMatchKey(mutationKey, queryDefault.mutationKey)) Object.assign(result, queryDefault.defaultOptions);
		});
		return result;
	}
	/**
	* Called by framework adapters (e.g. inside `useQuery`) to resolve the options passed by the
	* caller into their final, defaulted form: merging the client's own `defaultOptions.queries`,
	* then `queryClient.setQueryDefaults` for the given `queryKey`, then the caller's options on
	* top. A no-op if the options are already defaulted (`_defaulted: true`).
	* @param options - The query options passed by the caller.
	* @returns The defaulted options, with `queryHash` and dependent defaults (e.g.
	* `refetchOnReconnect`) filled in.
	*/
	defaultQueryOptions(options) {
		if (options._defaulted) return options;
		const defaultedOptions = {
			...this.#defaultOptions.queries,
			...this.getQueryDefaults(options.queryKey),
			...options,
			_defaulted: true
		};
		if (!defaultedOptions.queryHash) defaultedOptions.queryHash = hashQueryKeyByOptions(defaultedOptions.queryKey, defaultedOptions);
		if (defaultedOptions.refetchOnReconnect === void 0) defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== "always";
		if (defaultedOptions.throwOnError === void 0) defaultedOptions.throwOnError = !!defaultedOptions.suspense;
		if (!defaultedOptions.networkMode && defaultedOptions.persister) defaultedOptions.networkMode = "offlineFirst";
		if (defaultedOptions.queryFn === skipToken) defaultedOptions.enabled = false;
		return defaultedOptions;
	}
	/**
	* The mutation counterpart of {@link QueryClient#defaultQueryOptions}. Called by framework
	* adapters (e.g. inside `useMutation`) to merge the client's `defaultOptions.mutations`, then
	* `queryClient.setMutationDefaults` for the given `mutationKey`, then the caller's options on
	* top. A no-op if the options are already defaulted (`_defaulted: true`).
	* @param options - The mutation options passed by the caller.
	* @returns The defaulted options.
	*/
	defaultMutationOptions(options) {
		if (options?._defaulted) return options;
		return {
			...this.#defaultOptions.mutations,
			...options?.mutationKey && this.getMutationDefaults(options.mutationKey),
			...options,
			_defaulted: true
		};
	}
	/**
	* Clears both the query cache and the mutation cache this client is connected to.
	* @example
	* ```ts
	* import { QueryClient } from '@tanstack/query-core'
	*
	* const queryClient = new QueryClient()
	* queryClient.clear()
	* ```
	*/
	clear() {
		this.#queryCache.clear();
		this.#mutationCache.clear();
	}
};
// node_modules/@tanstack/react-query/build/modern/IsRestoringProvider.js
var IsRestoringContext = React.createContext(false);
/**
* If you are using `PersistQueryClientProvider`, you can also use the `useIsRestoring` hook alongside it to
* check if a restore is currently in progress. `useQuery` and friends also check this internally to avoid
* race conditions between the restore and mounting queries.
* @returns `true` while a persisted client is being restored, `false` otherwise.
*/
var useIsRestoring = () => React.useContext(IsRestoringContext);
IsRestoringContext.Provider;
// node_modules/@tanstack/react-query/build/modern/QueryErrorResetBoundary.js
/**
* Creates the value shared through the boundary's context, which tracks whether a reset was
* requested.
* @returns The `clearReset`, `isReset`, and `reset` functions of the boundary.
*/
function createValue() {
	let isReset = false;
	return {
		/**
		* Clears the reset state, so queries know not to try again until the boundary is reset again.
		*/
		clearReset: () => {
			isReset = false;
		},
		/**
		* Resets any query errors within the boundary, so queries know they can try again.
		*/
		reset: () => {
			isReset = true;
		},
		/**
		* Returns whether the boundary has been reset and not yet cleared.
		* @returns `true` if the boundary has been reset and not yet cleared.
		*/
		isReset: () => {
			return isReset;
		}
	};
}
var QueryErrorResetBoundaryContext = React.createContext(createValue());
/**
* This hook will reset any query errors within the closest `QueryErrorResetBoundary`. If there is no boundary
* defined it will reset them globally.
* @returns The boundary's {@link QueryErrorResetBoundaryValue}.
* @example
* ```tsx
* import { ErrorBoundary } from 'react-error-boundary'
* import { useQueryErrorResetBoundary } from '@tanstack/react-query'
*
* function App({ children }: { children: React.ReactNode }) {
*   const { reset } = useQueryErrorResetBoundary()
*
*   return (
*     <ErrorBoundary
*       onReset={reset}
*       fallbackRender={({ resetErrorBoundary }) => (
*         <div>
*           There was an error!
*           <button onClick={() => resetErrorBoundary()}>Try again</button>
*         </div>
*       )}
*     >
*       {children}
*     </ErrorBoundary>
*   )
* }
* ```
*/
var useQueryErrorResetBoundary = () => React.useContext(QueryErrorResetBoundaryContext);
// node_modules/@tanstack/react-query/build/modern/errorBoundaryUtils.js
/**
* Turns off `retryOnMount` for a query that throws its errors (with `suspense` or `throwOnError`),
* unless the error boundary has been reset, so a remount doesn't retry the failed query before the
* user resets the boundary. Mutates the options.
* @param options - The defaulted query options to adjust.
* @param errorResetBoundary - The value of the nearest `QueryErrorResetBoundary`.
* @param query - The query, used to evaluate a `throwOnError` function against its error.
*/
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
	const throwOnError = query?.state.status === "error" && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
	if (options.suspense || throwOnError) {
		if (!errorResetBoundary.isReset()) options.retryOnMount = false;
	}
};
/**
* Clears the reset state of the error boundary after the component mounts, so later errors are
* thrown to the boundary again.
* @param errorResetBoundary - The value of the nearest `QueryErrorResetBoundary`.
*/
var useClearResetErrorBoundary = (errorResetBoundary) => {
	React.useEffect(() => {
		errorResetBoundary.clearReset();
	}, [errorResetBoundary]);
};
/**
* Checks whether the query error should be thrown to the nearest error boundary: the query errored
* and isn't fetching, the boundary hasn't been reset, and either `suspense` is enabled with no data
* or `throwOnError` says so.
* @param params - The observer `result`, the `errorResetBoundary`, the `throwOnError` option, the
* `query`, and the `suspense` option.
* @returns `true` if the error should be thrown.
*/
var getHasError = ({ result, errorResetBoundary, throwOnError, query, suspense }) => {
	return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
// node_modules/@tanstack/react-query/build/modern/suspense.js
/**
* Raises `staleTime` and a numeric `gcTime` to at least 1000ms when `suspense` is enabled, so a
* component that remounts after suspending doesn't refetch right away or find the query garbage
* collected. A `'static'` `staleTime` is kept as is. Mutates the options.
* @param defaultedOptions - The defaulted query options to adjust.
*/
var ensureSuspenseTimers = (defaultedOptions) => {
	if (defaultedOptions.suspense) {
		const MIN_SUSPENSE_TIME_MS = 1e3;
		const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
		const originalStaleTime = defaultedOptions.staleTime;
		defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
		if (typeof defaultedOptions.gcTime === "number") defaultedOptions.gcTime = Math.max(defaultedOptions.gcTime, MIN_SUSPENSE_TIME_MS);
	}
};
/**
* Checks whether a query should suspend: `suspense` is enabled and the result is still `pending`.
* @param defaultedOptions - The defaulted query options, if any.
* @param result - The current result of the observer.
* @returns `true` if the component should suspend.
*/
var shouldSuspend = (defaultedOptions, result) => defaultedOptions?.suspense && result.isPending;
/**
* Fetches the query for a suspending component, without affecting the observer's own result. If
* the fetch fails, the reset state of the error boundary is cleared, so the error is thrown to it.
* @param defaultedOptions - The defaulted query options to fetch with.
* @param observer - The observer of the query.
* @param errorResetBoundary - The value of the nearest `QueryErrorResetBoundary`.
* @returns A promise that resolves once the fetch settles. It never rejects.
*/
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
	errorResetBoundary.clearReset();
});
// node_modules/@tanstack/react-query/build/modern/useQueries.js
/**
* The `useQueries` hook can be used to fetch a variable number of queries.
*
* The `queries` key accepts an array with query option objects mostly identical to `useQuery` — the top-level
* `subscribed` option isn't accepted per query (see `placeholderData` below for another difference). A custom
* `QueryClient` is supplied once, as `useQueries`' own top-level second argument, rather than per query.
*
* Having the same query key more than once in the array of query objects may cause some data to be shared
* between queries. To avoid this, consider de-duplicating the queries and map the results back to the desired
* structure.
*
* The `combine` option can be used to combine the results of the queries into a single value. The result will
* be structurally shared to be as referentially stable as possible.
* @param options - The `queries` array to run, and the optional `combine` and `subscribed` options.
* @param queryClient - Use this to provide a custom `QueryClient`. Otherwise, the one from the nearest context
* will be used.
* @returns The combined result. Without `combine`, this is an array with all the query results, in the same
* order as the input. When `combine` is provided, this is the value returned by `combine` instead.
* @throws {Error} The error of the first query that should be thrown to the nearest error boundary (see
* `throwOnError`). While suspending, it throws a promise instead.
* @remarks The `combine` function only re-runs if it changed referentially, or if any of the query results
* changed. An inlined `combine` function, as shown in the example below, therefore runs on every render — wrap
* it in `useCallback`, or extract it to a stable function reference if it doesn't have any dependencies, to
* avoid that.
*
* Unlike `useQuery`, `useQueries` cannot infer the `data` argument of an _inline_ `select` from its sibling
* `queryFn`. Because `useQueries` infers the type of the whole `queries` array at once, the `select` parameter
* of a query object written inline cannot be contextually typed from that same object's `queryFn`, so it falls
* back to `unknown` — a [known TypeScript limitation](https://github.com/TanStack/query/issues/6556). Annotate
* the `select` parameter explicitly, or define the query with {@link queryOptions}, which resolves its types in
* a single object _before_ it reaches `useQueries`, to work around this — see the example below. The same
* limitation applies to {@link useSuspenseQueries}.
*
* `placeholderData` is supported here too, but unlike `useQuery`, it doesn't receive information from
* previously rendered queries, because the number of queries can differ between renders.
* @example
* ```tsx
* import { useQueries } from '@tanstack/react-query'
*
* function Posts({ ids }: { ids: Array<number> }) {
*   const postQueries = useQueries({
*     queries: ids.map((id) => ({
*       queryKey: ['post', id],
*       queryFn: () => fetchPost(id),
*       staleTime: Infinity,
*     })),
*   })
*
*   return (
*     <ul>
*       {postQueries.map((query, index) => {
*         if (query.isPending) return <li key={ids[index]}>Loading...</li>
*         if (query.isError) return <li key={ids[index]}>Error: {query.error.message}</li>
*         return <li key={ids[index]}>{query.data.title}</li>
*       })}
*     </ul>
*   )
* }
* ```
* @example
* Combining results into a single value:
* ```tsx
* import { useQueries } from '@tanstack/react-query'
*
* function Posts({ ids }: { ids: Array<number> }) {
*   const { data, isPending, isError } = useQueries({
*     queries: ids.map((id) => ({
*       queryKey: ['post', id],
*       queryFn: () => fetchPost(id),
*     })),
*     combine: (postQueries) => {
*       return {
*         data: postQueries.map((query) => query.data),
*         isPending: postQueries.some((query) => query.isPending),
*         isError: postQueries.some((query) => query.isError),
*       }
*     },
*   })
*
*   if (isPending) return 'Loading...'
*   if (isError) return 'Error loading posts'
*
*   return (
*     <ul>
*       {data.map((post) => (
*         <li key={post?.id}>{post?.title}</li>
*       ))}
*     </ul>
*   )
* }
* ```
* @example
* Typing `select` via {@link queryOptions}. Note that spreading a `queryOptions` result and overriding
* `select` inline still falls back to `unknown` — wrap the spread in `queryOptions` again so the override is
* resolved before it reaches `useQueries`:
* ```tsx
* import { queryOptions, useQueries } from '@tanstack/react-query'
*
* const postOptions = (id: number) =>
*   queryOptions({
*     queryKey: ['post', id],
*     queryFn: () => fetchPost(id),
*   })
*
* function PostTitle({ id }: { id: number }) {
*   const [{ data: broken }] = useQueries({
*     queries: [
*       {
*         ...postOptions(id),
*         // ❌ `data` is `unknown` here
*         select: (data) => data.title,
*       },
*     ],
*   })
*
*   const [{ data: fixed }] = useQueries({
*     queries: [
*       queryOptions({
*         ...postOptions(id),
*         // ✅ `data` is `Post`
*         select: (data) => data.title,
*       }),
*     ],
*   })
*
*   return <h1>{fixed}</h1>
* }
* ```
*/
function useQueries({ queries, ...options }, queryClient) {
	const client = useQueryClient(queryClient);
	const isRestoring = useIsRestoring();
	const errorResetBoundary = useQueryErrorResetBoundary();
	const subscribed = options.subscribed !== false;
	const defaultedQueries = React.useMemo(() => queries.map((opts) => {
		const defaultedOptions = client.defaultQueryOptions(opts);
		defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : subscribed ? "optimistic" : void 0;
		return defaultedOptions;
	}), [
		queries,
		client,
		isRestoring,
		subscribed
	]);
	defaultedQueries.forEach((queryOptions) => {
		ensureSuspenseTimers(queryOptions);
		const query = client.getQueryCache().get(queryOptions.queryHash);
		ensurePreventErrorBoundaryRetry(queryOptions, errorResetBoundary, query);
	});
	useClearResetErrorBoundary(errorResetBoundary);
	const [observer] = React.useState(() => new QueriesObserver(client, defaultedQueries, options));
	const [optimisticResult, getCombinedResult, trackResult] = observer.getOptimisticResult(defaultedQueries, options.combine);
	React.useEffect(() => {
		observer.setQueries(defaultedQueries, options);
	}, [
		defaultedQueries,
		options,
		observer
	]);
	const shouldSubscribe = !isRestoring && subscribed;
	React.useSyncExternalStore(React.useCallback((onStoreChange) => shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop, [observer, shouldSubscribe]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
	const suspensePromises = optimisticResult.some((result, index) => shouldSuspend(defaultedQueries[index], result)) ? optimisticResult.flatMap((result, index) => {
		const opts = defaultedQueries[index];
		if (opts && shouldSuspend(opts, result)) return fetchOptimistic(opts, new QueryObserver(client, opts), errorResetBoundary);
		return [];
	}) : [];
	if (suspensePromises.length > 0) throw Promise.all(suspensePromises);
	const firstSingleResultWhichShouldThrow = optimisticResult.find((result, index) => {
		const query = defaultedQueries[index];
		return query && getHasError({
			result,
			errorResetBoundary,
			throwOnError: query.throwOnError,
			query: client.getQueryCache().get(query.queryHash),
			suspense: query.suspense
		});
	});
	if (firstSingleResultWhichShouldThrow) throw firstSingleResultWhichShouldThrow.error;
	return getCombinedResult(trackResult());
}
// node_modules/@tanstack/react-query/build/modern/useBaseQuery.js
/**
* Base implementation shared by `useQuery`, `useInfiniteQuery`, `useSuspenseQuery`, and
* `useSuspenseInfiniteQuery`.
* @param options - The options passed to the calling hook.
* @param Observer - The observer class from query-core (`QueryObserver` or
* `InfiniteQueryObserver`).
* @param queryClient - Use this to use a custom `QueryClient`. Otherwise, the one from the nearest
* context will be used.
* @returns The query result, tracking which properties are read unless `notifyOnChangeProps` is
* set.
* @throws {Error} If `options` is not an object (outside production), or the query error when it should be
* thrown to the nearest error boundary (see `throwOnError`). While suspending, it throws a promise instead.
*/
function useBaseQuery(options, Observer, queryClient) {
	if (typeof options !== "object" || Array.isArray(options)) throw new Error("Bad argument type. Starting with v5, only the \"Object\" form is allowed when calling query related functions. Please use the error stack to find the culprit call. More info here: https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5#supports-a-single-signature-one-object");
	const isRestoring = useIsRestoring();
	const errorResetBoundary = useQueryErrorResetBoundary();
	const client = useQueryClient(queryClient);
	const defaultedOptions = client.defaultQueryOptions(options);
	const query = client.getQueryCache().get(defaultedOptions.queryHash);
	if (!defaultedOptions.queryFn) console.error(`[${defaultedOptions.queryHash}]: No queryFn was passed as an option, and no default queryFn was found. The queryFn parameter is only optional when using a default queryFn. More info here: https://tanstack.com/query/latest/docs/framework/react/guides/default-query-function`);
	const subscribed = options.subscribed !== false;
	defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : subscribed ? "optimistic" : void 0;
	ensureSuspenseTimers(defaultedOptions);
	ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
	useClearResetErrorBoundary(errorResetBoundary);
	const [observer] = React.useState(() => new Observer(client, defaultedOptions));
	const result = observer.getOptimisticResult(defaultedOptions);
	React.useEffect(() => {
		observer.setOptions(defaultedOptions);
	}, [defaultedOptions, observer]);
	const shouldSubscribe = !isRestoring && subscribed;
	React.useSyncExternalStore(React.useCallback((onStoreChange) => {
		const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
		observer.updateResult();
		return unsubscribe;
	}, [observer, shouldSubscribe]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
	if (shouldSuspend(defaultedOptions, result)) throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
	if (getHasError({
		result,
		errorResetBoundary,
		throwOnError: defaultedOptions.throwOnError,
		query,
		suspense: defaultedOptions.suspense
	})) throw result.error;
	return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
// node_modules/@tanstack/react-query/build/modern/useQuery.js
function useQuery(options, queryClient) {
	return useBaseQuery(options, QueryObserver, queryClient);
}
// node_modules/@seliseblocks/client/dist/auth/auth-client.js
var BlocksAuthenticationClient = class {
	clientConfig;
	fetchImpl;
	constructor(clientConfig, fetchImpl = globalThis.fetch?.bind(globalThis)) {
		this.clientConfig = clientConfig;
		this.fetchImpl = fetchImpl;
		if (!this.fetchImpl) throw new Error("Blocks client requires fetch.");
	}
	/**
	* What: discovers tenant login options through `GET /iam/v4/auth/login-options`.
	* Why: login screens need to know which login methods the tenant supports before rendering controls.
	* How: call it before showing your login UI; it is public and still sends `x-blocks-key`.
	*/
	loginOptions() {
		return this.json("/iam/v4/auth/login-options", { auth: false });
	}
	/**
	* What: executes username/password login through `POST /iam/v4/auth/login`.
	* Why: apps that own their login UI need a direct AuthController login call.
	* How: pass IAM's expected login payload; the SDK returns IAM's response as-is and does not store tokens.
	*/
	login(request) {
		return this.json("/iam/v4/auth/login", {
			auth: false,
			body: request
		});
	}
	/**
	* What: starts social login through `GET /iam/v4/auth/social/initiate`.
	* Why: custom login screens may offer social providers while keeping the app in charge of UI.
	* How: provide the public browser client id and redirect URI, then follow IAM's returned social-login response.
	*/
	socialInitiate(clientId, redirectUri) {
		return this.json("/iam/v4/auth/social/initiate", {
			auth: false,
			query: {
				clientId,
				redirectUri
			}
		});
	}
	/**
	* What: completes social login through `POST /iam/v4/auth/social/callback`.
	* Why: the app receives the provider callback but IAM owns the token/session response contract.
	* How: pass the callback payload your app received; store returned tokens in your app layer if IAM returns tokens.
	*/
	socialCallback(request) {
		return this.json("/iam/v4/auth/social/callback", {
			auth: false,
			body: request
		});
	}
	/**
	* What: refreshes an AuthController token through `POST /iam/v4/auth/refresh`.
	* Why: direct AuthController sessions refresh through AuthController instead of the OIDC token endpoint.
	* How: pass the refresh payload your app owns; the SDK does not read or write token storage.
	*/
	refresh(request = {}) {
		return this.json("/iam/v4/auth/refresh", {
			auth: false,
			body: request
		});
	}
	/**
	* What: switches the active organization through `POST /iam/v4/auth/switch-org`.
	* Why: multi-organization users need a new IAM response for the selected organization context.
	* How: pass `organizationId` plus the refresh/session fields IAM expects; then replace app-owned session state with the response if needed.
	*/
	switchOrganization(request) {
		return this.json("/iam/v4/auth/switch-org", { body: request });
	}
	/**
	* What: reads OIDC-style current-user info through `GET /iam/v4/auth/me`.
	* Why: apps may need profile claims from AuthController, separate from full IAM `iam.me()`.
	* How: call after `accessToken` is available on `createBlocksClient`.
	*/
	userInfo() {
		return this.json("/iam/v4/auth/me");
	}
	/**
	* What: logs out the current session through `POST /iam/v4/auth/logout`.
	* Why: the app can ask IAM to invalidate the current session/refresh token while clearing its own local state.
	* How: pass IAM's logout payload, commonly including `refreshToken`.
	*/
	logout(request = {}) {
		return this.json("/iam/v4/auth/logout", { body: request });
	}
	/**
	* What: logs out all supported sessions through `POST /iam/v4/auth/logout-all`.
	* Why: security-sensitive apps may offer a sign-out-everywhere action.
	* How: pass IAM's logout-all payload and clear app-owned session state after success.
	*/
	logoutAll(request = {}) {
		return this.json("/iam/v4/auth/logout-all", { body: request });
	}
	/**
	* What: registers a user through `POST /iam/v4/auth/signup`.
	* Why: apps may own their signup page while IAM owns account creation rules.
	* How: send IAM's signup payload and render IAM's response/errors directly.
	*/
	signup(request) {
		return this.json("/iam/v4/auth/signup", {
			auth: false,
			body: request
		});
	}
	/**
	* What: starts account/password recovery through `POST /iam/v4/auth/recover`.
	* Why: apps need a public recovery entry point.
	* How: pass the email or recovery payload IAM expects and return IAM's response to the UI.
	*/
	recover(request) {
		return this.json("/iam/v4/auth/recover", {
			auth: false,
			body: request
		});
	}
	/**
	* What: completes password reset through `POST /iam/v4/auth/reset-password`.
	* Why: IAM owns reset-token validation and password policy enforcement.
	* How: pass the reset payload from your reset form and show IAM's response/errors.
	*/
	resetPassword(request) {
		return this.json("/iam/v4/auth/reset-password", {
			auth: false,
			body: request
		});
	}
	/**
	* What: changes password through `POST /iam/v4/auth/change-password`.
	* Why: authenticated users need an account-security action inside your app.
	* How: pass IAM's change-password payload after an access token is available.
	*/
	changePassword(request) {
		return this.json("/iam/v4/auth/change-password", { body: request });
	}
	/**
	* What: activates an account through `POST /iam/v4/auth/activate`.
	* Why: signup or invitation flows may require an activation step.
	* How: pass the activation code/token payload IAM expects.
	*/
	activate(request) {
		return this.json("/iam/v4/auth/activate", {
			auth: false,
			body: request
		});
	}
	/**
	* What: requests another activation message through `POST /iam/v4/auth/resend-activation`.
	* Why: users may need a new activation link/code.
	* How: pass IAM's resend payload; this call uses the active bearer token when configured.
	*/
	resendActivation(request) {
		return this.json("/iam/v4/auth/resend-activation", { body: request });
	}
	/**
	* What: validates an activation payload through `POST /iam/v4/auth/validate-activation`.
	* Why: apps can check activation state before committing the final activation UI step.
	* How: pass the activation validation payload and render IAM's response.
	*/
	validateActivation(request) {
		return this.json("/iam/v4/auth/validate-activation", {
			auth: false,
			body: request
		});
	}
	idp = {
		/**
		* What: starts the Blocks IAM IdP-controller browser/provider flow through `GET /iam/v4/idp/initiate`.
		* Why: hosted login should rely on IAM's IdP controller instead of manually constructing `oidc/authorize`.
		* How: pass optional `clientId`, `redirectUri`, or `forwardedTo`; otherwise the SDK uses `createBlocksClient().oidc` defaults and returns IAM's redirect response.
		*/
		initiate: (request = {}) => {
			const oidc = this.oidcDefaults;
			return this.json("/iam/v4/idp/initiate", {
				auth: false,
				query: {
					clientId: request.clientId ?? oidc.clientId,
					forwardedTo: request.forwardedTo,
					redirectUri: request.redirectUri ?? oidc.redirectUri
				}
			});
		},
		/**
		* What: starts hosted login and redirects the browser to IAM's returned provider URL.
		* Why: browser apps often need one call that handles initiate plus navigation.
		* How: call it from a login button handler; the function throws if IAM does not return `redirect_uri`.
		*/
		redirectToProvider: async (request = {}) => {
			const response = await this.idp.initiate(request);
			const redirectUri = response.redirect_uri ?? response.redirectUri;
			if (!redirectUri) throw new Error("Blocks IdP initiate response did not include redirect_uri.");
			window.location.assign(redirectUri);
		},
		/**
		* What: completes the Blocks IAM IdP-controller callback through `GET /iam/v4/idp/callback`.
		* Why: IAM owns the hosted callback contract and returns the auth response shape.
		* How: pass `window.location.href` or an object with `code`, `state`, and optional OIDC error fields; store the returned tokens in your app layer if IAM returns tokens.
		*/
		callback: (callback) => {
			const params = typeof callback === "string" ? callbackParams(callback) : callback;
			return this.json("/iam/v4/idp/callback", {
				auth: false,
				query: {
					code: params.code,
					error: params.error,
					error_description: params.error_description,
					state: params.state
				}
			});
		},
		/**
		* What: reads public UI configuration from `GET /iam/v4/idp/oidc-ui-config`.
		* Why: hosted auth pages may need tenant login settings such as captcha or UI config before authentication.
		* How: call before rendering hosted-auth support UI; the SDK returns IAM's response body without reshaping.
		*/
		uiConfig: () => this.json("/iam/v4/idp/oidc-ui-config", { auth: false })
	};
	oidc = {
		/**
		* What: refreshes an OIDC-flow token through `POST /iam/v4/oidc/token` with `grant_type=refresh_token`.
		* Why: hosted IdP login relies on IdPController for browser login, but token refresh still belongs to the OIDC token endpoint.
		* How: pass the refresh token your app owns; the SDK always sends `client_id` from the request or client OIDC config and returns IAM's token response without storing it.
		*/
		refreshToken: (request = {}) => {
			const clientId = request.clientId ?? this.clientConfig.oidc?.clientId;
			if (!clientId) throw new Error("Blocks OIDC clientId is required for refreshToken.");
			return this.form("/iam/v4/oidc/token", {
				client_id: clientId,
				grant_type: "refresh_token",
				refresh_token: request.refreshToken,
				scope: request.scope
			});
		},
		/**
		* What: requests a machine token through `POST /iam/v4/oidc/token` with `grant_type=client_credentials`.
		* Why: backend jobs or trusted server-side adapters may need service access to Blocks APIs.
		* How: call only outside public browser code because it requires `clientSecret`.
		*/
		clientCredentials: (request) => this.form("/iam/v4/oidc/token", {
			client_id: request.clientId,
			client_secret: request.clientSecret,
			grant_type: "client_credentials",
			scope: request.scope
		})
	};
	identityProviders = {
		/**
		* What: lists configured identity providers through `GET /iam/v4/auth/identity-providers`.
		* Why: admin UI can show available IdP configurations.
		* How: call with a type parameter when your app has a specific response model.
		*/
		list: () => this.json("/iam/v4/auth/identity-providers"),
		/**
		* What: reads one identity provider through `GET /iam/v4/auth/identity-providers/{id}`.
		* Why: admin UI needs one record before edit/detail rendering.
		* How: pass the IdP id from IAM.
		*/
		get: (id) => this.json(`/iam/v4/auth/identity-providers/${encodeURIComponent(id)}`),
		/**
		* What: creates an identity provider through `POST /iam/v4/auth/identity-providers`.
		* Why: authorized apps can configure tenant IdP options.
		* How: pass IAM's IdP payload and receive IAM's response as-is.
		*/
		create: (request) => this.json("/iam/v4/auth/identity-providers", { body: request }),
		/**
		* What: updates an identity provider through `PUT /iam/v4/auth/identity-providers/{id}`.
		* Why: authorized apps can edit tenant IdP options.
		* How: pass the IdP id and IAM's update payload.
		*/
		update: (id, request) => this.json(`/iam/v4/auth/identity-providers/${encodeURIComponent(id)}`, {
			body: request,
			method: "PUT"
		}),
		/**
		* What: changes identity-provider status through `PATCH /iam/v4/auth/identity-providers/{id}/status`.
		* Why: admin UI can enable or disable an IdP without editing the whole configuration.
		* How: pass the IdP id and status payload IAM expects.
		*/
		updateStatus: (id, request) => this.json(`/iam/v4/auth/identity-providers/${encodeURIComponent(id)}/status`, {
			body: request,
			method: "PATCH"
		}),
		/**
		* What: deletes an identity provider through `DELETE /iam/v4/auth/identity-providers/{id}`.
		* Why: admin UI can remove tenant IdP configuration.
		* How: pass the IdP id; IAM decides whether deletion is allowed.
		*/
		delete: (id) => this.json(`/iam/v4/auth/identity-providers/${encodeURIComponent(id)}`, { method: "DELETE" })
	};
	config = {
		/**
		* What: reads auth configuration through `GET /iam/v4/auth/config`.
		* Why: admin/settings UI can render current AuthController configuration.
		* How: call after an authorized token is available.
		*/
		get: () => this.json("/iam/v4/auth/config"),
		/**
		* What: saves auth configuration through `POST /iam/v4/auth/config`.
		* Why: admin/settings UI can update AuthController behavior.
		* How: pass IAM's config payload and receive IAM's response as-is.
		*/
		update: (request) => this.json("/iam/v4/auth/config", { body: request })
	};
	userCodes = {
		/**
		* What: lists user codes through `GET /iam/v4/auth/user-codes`.
		* Why: apps using user-code auth/admin flows can show existing generated codes.
		* How: call from an authorized surface.
		*/
		list: () => this.json("/iam/v4/auth/user-codes"),
		/**
		* What: generates a user code through `POST /iam/v4/auth/user-codes`.
		* Why: apps using user-code flows need IAM to create the code.
		* How: pass IAM's generation payload.
		*/
		generate: (request) => this.json("/iam/v4/auth/user-codes", { body: request })
	};
	clientCredentials = {
		/**
		* What: lists client credentials through `GET /iam/v4/auth/client-credentials`.
		* Why: authorized admin UIs can manage service credentials.
		* How: call from a trusted/authorized management surface.
		*/
		list: () => this.json("/iam/v4/auth/client-credentials"),
		/**
		* What: creates or updates client credentials through `POST /iam/v4/auth/client-credentials`.
		* Why: authorized admin UIs can provision service credentials.
		* How: pass IAM's credential payload; do not expose generated secrets in public UI longer than necessary.
		*/
		save: (request) => this.json("/iam/v4/auth/client-credentials", { body: request }),
		/**
		* What: deletes a client credential through `DELETE /iam/v4/auth/client-credentials/{id}`.
		* Why: authorized admin UIs can revoke service credentials.
		* How: pass the credential id from IAM.
		*/
		delete: (id) => this.json(`/iam/v4/auth/client-credentials/${encodeURIComponent(id)}`, { method: "DELETE" })
	};
	/**
	* What: resolves the caller-owned bearer token configured on `createBlocksClient`.
	* Why: the SDK must not own browser sessions or token storage, but protected API calls still need the active token.
	* How: provide `accessToken` as a string or callback in client config; call this when adapters need to inspect the resolved token.
	*/
	async accessToken() {
		return typeof this.clientConfig.accessToken === "function" ? await this.clientConfig.accessToken() : this.clientConfig.accessToken;
	}
	/**
	* What: validates the current session against IAM through `GET /iam/v4/auth/me`.
	* Why: a caller-owned `accessToken` may be absent by design -- IAM's hosted IdP flow sets the
	* session as a Secure, httpOnly cookie by default, so checking for a local token would report
	* "signed out" even when the browser holds a valid session cookie. IAM is the source of truth.
	* How: checks the raw response status rather than `userInfo()` -- `json()` intentionally never
	* throws on non-2xx (auth endpoints can return protocol-shaped error bodies), so a 401 there
	* would otherwise resolve as if the call had succeeded.
	*/
	async isAuthenticated() {
		try {
			return (await this.raw("/iam/v4/auth/me", { method: "GET" })).ok;
		} catch {
			return false;
		}
	}
	/**
	* What: sends a JSON Auth/IdPController request and returns the parsed response body.
	* Why: auth endpoints can return protocol-shaped errors, so this layer intentionally does not reshape non-2xx bodies.
	* How: SDK methods call this with the exact IAM route, method, query, and payload.
	*/
	async json(path, options = {}) {
		return parseResponse(await this.raw(path, {
			auth: options.auth,
			body: options.body === void 0 ? void 0 : JSON.stringify(options.body),
			headers: options.body === void 0 ? void 0 : { "Content-Type": "application/json" },
			method: options.method ?? (options.body === void 0 ? "GET" : "POST"),
			query: options.query
		}));
	}
	/**
	* What: sends an `application/x-www-form-urlencoded` OIDC token request.
	* Why: `/iam/v4/oidc/token` follows OAuth/OIDC form-post semantics rather than JSON body semantics.
	* How: OIDC token helpers pass grant fields here; the response body is returned exactly as IAM sends it.
	*/
	async form(path, form) {
		const body = new URLSearchParams();
		for (const [key, value] of Object.entries(form)) if (value !== void 0) body.set(key, value);
		return parseResponse(await this.raw(path, {
			auth: false,
			body,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			method: "POST"
		}));
	}
	async raw(path, options) {
		const url = buildUrl$1(this.clientConfig.apiUrl, path, options.query);
		const headers = new Headers(options.headers);
		headers.set("Accept", "application/json");
		headers.set("x-blocks-key", this.clientConfig.xBlocksKey);
		if (options.auth !== false) {
			const token = await this.accessToken();
			if (token) headers.set("Authorization", `Bearer ${token}`);
		}
		return this.fetchImpl(url, {
			body: options.body,
			credentials: "include",
			headers,
			method: options.method
		});
	}
	get oidcDefaults() {
		if (!this.clientConfig.oidc) throw new Error("Blocks OIDC config is required.");
		return this.clientConfig.oidc;
	}
};
function callbackParams(callbackUrl) {
	const url = new URL(callbackUrl);
	return {
		code: url.searchParams.get("code") ?? void 0,
		error: url.searchParams.get("error") ?? void 0,
		error_description: url.searchParams.get("error_description") ?? void 0,
		state: url.searchParams.get("state") ?? void 0
	};
}
function buildUrl$1(baseUrl, path, query) {
	const url = new URL(path.replace(/^\/+/, ""), `${baseUrl.replace(/\/+$/, "")}/`);
	for (const [key, value] of Object.entries(query ?? {})) if (value !== void 0) url.searchParams.set(key, value);
	return url.toString();
}
async function parseResponse(response) {
	const text = await response.text();
	return text ? parseJson(text) : void 0;
}
function parseJson(text) {
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}
// node_modules/@seliseblocks/client/dist/data/data-client.js
var DATA_API = "/data/v4";
var BlocksDataClient = class {
	http;
	constructor(http) {
		this.http = http;
	}
	schemas = {
		/**
		* What: lists Data schemas through `GET /data/v4/schemas`.
		* Why: runtime apps and form builders need to discover available collections/schema metadata.
		* How: pass optional paging/filter fields; tenant routing always uses the `x-blocks-key` header, never `ProjectKey`.
		*/
		list: (options = {}) => this.http.request(`${DATA_API}/schemas`, { query: schemaListQuery(options) }),
		/**
		* What: looks up one schema by name through `GET /data/v4/schemas`.
		* Why: apps often need a compact schema lookup before rendering a single collection/form.
		* How: pass the schema name; the SDK sends `SchemaName`, `PageNo=1`, and `PageSize=1`.
		*/
		get: (schemaName) => this.http.request(`${DATA_API}/schemas`, { query: {
			PageNo: 1,
			PageSize: 1,
			SchemaName: schemaName
		} }),
		/**
		* What: reads schema summary/aggregation through `GET /data/v4/schemas/aggregation`.
		* Why: frontend admin/runtime dashboards may need schema list plus access-level summary in one response.
		* How: pass the same list filters as `schemas.list`; the SDK does not send `ProjectKey`.
		*/
		aggregation: (options = {}) => this.http.request(`${DATA_API}/schemas/aggregation`, { query: schemaListQuery(options) }),
		/**
		* What: reads one schema definition by id through `GET /data/v4/schemas/get-by-id`.
		* Why: detail views need exact schema metadata when they already have the schema item id.
		* How: pass the schema id; the SDK sends it as the `id` query parameter.
		*/
		getById: (id) => this.http.request(`${DATA_API}/schemas/get-by-id`, { query: { id } }),
		/**
		* What: reads general schema info through `GET /data/v4/schemas/info`.
		* Why: generic runtime UIs can bootstrap schema metadata without naming a single schema.
		* How: call after configuring `accessToken`; the SDK sends only auth plus `x-blocks-key`.
		*/
		info: () => this.http.request(`${DATA_API}/schemas/info`),
		/**
		* What: reads detailed schema info through `GET /data/v4/schemas/info-by-name`.
		* Why: dynamic forms/tables need field-level metadata for one schema.
		* How: pass the schema name; the SDK sends it as `schemaName`.
		*/
		infoByName: (schemaName) => this.http.request(`${DATA_API}/schemas/info-by-name`, { query: { schemaName } })
	};
	files = {
		/**
		* What: reads one file record through the current file download operation.
		* Why: frontend views need file metadata or a downloadable reference by file id.
		* How: pass `fileId` and optional Data file configuration/version fields.
		*/
		get: (fileId, options = {}) => this.http.request(`${DATA_API}/files/get-file`, { query: {
			ConfigurationName: options.configurationName,
			FileId: fileId,
			Version: options.version
		} }),
		/**
		* What: batch-reads file metadata and download URLs.
		* Why: pages with many attachments should avoid one request per file.
		* How: pass the file-list payload exactly as Data expects; the SDK does not inject project fields.
		*/
		getMany: (request) => this.http.request(`${DATA_API}/files/get-files`, { body: normalizeFileListRequest(request) }),
		/**
		* What: lists file records and metadata.
		* Why: storage browsers and attachment managers need paged file metadata before downloading content.
		* How: pass paging, sort, and filter fields; the SDK sends your request without any `projectKey`.
		*/
		info: (request) => this.http.request(`${DATA_API}/files/get-files-info`, { body: withoutProjectKey$1(request) }),
		/**
		* What: creates file/version metadata and requests a pre-signed upload URL.
		* Why: browser apps should upload binary content through the URL issued by Blocks Data.
		* How: pass file metadata plus a parent directory id or module default.
		*/
		presignedUploadUrl: (request) => this.http.request(`${DATA_API}/files/get-pre-signed-url-for-upload`, { body: normalizeUploadRequest(request) }),
		/**
		* What: uploads binary content to a pre-signed storage URL.
		* Why: the actual blob upload goes to cloud/object storage, not to the Blocks API host.
		* How: pass the `uploadUrl` returned by `presignedUploadUrl` plus a `Blob`, stream, or buffer; this call sends no `x-blocks-key` or bearer token.
		*/
		uploadToUrl: (request) => {
			const headers = new Headers(request.headers);
			if (request.contentType && !headers.has("Content-Type")) headers.set("Content-Type", request.contentType);
			if (!headers.has("x-ms-blob-type")) headers.set("x-ms-blob-type", "Blockblob");
			return this.http.external(request.url, {
				body: request.body,
				headers,
				method: "PUT"
			});
		},
		/**
		* What: creates a file/version and uploads its bytes to local storage.
		* Why: local-storage deployments need multipart upload through Blocks Data instead of a pre-signed cloud URL.
		* How: pass a `Blob`/`File` and metadata; the SDK builds `FormData` and does not add `projectKey`.
		*/
		uploadToLocalStorage: (request) => this.http.request(`${DATA_API}/files/upload-file-to-local-storage`, {
			body: toLocalStorageFormData(request),
			headers: {}
		}),
		/**
		* What: moves a file to trash or permanently deletes it.
		* Why: storage UIs need to remove files when permissions and Data rules allow it.
		* How: pass `fileId` and an explicit `permanent` choice; false moves to trash.
		*/
		delete: (request) => this.http.request(`${DATA_API}/files/delete-file`, { body: withoutProjectKey$1(request) }),
		/**
		* What: updates file additional properties.
		* Why: apps often need to attach searchable metadata such as agent status or business references to a file.
		* How: pass `itemId` and `additionalProperties`; the SDK forwards the request as-is except for not adding project fields.
		*/
		updateAdditionalInfo: (request) => this.http.request(`${DATA_API}/files/update-file-additional-info`, { body: withoutProjectKey$1(request) }),
		versions: (request) => this.http.request(`${DATA_API}/files/get-file-versions`, { query: request }),
		createVersion: (request) => this.http.request(`${DATA_API}/files/create-file-version`, { body: request }),
		copy: (request) => this.http.request(`${DATA_API}/files/copy-file`, { body: request }),
		move: (request) => this.http.request(`${DATA_API}/files/move-file`, { body: request }),
		rename: (request) => this.http.request(`${DATA_API}/files/rename-file`, { body: request })
	};
	directories = {
		create: (request) => this.http.request(`${DATA_API}/directory/create-directory`, { body: request }),
		get: (directoryId) => this.http.request(`${DATA_API}/directory/get-directory`, { query: { directoryId } }),
		update: (request) => this.http.request(`${DATA_API}/directory/update-directory`, { body: request }),
		delete: (request) => this.http.request(`${DATA_API}/directory/delete-directory`, { body: request }),
		move: (request) => this.http.request(`${DATA_API}/directory/move-directory`, { body: request })
	};
	objects = {
		list: (request = {}) => this.http.request(`${DATA_API}/objects/get-objects`, { query: request }),
		search: (request) => this.http.request(`${DATA_API}/objects/search-objects`, { query: request }),
		trash: (request = {}) => this.http.request(`${DATA_API}/objects/get-trash`, { query: request }),
		shared: (request = {}) => this.http.request(`${DATA_API}/objects/get-shared-objects`, { query: request }),
		restore: (request) => this.http.request(`${DATA_API}/objects/restore-from-trash`, { body: request }),
		deleteFromTrash: (request) => this.http.request(`${DATA_API}/objects/delete-from-trash`, { body: request }),
		accessPolicies: (resourceId) => this.http.request(`${DATA_API}/objects/get-access-policies`, { query: { resourceId } }),
		grantAccess: (request) => this.http.request(`${DATA_API}/objects/grant-access`, { body: request }),
		updateAccess: (request) => this.http.request(`${DATA_API}/objects/update-access-policy`, { body: request }),
		revokeAccess: (request) => this.http.request(`${DATA_API}/objects/revoke-access-policy`, { body: request }),
		resolveAccess: (resourceId) => this.http.request(`${DATA_API}/objects/resolve-access`, { query: { resourceId } }),
		toggleInheritance: (request) => this.http.request(`${DATA_API}/objects/toggle-inheritance`, { body: request }),
		share: (request) => this.http.request(`${DATA_API}/objects/share-object`, { body: request })
	};
	validations = {
		/**
		* What: lists field validation rules through `GET /data/v4/data-validations`.
		* Why: dynamic forms can render backend validation rules for schema fields.
		* How: pass optional schema/field/paging filters; the SDK does not send `ProjectKey`.
		*/
		list: (options = {}) => this.http.request(`${DATA_API}/data-validations`, { query: validationListQuery(options) }),
		/**
		* What: reads one validation rule through `GET /data/v4/data-validations/get-by-id`.
		* Why: validation detail screens need one rule by id.
		* How: pass the validation id.
		*/
		getById: (id) => this.http.request(`${DATA_API}/data-validations/get-by-id`, { query: { id } }),
		/**
		* What: reads all validations for a schema through `GET /data/v4/data-validations/by-schema-id`.
		* Why: form builders and runtime renderers need the validation set for one schema.
		* How: pass the schema id.
		*/
		bySchemaId: (schemaId) => this.http.request(`${DATA_API}/data-validations/by-schema-id`, { query: { schemaId } }),
		/**
		* What: reads validation for one schema field through `GET /data/v4/data-validations/by-schema-and-field`.
		* Why: field renderers can load rules lazily for a single field.
		* How: pass `schemaId` and `fieldName`.
		*/
		bySchemaAndField: (options) => this.http.request(`${DATA_API}/data-validations/by-schema-and-field`, { query: options })
	};
	/**
	* What: executes a GraphQL operation through `POST /data/v4/gateway`.
	* Why: the Data Gateway runtime exposes schema-backed collections through GraphQL with tenant-aware access controls.
	* How: pass `query`, optional `variables`, optional `operationName`, and optional headers such as `x-graphql-playground`.
	*/
	graphql(request) {
		return this.http.request(`${DATA_API}/gateway`, {
			body: {
				operationName: request.operationName,
				query: request.query,
				variables: request.variables
			},
			headers: request.headers
		});
	}
	utilities = {
		/**
		* What: generates a regex pattern through `POST /data/v4/regex/generate-regex`.
		* Why: schema/form builders can ask Blocks Data for a validation regex suggestion.
		* How: pass a text `description` and optional constraints; the SDK returns the generated pattern response.
		*/
		generateRegex: (request) => this.http.request(`${DATA_API}/regex/generate-regex`, { body: request }),
		/**
		* What: reads mock data through `GET /data/v4/mock-data`.
		* Why: development/test UIs may need sample data exposed by Blocks Data.
		* How: call with an authorized token; this is read-only and does not mutate stored mock data.
		*/
		mockData: () => this.http.request(`${DATA_API}/mock-data`)
	};
	/**
	* What: creates CRUD helpers for a Data runtime collection.
	* Why: frontend code usually works with schema names rather than hand-written GraphQL operations.
	* How: pass the exact schema name, such as `Product`; returned helpers call `/data/v4/gateway` and never add `ProjectKey`.
	*/
	collection(schemaName, options = {}) {
		assertGraphqlName(schemaName, "schemaName");
		const listField = `get${schemaName}s`;
		const createField = `insert${schemaName}`;
		const updateField = `update${schemaName}`;
		const deleteField = `delete${schemaName}`;
		return {
			/**
			* What: creates a schema-backed item through `POST /data/v4/gateway`.
			* Why: forms need a direct runtime create operation.
			* How: pass the item payload; Data validates it against the active schema's insert input.
			*/
			create: (payload) => this.graphql({
				operationName: createField,
				query: `mutation ${createField}($input: ${schemaName}InsertInput!) {
  ${createField}(input: $input) {
    acknowledged
    itemId
    message
    totalImpactedData
  }
}`,
				variables: { input: payload }
			}),
			/**
			* What: deletes a schema-backed item through `POST /data/v4/gateway`.
			* Why: collection UIs need a runtime delete operation when allowed by permissions/rules.
			* How: pass the item id from Data; the SDK sends a GraphQL `filter` on `ItemId`.
			*/
			delete: (itemId, deleteOptions = {}) => this.graphql({
				operationName: deleteField,
				query: `mutation ${deleteField}($filter: String, $input: ${schemaName}DeleteInput!) {
  ${deleteField}(filter: $filter, input: $input) {
    acknowledged
    itemId
    message
    totalImpactedData
  }
}`,
				variables: {
					filter: itemIdFilter(itemId),
					input: { isHardDelete: deleteOptions.hardDelete ?? false }
				}
			}),
			/**
			* What: reads one schema-backed item through `POST /data/v4/gateway`.
			* Why: detail pages need one runtime record by id.
			* How: pass the item id from Data; the SDK queries `get{SchemaName}s` with an `ItemId` filter.
			*/
			get: (itemId, getOptions = {}) => this.graphql({
				operationName: listField,
				query: collectionListQuery(listField, selectionFor(getOptions.fields ?? options.fields)),
				variables: { input: {
					filter: itemIdFilter(itemId),
					pageNo: 1,
					pageSize: 1
				} }
			}),
			/**
			* What: lists schema-backed items through `POST /data/v4/gateway`.
			* Why: tables, grids, and pickers need paged runtime records.
			* How: pass `pageNo`, `pageSize`, optional `filter`/`sort`, and GraphQL fields to select.
			*/
			list: (listOptions) => this.graphql({
				operationName: listField,
				query: collectionListQuery(listField, selectionFor(listOptions?.fields ?? options.fields)),
				variables: { input: dynamicQueryInput(listOptions) }
			}),
			/**
			* What: updates a schema-backed item through `POST /data/v4/gateway`.
			* Why: edit forms need a runtime update operation.
			* How: pass the item id and partial payload; the SDK sends a GraphQL `filter` on `ItemId`.
			*/
			update: (itemId, payload) => this.graphql({
				operationName: updateField,
				query: `mutation ${updateField}($filter: String, $input: ${schemaName}UpdateInput!) {
  ${updateField}(filter: $filter, input: $input) {
    acknowledged
    itemId
    message
    totalImpactedData
  }
}`,
				variables: {
					filter: itemIdFilter(itemId),
					input: payload
				}
			})
		};
	}
};
function normalizeFileListRequest(request) {
	const record = withoutProjectKey$1(request);
	if (request.fileIds && !record.FileIds) record.FileIds = request.fileIds;
	delete record.fileIds;
	return record;
}
function schemaListQuery(options) {
	return {
		CollectionName: options.collectionName,
		Keyword: options.keyword,
		PageNo: options.pageNo ?? 1,
		PageSize: options.pageSize ?? 100,
		SchemaName: options.schemaName,
		SchemaType: options.schemaType,
		SortBy: options.sortBy,
		SortDescending: options.sortDescending
	};
}
function validationListQuery(options) {
	return {
		FieldName: options.fieldName,
		Keyword: options.keyword,
		PageNo: options.pageNo ?? 1,
		PageSize: options.pageSize ?? 100,
		SchemaId: options.schemaId,
		SortBy: options.sortBy,
		SortDescending: options.sortDescending
	};
}
function normalizeUploadRequest(request) {
	const record = withoutProjectKey$1(request);
	if (request.fileName && !record.Name) record.Name = request.fileName;
	if (request.name && !record.Name) record.Name = request.name;
	if (request.itemId && !record.ItemId) record.ItemId = request.itemId;
	if (request.metaData && !record.MetaData) record.MetaData = request.metaData;
	if (request.parentDirectoryId && !record.ParentDirectoryId) record.ParentDirectoryId = request.parentDirectoryId;
	if (request.tags && !record.Tags) record.Tags = request.tags;
	if (request.accessModifier && !record.AccessModifier) record.AccessModifier = request.accessModifier;
	if (request.configurationName && !record.ConfigurationName) record.ConfigurationName = request.configurationName;
	if (request.moduleName !== void 0 && !record.ModuleName) record.ModuleName = request.moduleName;
	if (request.additionalProperties && !record.AdditionalProperties) record.AdditionalProperties = request.additionalProperties;
	delete record.fileName;
	delete record.contentType;
	delete record.name;
	delete record.itemId;
	delete record.metaData;
	delete record.parentDirectoryId;
	delete record.tags;
	delete record.accessModifier;
	delete record.configurationName;
	delete record.moduleName;
	delete record.additionalProperties;
	return record;
}
function toLocalStorageFormData(request) {
	const form = new FormData();
	appendFormValue(form, "File", request.file);
	appendFormValue(form, "Name", request.name);
	appendFormValue(form, "ItemId", request.itemId);
	appendFormValue(form, "MetaData", request.metaData);
	appendFormValue(form, "ParentDirectoryId", request.parentDirectoryId);
	appendFormValue(form, "Tags", Array.isArray(request.tags) ? request.tags.join(",") : request.tags);
	appendFormValue(form, "AccessModifier", request.accessModifier);
	appendFormValue(form, "ConfigurationName", request.configurationName);
	if (request.additionalProperties) for (const [key, value] of Object.entries(request.additionalProperties)) form.append(`AdditionalProperties[${key}]`, value);
	return form;
}
function appendFormValue(form, key, value) {
	if (value === void 0) return;
	form.append(key, value instanceof Blob ? value : String(value));
}
function withoutProjectKey$1(request) {
	const record = { ...request };
	delete record.projectKey;
	delete record.ProjectKey;
	return record;
}
function dynamicQueryInput(options) {
	return {
		filter: normalizeGraphqlJsonInput(options?.filter ?? options?.query),
		pageNo: options?.pageNo ?? 1,
		pageSize: options?.pageSize ?? 20,
		sort: normalizeGraphqlJsonInput(options?.sort)
	};
}
function collectionListQuery(fieldName, selection) {
	return `query ${fieldName}($input: DynamicQueryInput) {
  ${fieldName}(input: $input) {
    items {
${indent(selection, 6)}
    }
    totalCount
    pageNo
    pageSize
    totalPages
    hasNextPage
    hasPreviousPage
  }
}`;
}
function selectionFor(fields) {
	const selected = fields?.length ? fields : ["ItemId"];
	const unique = Array.from(/* @__PURE__ */ new Set(["ItemId", ...selected]));
	for (const field of unique) assertGraphqlName(field, "field");
	return unique.join("\n");
}
function itemIdFilter(itemId) {
	return JSON.stringify({ ItemId: itemId });
}
function normalizeGraphqlJsonInput(value) {
	if (value === void 0) return void 0;
	return typeof value === "string" ? value : JSON.stringify(value);
}
function assertGraphqlName(value, label) {
	if (!/^[_A-Za-z][_0-9A-Za-z]*$/.test(value)) throw new Error(`Invalid Blocks Data GraphQL ${label}: ${value}`);
}
function indent(value, spaces) {
	const pad = " ".repeat(spaces);
	return value.split("\n").map((line) => `${pad}${line}`).join("\n");
}
// node_modules/@seliseblocks/client/dist/http/errors.js
var BlocksApiError = class extends Error {
	status;
	statusText;
	body;
	constructor(status, statusText, body) {
		super(buildMessage(status, statusText, body));
		this.status = status;
		this.statusText = statusText;
		this.body = body;
		this.name = "BlocksApiError";
	}
};
function buildMessage(status, statusText, body) {
	if (typeof body === "object" && body) {
		const record = body;
		const message = record.message ?? record.detail ?? record.error_description ?? record.error;
		if (typeof message === "string" && message) return `Blocks API ${status} ${statusText}: ${message}`;
	}
	if (typeof body === "string" && body) return `Blocks API ${status} ${statusText}: ${body}`;
	return `Blocks API ${status} ${statusText}`;
}
// node_modules/@seliseblocks/client/dist/http/http-client.js
var BlocksHttpClient = class {
	config;
	auth;
	fetchImpl;
	constructor(config, auth, fetchImpl = globalThis.fetch?.bind(globalThis)) {
		this.config = config;
		this.auth = auth;
		this.fetchImpl = fetchImpl;
		if (!this.fetchImpl) throw new Error("Blocks client requires fetch.");
	}
	async request(path, options = {}) {
		const url = buildUrl(this.config.apiUrl, path, options.query);
		const rawBody = isBodyInit(options.body) ? options.body : void 0;
		const send = async (accessTokenOverride) => {
			const headers = new Headers(options.headers);
			headers.set("Accept", "application/json");
			headers.set("x-blocks-key", this.config.xBlocksKey);
			if (options.body !== void 0 && !rawBody && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
			if (options.auth !== false) {
				const token = accessTokenOverride ?? options.accessToken ?? await this.auth.accessToken();
				if (token) headers.set("Authorization", `Bearer ${token}`);
			}
			return this.fetchImpl(url, {
				body: rawBody ?? (options.body === void 0 ? void 0 : JSON.stringify(options.body)),
				credentials: "include",
				headers,
				method: options.method ?? (options.body === void 0 ? "GET" : "POST")
			});
		};
		let response = await send();
		if (response.status === 401 && options.auth !== false && options.accessToken === void 0 && this.config.onUnauthorized) {
			const freshToken = await this.config.onUnauthorized();
			if (freshToken) response = await send(freshToken);
		}
		const body = await parseBody(response);
		if (!response.ok) throw new BlocksApiError(response.status, response.statusText, body);
		return body;
	}
	async external(url, options = {}) {
		const response = await this.fetchImpl(url, {
			body: options.body,
			headers: options.headers,
			method: options.method ?? "GET"
		});
		const body = await parseBody(response);
		if (!response.ok) throw new BlocksApiError(response.status, response.statusText, body);
		return body;
	}
};
/**
* `request` attaches the caller's bearer token, `x-blocks-key`, and
* `credentials: "include"`, so it must only ever reach the configured Blocks
* API. An absolute URL is still accepted -- callers legitimately pass a full
* API URL -- but one pointing somewhere else would hand a live session to a
* third party, so it is refused with a pointer to `external`, which sends no
* Blocks credentials by design.
*/
function sameOriginOnly(path, baseUrl) {
	const target = new URL(path);
	const base = new URL(`${baseUrl}/`);
	if (target.origin !== base.origin) throw new Error(`Refusing to send Blocks credentials to ${target.origin}: it is not the configured apiUrl (${base.origin}). Use blocks.http.external(url) for third-party URLs such as a pre-signed storage upload.`);
	return target;
}
function isBodyInit(value) {
	return typeof Blob !== "undefined" && value instanceof Blob || typeof FormData !== "undefined" && value instanceof FormData || typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams || typeof ReadableStream !== "undefined" && value instanceof ReadableStream || value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}
function buildUrl(baseUrl, path, query) {
	const url = /^https?:\/\//i.test(path) ? sameOriginOnly(path, baseUrl) : new URL(path.replace(/^\/+/, ""), `${baseUrl}/`);
	for (const [key, value] of Object.entries(query ?? {})) if (value !== void 0) url.searchParams.set(key, String(value));
	return url.toString();
}
async function parseBody(response) {
	if (response.status === 204) return void 0;
	const text = await response.text();
	if (!text) return void 0;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}
// node_modules/@seliseblocks/client/dist/iam/iam-client.js
var BlocksIAMClient = class {
	http;
	constructor(http) {
		this.http = http;
	}
	/**
	* Current authenticated IAM account from `GET /iam/v4/iam/me`.
	* Use this for app profile bootstrapping because it returns the Blocks user record,
	* roles, permissions, and active organization context according to the access token.
	*/
	me() {
		return this.http.request("/iam/v4/iam/me");
	}
	/**
	* Updates the current authenticated user's IAM profile through `POST /iam/v4/iam/me`.
	* The backend resolves the user id from the token; callers must not send another user's id.
	*/
	updateMe(request) {
		return this.http.request("/iam/v4/iam/me", { body: request });
	}
	users = {
		/**
		* What: creates a user through `POST /iam/v4/iam/users/create`.
		* Why: authorized admin UIs need to invite/provision users in the active tenant/organization.
		* How: pass IAM's create-user payload; caller permissions determine whether the API accepts it.
		*/
		create: (request) => this.http.request("/iam/v4/iam/users/create", { body: request }),
		/**
		* What: updates a user through `POST /iam/v4/iam/users/{id}`.
		* Why: authorized admin UIs need to edit IAM profile fields.
		* How: pass the user id in the route and IAM's update payload in the body.
		*/
		update: (id, request) => this.http.request(`/iam/v4/iam/users/${encodeURIComponent(id)}`, { body: request }),
		/**
		* What: deactivates a user through `POST /iam/v4/iam/users/deactivate`.
		* Why: admin UIs need to remove access without deleting the user record.
		* How: pass IAM's deactivate payload for the target user.
		*/
		deactivate: (request) => this.http.request("/iam/v4/iam/users/deactivate", { body: request }),
		/**
		* What: activates a user through `POST /iam/v4/iam/users/activate`.
		* Why: admin UIs need to restore access for a previously inactive account.
		* How: pass IAM's activate payload for the target user.
		*/
		activate: (request) => this.http.request("/iam/v4/iam/users/activate", { body: request }),
		/**
		* What: queries users through `POST /iam/v4/iam/users`.
		* Why: IAM uses a POST-read contract for paging/filtering user lists.
		* How: pass `pageNo`, `pageSize`, search/filter fields, or the exact IAM list payload your UI needs.
		*/
		list: (request = {}) => this.http.request("/iam/v4/iam/users", { body: request }),
		/**
		* What: reads one user through `GET /iam/v4/iam/users/{id}`.
		* Why: user detail screens need one IAM user record, optionally for a specific organization context.
		* How: pass the user id and optional `organizationId`.
		*/
		get: (id, options = {}) => this.http.request(`/iam/v4/iam/users/${encodeURIComponent(id)}`, { query: { organizationId: options.organizationId } }),
		/**
		* What: updates user access through `POST /iam/v4/iam/users/access`.
		* Why: admin UIs need to grant or change roles/permissions for a user.
		* How: pass IAM's access payload; the active token and tenant header define allowed scope.
		*/
		updateAccess: (request) => this.http.request("/iam/v4/iam/users/access", { body: request }),
		/**
		* What: revokes user access through `POST /iam/v4/iam/users/revoke-access`.
		* Why: admin UIs need to remove roles/permissions or organization access.
		* How: pass IAM's revoke-access payload.
		*/
		revokeAccess: (request) => this.http.request("/iam/v4/iam/users/revoke-access", { body: request }),
		/**
		* What: checks email availability through `GET /iam/v4/iam/email/available`.
		* Why: signup and invite forms can validate duplicate email state before submit.
		* How: pass the email query fields IAM expects; this is public but still sends `x-blocks-key`.
		*/
		emailAvailable: (query) => this.http.request("/iam/v4/iam/email/available", {
			auth: false,
			query
		}),
		/**
		* What: checks whether a user exists through `GET /iam/v4/iam/users/exists`.
		* Why: account and invite flows may need an existence check by email.
		* How: pass the email string; the SDK sends it as the `email` query parameter.
		*/
		exists: (email) => this.http.request("/iam/v4/iam/users/exists", { query: { email } })
	};
	permissions = {
		/**
		* What: creates a permission through `POST /iam/v4/iam/permissions/create`.
		* Why: authorized admin tooling may manage custom IAM permission definitions.
		* How: pass IAM's create-permission payload.
		*/
		create: (request) => this.http.request("/iam/v4/iam/permissions/create", { body: request }),
		/**
		* What: updates a permission through `POST /iam/v4/iam/permissions/{id}`.
		* Why: admin tooling may need to edit permission metadata.
		* How: pass the permission id and IAM's update payload.
		*/
		update: (id, request) => this.http.request(`/iam/v4/iam/permissions/${encodeURIComponent(id)}`, { body: request }),
		/**
		* What: queries permissions through `POST /iam/v4/iam/permissions`.
		* Why: IAM uses a POST-read contract for permission paging/filtering.
		* How: pass `pageNo`, `pageSize`, search/filter fields, or IAM's exact list payload.
		*/
		list: (request = {}) => this.http.request("/iam/v4/iam/permissions", { body: request }),
		/**
		* What: groups permissions by severity through `GET /iam/v4/iam/permissions/by-severity`.
		* Why: role/access UIs often display permissions grouped by risk or category.
		* How: call after an authorized token is available.
		*/
		bySeverity: () => this.http.request("/iam/v4/iam/permissions/by-severity"),
		/**
		* What: reads one permission through `GET /iam/v4/iam/permissions/{id}`.
		* Why: admin detail/edit screens need one permission record.
		* How: pass the permission id from IAM.
		*/
		get: (id) => this.http.request(`/iam/v4/iam/permissions/${encodeURIComponent(id)}`)
	};
	roles = {
		/**
		* What: creates a role through `POST /iam/v4/iam/roles/create`.
		* Why: admin UIs need to define permission bundles users can be assigned to.
		* How: pass IAM's create-role payload.
		*/
		create: (request) => this.http.request("/iam/v4/iam/roles/create", { body: request }),
		/**
		* What: updates a role through `POST /iam/v4/iam/roles/update`.
		* Why: admin UIs need to edit role names, metadata, or other IAM-supported fields.
		* How: pass IAM's role update payload.
		*/
		update: (request) => this.http.request("/iam/v4/iam/roles/update", { body: request }),
		/**
		* What: queries roles through `POST /iam/v4/iam/roles`.
		* Why: IAM uses a POST-read contract for role paging/filtering.
		* How: pass `pageNo`, `pageSize`, search/filter fields, or IAM's exact list payload.
		*/
		list: (request = {}) => this.http.request("/iam/v4/iam/roles", { body: request }),
		/**
		* What: reads one role through `GET /iam/v4/iam/roles/{id}`.
		* Why: role detail/edit screens need one IAM role record.
		* How: pass the role id from IAM.
		*/
		get: (id) => this.http.request(`/iam/v4/iam/roles/${encodeURIComponent(id)}`),
		/**
		* What: assigns permissions to a role through `POST /iam/v4/iam/roles/assign-permissions`.
		* Why: role editors need to attach or replace permission sets.
		* How: pass IAM's assign-permissions payload.
		*/
		assignPermissions: (request) => this.http.request("/iam/v4/iam/roles/assign-permissions", { body: request }),
		/**
		* What: lists assignable roles through `GET /iam/v4/iam/roles/assignable`.
		* Why: user-access UIs should only show roles the current user can assign.
		* How: call after an authorized token is available.
		*/
		assignable: () => this.http.request("/iam/v4/iam/roles/assignable")
	};
	resources = {
		/**
		* What: lists resource groups through `GET /iam/v4/iam/resource-groups`.
		* Why: permission screens need resource grouping metadata for navigation and display.
		* How: call after an authorized token is available.
		*/
		groups: () => this.http.request("/iam/v4/iam/resource-groups"),
		/**
		* What: lists feature/resource flags through `GET /iam/v4/iam/resource/features`.
		* Why: frontends use this to feature-gate UI based on current roles and permissions.
		* How: pass optional query fields supported by IAM; the active token defines the user context.
		*/
		features: (query = {}) => this.http.request("/iam/v4/iam/resource/features", { query })
	};
	organizations = {
		/**
		* What: creates an organization through `POST /iam/v4/iam/organizations/create`.
		* Why: authorized admin UIs may need tenant organization management.
		* How: pass IAM's create-organization payload.
		*/
		create: (request) => this.http.request("/iam/v4/iam/organizations/create", { body: request }),
		/**
		* What: updates an organization through `POST /iam/v4/iam/organizations/{id}`.
		* Why: organization settings screens need to edit metadata/config.
		* How: pass the organization id and IAM's update payload.
		*/
		update: (id, request) => this.http.request(`/iam/v4/iam/organizations/${encodeURIComponent(id)}`, { body: request }),
		/**
		* What: lists organizations through `GET /iam/v4/iam/organizations`.
		* Why: admin UIs need organization browsing and selection.
		* How: pass IAM-supported query fields such as paging/search options.
		*/
		list: (query = {}) => this.http.request("/iam/v4/iam/organizations", { query }),
		/**
		* What: reads one organization through `GET /iam/v4/iam/organizations/{id}`.
		* Why: organization detail screens need one organization record.
		* How: pass the organization id from IAM.
		*/
		get: (id) => this.http.request(`/iam/v4/iam/organizations/${encodeURIComponent(id)}`),
		/**
		* What: lists current-user organizations through `GET /iam/v4/iam/organizations/my`.
		* Why: apps need available organizations for org switchers and context selectors.
		* How: call with the current user's access token.
		*/
		my: () => this.http.request("/iam/v4/iam/organizations/my"),
		/**
		* What: reads organization configuration through `GET /iam/v4/iam/organizations/config`.
		* Why: settings screens need the active organization's current configuration.
		* How: call with an authorized token in the desired organization context.
		*/
		getConfig: () => this.http.request("/iam/v4/iam/organizations/config"),
		/**
		* What: saves organization configuration through `POST /iam/v4/iam/organizations/config`.
		* Why: settings screens need to persist organization-level behavior.
		* How: pass IAM's organization config payload.
		*/
		saveConfig: (request) => this.http.request("/iam/v4/iam/organizations/config", { body: request })
	};
	signupSettings = {
		/**
		* What: reads signup settings through `GET /iam/v4/iam/signup-settings`.
		* Why: public signup screens need tenant policy before a user is authenticated.
		* How: call without an access token; the SDK still sends `x-blocks-key`.
		*/
		get: () => this.http.request("/iam/v4/iam/signup-settings", { auth: false }),
		/**
		* What: saves signup settings through `POST /iam/v4/iam/signup-settings`.
		* Why: admin/settings screens need to configure signup policy.
		* How: pass IAM's signup-settings payload with an authorized token.
		*/
		save: (request) => this.http.request("/iam/v4/iam/signup-settings", { body: request })
	};
};
// node_modules/@seliseblocks/client/dist/localization/localization-client.js
var LOCALIZATION_API = "/localization/v4";
var BlocksLocalizationClient = class {
	http;
	dictionaries = /* @__PURE__ */ new Map();
	activeLanguage = "";
	constructor(http) {
		this.http = http;
	}
	/**
	* What: lists available languages through `GET /localization/v4/Language/Gets`.
	* Why: apps need tenant-supported cultures for language pickers and startup locale selection.
	* How: call without an access token; the SDK still sends `x-blocks-key`.
	*/
	languages() {
		return this.http.request(`${LOCALIZATION_API}/Language/Gets`, { auth: false });
	}
	/**
	* What: lists available localization modules through `GET /localization/v4/Module/Gets`.
	* Why: apps can discover which translation bundles exist for the tenant.
	* How: call without an access token; the SDK still sends `x-blocks-key`.
	*/
	modules() {
		return this.http.request(`${LOCALIZATION_API}/Module/Gets`, { auth: false });
	}
	/**
	* What: loads one module dictionary through `GET /localization/v4/Key/GetUilmFile`.
	* Why: framework-neutral apps need raw translation dictionaries without adopting a specific i18n library.
	* How: pass `moduleName` and `language`; the SDK normalizes string values and caches the dictionary in this client instance.
	*/
	async translations(moduleName, language) {
		const dictionary = normalizeDictionary(await this.http.request(`${LOCALIZATION_API}/Key/GetUilmFile`, {
			auth: false,
			query: {
				Language: language,
				ModuleName: moduleName
			}
		}));
		this.dictionaries.set(cacheKey(language, moduleName), dictionary);
		this.activeLanguage = language;
		return dictionary;
	}
	/**
	* What: lists languages resolved for the active Blocks tenant through `GET /localization/v4/Language/GetLanguagesForCurrentTenant`.
	* Why: multi-tenant apps should show the languages actually enabled for the tenant behind the current `x-blocks-key`.
	* How: call during app startup or settings screen load; the SDK sends `x-blocks-key` and the caller access token when configured.
	*/
	languagesForCurrentTenant() {
		return this.http.request(`${LOCALIZATION_API}/Language/GetLanguagesForCurrentTenant`);
	}
	/**
	* What: lists localization modules resolved for the active Blocks tenant through `GET /localization/v4/Module/GetModulesForCurrentTenant`.
	* Why: apps can discover tenant-scoped bundles such as `common`, `dashboard`, or feature modules before loading translations.
	* How: call with the configured client; the tenant is selected by `x-blocks-key`, not by a `ProjectKey` query/body value.
	*/
	modulesForCurrentTenant() {
		return this.http.request(`${LOCALIZATION_API}/Module/GetModulesForCurrentTenant`);
	}
	/**
	* What: loads the authorized cloud UILM dictionary through `GET /localization/v4/Key/GetCloudUilmFile`.
	* Why: signed-in app surfaces can load protected tenant dictionaries while keeping session/token ownership in the caller app.
	* How: pass `moduleName` and `language`; the SDK sends the caller access token when configured, normalizes string values, and caches the result for `t()`.
	*/
	async cloudTranslations(moduleName, language) {
		const dictionary = normalizeDictionary(await this.http.request(`${LOCALIZATION_API}/Key/GetCloudUilmFile`, { query: {
			Language: language,
			ModuleName: moduleName
		} }));
		this.dictionaries.set(cacheKey(language, moduleName), dictionary);
		this.activeLanguage = language;
		return dictionary;
	}
	/**
	* What: retrieves exact localization key records through `POST /localization/v4/Key/GetsByKeyNames`.
	* Why: apps sometimes need key metadata or selected translations without downloading a whole module dictionary.
	* How: pass `keyNames` and optional `moduleId`; the SDK posts the body as-is except it removes any accidental `ProjectKey`/`projectKey`.
	*/
	keysByNames(request) {
		return this.http.request(`${LOCALIZATION_API}/Key/GetsByKeyNames`, {
			body: withoutProjectKey(request),
			method: "POST"
		});
	}
	/**
	* What: loads multiple module dictionaries and merges them.
	* Why: most apps need several translation modules during startup.
	* How: pass a language and module list; later modules overwrite earlier keys if the same key appears twice.
	*/
	async load(language, modules) {
		const dictionaries = await Promise.all(modules.map((moduleName) => this.translations(moduleName, language)));
		return Object.assign({}, ...dictionaries);
	}
	/**
	* What: loads multiple authorized cloud UILM dictionaries and merges them.
	* Why: signed-in runtime areas can hydrate all protected translation modules needed for a screen in one app-level call.
	* How: pass a language and module list; later modules overwrite earlier keys if the same key appears twice.
	*/
	async loadCloud(language, modules) {
		const dictionaries = await Promise.all(modules.map((moduleName) => this.cloudTranslations(moduleName, language)));
		return Object.assign({}, ...dictionaries);
	}
	/**
	* What: resolves a translated string from dictionaries already loaded by `translations()` or `load()`.
	* Why: simple apps can read labels without adding a framework-specific localization package.
	* How: pass a key, optional fallback, and optional `language`/`moduleName`; missing keys return fallback or the key.
	*/
	t(key, fallback, options = {}) {
		const language = options.language ?? this.activeLanguage;
		if (options.moduleName) return this.dictionaries.get(cacheKey(language, options.moduleName))?.[key] ?? fallback ?? key;
		for (const [dictionaryKey, dictionary] of this.dictionaries) {
			if (language && !dictionaryKey.startsWith(`${language}:`)) continue;
			const value = dictionary[key];
			if (value) return value;
		}
		return fallback ?? key;
	}
};
function normalizeDictionary(value) {
	if (typeof value === "object" && value) {
		const record = value;
		if (typeof record.data === "object" && record.data) return stringifyValues(record.data);
		return stringifyValues(record);
	}
	return {};
}
function stringifyValues(record) {
	const result = {};
	for (const [key, value] of Object.entries(record)) if (typeof value === "string") result[key] = value;
	return result;
}
function cacheKey(language, moduleName) {
	return `${language}:${moduleName}`;
}
function withoutProjectKey(value) {
	const clone = { ...value };
	delete clone.ProjectKey;
	delete clone.projectKey;
	return clone;
}
// node_modules/@seliseblocks/client/dist/mail/mail-client.js
var MAIL_API = "/logic/v4/Mail";
/**
* Mail sending surface: fires a purpose/language-templated email through the tenant's
* configured mail provider. Mail server/template/mailbox management (Mail/Save, Mail/Get,
* templates, mailbox reads) is a CLI/admin concern and is not exposed here.
*/
var BlocksMailClient = class {
	http;
	constructor(http) {
		this.http = http;
	}
	/**
	* What: sends an email through `POST /logic/v4/Mail/Send` using the tenant's default mail configuration.
	* Why: app code needs to trigger transactional email (welcome, password reset, alerts) without managing SMTP directly.
	* How: pass recipients plus `purpose`/`language` to select the right template, and `subjectDataContext`/`bodyDataContext` for placeholder values.
	*/
	send(request) {
		return this.http.request(`${MAIL_API}/Send`, { body: request });
	}
	/**
	* What: sends an email through `POST /logic/v4/Mail/SendToAny`.
	* Why: some sends need a provider-routing hint the default `send` doesn't take, such as marking a test send.
	* How: same fields as `send`, plus `isTestMail`.
	*/
	sendToAny(request) {
		return this.http.request(`${MAIL_API}/SendToAny`, { body: request });
	}
};
// node_modules/@seliseblocks/client/dist/mfa/mfa-client.js
var MFA_API = "/iam/v4/mfa";
/**
* MFA surface: enroll, verify, switch, or disable the signed-in user's own MFA and manage
* their own backup codes, plus `saveConfig` for the tenant-wide MFA policy. Like
* `identityProviders`/`config`/`clientCredentials` on `BlocksAuthenticationClient`, `saveConfig`
* is an admin/tenant-settings action -- IAM enforces the required role, the SDK does not gate it.
*/
var BlocksMfaClient = class {
	http;
	constructor(http) {
		this.http = http;
	}
	/**
	* What: reads the tenant's current MFA policy through `GET /iam/v4/mfa/config`.
	* Why: consumer apps can check whether MFA is enabled/required before prompting enrollment.
	* How: call with an authorized token; the SDK returns IAM's policy shape as-is.
	*/
	config() {
		return this.http.request(`${MFA_API}/config`);
	}
	/**
	* What: saves the tenant's MFA policy through `POST /iam/v4/mfa/config`.
	* Why: tenant admin/settings screens need to turn MFA on/off, require it for specific roles,
	* or configure backup codes -- this is not a user self-service action.
	* How: pass IAM's full config payload with an authorized, sufficiently-privileged token.
	*/
	saveConfig(request) {
		return this.http.request(`${MFA_API}/config`, { body: request });
	}
	totp = {
		/**
		* What: starts TOTP enrollment through `POST /iam/v4/mfa/totp/setup`.
		* Why: authenticator-app enrollment needs a secret/QR payload from IAM before the user can scan it.
		* How: call for the signed-in user, then render IAM's returned secret/QR data in your enrollment UI.
		*/
		setup: () => this.http.request(`${MFA_API}/totp/setup`, { method: "POST" }),
		/**
		* What: confirms TOTP enrollment through `POST /iam/v4/mfa/totp/verify-setup`.
		* Why: IAM must confirm the user's authenticator app is correctly configured before enabling TOTP.
		* How: pass the 6-digit `code` the user typed from their authenticator app.
		*/
		verifySetup: (request) => this.http.request(`${MFA_API}/totp/verify-setup`, { body: request })
	};
	/**
	* What: sends an OTP challenge through `POST /iam/v4/mfa/generate`.
	* Why: email/SMS-based MFA needs IAM to issue and deliver a one-time code before verification.
	* How: pass the target `mfaType`; IAM returns an `mfaId` to pass to `verify`/`resend`.
	*/
	generate(request) {
		return this.http.request(`${MFA_API}/generate`, { body: request });
	}
	/**
	* What: resends a pending OTP through `POST /iam/v4/mfa/resend`.
	* Why: users may not receive the first code (SMS delay, spam filtering) and need a retry.
	* How: pass the `mfaId` returned from `generate`.
	*/
	resend(request) {
		return this.http.request(`${MFA_API}/resend`, { body: request });
	}
	/**
	* What: verifies an OTP or step-up challenge through `POST /iam/v4/mfa/verify`.
	* Why: login and sensitive in-app actions need this to confirm the code the user entered.
	* How: pass `mfaId`, `verificationCode`, and `authType`; set `isFromTokenCall` when verifying as part of a token/login exchange rather than a standalone check.
	*/
	verify(request) {
		return this.http.request(`${MFA_API}/verify`, { body: request });
	}
	/**
	* What: sets the signed-in user's active MFA method through `PUT /iam/v4/mfa/method`.
	* Why: users who have enrolled more than one method need to switch which one is active.
	* How: pass the `mfaType` to activate; enroll it first (e.g. via `totp.setup`/`verifySetup`) if it isn't already.
	* Careful: IAM only branches on TOTP (1) and Email (2) here -- every other value falls through to its
	* disable path and turns the user's MFA off. Use `disable()` when that is the intent.
	*/
	setMethod(request) {
		return this.http.request(`${MFA_API}/method`, {
			body: request,
			method: "PUT"
		});
	}
	/**
	* What: disables MFA for the signed-in user through `POST /iam/v4/mfa/disable`.
	* Why: users need a self-service way to turn MFA off when the tenant's policy allows opt-out.
	* How: call with an authorized token; IAM enforces whether opt-out is permitted for this tenant/role.
	*/
	disable() {
		return this.http.request(`${MFA_API}/disable`, { method: "POST" });
	}
	backupCodes = {
		/**
		* What: lists the signed-in user's backup codes through `GET /iam/v4/mfa/backup-codes`.
		* Why: account-security screens need to show how many unused recovery codes remain.
		* How: call with an authorized token.
		*/
		list: () => this.http.request(`${MFA_API}/backup-codes`),
		/**
		* What: generates a fresh set of backup codes through `POST /iam/v4/mfa/backup-codes/generate`.
		* Why: users need recovery codes for when their primary MFA method is unavailable.
		* How: call once TOTP/OTP is enrolled; treat the response as sensitive and show it to the user only once.
		*/
		generate: () => this.http.request(`${MFA_API}/backup-codes/generate`, { method: "POST" }),
		/**
		* What: consumes one backup code through `POST /iam/v4/mfa/backup-codes/use`.
		* Why: lets a user complete login/step-up when their primary MFA method is unavailable.
		* How: pass the signed-in `userId` and the backup `code` the user entered; each code is single-use.
		*/
		use: (request) => this.http.request(`${MFA_API}/backup-codes/use`, { body: request })
	};
};
// node_modules/@seliseblocks/client/dist/notifier/notifier-client.js
var NOTIFIER_API = "/logic/v4/Notifier";
/**
* Real-time/offline notification surface: push a notification to specific users, roles, or
* subscription-filter matches, and read/manage the signed-in user's own notification inbox.
* Tenant-wide notification *channel configuration* (Notification/Save etc., under
* `BlocksIAMClient`/CLI `notification` commands) is a separate, admin-facing concern.
*/
var BlocksNotifierClient = class {
	http;
	constructor(http) {
		this.http = http;
	}
	/**
	* What: pushes a notification through `POST /logic/v4/Notifier/Notify`.
	* Why: app code needs to notify specific users/roles, or everyone subscribed to a filter, in real time with an offline/persisted fallback.
	* How: target with at least one of `userIds`/`roles`/`subscriptionFilters`; set `saveDenormalizedPayloadAsAnObject` if `denormalizedPayload` is a JSON string clients should receive parsed.
	*/
	notify(request) {
		return this.http.request(`${NOTIFIER_API}/Notify`, { body: request });
	}
	/**
	* What: reads unread notifications matching a subscription filter through `GET /logic/v4/Notifier/GetUnreadNotificationsBySubscriptionFilter`.
	* Why: clients that subscribe by filter (rather than by user id) need to catch up on what they missed while offline.
	* How: pass `userId` and the same `subscriptionFilterData` shape used with `notify`. Swagger documents this endpoint
	* as GET with a JSON body, which the Fetch spec forbids -- the SDK sends the same fields as a flattened query string instead.
	*/
	getUnreadNotificationsBySubscriptionFilter(request) {
		return this.http.request(`${NOTIFIER_API}/GetUnreadNotificationsBySubscriptionFilter`, { query: {
			OrderBy: request.orderBy,
			"SubscriptionFilterData.ActionName": request.subscriptionFilterData?.actionName,
			"SubscriptionFilterData.Context": request.subscriptionFilterData?.context,
			"SubscriptionFilterData.Value": request.subscriptionFilterData?.value,
			UserId: request.userId
		} });
	}
	/**
	* What: lists the signed-in user's notifications through `GET /logic/v4/Notifier/GetNotifications`.
	* Why: notification-inbox UIs need paged, sortable, filterable access plus unread/total counts.
	* How: pass paging/sort/filter options; omit them for the API's defaults.
	*/
	getNotifications(options = {}) {
		return this.http.request(`${NOTIFIER_API}/GetNotifications`, { query: {
			Filter: options.filter,
			IsUnreadOnly: options.isUnreadOnly,
			Page: options.page,
			PageSize: options.pageSize,
			"Sort.IsDescending": options.sortDescending,
			"Sort.Property": options.sortBy
		} });
	}
	/**
	* What: marks every notification read through `POST /logic/v4/Notifier/MarkAllNotificationAsRead`.
	* Why: inbox UIs offer a bulk "mark all as read" action.
	* How: call with an authorized token for the signed-in user.
	*/
	markAllNotificationAsRead() {
		return this.http.request(`${NOTIFIER_API}/MarkAllNotificationAsRead`, { method: "POST" });
	}
	/**
	* What: marks one notification read through `POST /logic/v4/Notifier/MarkNotificationAsRead`.
	* Why: inbox UIs mark individual notifications read as the user views them.
	* How: pass the notification's `id`.
	*/
	markNotificationAsRead(request) {
		return this.http.request(`${NOTIFIER_API}/MarkNotificationAsRead`, { body: request });
	}
};
// node_modules/@seliseblocks/client/dist/client.js
/**
* What: creates a framework-neutral Blocks SDK instance for one tenant/app runtime.
* Why: frontend code needs a single configured entry point for IAM, Auth, Data, and Localization APIs.
* How: pass `apiUrl` and `xBlocksKey`; optionally pass an `accessToken` callback and OIDC config. The SDK never adds `ProjectKey` and never stores tokens.
*/
function createBlocksClient(config) {
	const normalized = normalizeConfig(config);
	const auth = new BlocksAuthenticationClient(normalized, config.fetch);
	const http = new BlocksHttpClient(normalized, auth, config.fetch);
	const { accessToken: _accessToken, onUnauthorized: _onUnauthorized, ...publicConfig } = normalized;
	return {
		auth,
		config: publicConfig,
		data: new BlocksDataClient(http),
		http,
		iam: new BlocksIAMClient(http),
		localization: new BlocksLocalizationClient(http),
		mail: new BlocksMailClient(http),
		mfa: new BlocksMfaClient(http),
		notifier: new BlocksNotifierClient(http)
	};
}
function normalizeConfig(config) {
	if (!config.apiUrl) throw new Error("Blocks client requires apiUrl.");
	if (!config.xBlocksKey) throw new Error("Blocks client requires xBlocksKey.");
	return {
		accessToken: config.accessToken,
		apiUrl: trimTrailingSlash(config.apiUrl),
		appDomain: config.appDomain,
		onUnauthorized: config.onUnauthorized,
		oidc: config.oidc ? {
			...config.oidc,
			redirectUri: config.oidc.redirectUri ?? browserRedirectUri(),
			scope: config.oidc.scope ?? "openid profile"
		} : void 0,
		xBlocksKey: config.xBlocksKey
	};
}
function browserRedirectUri() {
	if (typeof window === "undefined") throw new Error("OIDC redirectUri is required outside a browser.");
	return `${window.location.origin}/login/callback`;
}
function trimTrailingSlash(value) {
	return value.replace(/\/+$/, "");
}
// src/lib/blocks/config.ts
var blocksConfig = {
	apiUrl: "https://blocksapi.dev.slsblx.com",
	appDomain: "https://Sff984c736d3b493889810efd873f3f85-3b0164d5-ddf3-45c9-ab6f-09a01d0fee0a.slsblx.com",
	oidcUrl: "https://dev-iam.blocksdevelopers.com",
	oidcClientId: "24d0e873-2a3f-44eb-b3eb-bd29fe7fbbaa",
	oidcScope: "openid profile",
	xBlocksKey: "Sff984c736d3b493889810efd873f3f85"
};
// src/lib/blocks/jwt.ts
function decodeJwtPayload(token) {
	const [, payload] = token.split(".");
	if (!payload) throw new Error("Invalid JWT: missing payload");
	const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
	const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, "=");
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return JSON.parse(new TextDecoder().decode(bytes));
}
function jwtExpiryMs(token) {
	const payload = decodeJwtPayload(token);
	return typeof payload.exp === "number" ? payload.exp * 1e3 : void 0;
}
function isJwtExpired(token, skewMs = 3e4) {
	let expiry;
	try {
		expiry = jwtExpiryMs(token);
	} catch {
		return true;
	}
	if (!expiry) return false;
	return Date.now() + skewMs >= expiry;
}
// src/lib/blocks/auth.ts
var TOKEN_KEY = "blocks-app:access-token";
var REFRESH_TOKEN_KEY = "blocks-app:refresh-token";
var RETURN_KEY = "blocks-app:oidc-return-to";
var cachedAccessToken;
var cachedRefreshToken;
var refreshInFlight;
var sessionExpiredListeners = /* @__PURE__ */ new Set();
function onSessionExpired(listener) {
	sessionExpiredListeners.add(listener);
	return () => sessionExpiredListeners.delete(listener);
}
function notifySessionExpired() {
	for (const listener of sessionExpiredListeners) listener();
}
function getAccessToken() {
	if (cachedAccessToken && !isJwtExpired(cachedAccessToken)) return cachedAccessToken;
	const stored = sessionStorage.getItem(TOKEN_KEY);
	if (stored && !isJwtExpired(stored)) {
		cachedAccessToken = stored;
		return stored;
	}
}
function getRefreshToken() {
	if (cachedRefreshToken) return cachedRefreshToken;
	return sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? void 0;
}
function persistTokens(accessToken, refreshToken) {
	cachedAccessToken = accessToken;
	sessionStorage.setItem(TOKEN_KEY, accessToken);
	if (refreshToken) cachedRefreshToken = refreshToken;
}
function clearLocalTokens() {
	cachedAccessToken = void 0;
	cachedRefreshToken = void 0;
	sessionStorage.removeItem(TOKEN_KEY);
	sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}
async function getValidAccessToken() {
	const current = getAccessToken();
	if (current) return current;
	return forceRefreshAccessToken();
}
async function forceRefreshAccessToken() {
	const refreshToken = getRefreshToken();
	if (!refreshToken) return void 0;
	if (!refreshInFlight) refreshInFlight = refreshAccessToken(refreshToken).finally(() => {
		refreshInFlight = void 0;
	});
	return refreshInFlight;
}
async function refreshAccessToken(refreshToken) {
	let response;
	try {
		response = await blocksClient.auth.oidc.refreshToken({ refreshToken });
	} catch {
		return;
	}
	const accessToken = response.access_token ?? response.accessToken;
	if (!accessToken) {
		clearLocalTokens();
		await blocksClient.auth.logout({ refreshToken }).catch(() => void 0);
		notifySessionExpired();
		return;
	}
	persistTokens(accessToken, response.refresh_token ?? response.refreshToken ?? refreshToken);
	return accessToken;
}
async function fetchSessionClaims() {
	try {
		return await blocksClient.auth.userInfo();
	} catch {
		return;
	}
}
async function startLogin(returnTo) {
	if (!blocksConfig.oidcClientId) throw new Error("Login is not configured. Set VITE_BLOCKS_OIDC_CLIENT_ID in .env.");
	sessionStorage.setItem(RETURN_KEY, returnTo || "/");
	await blocksClient.auth.idp.redirectToProvider();
}
async function completeLogin(callbackUrl) {
	const returnTo = sessionStorage.getItem(RETURN_KEY) || "/";
	sessionStorage.removeItem(RETURN_KEY);
	const data = await blocksClient.auth.idp.callback(callbackUrl);
	if (data.error) return {
		message: data.error_description || data.error,
		ok: false
	};
	const accessToken = data.access_token ?? data.accessToken;
	if (accessToken) persistTokens(accessToken, data.refresh_token ?? data.refreshToken);
	return {
		ok: true,
		returnTo
	};
}
async function logout() {
	await blocksClient.auth.logout({ refreshToken: getRefreshToken() }).catch(() => void 0);
	clearLocalTokens();
}
// src/lib/blocks/client.ts
var blocksClient = createBlocksClient({
	accessToken: () => getValidAccessToken(),
	apiUrl: blocksConfig.apiUrl,
	appDomain: blocksConfig.appDomain,
	onUnauthorized: () => forceRefreshAccessToken(),
	oidc: {
		clientId: blocksConfig.oidcClientId,
		scope: blocksConfig.oidcScope,
		url: blocksConfig.oidcUrl
	},
	xBlocksKey: blocksConfig.xBlocksKey
});
// src/lib/i18n/dictionary.ts
var defaultDictionary = {
	"welcome.brand": "My lists",
	"welcome.home": "My lists home",
	"welcome.title.a": "Keep your tasks",
	"welcome.title.b": "in one place.",
	"welcome.lede.b": "Sign in to see your lists.",
	"welcome.lede.rest": "Make a list for anything, add what you need to do, and tick it off when it's done.",
	"welcome.signIn": "Sign in or create an account",
	"welcome.signInOnly": "Sign in",
	"welcome.signInFailed": "We couldn't open sign-in. Please try again in a moment.",
	"welcome.step.list": "Make a list",
	"welcome.step.add": "Add tasks",
	"welcome.step.tick": "Tick them done",
	"welcome.preview.list": "Home",
	"welcome.preview.badge": "1 of 3 done",
	"welcome.preview.task1": "Buy milk",
	"welcome.preview.task2": "Book the dentist",
	"welcome.preview.task3": "Take out the bins",
	"welcome.artFoot": "Only you see your lists",
	"welcome.note": "New here? The same page makes your account, so there's just one button to press.",
	"welcome.noteSignInOnly": "One button gets you in. If you don't have an account yet, ask the owner to switch joining on.",
	"header.myLists": "My lists",
	"header.sections": "Main sections",
	"header.menu": "Open the menu",
	"header.accountMenuFor": "{name}: account menu",
	"header.signOut": "Sign out",
	"header.signedIn": "Signed in",
	"header.language": "Language",
	"header.colourMode": "Colour mode",
	"header.light": "Light",
	"header.dark": "Dark",
	"header.auto": "Auto",
	"lists.eyebrow": "{name}'s lists",
	"lists.eyebrowPlain": "Your lists",
	"lists.title": "My lists",
	"lists.sub": "Your own little corners for tasks. Add one, tick it off, done.",
	"lists.makeList": "Make a list",
	"lists.empty.title": "No lists yet. Make your first list.",
	"lists.empty.detail": "Give it a name and start adding tasks to it.",
	"lists.error.title": "Your lists didn't load",
	"lists.error.detail": "Something went wrong on the way. Try again in a moment.",
	"lists.error.retry": "Try again",
	"lists.form.title": "Make a list",
	"lists.form.detail": "Give it a name you'll spot quickly.",
	"lists.form.label": "List name",
	"lists.form.hint": "Up to 60 characters.",
	"lists.form.cancel": "Cancel",
	"lists.form.submit": "Make list",
	"lists.form.saved": "List made. It's at the top of your lists.",
	"lists.form.duplicate": "You already have a list called that.",
	"lists.form.nameRequired": "Give the list a name.",
	"lists.form.limit": "You can have up to 50 lists. Remove one to make room.",
	"lists.form.failed": "The list couldn't be saved. Please try again.",
	"lists.madeOn": "Made {date}",
	"lists.actionsFor": "Actions for {name}",
	"lists.noTasks": "No tasks in this list yet. Add the first one.",
	"lists.addTask": "Add a task",
	"lists.renameList": "Rename list",
	"lists.removeList": "Remove list",
	"lists.taskCount.one": "1 task",
	"lists.taskCount.many": "{count} tasks",
	"lists.taskDone": "Mark {name} done",
	"lists.taskNotDone": "Mark {name} not done",
	"lists.taskForm.title": "Add a task",
	"lists.taskForm.detail": "Give it a short name you'll know at a glance.",
	"lists.taskForm.label": "Task name",
	"lists.taskForm.listLabel": "List",
	"lists.taskForm.nameHint": "Up to 200 characters.",
	"lists.taskForm.saved": "Task added to {list}.",
	"lists.taskForm.cancel": "Cancel",
	"lists.taskForm.submit": "Add task",
	"lists.taskForm.nameRequired": "Give the task a name.",
	"lists.taskForm.nameTooLong": "Keep the task name to 200 characters.",
	"lists.taskForm.limit": "You can have up to 500 tasks. Tick some done, or remove a list.",
	"lists.taskForm.failed": "The task couldn't be saved. Please try again.",
	"lists.taskForm.noLists": "Make a list first, then add tasks to it.",
	"lists.taskToggle.failed": "The change didn't save. Please try again.",
	"task.eyebrow": "Task",
	"task.back": "Back to my lists",
	"task.in": "In",
	"task.done": "Done",
	"task.notDone": "Not done",
	"task.statusDone": "Done",
	"task.statusDoneDetail": "Nice one. It's sitting with the finished tasks in this list.",
	"task.markNotDone": "Mark not done",
	"task.statusNotDone": "Not done yet",
	"task.statusNotDoneDetail": "Tick it done when it's finished.",
	"task.markDone": "Mark done",
	"task.nameAndList": "Name and list",
	"task.hint": "Change the name, or move this task to another of your lists.",
	"task.nameLabel": "Task name",
	"task.nameHint": "Up to 200 characters.",
	"task.listLabel": "List",
	"task.cancel": "Cancel",
	"task.edit": "Edit task",
	"task.editSaved": "Saved. This task shows in {list}.",
	"task.details": "Details",
	"task.status": "Status",
	"task.list": "List",
	"task.added": "Added",
	"task.whatNext": "What next",
	"task.nextNotDone": "Mark this task done when it's finished, or go back to your lists to see the rest.",
	"task.nextDone": "All done here. Back to your lists to pick the next one.",
	"task.notYours": "This task isn't yours.",
	"task.notYoursDetail": "Only the person who added a task can open it.",
	"task.nameRequired": "Give the task a name.",
	"task.nameTooLong": "Keep the task name to 200 characters.",
	"task.saveFailed": "The task couldn't be saved. Please try again.",
	"task.toggleFailed": "The change didn't save. Please try again.",
	"task.retry": "Try again",
	"task.loadFailed": "This task didn't load. Try again in a moment.",
	"notFound.title": "Not found",
	"notFound.message": "This page isn't here. Back to your lists to carry on.",
	"notFound.home": "Back to my lists",
	"error.title": "Something went wrong",
	"error.detail": "Please try again in a moment.",
	"error.home": "Back home",
	"auth.failed": "Sign-in didn't finish",
	"auth.back": "Back to the start"
};
// src/lib/i18n/languages.ts
var appLanguages = [
	{
		code: "en-US",
		label: "English"
	},
	{
		code: "bn-BD",
		label: "বাংলা"
	},
	{
		code: "de-DE",
		label: "Deutsch"
	},
	{
		code: "dz-BT",
		label: "ཇོང་ཁ"
	}
];
// src/lib/i18n/LocalizationProvider.tsx
var LocalizationContext = createContext(void 0);
var LANGUAGE_KEY = "blocks-app:language";
var MODULES = ["app-3b0164d5"];
function pickText(cloud, fallback, key) {
	if (cloud && !cloud.trim().startsWith("[")) return cloud;
	if (fallback && !fallback.trim().startsWith("[")) return fallback;
	return key;
}
function LocalizationProvider({ children }) {
	const [languageOverride, setLanguageOverride] = useState(() => localStorage.getItem(LANGUAGE_KEY) ?? "");
	const languagesQuery = useQuery({
		queryFn: () => blocksClient.localization.languages(),
		queryKey: ["i18n", "languages"],
		staleTime: 3e5
	});
	const serviceLanguages = useMemo(() => Array.isArray(languagesQuery.data) ? languagesQuery.data : [], [languagesQuery.data]);
	const defaultLanguage = useMemo(() => {
		const serviceDefault = serviceLanguages.find((entry) => Boolean(entry?.isDefault))?.languageCode;
		if (appLanguages.some((entry) => entry.code === serviceDefault)) return String(serviceDefault);
		return appLanguages[0]?.code ?? "en-US";
	}, [serviceLanguages]);
	const storedOverride = appLanguages.some((entry) => entry.code === languageOverride) ? languageOverride : "";
	const browserMatch = appLanguages.find((entry) => entry.code.toLowerCase().split("-")[0] === navigator.language.toLowerCase().split("-")[0]);
	const language = storedOverride || browserMatch?.code || defaultLanguage;
	function setLanguage(next) {
		localStorage.setItem(LANGUAGE_KEY, next);
		setLanguageOverride(next);
	}
	const moduleQueries = useQueries({ queries: MODULES.map((moduleName) => ({
		queryFn: () => blocksClient.localization.translations(moduleName, language),
		queryKey: [
			"i18n",
			"translations",
			language,
			moduleName
		],
		staleTime: 3e5
	})) });
	const cloudDictionary = useMemo(() => {
		const merged = {};
		moduleQueries.forEach((query, index) => {
			for (const [key, value] of Object.entries(query.data ?? {})) {
				const appKey = key;
				merged[appKey] = value;
			}
		});
		return merged;
	}, [moduleQueries.map((query) => query.dataUpdatedAt).join()]);
	const value = useMemo(() => ({
		language,
		languages: appLanguages.map((entry) => ({
			code: entry.code,
			isDefault: entry.code === defaultLanguage,
			name: entry.label
		})),
		setLanguage,
		t: (key, values) => {
			const text = pickText(cloudDictionary[key], defaultDictionary[key], typeof values === "string" ? values : key);
			if (!values || typeof values === "string") return text;
			return Object.entries(values).reduce((out, [name, value]) => out.split(`{${name}}`).join(String(value)), text);
		}
	}), [
		cloudDictionary,
		defaultLanguage,
		language
	]);
	return /* @__PURE__ */ jsx(LocalizationContext.Provider, {
		value,
		children
	});
}
function useT() {
	const context = useContext(LocalizationContext);
	if (!context) throw new Error("useT must be used within LocalizationProvider");
	return context;
}
// src/app/providers/AppProviders.tsx
var queryClient = new QueryClient({ defaultOptions: { queries: {
	staleTime: 3e4,
	refetchOnWindowFocus: false,
	retry: false
} } });
function AppProviders({ children }) {
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ jsx(LocalizationProvider, { children })
	});
}
// src/app/providers/AuthProvider.tsx
var AuthContext = createContext(void 0);
var STATUS_POLL_MS = 3e5;
function AuthProvider({ children }) {
	const [status, setStatus] = useState("loading");
	const [claims, setClaims] = useState();
	const refresh = useCallback(async () => {
		const sessionClaims = await fetchSessionClaims();
		setClaims(sessionClaims);
		setStatus(sessionClaims ? "authenticated" : "unauthenticated");
	}, []);
	useEffect(() => {
		refresh();
		const id = window.setInterval(refresh, STATUS_POLL_MS);
		function onVisible() {
			if (document.visibilityState === "visible") refresh();
		}
		document.addEventListener("visibilitychange", onVisible);
		return () => {
			window.clearInterval(id);
			document.removeEventListener("visibilitychange", onVisible);
		};
	}, [refresh]);
	useEffect(() => onSessionExpired(() => void refresh()), [refresh]);
	const login = useCallback(async (returnTo) => {
		await startLogin(returnTo);
	}, []);
	const logout$1 = useCallback(async () => {
		await logout();
		await refresh();
	}, [refresh]);
	const value = useMemo(() => ({
		claims,
		login,
		logout: logout$1,
		refresh,
		status
	}), [
		claims,
		login,
		logout$1,
		refresh,
		status
	]);
	return /* @__PURE__ */ jsx(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
}
// src/shared/ui/LoadingScreen.tsx
function LoadingScreen() {
	return /* @__PURE__ */ jsx("div", {
		className: "loading-screen",
		children: /* @__PURE__ */ jsx("span", { className: "spinner" })
	});
}
// src/app/router/guards.tsx
function RequireAuth({ children, currentPath, onNavigate }) {
	const { status } = useAuth();
	useEffect(() => {
		if (status === "unauthenticated") onNavigate(`/login?returnTo=${encodeURIComponent(currentPath)}`);
	}, [
		currentPath,
		status,
		onNavigate
	]);
	if (status !== "authenticated") return /* @__PURE__ */ jsx(LoadingScreen, {});
	return /* @__PURE__ */ jsx(Fragment, { children });
}
function RedirectIfAuthenticated({ children, onNavigate }) {
	const { status } = useAuth();
	useEffect(() => {
		if (status === "authenticated") onNavigate("/");
	}, [status, onNavigate]);
	if (status === "loading" || status === "authenticated") return /* @__PURE__ */ jsx(LoadingScreen, {});
	return /* @__PURE__ */ jsx(Fragment, { children });
}
// src/shared/ui/Alert.tsx
function Alert({ children, tone = "warn" }) {
	return /* @__PURE__ */ jsx("div", {
		className: `alert alert-${tone}`,
		children
	});
}
// src/features/auth/CallbackPage.tsx
function CallbackPage({ onNavigate }) {
	const { refresh } = useAuth();
	const { t } = useT();
	const [error, setError] = useState();
	const ran = useRef(false);
	useEffect(() => {
		if (ran.current) return;
		ran.current = true;
		completeLogin(window.location.href).then((result) => {
			if (result.ok) {
				refresh().then(() => onNavigate(result.returnTo));
				return;
			}
			setError(result.message);
		});
	}, [onNavigate, refresh]);
	if (error) return /* @__PURE__ */ jsx("div", {
		className: "auth-screen",
		children: /* @__PURE__ */ jsxs("div", {
			className: "auth-card",
			children: [
				/* @__PURE__ */ jsx("h2", { children: t("auth.failed") }),
				/* @__PURE__ */ jsx(Alert, {
					tone: "error",
					children: error
				}),
				/* @__PURE__ */ jsx("button", {
					className: "primary-button auth-submit",
					type: "button",
					onClick: () => onNavigate("/login"),
					children: t("auth.back")
				})
			]
		})
	});
	return /* @__PURE__ */ jsx(LoadingScreen, {});
}
// src/app/layout/LanguageSwitch.tsx
function LanguageSwitch({ className = "" }) {
	const { language, setLanguage, t } = useT();
	const id = useId();
	return /* @__PURE__ */ jsxs("div", {
		className: `ds-lang-switch ${className}`.trim(),
		role: "group",
		"aria-label": t("header.language"),
		children: [/* @__PURE__ */ jsxs("svg", {
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.75",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "9"
			}), /* @__PURE__ */ jsx("path", { d: "M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" })]
		}), /* @__PURE__ */ jsx("select", {
			className: "ds-lang-select",
			"aria-label": t("header.language"),
			value: language,
			id,
			onChange: (event) => setLanguage(event.target.value),
			children: appLanguages.map((entry) => /* @__PURE__ */ jsx("option", {
				value: entry.code,
				children: entry.label
			}, entry.code))
		})]
	});
}
// src/lib/theme/applyTheme.ts
var THEME_KEY = "app:theme";
function storedTheme() {
	const saved = localStorage.getItem(THEME_KEY);
	return saved === "light" || saved === "dark" || saved === "auto" ? saved : "auto";
}
function applyTheme(mode) {
	const dark = mode === "dark" || mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches;
	document.documentElement.classList.toggle("dark", dark);
}
// src/app/layout/ThemeSwitch.tsx
var MODES = [
	{
		mode: "light",
		key: "header.light",
		icon: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("circle", {
			cx: "12",
			cy: "12",
			r: "4"
		}), /* @__PURE__ */ jsx("path", { d: "M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" })] })
	},
	{
		mode: "dark",
		key: "header.dark",
		icon: /* @__PURE__ */ jsx("path", { d: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" })
	},
	{
		mode: "auto",
		key: "header.auto",
		icon: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("circle", {
			cx: "12",
			cy: "12",
			r: "8"
		}), /* @__PURE__ */ jsx("path", {
			d: "M12 4a8 8 0 0 1 0 16Z",
			fill: "currentColor"
		})] })
	}
];
function ThemeSwitch({ className = "" }) {
	const { t } = useT();
	const [mode, setMode] = useState(() => storedTheme());
	useEffect(() => {
		applyTheme(mode);
		localStorage.setItem("app:theme", mode);
		if (mode !== "auto") return;
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("auto");
		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, [mode]);
	function choose(event, next) {
		event.preventDefault();
		setMode(next);
	}
	return /* @__PURE__ */ jsx("div", {
		className: `ds-theme-switch ${className}`.trim(),
		role: "group",
		"aria-label": t("header.colourMode"),
		children: MODES.map((entry) => /* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": t(entry.key),
			"aria-pressed": mode === entry.mode,
			onClick: (event) => choose(event, entry.mode),
			className: mode === entry.mode ? "ds-active" : void 0,
			children: /* @__PURE__ */ jsx("svg", {
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.75",
				children: entry.icon
			})
		}, entry.mode))
	});
}
// src/features/auth/ErrorPage.tsx
function ErrorPage({ onNavigate }) {
	const { t } = useT();
	return /* @__PURE__ */ jsxs("section", {
		className: "not-found",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "ds-corner",
				children: [/* @__PURE__ */ jsx(LanguageSwitch, {}), /* @__PURE__ */ jsx(ThemeSwitch, {})]
			}),
			/* @__PURE__ */ jsx("h2", { children: t("error.title") }),
			/* @__PURE__ */ jsx("p", { children: t("error.detail") }),
			/* @__PURE__ */ jsx("button", {
				className: "primary-button",
				type: "button",
				onClick: () => onNavigate?.("/"),
				children: t("error.home")
			})
		]
	});
}
// src/features/auth/NotFoundPage.tsx
function NotFoundPage({ onNavigate }) {
	const { t } = useT();
	return /* @__PURE__ */ jsxs("section", {
		className: "not-found",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "ds-corner",
				children: [/* @__PURE__ */ jsx(LanguageSwitch, {}), /* @__PURE__ */ jsx(ThemeSwitch, {})]
			}),
			/* @__PURE__ */ jsx("h2", { children: t("notFound.title") }),
			/* @__PURE__ */ jsx("p", { children: t("notFound.message") }),
			/* @__PURE__ */ jsx("button", {
				className: "primary-button",
				type: "button",
				onClick: () => onNavigate("/"),
				children: t("notFound.home")
			})
		]
	});
}
// src/features/profile/useCurrentUser.ts
function useCurrentUser() {
	const { status } = useAuth();
	return useQuery({
		enabled: status === "authenticated",
		queryFn: () => blocksClient.iam.me(),
		queryKey: ["iam", "me"]
	});
}
function userInitials(profile) {
	if (!profile) return "?";
	const first = profile.firstName?.[0];
	const last = profile.lastName?.[0];
	if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase();
	return (profile.email?.[0] ?? "?").toUpperCase();
}
// src/features/lists/listsApi.ts
var lists = blocksClient.data.collection("List", { fields: ["name", "CreatedDate"] });
var tasks = blocksClient.data.collection("Task", { fields: [
	"name",
	"list",
	"done",
	"CreatedDate"
] });
function textOf(value) {
	return typeof value === "string" ? value : "";
}
function recordId(raw) {
	return textOf(raw.ItemId ?? raw.itemId);
}
function itemsOf(answer, queryName) {
	return answer.data?.[queryName]?.items ?? [];
}
function refusal(answer) {
	if (answer.errors) {
		const text = typeof answer.errors === "string" ? answer.errors : JSON.stringify(answer.errors);
		if (text && text !== "null" && text !== "[]" && text !== "{}") return answer.message || text;
	}
	if (answer.acknowledged === false) return answer.message || "The save was refused.";
}
function toSaveAnswer(answer) {
	const raw = answer ?? {};
	const reason = refusal(raw);
	if (reason) return {
		ok: false,
		reason
	};
	return {
		ok: true,
		itemId: raw.itemId ?? raw.itemIds?.[0]
	};
}
function toList(raw) {
	return {
		createdDate: textOf(raw.CreatedDate ?? raw.createdDate),
		itemId: recordId(raw),
		name: textOf(raw.name)
	};
}
function toTask(raw) {
	return {
		createdDate: textOf(raw.CreatedDate ?? raw.createdDate),
		done: Boolean(raw.done),
		itemId: recordId(raw),
		list: textOf(raw.list),
		name: textOf(raw.name)
	};
}
async function fetchLists() {
	const answer = await lists.list({
		pageNo: 1,
		pageSize: 50,
		sort: { CreatedDate: -1 }
	});
	if (refusal(answer)) return { ok: false };
	return {
		items: itemsOf(answer, "getLists").map(toList),
		ok: true
	};
}
async function fetchTasks() {
	const answer = await tasks.list({
		pageNo: 1,
		pageSize: 500,
		sort: { CreatedDate: 1 }
	});
	if (refusal(answer)) return { ok: false };
	return {
		items: itemsOf(answer, "getTasks").map(toTask),
		ok: true
	};
}
async function fetchTask(id) {
	const answer = await tasks.get(id);
	if (refusal(answer)) return null;
	const raw = itemsOf(answer, "getTasks")[0];
	return raw ? toTask(raw) : null;
}
function createList(name) {
	return lists.create({ name }).then(toSaveAnswer);
}
function createTask(name, list) {
	return tasks.create({
		done: false,
		list,
		name
	}).then(toSaveAnswer);
}
function updateTask(id, changes) {
	return tasks.update(id, changes).then(toSaveAnswer);
}
/** One list's tasks, not-done first and each group in the order it was added. */
function tasksOfList(all, listId) {
	return all.filter((task) => task.list === listId).sort((a, b) => Number(a.done) - Number(b.done));
}
// src/app/layout/HeaderPart.tsx
function HeaderPart({ onNavigate, onSignOut, person }) {
	const { t } = useT();
	const rootRef = useRef(null);
	const goTo = (path) => (event) => {
		if (!onNavigate) return;
		event.preventDefault();
		onNavigate(path);
	};
	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		function closeAll() {
			root?.querySelectorAll("details.ds-menu[open]").forEach((menu) => {
				menu.open = false;
			});
		}
		function onKey(event) {
			if (event.key === "Escape") closeAll();
		}
		function onPointer(event) {
			const target = event.target;
			root?.querySelectorAll("details.ds-menu[open]").forEach((menu) => {
				if (target && !menu.contains(target)) menu.open = false;
			});
		}
		document.addEventListener("keydown", onKey);
		document.addEventListener("pointerdown", onPointer);
		return () => {
			document.removeEventListener("keydown", onKey);
			document.removeEventListener("pointerdown", onPointer);
		};
	}, []);
	function choose(action) {
		if (rootRef.current) rootRef.current.querySelectorAll("details.ds-menu[open]").forEach((menu) => {
			menu.open = false;
		});
		action();
	}
	function signOut(event) {
		event.preventDefault();
		choose(() => onSignOut?.());
	}
	return /* @__PURE__ */ jsx("div", {
		className: "studio-part-header",
		"data-part-root": "header",
		style: { display: "contents" },
		ref: rootRef,
		children: /* @__PURE__ */ jsx("header", {
			style: {
				borderBottom: "1px solid hsl(var(--border))",
				background: "hsl(var(--card) / 0.72)",
				backdropFilter: "blur(16px)",
				WebkitBackdropFilter: "blur(16px)",
				position: "sticky",
				top: "0",
				zIndex: "20"
			},
			children: /* @__PURE__ */ jsxs("div", {
				className: "ds-bar th-bar",
				children: [
					/* @__PURE__ */ jsxs("details", {
						className: "ds-menu ds-only-narrow th-narrow-menu",
						children: [/* @__PURE__ */ jsx("summary", {
							className: "ds-menu-button",
							"aria-label": t("header.menu"),
							children: /* @__PURE__ */ jsx("svg", {
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "1.75",
								children: /* @__PURE__ */ jsx("path", { d: "M4 7h16M4 12h16M4 17h16" })
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "ds-menu-list",
							children: [
								/* @__PURE__ */ jsx("a", {
									href: "/lists",
									"data-goto": "lists",
									onClick: goTo("/lists"),
									children: t("header.myLists")
								}),
								/* @__PURE__ */ jsx(ThemeSwitch, {}),
								/* @__PURE__ */ jsxs("div", {
									className: "ds-user",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "ds-avatar",
											children: person.initials
										}),
										" ",
										/* @__PURE__ */ jsxs("span", {
											className: "ds-user-text",
											children: [
												" ",
												/* @__PURE__ */ jsx("b", {
													className: "ds-user-name",
													children: person.name
												}),
												" ",
												/* @__PURE__ */ jsx("span", {
													className: "ds-user-role",
													children: person.role
												}),
												" "
											]
										})
									]
								}),
								/* @__PURE__ */ jsx("a", {
									href: "/",
									className: "th-narrow-signout",
									"data-goto": "welcome",
									onClick: signOut,
									children: t("header.signOut")
								})
							]
						})]
					}),
					/* @__PURE__ */ jsxs("a", {
						href: "/lists",
						className: "th-brand",
						"data-goto": "lists",
						onClick: goTo("/lists"),
						children: [
							" ",
							/* @__PURE__ */ jsxs("span", {
								className: "th-mark",
								"aria-hidden": "true",
								children: [
									" ",
									/* @__PURE__ */ jsxs("svg", {
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "1.75",
										children: [/* @__PURE__ */ jsx("path", { d: "M4 7h10M4 12h10M4 17h6" }), /* @__PURE__ */ jsx("path", { d: "m15.5 15.5 2 2 4-4.5" })]
									}),
									" "
								]
							}),
							" ",
							/* @__PURE__ */ jsx("span", {
								className: "ds-brand-text",
								children: t("welcome.brand")
							}),
							" "
						]
					}),
					/* @__PURE__ */ jsx("nav", {
						className: "ds-nav th-nav ds-only-wide",
						"aria-label": t("header.sections"),
						children: /* @__PURE__ */ jsx("a", {
							href: "/lists",
							className: "ds-nav-item ds-active",
							"data-goto": "lists",
							onClick: goTo("/lists"),
							children: t("header.myLists")
						})
					}),
					/* @__PURE__ */ jsx("span", { className: "ds-spacer" }),
					/* @__PURE__ */ jsx(ThemeSwitch, { className: "ds-only-wide" }),
					/* @__PURE__ */ jsxs("details", {
						className: "ds-menu ds-menu-left th-user",
						children: [/* @__PURE__ */ jsxs("summary", {
							className: "th-user-btn",
							"aria-label": t("header.accountMenuFor", { name: person.name }),
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "ds-avatar",
									children: person.initials
								}),
								" ",
								/* @__PURE__ */ jsx("span", {
									className: "th-name",
									children: person.name
								}),
								" ",
								/* @__PURE__ */ jsx("svg", {
									className: "th-chev",
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.75",
									"aria-hidden": "true",
									children: /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" })
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "ds-menu-list th-account",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "th-account-head",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "ds-avatar",
										children: person.initials
									}),
									" ",
									/* @__PURE__ */ jsxs("span", {
										className: "th-account-text",
										children: [
											" ",
											/* @__PURE__ */ jsx("b", { children: person.name }),
											" ",
											/* @__PURE__ */ jsx("span", { children: person.role }),
											" "
										]
									})
								]
							}), /* @__PURE__ */ jsx("a", {
								href: "/",
								"data-goto": "welcome",
								onClick: signOut,
								children: t("header.signOut")
							})]
						})]
					})
				]
			})
		})
	});
}
// src/features/lists/ListsScreen.tsx
function ListsScreen({ situation = "normal", onNavigate, person, onSignOut, lists, tasks, onRetry, onOpenTask, onToggleTask, onAddTask, onMakeList, notice }) {
	const { t } = useT();
	const [formOpen, setFormOpen] = useState(false);
	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState();
	const [taskFormIn, setTaskFormIn] = useState();
	const [taskFormList, setTaskFormList] = useState("");
	const [taskName, setTaskName] = useState("");
	const [savingTask, setSavingTask] = useState(false);
	const [openMenu, setOpenMenu] = useState();
	const [taskError, setTaskError] = useState();
	const nameRef = useRef(null);
	const taskRef = useRef(null);
	useEffect(() => {
		if (formOpen) nameRef.current?.focus();
	}, [formOpen]);
	useEffect(() => {
		if (taskFormIn) taskRef.current?.focus();
	}, [taskFormIn]);
	useEffect(() => {
		function close(event) {
			if (event instanceof KeyboardEvent && event.key !== "Escape") return;
			setOpenMenu(void 0);
		}
		document.addEventListener("keydown", close);
		document.addEventListener("pointerdown", close);
		return () => {
			document.removeEventListener("keydown", close);
			document.removeEventListener("pointerdown", close);
		};
	}, []);
	function openForm() {
		setFormOpen(true);
		setName("");
		setFormError(void 0);
	}
	function cancelForm() {
		setFormOpen(false);
		setName("");
		setFormError(void 0);
	}
	async function submit(event) {
		event.preventDefault();
		const trimmed = name.trim();
		setFormError(void 0);
		if (!trimmed) {
			setFormError(t("lists.form.nameRequired"));
			return;
		}
		if (trimmed.length > 60) {
			setFormError(t("lists.form.hint"));
			return;
		}
		setSaving(true);
		const reason = await onMakeList(trimmed);
		setSaving(false);
		if (reason) {
			setFormError(reason);
			return;
		}
		setFormOpen(false);
		setName("");
	}
	function startTask(listId) {
		setTaskFormIn(listId);
		setTaskFormList(listId);
		setTaskName("");
		setTaskError(void 0);
	}
	function cancelTask() {
		setTaskFormIn(void 0);
		setTaskFormList("");
		setTaskName("");
		setTaskError(void 0);
	}
	async function submitTask(event) {
		event.preventDefault();
		if (!taskFormIn) return;
		const trimmed = taskName.trim();
		setTaskError(void 0);
		if (!trimmed) {
			setTaskError(t("lists.taskForm.nameRequired"));
			return;
		}
		if (trimmed.length > 200) {
			setTaskError(t("lists.taskForm.nameTooLong"));
			return;
		}
		setSavingTask(true);
		const reason = await onAddTask(taskFormList, trimmed);
		setSavingTask(false);
		if (reason) {
			setTaskError(reason);
			return;
		}
		setTaskFormIn(void 0);
		setTaskName("");
	}
	const eyebrow = person.name ? t("lists.eyebrow", { name: person.name.split(" ")[0] ?? person.name }) : t("lists.eyebrowPlain");
	const head = (withAction) => /* @__PURE__ */ jsx("div", {
		className: "ds-page lists-head",
		children: /* @__PURE__ */ jsxs("div", {
			className: "ds-page-head",
			children: [/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx("span", {
					className: "ds-eyebrow",
					children: eyebrow
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "ds-h1 lists-title",
					children: t("lists.title")
				}),
				/* @__PURE__ */ jsx("p", {
					className: "ds-muted lists-sub",
					children: t("lists.sub")
				})
			] }), withAction ? /* @__PURE__ */ jsx("div", {
				className: "ds-actions",
				children: /* @__PURE__ */ jsxs("button", {
					className: "ds-btn",
					type: "button",
					onClick: openForm,
					children: [
						" ",
						/* @__PURE__ */ jsx("svg", {
							viewBox: "0 0 24 24",
							width: "18",
							height: "18",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "1.75",
							"aria-hidden": "true",
							children: /* @__PURE__ */ jsx("path", { d: "M12 5v14M5 12h14" })
						}),
						" ",
						t("lists.makeList"),
						" "
					]
				})
			}) : null]
		})
	});
	const emptyBlock = (title, detail, withButton) => /* @__PURE__ */ jsx("div", {
		className: "lists-empty",
		children: /* @__PURE__ */ jsxs("div", {
			className: "ds-empty",
			style: { padding: "0" },
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "ds-empty-icon",
					children: [
						" ",
						/* @__PURE__ */ jsxs("svg", {
							width: "24",
							height: "24",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "1.75",
							"aria-hidden": "true",
							children: [/* @__PURE__ */ jsx("path", { d: "M4 6h16M4 12h16M4 18h10" }), /* @__PURE__ */ jsx("path", { d: "M17 15l2 2 3.5-3.5" })]
						}),
						" "
					]
				}),
				" ",
				/* @__PURE__ */ jsx("b", {
					style: {
						color: "hsl(var(--foreground))",
						fontSize: "18px"
					},
					children: title
				}),
				" ",
				/* @__PURE__ */ jsx("span", { children: detail }),
				withButton ? /* @__PURE__ */ jsxs(Fragment, { children: [" ", /* @__PURE__ */ jsxs("button", {
					className: "ds-btn",
					type: "button",
					style: { marginTop: "calc(8px * var(--space-scale, 1))" },
					onClick: openForm,
					children: [
						" ",
						/* @__PURE__ */ jsx("svg", {
							viewBox: "0 0 24 24",
							width: "18",
							height: "18",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "1.75",
							"aria-hidden": "true",
							children: /* @__PURE__ */ jsx("path", { d: "M12 5v14M5 12h14" })
						}),
						" ",
						t("lists.makeList"),
						" "
					]
				})] }) : null
			]
		})
	});
	return /* @__PURE__ */ jsx("div", {
		className: "studio-screen-lists",
		style: { display: "contents" },
		children: /* @__PURE__ */ jsxs("main", {
			"data-screen": "lists",
			className: "lists-root",
			children: [
				/* @__PURE__ */ jsx("div", { className: "ds-deco lists-deco-a" }),
				/* @__PURE__ */ jsx("div", { className: "ds-deco lists-deco-b" }),
				/* @__PURE__ */ jsx(HeaderPart, {
					onNavigate,
					onSignOut,
					person
				}),
				situation === "empty" ? /* @__PURE__ */ jsxs("section", {
					"data-state": "empty",
					children: [head(true), /* @__PURE__ */ jsx("div", {
						className: "ds-page lists-body",
						children: emptyBlock(t("lists.empty.title"), t("lists.empty.detail"), true)
					})]
				}) : null,
				situation === "error" ? /* @__PURE__ */ jsxs("section", {
					"data-state": "error",
					children: [head(false), /* @__PURE__ */ jsx("div", {
						className: "ds-page lists-body",
						children: /* @__PURE__ */ jsx("div", {
							className: "lists-empty",
							children: /* @__PURE__ */ jsxs("div", {
								className: "ds-empty",
								style: { padding: "0" },
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "ds-empty-icon",
										children: [
											" ",
											/* @__PURE__ */ jsxs("svg", {
												width: "24",
												height: "24",
												viewBox: "0 0 24 24",
												fill: "none",
												stroke: "currentColor",
												strokeWidth: "1.75",
												"aria-hidden": "true",
												children: [
													/* @__PURE__ */ jsx("path", { d: "M12 8v5" }),
													/* @__PURE__ */ jsx("circle", {
														cx: "12",
														cy: "16",
														r: "0.75",
														fill: "currentColor"
													}),
													/* @__PURE__ */ jsx("circle", {
														cx: "12",
														cy: "12",
														r: "9"
													})
												]
											}),
											" "
										]
									}),
									" ",
									/* @__PURE__ */ jsx("b", {
										style: {
											color: "hsl(var(--foreground))",
											fontSize: "18px"
										},
										children: t("lists.error.title")
									}),
									" ",
									/* @__PURE__ */ jsx("span", { children: t("lists.error.detail") }),
									" ",
									/* @__PURE__ */ jsxs("button", {
										className: "ds-btn ds-btn-secondary",
										type: "button",
										style: { marginTop: "calc(8px * var(--space-scale, 1))" },
										onClick: onRetry,
										children: [
											" ",
											/* @__PURE__ */ jsxs("svg", {
												viewBox: "0 0 24 24",
												width: "18",
												height: "18",
												fill: "none",
												stroke: "currentColor",
												strokeWidth: "1.75",
												"aria-hidden": "true",
												children: [/* @__PURE__ */ jsx("path", { d: "M20 12a8 8 0 1 1-2.3-5.6" }), /* @__PURE__ */ jsx("path", { d: "M20 4v5h-5" })]
											}),
											" ",
											t("lists.error.retry"),
											" "
										]
									})
								]
							})
						})
					})]
				}) : null,
				situation === "loading" ? /* @__PURE__ */ jsxs("section", {
					"data-state": "loading",
					children: [head(false), /* @__PURE__ */ jsx("div", {
						className: "ds-page lists-body",
						children: /* @__PURE__ */ jsxs("div", {
							className: "list-grid",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "ds-card list-card skel-card",
									children: [
										/* @__PURE__ */ jsx("div", { className: "skel" }),
										/* @__PURE__ */ jsx("div", { className: "skel" }),
										/* @__PURE__ */ jsx("div", { className: "skel" }),
										/* @__PURE__ */ jsx("div", { className: "skel" })
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "ds-card list-card skel-card",
									children: [
										/* @__PURE__ */ jsx("div", { className: "skel" }),
										/* @__PURE__ */ jsx("div", { className: "skel" }),
										/* @__PURE__ */ jsx("div", { className: "skel" }),
										/* @__PURE__ */ jsx("div", { className: "skel" })
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "ds-card list-card skel-card",
									children: [
										/* @__PURE__ */ jsx("div", { className: "skel" }),
										/* @__PURE__ */ jsx("div", { className: "skel" }),
										/* @__PURE__ */ jsx("div", { className: "skel" }),
										/* @__PURE__ */ jsx("div", { className: "skel" })
									]
								})
							]
						})
					})]
				}) : null,
				situation === "no-lists" ? /* @__PURE__ */ jsxs("section", {
					"data-state": "no-lists",
					children: [head(false), /* @__PURE__ */ jsx("div", {
						className: "ds-page lists-body",
						children: emptyBlock(t("lists.empty.title"), t("lists.taskForm.noLists"), true)
					})]
				}) : null,
				situation === "normal" ? /* @__PURE__ */ jsxs("div", { children: [head(true), /* @__PURE__ */ jsxs("div", {
					className: "ds-page lists-body",
					children: [
						formOpen ? /* @__PURE__ */ jsx("section", {
							className: "ds-card ds-panel new-list",
							id: "make-list",
							"aria-label": t("lists.form.title"),
							children: /* @__PURE__ */ jsxs("div", {
								className: "new-list-inner",
								children: [
									/* @__PURE__ */ jsx("h2", {
										className: "ds-h2",
										style: {
											fontSize: "20px",
											margin: "0 0 calc(4px * var(--space-scale, 1))"
										},
										children: t("lists.form.title")
									}),
									/* @__PURE__ */ jsx("p", {
										className: "ds-muted",
										style: {
											margin: "0 0 calc(16px * var(--space-scale, 1))",
											fontSize: "14px"
										},
										children: t("lists.form.detail")
									}),
									/* @__PURE__ */ jsxs("form", {
										className: "ds-form",
										onSubmit: (event) => void submit(event),
										noValidate: true,
										children: [/* @__PURE__ */ jsxs("div", {
											className: "ds-field",
											children: [
												/* @__PURE__ */ jsx("label", {
													className: "ds-label",
													htmlFor: "list-name",
													children: t("lists.form.label")
												}),
												" ",
												/* @__PURE__ */ jsx("input", {
													className: "ds-input",
													id: "list-name",
													ref: nameRef,
													type: "text",
													maxLength: 60,
													value: name,
													onChange: (event) => {
														setName(event.target.value);
														setFormError(void 0);
													},
													"aria-invalid": formError ? true : void 0
												}),
												" ",
												formError ? /* @__PURE__ */ jsx("span", {
													className: "ds-error",
													role: "alert",
													children: formError
												}) : /* @__PURE__ */ jsx("span", {
													className: "ds-hint",
													children: t("lists.form.hint")
												})
											]
										}), /* @__PURE__ */ jsxs("div", {
											className: "ds-form-actions",
											children: [
												/* @__PURE__ */ jsx("button", {
													className: "ds-btn ds-btn-secondary",
													type: "button",
													onClick: cancelForm,
													children: t("lists.form.cancel")
												}),
												" ",
												/* @__PURE__ */ jsx("button", {
													className: "ds-btn",
													type: "submit",
													disabled: saving,
													children: t("lists.form.submit")
												})
											]
										})]
									})
								]
							})
						}) : null,
						!formOpen && notice?.where === "list" ? /* @__PURE__ */ jsx("div", {
							className: "ds-notice ds-notice-success",
							style: { marginBottom: "calc(16px * var(--space-scale, 1))" },
							children: notice.text
						}) : null,
						/* @__PURE__ */ jsx("div", {
							className: "list-grid lift",
							children: lists.map((list) => {
								const listTasks = tasksOfList(tasks, list.itemId);
								return /* @__PURE__ */ jsxs("article", {
									className: "ds-card list-card",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "list-card-top",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "list-titles",
												children: [/* @__PURE__ */ jsx("h2", {
													className: "list-name",
													children: list.name
												}), /* @__PURE__ */ jsx("p", {
													className: "ds-muted list-meta",
													children: t("lists.madeOn", { date: formatDate$1(list.createdDate) })
												})]
											}), /* @__PURE__ */ jsxs("details", {
												className: "ds-menu",
												open: openMenu === list.itemId,
												onToggle: (event) => setOpenMenu(event.currentTarget.open ? list.itemId : void 0),
												children: [/* @__PURE__ */ jsx("summary", {
													className: "ds-btn ds-btn-ghost ds-btn-icon",
													"aria-label": t("lists.actionsFor", { name: list.name }),
													children: /* @__PURE__ */ jsxs("svg", {
														viewBox: "0 0 24 24",
														width: "18",
														height: "18",
														fill: "none",
														stroke: "currentColor",
														strokeWidth: "1.75",
														"aria-hidden": "true",
														children: [
															/* @__PURE__ */ jsx("circle", {
																cx: "5",
																cy: "12",
																r: "1.5"
															}),
															/* @__PURE__ */ jsx("circle", {
																cx: "12",
																cy: "12",
																r: "1.5"
															}),
															/* @__PURE__ */ jsx("circle", {
																cx: "19",
																cy: "12",
																r: "1.5"
															})
														]
													})
												}), /* @__PURE__ */ jsxs("div", {
													className: "ds-menu-list",
													onPointerDown: (event) => event.stopPropagation(),
													children: [
														/* @__PURE__ */ jsx("button", {
															type: "button",
															onClick: () => void 0,
															children: t("lists.renameList")
														}),
														" ",
														/* @__PURE__ */ jsx("button", {
															type: "button",
															onClick: () => void 0,
															children: t("lists.removeList")
														})
													]
												})]
											})]
										}),
										/* @__PURE__ */ jsx("div", { className: "ds-divider" }),
										listTasks.length === 0 ? /* @__PURE__ */ jsxs("div", {
											className: "task-empty",
											children: [
												/* @__PURE__ */ jsxs("svg", {
													viewBox: "0 0 24 24",
													fill: "none",
													stroke: "currentColor",
													strokeWidth: "1.75",
													"aria-hidden": "true",
													children: [/* @__PURE__ */ jsx("path", { d: "M9 11l3 3 8-8" }), /* @__PURE__ */ jsx("path", { d: "M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" })]
												}),
												" ",
												t("lists.noTasks")
											]
										}) : /* @__PURE__ */ jsx("div", {
											className: "task-rows",
											children: listTasks.map((task) => /* @__PURE__ */ jsxs("div", {
												className: task.done ? "task task-done" : "task",
												children: [
													/* @__PURE__ */ jsx("input", {
														type: "checkbox",
														className: "ds-check",
														checked: task.done,
														"aria-label": task.done ? t("lists.taskNotDone", { name: task.name }) : t("lists.taskDone", { name: task.name }),
														onChange: () => onToggleTask(task)
													}),
													" ",
													/* @__PURE__ */ jsx("button", {
														type: "button",
														className: "task-name task-name-button",
														onClick: () => onOpenTask(task.itemId),
														children: task.name
													})
												]
											}, task.itemId))
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "list-foot",
											children: [
												/* @__PURE__ */ jsxs("button", {
													className: "ds-btn ds-btn-ghost ds-btn-sm",
													type: "button",
													onClick: () => startTask(list.itemId),
													children: [
														" ",
														/* @__PURE__ */ jsx("svg", {
															viewBox: "0 0 24 24",
															width: "16",
															height: "16",
															fill: "none",
															stroke: "currentColor",
															strokeWidth: "1.75",
															"aria-hidden": "true",
															children: /* @__PURE__ */ jsx("path", { d: "M12 5v14M5 12h14" })
														}),
														" ",
														t("lists.addTask"),
														" "
													]
												}),
												" ",
												/* @__PURE__ */ jsx("span", { className: "ds-spacer" }),
												" ",
												/* @__PURE__ */ jsx("span", {
													className: "ds-muted",
													style: { fontSize: "13px" },
													children: listTasks.length === 1 ? t("lists.taskCount.one") : t("lists.taskCount.many", { count: listTasks.length })
												})
											]
										})
									]
								}, list.itemId);
							})
						}),
						notice?.where === "task" ? /* @__PURE__ */ jsx("div", {
							className: "ds-notice ds-notice-success",
							style: { marginTop: "calc(16px * var(--space-scale, 1))" },
							children: notice.text
						}) : null
					]
				})] }) : null,
				taskFormIn ? /* @__PURE__ */ jsx("div", {
					className: "ds-modal-backdrop",
					role: "presentation",
					onMouseDown: (event) => {
						if (event.target === event.currentTarget) cancelTask();
					},
					children: /* @__PURE__ */ jsxs("div", {
						className: "ds-card ds-modal",
						role: "dialog",
						"aria-modal": "true",
						"aria-labelledby": "add-task-title",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "ds-h2",
								id: "add-task-title",
								children: t("lists.taskForm.title")
							}),
							/* @__PURE__ */ jsx("p", {
								className: "ds-muted",
								style: {
									margin: "calc(4px * var(--space-scale, 1)) 0 calc(16px * var(--space-scale, 1))",
									fontSize: "14px"
								},
								children: t("lists.taskForm.detail")
							}),
							/* @__PURE__ */ jsxs("form", {
								className: "ds-form",
								onSubmit: (event) => void submitTask(event),
								noValidate: true,
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "ds-field",
										children: [
											/* @__PURE__ */ jsx("label", {
												className: "ds-label",
												htmlFor: "task-name",
												children: t("lists.taskForm.label")
											}),
											" ",
											/* @__PURE__ */ jsx("input", {
												className: "ds-input",
												id: "task-name",
												ref: taskRef,
												type: "text",
												maxLength: 200,
												value: taskName,
												onChange: (event) => {
													setTaskName(event.target.value);
													setTaskError(void 0);
												},
												"aria-invalid": taskError ? true : void 0
											}),
											" ",
											taskError ? /* @__PURE__ */ jsx("span", {
												className: "ds-error",
												role: "alert",
												children: taskError
											}) : /* @__PURE__ */ jsx("span", {
												className: "ds-hint",
												children: t("lists.taskForm.nameHint")
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "ds-field",
										children: [
											/* @__PURE__ */ jsx("label", {
												className: "ds-label",
												htmlFor: "task-form-list",
												children: t("lists.taskForm.listLabel")
											}),
											" ",
											/* @__PURE__ */ jsx("select", {
												className: "ds-select",
												id: "task-form-list",
												value: taskFormList,
												onChange: (event) => {
													setTaskFormList(event.target.value);
													setTaskError(void 0);
												},
												children: lists.map((list) => /* @__PURE__ */ jsx("option", {
													value: list.itemId,
													children: list.name
												}, list.itemId))
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "ds-form-actions",
										children: [
											/* @__PURE__ */ jsx("button", {
												className: "ds-btn ds-btn-secondary",
												type: "button",
												onClick: cancelTask,
												children: t("lists.taskForm.cancel")
											}),
											" ",
											/* @__PURE__ */ jsx("button", {
												className: "ds-btn",
												type: "submit",
												disabled: savingTask,
												children: t("lists.taskForm.submit")
											})
										]
									})
								]
							})
						]
					})
				}) : null
			]
		})
	});
}
function formatDate$1(value) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat(void 0, {
		day: "numeric",
		month: "long",
		year: "numeric"
	}).format(date);
}
// src/features/lists/ListsPage.tsx
function ListsPage({ onNavigate }) {
	const { t } = useT();
	const { logout } = useAuth();
	const queryClient = useQueryClient();
	const me = useCurrentUser();
	const listsQuery = useQuery({
		queryFn: fetchLists,
		queryKey: ["lists"]
	});
	const tasksQuery = useQuery({
		queryFn: fetchTasks,
		queryKey: ["tasks"]
	});
	const [notice, setNotice] = useState();
	const profile = me.data?.data;
	const person = {
		initials: userInitials(profile),
		name: profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || profile.email || "" : "",
		role: t("header.signedIn")
	};
	const listsAnswer = listsQuery.data;
	const tasksAnswer = tasksQuery.data;
	const lists = listsAnswer?.ok ? listsAnswer.items : [];
	const tasks = tasksAnswer?.ok ? tasksAnswer.items : [];
	const loading = listsQuery.isLoading || tasksQuery.isLoading;
	const failed = listsAnswer?.ok === false || tasksAnswer?.ok === false;
	const situation = loading ? "loading" : failed ? "error" : lists.length === 0 ? "no-lists" : "normal";
	function refresh() {
		queryClient.invalidateQueries({ queryKey: ["lists"] });
		queryClient.invalidateQueries({ queryKey: ["tasks"] });
	}
	async function makeList(name) {
		setNotice(void 0);
		const trimmed = name.trim();
		if (lists.some((list) => list.name.trim().toLowerCase() === trimmed.toLowerCase())) return t("lists.form.duplicate");
		if (lists.length >= 50) return t("lists.form.limit");
		try {
			if (!(await createList(trimmed)).ok) return t("lists.form.failed");
			refresh();
			setNotice({
				text: t("lists.form.saved"),
				where: "list"
			});
			return;
		} catch (caught) {
			console.error("The list couldn't be saved:", caught);
			return t("lists.form.failed");
		}
	}
	async function addTask(listId, name) {
		setNotice(void 0);
		if (tasks.length >= 500) return t("lists.taskForm.limit");
		try {
			if (!(await createTask(name.trim(), listId)).ok) return t("lists.taskForm.failed");
			const listName = lists.find((list) => list.itemId === listId)?.name ?? "";
			refresh();
			setNotice({
				text: t("lists.taskForm.saved", { list: listName }),
				where: "task"
			});
			return;
		} catch (caught) {
			console.error("The task couldn't be saved:", caught);
			return t("lists.taskForm.failed");
		}
	}
	async function toggleTask(task) {
		setNotice(void 0);
		try {
			if (!(await updateTask(task.itemId, { done: !task.done })).ok) {
				setNotice({
					text: t("lists.taskToggle.failed"),
					where: "task"
				});
				return;
			}
			refresh();
		} catch (caught) {
			console.error("The change didn't save:", caught);
			setNotice({
				text: t("lists.taskToggle.failed"),
				where: "task"
			});
		}
	}
	return /* @__PURE__ */ jsx(ListsScreen, {
		lists,
		notice,
		onAddTask: addTask,
		onMakeList: makeList,
		onNavigate,
		onOpenTask: (id) => onNavigate(`/tasks/${id}`),
		onRetry: () => {
			listsQuery.refetch();
			tasksQuery.refetch();
		},
		onSignOut: () => void logout(),
		onToggleTask: (task) => void toggleTask(task),
		person,
		situation,
		tasks
	});
}
// src/features/auth/signup.ts
/** Whether the project lets people make their own account, read without a session. */
function useSignUpEnabled() {
	const [enabled, setEnabled] = useState(false);
	useEffect(() => {
		let live = true;
		blocksClient.iam.signupSettings.get().then((answer) => {
			if (!live) return;
			setEnabled(Boolean(answer?.isSignUpEnable ?? answer?.isEmailPasswordSignUpEnabled));
		}).catch(() => void 0);
		return () => {
			live = false;
		};
	}, []);
	return enabled;
}
// src/features/welcome/WelcomeScreen.tsx
function WelcomeScreen({ error, onNavigate, onSignIn, signingIn, signUpEnabled = false }) {
	const { t } = useT();
	const goTo = (path) => (event) => {
		if (!onNavigate) return;
		event.preventDefault();
		onNavigate(path);
	};
	return /* @__PURE__ */ jsx("div", {
		className: "studio-screen-welcome",
		style: { display: "contents" },
		children: /* @__PURE__ */ jsxs("main", {
			"data-screen": "welcome",
			children: [/* @__PURE__ */ jsx("div", {
				className: "wc-bar",
				children: /* @__PURE__ */ jsxs("div", {
					className: "ds-bar",
					children: [/* @__PURE__ */ jsxs("a", {
						href: "/",
						className: "wc-brand",
						"data-goto": "welcome",
						"aria-label": t("welcome.home"),
						onClick: goTo("/"),
						children: [
							" ",
							/* @__PURE__ */ jsxs("span", {
								className: "wc-mark",
								"aria-hidden": "true",
								children: [
									" ",
									/* @__PURE__ */ jsx("svg", {
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "2.1",
										children: /* @__PURE__ */ jsx("path", { d: "M5 13l4 4 10-10" })
									}),
									" "
								]
							}),
							" ",
							t("welcome.brand"),
							" "
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "wc-bar-actions",
						children: [/* @__PURE__ */ jsx(ThemeSwitch, {}), /* @__PURE__ */ jsx(LanguageSwitch, { className: "wc-lang" })]
					})]
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "wc-wrap",
				children: /* @__PURE__ */ jsx("div", {
					className: "ds-page",
					children: /* @__PURE__ */ jsxs("div", {
						className: "wc-hero",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "ds-deco wc-deco-ring",
								"aria-hidden": "true"
							}),
							" ",
							/* @__PURE__ */ jsx("span", {
								className: "ds-deco wc-deco-dot",
								"aria-hidden": "true"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "wc-copy",
								children: [
									/* @__PURE__ */ jsxs("h1", {
										className: "wc-title",
										children: [
											t("welcome.title.a"),
											/* @__PURE__ */ jsx("br", {}),
											/* @__PURE__ */ jsx("em", { children: t("welcome.title.b") })
										]
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "wc-lede",
										children: [
											/* @__PURE__ */ jsx("b", { children: t("welcome.lede.b") }),
											" ",
											t("welcome.lede.rest")
										]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "wc-cta",
										children: /* @__PURE__ */ jsx("button", {
											className: "ds-btn ds-btn-lg",
											type: "button",
											disabled: signingIn,
											onClick: onSignIn,
											children: signUpEnabled ? t("welcome.signIn") : t("welcome.signInOnly")
										})
									}),
									error ? /* @__PURE__ */ jsx("p", {
										className: "ds-error",
										role: "alert",
										style: { margin: "calc(12px * var(--space-scale, 1)) 0 0" },
										children: error
									}) : null,
									/* @__PURE__ */ jsx("p", {
										className: "wc-hint",
										children: signUpEnabled ? t("welcome.note") : t("welcome.noteSignInOnly")
									}),
									/* @__PURE__ */ jsxs("ul", {
										className: "wc-steps",
										children: [
											/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("span", {
												className: "wc-step-dot",
												"aria-hidden": "true",
												children: /* @__PURE__ */ jsx("svg", {
													viewBox: "0 0 24 24",
													fill: "none",
													stroke: "currentColor",
													strokeWidth: "2",
													children: /* @__PURE__ */ jsx("path", { d: "M4 7h16M4 12h16M4 17h10" })
												})
											}), t("welcome.step.list")] }),
											/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("span", {
												className: "wc-step-dot",
												"aria-hidden": "true",
												children: /* @__PURE__ */ jsx("svg", {
													viewBox: "0 0 24 24",
													fill: "none",
													stroke: "currentColor",
													strokeWidth: "2",
													children: /* @__PURE__ */ jsx("path", { d: "M12 5v14M5 12h14" })
												})
											}), t("welcome.step.add")] }),
											/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("span", {
												className: "wc-step-dot",
												"aria-hidden": "true",
												children: /* @__PURE__ */ jsx("svg", {
													viewBox: "0 0 24 24",
													fill: "none",
													stroke: "currentColor",
													strokeWidth: "2",
													children: /* @__PURE__ */ jsx("path", { d: "M5 13l4 4 10-10" })
												})
											}), t("welcome.step.tick")] })
										]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "wc-art",
								"aria-hidden": "true",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "wc-art-head",
										children: [
											/* @__PURE__ */ jsxs("span", {
												className: "wc-list-title",
												children: [
													" ",
													/* @__PURE__ */ jsx("svg", {
														viewBox: "0 0 24 24",
														fill: "none",
														stroke: "currentColor",
														strokeWidth: "1.75",
														children: /* @__PURE__ */ jsx("path", { d: "M4 6h16M4 12h16M4 18h10" })
													}),
													" ",
													/* @__PURE__ */ jsx("span", { children: t("welcome.preview.list") }),
													" "
												]
											}),
											" ",
											/* @__PURE__ */ jsx("span", {
												className: "ds-badge ds-badge-quiet",
												children: t("welcome.preview.badge")
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "wc-tasks",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "wc-task",
												children: [
													/* @__PURE__ */ jsx("span", { className: "wc-box" }),
													" ",
													/* @__PURE__ */ jsx("span", {
														className: "wc-task-name",
														children: t("welcome.preview.task1")
													})
												]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "wc-task",
												children: [
													/* @__PURE__ */ jsx("span", { className: "wc-box" }),
													" ",
													/* @__PURE__ */ jsx("span", {
														className: "wc-task-name",
														children: t("welcome.preview.task2")
													})
												]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "wc-task wc-task-done",
												children: [
													/* @__PURE__ */ jsx("span", {
														className: "wc-box",
														children: /* @__PURE__ */ jsx("svg", {
															viewBox: "0 0 24 24",
															fill: "none",
															stroke: "currentColor",
															strokeWidth: "2.5",
															children: /* @__PURE__ */ jsx("path", { d: "M5 13l4 4 10-10" })
														})
													}),
													" ",
													/* @__PURE__ */ jsx("span", {
														className: "wc-task-name",
														children: t("welcome.preview.task3")
													})
												]
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "wc-art-foot",
										children: [
											/* @__PURE__ */ jsxs("svg", {
												viewBox: "0 0 24 24",
												fill: "none",
												stroke: "currentColor",
												strokeWidth: "1.75",
												width: "14",
												height: "14",
												children: [/* @__PURE__ */ jsx("path", { d: "M12 6v6l4 2" }), /* @__PURE__ */ jsx("circle", {
													cx: "12",
													cy: "12",
													r: "9"
												})]
											}),
											" ",
											/* @__PURE__ */ jsx("span", { children: t("welcome.artFoot") })
										]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "wc-note",
								children: [
									/* @__PURE__ */ jsxs("svg", {
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "1.75",
										"aria-hidden": "true",
										children: [/* @__PURE__ */ jsx("circle", {
											cx: "12",
											cy: "12",
											r: "9"
										}), /* @__PURE__ */ jsx("path", { d: "M12 8h.01M11 12h1v4h1" })]
									}),
									" ",
									/* @__PURE__ */ jsx("span", { children: t("welcome.note") })
								]
							})
						]
					})
				})
			})]
		})
	});
}
// src/features/welcome/WelcomePage.tsx
function WelcomePage({ onNavigate }) {
	const { login } = useAuth();
	const { t } = useT();
	const signUpEnabled = useSignUpEnabled();
	const [signingIn, setSigningIn] = useState(false);
	const [error, setError] = useState();
	async function handleSignIn() {
		setError(void 0);
		setSigningIn(true);
		try {
			await login("/lists");
		} catch (caught) {
			console.error("Sign-in could not be opened:", caught);
			setError(t("welcome.signInFailed"));
			setSigningIn(false);
		}
	}
	return /* @__PURE__ */ jsx(WelcomeScreen, {
		error,
		onNavigate,
		onSignIn: () => void handleSignIn(),
		signingIn,
		signUpEnabled
	});
}
// src/features/task/TaskScreen.tsx
function TaskScreen({ situation = "normal", onNavigate, person, onSignOut, task, lists, listName, errorMessage, onRetry, onToggle, onEdit }) {
	const { t } = useT();
	const [draft, setDraft] = useState({
		list: "",
		name: ""
	});
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState();
	const [savedIn, setSavedIn] = useState();
	const editedRef = useRef(false);
	useEffect(() => {
		setDraft({
			list: task?.list ?? "",
			name: task?.name ?? ""
		});
		if (!editedRef.current) setFormError(void 0);
	}, [task]);
	const goTo = (path) => (event) => {
		if (!onNavigate) return;
		event.preventDefault();
		onNavigate(path);
	};
	async function submit(event) {
		event.preventDefault();
		const trimmed = draft.name.trim();
		setFormError(void 0);
		if (!trimmed) {
			setFormError(t("task.nameRequired"));
			return;
		}
		if (trimmed.length > 200) {
			setFormError(t("task.nameTooLong"));
			return;
		}
		setSaving(true);
		const reason = await onEdit({
			name: trimmed,
			list: draft.list
		});
		setSaving(false);
		editedRef.current = true;
		if (reason) {
			setSavedIn(void 0);
			setFormError(reason);
			return;
		}
		setSavedIn(lists.find((list) => list.itemId === draft.list)?.name ?? "");
	}
	const name = draft.name || task?.name || "";
	const statusBadge = task?.done ? /* @__PURE__ */ jsxs("span", {
		className: "ds-badge ds-badge-success",
		children: [/* @__PURE__ */ jsx("span", { className: "ds-badge-dot" }), t("task.done")]
	}) : /* @__PURE__ */ jsxs("span", {
		className: "ds-badge ds-badge-warning",
		children: [/* @__PURE__ */ jsx("span", { className: "ds-badge-dot" }), t("task.notDone")]
	});
	const listPicker = (id) => /* @__PURE__ */ jsx("select", {
		className: "ds-select",
		id,
		value: draft.list,
		onChange: (event) => setDraft({
			...draft,
			list: event.target.value
		}),
		children: lists.map((list) => /* @__PURE__ */ jsx("option", {
			value: list.itemId,
			children: list.name
		}, list.itemId))
	});
	const facts = /* @__PURE__ */ jsxs("dl", {
		className: "tk-facts",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", { children: t("task.status") }), /* @__PURE__ */ jsx("dd", { children: statusBadge })] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", { children: t("task.list") }), /* @__PURE__ */ jsx("dd", { children: listName })] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", { children: t("task.added") }), /* @__PURE__ */ jsx("dd", { children: formatDate(task?.createdDate) })] })
		]
	});
	const editForm = (idSuffix) => /* @__PURE__ */ jsxs("form", {
		className: "ds-form",
		style: { marginTop: "calc(24px * var(--space-scale, 1))" },
		onSubmit: (event) => void submit(event),
		noValidate: true,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "ds-field",
				children: [
					/* @__PURE__ */ jsx("label", {
						className: "ds-label",
						htmlFor: `task-name${idSuffix}`,
						children: t("task.nameLabel")
					}),
					" ",
					/* @__PURE__ */ jsx("input", {
						className: "ds-input",
						id: `task-name${idSuffix}`,
						type: "text",
						maxLength: 200,
						value: draft.name,
						onChange: (event) => {
							setDraft({
								...draft,
								name: event.target.value
							});
							setFormError(void 0);
						},
						"aria-invalid": formError ? true : void 0
					}),
					" ",
					formError ? /* @__PURE__ */ jsx("span", {
						className: "ds-error",
						role: "alert",
						children: formError
					}) : null,
					formError ? null : /* @__PURE__ */ jsx("span", {
						className: "ds-hint",
						children: t("task.nameHint")
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ds-field",
				children: [/* @__PURE__ */ jsx("label", {
					className: "ds-label",
					htmlFor: `task-list${idSuffix}`,
					children: t("task.listLabel")
				}), listPicker(`task-list${idSuffix}`)]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ds-form-actions",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "ds-btn ds-btn-secondary",
						onClick: goTo("/lists"),
						children: t("task.cancel")
					}),
					" ",
					/* @__PURE__ */ jsx("button", {
						type: "submit",
						className: "ds-btn",
						disabled: saving,
						children: t("task.edit")
					})
				]
			})
		]
	});
	return /* @__PURE__ */ jsx("div", {
		className: "studio-screen-task",
		style: { display: "contents" },
		children: /* @__PURE__ */ jsxs("main", {
			"data-screen": "task",
			children: [
				/* @__PURE__ */ jsx(HeaderPart, {
					onNavigate,
					onSignOut,
					person
				}),
				situation === "not-allowed" ? /* @__PURE__ */ jsx("section", {
					"data-state": "not-allowed",
					children: /* @__PURE__ */ jsxs("div", {
						className: "ds-page tk-wrap",
						children: [/* @__PURE__ */ jsx("div", {
							className: "ds-page-head tk-head",
							children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "ds-eyebrow",
								children: t("task.eyebrow")
							}), /* @__PURE__ */ jsx("h1", {
								className: "ds-h1",
								children: t("task.notYours")
							})] })
						}), /* @__PURE__ */ jsx("div", {
							className: "ds-card",
							style: { padding: "calc(32px * var(--space-scale, 1))" },
							children: /* @__PURE__ */ jsxs("div", {
								className: "ds-empty",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "ds-empty-icon",
										children: [
											" ",
											/* @__PURE__ */ jsxs("svg", {
												width: "20",
												height: "20",
												viewBox: "0 0 24 24",
												fill: "none",
												stroke: "currentColor",
												strokeWidth: "1.75",
												children: [/* @__PURE__ */ jsx("rect", {
													x: "4",
													y: "11",
													width: "16",
													height: "9",
													rx: "2"
												}), /* @__PURE__ */ jsx("path", { d: "M8 11V8a4 4 0 0 1 8 0v3" })]
											}),
											" "
										]
									}),
									" ",
									/* @__PURE__ */ jsx("b", {
										style: { color: "hsl(var(--foreground))" },
										children: t("task.notYours")
									}),
									" ",
									/* @__PURE__ */ jsx("span", { children: t("task.notYoursDetail") }),
									" ",
									/* @__PURE__ */ jsx("button", {
										type: "button",
										className: "ds-btn ds-btn-sm",
										style: { marginTop: "8px" },
										onClick: goTo("/lists"),
										children: t("task.back")
									})
								]
							})
						})]
					})
				}) : null,
				situation === "done" ? /* @__PURE__ */ jsx("section", {
					"data-state": "done",
					children: /* @__PURE__ */ jsxs("div", {
						className: "ds-page tk-wrap",
						children: [
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								className: "ds-btn ds-btn-ghost ds-btn-sm tk-crumb",
								onClick: goTo("/lists"),
								children: [
									" ",
									/* @__PURE__ */ jsx("svg", {
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "1.75",
										children: /* @__PURE__ */ jsx("path", { d: "M19 12H5M12 19l-7-7 7-7" })
									}),
									" ",
									t("task.back"),
									" "
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "ds-page-head tk-head",
								children: /* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("span", {
										className: "ds-eyebrow",
										children: t("task.eyebrow")
									}),
									/* @__PURE__ */ jsx("h1", {
										className: "ds-h1",
										children: name
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "tk-head-meta",
										children: [
											/* @__PURE__ */ jsx("span", { children: t("task.in") }),
											" ",
											/* @__PURE__ */ jsxs("a", {
												href: "/lists",
												className: "tk-in-list",
												"data-goto": "lists",
												onClick: goTo("/lists"),
												children: [
													" ",
													/* @__PURE__ */ jsx("svg", {
														viewBox: "0 0 24 24",
														fill: "none",
														stroke: "currentColor",
														strokeWidth: "1.75",
														children: /* @__PURE__ */ jsx("path", { d: "M4 6h16M4 12h16M4 18h10" })
													}),
													" ",
													/* @__PURE__ */ jsx("span", { children: listName }),
													" "
												]
											}),
											" ",
											statusBadge
										]
									})
								] })
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "tk-body",
								children: [/* @__PURE__ */ jsxs("div", { children: [savedIn ? /* @__PURE__ */ jsx("div", {
									className: "ds-notice ds-notice-success",
									role: "status",
									children: t("task.editSaved", { list: savedIn })
								}) : null, /* @__PURE__ */ jsxs("div", {
									className: "tk-main",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "tk-status-band",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", { children: t("task.statusDone") }), /* @__PURE__ */ jsx("p", { children: t("task.statusDoneDetail") })] }), /* @__PURE__ */ jsx("button", {
											type: "button",
											className: "ds-btn ds-btn-secondary tk-toggle",
											onClick: onToggle,
											children: t("task.markNotDone")
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "tk-section",
										children: [/* @__PURE__ */ jsx("h2", {
											className: "ds-h2",
											children: t("task.nameAndList")
										}), editForm("-done")]
									})]
								})] }), /* @__PURE__ */ jsxs("aside", {
									className: "tk-side",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "ds-card",
										children: [/* @__PURE__ */ jsx("h3", { children: t("task.details") }), facts]
									}), /* @__PURE__ */ jsxs("div", {
										className: "ds-card",
										children: [
											/* @__PURE__ */ jsx("h3", { children: t("task.whatNext") }),
											/* @__PURE__ */ jsxs("div", {
												className: "tk-next",
												children: [
													/* @__PURE__ */ jsx("svg", {
														width: "18",
														height: "18",
														viewBox: "0 0 24 24",
														fill: "none",
														stroke: "currentColor",
														strokeWidth: "1.75",
														style: {
															flex: "none",
															marginTop: "2px",
															color: "hsl(var(--primary-text))"
														},
														children: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" })
													}),
													" ",
													/* @__PURE__ */ jsx("span", { children: t("task.nextDone") })
												]
											}),
											/* @__PURE__ */ jsx("div", {
												style: { marginTop: "calc(16px * var(--space-scale, 1))" },
												children: /* @__PURE__ */ jsx("button", {
													type: "button",
													className: "ds-btn ds-btn-secondary",
													style: { width: "100%" },
													onClick: goTo("/lists"),
													children: t("task.back")
												})
											})
										]
									})]
								})]
							})
						]
					})
				}) : null,
				situation === "normal" ? /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
					className: "ds-page tk-wrap",
					children: [
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							className: "ds-btn ds-btn-ghost ds-btn-sm tk-crumb",
							onClick: goTo("/lists"),
							children: [
								" ",
								/* @__PURE__ */ jsx("svg", {
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.75",
									children: /* @__PURE__ */ jsx("path", { d: "M19 12H5M12 19l-7-7 7-7" })
								}),
								" ",
								t("task.back"),
								" "
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "ds-page-head tk-head",
							children: /* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("span", {
									className: "ds-eyebrow",
									children: t("task.eyebrow")
								}),
								/* @__PURE__ */ jsx("h1", {
									className: "ds-h1",
									children: name
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "tk-head-meta",
									children: [
										/* @__PURE__ */ jsx("span", { children: t("task.in") }),
										" ",
										/* @__PURE__ */ jsxs("a", {
											href: "/lists",
											className: "tk-in-list",
											"data-goto": "lists",
											onClick: goTo("/lists"),
											children: [
												" ",
												/* @__PURE__ */ jsx("svg", {
													viewBox: "0 0 24 24",
													fill: "none",
													stroke: "currentColor",
													strokeWidth: "1.75",
													children: /* @__PURE__ */ jsx("path", { d: "M4 6h16M4 12h16M4 18h10" })
												}),
												" ",
												/* @__PURE__ */ jsx("span", { children: listName }),
												" "
											]
										}),
										" ",
										statusBadge
									]
								})
							] })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "tk-body",
							children: [/* @__PURE__ */ jsxs("div", { children: [savedIn ? /* @__PURE__ */ jsx("div", {
								className: "ds-notice ds-notice-success",
								role: "status",
								children: t("task.editSaved", { list: savedIn })
							}) : null, /* @__PURE__ */ jsxs("div", {
								className: "tk-main",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "tk-status-band",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", { children: t("task.statusNotDone") }), /* @__PURE__ */ jsx("p", { children: t("task.statusNotDoneDetail") })] }), /* @__PURE__ */ jsxs("button", {
										type: "button",
										className: "ds-btn tk-toggle",
										onClick: onToggle,
										children: [
											" ",
											/* @__PURE__ */ jsx("svg", {
												viewBox: "0 0 24 24",
												fill: "none",
												stroke: "currentColor",
												strokeWidth: "1.75",
												children: /* @__PURE__ */ jsx("path", { d: "m5 13 4 4L19 7" })
											}),
											" ",
											t("task.markDone"),
											" "
										]
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "tk-section",
									children: [
										/* @__PURE__ */ jsx("h2", {
											className: "ds-h2",
											children: t("task.nameAndList")
										}),
										/* @__PURE__ */ jsx("p", {
											className: "tk-hint-row",
											children: t("task.hint")
										}),
										editForm("")
									]
								})]
							})] }), /* @__PURE__ */ jsxs("aside", {
								className: "tk-side",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "ds-card",
									children: [/* @__PURE__ */ jsx("h3", { children: t("task.details") }), facts]
								}), /* @__PURE__ */ jsxs("div", {
									className: "ds-card",
									children: [
										/* @__PURE__ */ jsx("h3", { children: t("task.whatNext") }),
										/* @__PURE__ */ jsxs("div", {
											className: "tk-next",
											children: [
												/* @__PURE__ */ jsxs("svg", {
													width: "18",
													height: "18",
													viewBox: "0 0 24 24",
													fill: "none",
													stroke: "currentColor",
													strokeWidth: "1.75",
													style: {
														flex: "none",
														marginTop: "2px",
														color: "hsl(var(--primary-text))"
													},
													children: [
														/* @__PURE__ */ jsx("path", { d: "M9 18V6l12-2v12" }),
														/* @__PURE__ */ jsx("circle", {
															cx: "6",
															cy: "18",
															r: "3"
														}),
														/* @__PURE__ */ jsx("circle", {
															cx: "18",
															cy: "16",
															r: "3"
														})
													]
												}),
												" ",
												/* @__PURE__ */ jsx("span", { children: t("task.nextNotDone") })
											]
										}),
										/* @__PURE__ */ jsx("div", {
											style: { marginTop: "calc(16px * var(--space-scale, 1))" },
											children: /* @__PURE__ */ jsx("button", {
												type: "button",
												className: "ds-btn ds-btn-secondary",
												style: { width: "100%" },
												onClick: goTo("/lists"),
												children: t("task.back")
											})
										})
									]
								})]
							})]
						})
					]
				}) }) : null,
				errorMessage ? /* @__PURE__ */ jsx("div", {
					className: "ds-page",
					style: { paddingTop: "calc(16px * var(--space-scale, 1))" },
					children: /* @__PURE__ */ jsxs("div", {
						className: "ds-notice ds-notice-danger",
						role: "alert",
						children: [
							/* @__PURE__ */ jsx("span", { children: errorMessage }),
							" ",
							/* @__PURE__ */ jsx("button", {
								type: "button",
								className: "ds-btn ds-btn-sm ds-btn-secondary",
								style: { marginLeft: "auto" },
								onClick: onRetry,
								children: t("task.retry")
							})
						]
					})
				}) : null
			]
		})
	});
}
function formatDate(value) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat(void 0, {
		day: "numeric",
		month: "short",
		year: "numeric"
	}).format(date);
}
// src/features/task/TaskPage.tsx
function TaskPage({ taskId, onNavigate }) {
	const { t } = useT();
	const { logout } = useAuth();
	const queryClient = useQueryClient();
	const me = useCurrentUser();
	const [errorMessage, setErrorMessage] = useState();
	const taskQuery = useQuery({
		queryFn: () => fetchTask(taskId),
		queryKey: ["task", taskId]
	});
	const listsQuery = useQuery({
		queryFn: fetchLists,
		queryKey: ["lists"]
	});
	const task = taskQuery.data ?? void 0;
	const lists = listsQuery.data?.ok ? listsQuery.data.items : [];
	const profile = me.data?.data;
	const person = {
		initials: userInitials(profile),
		name: profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || profile.email || "" : "",
		role: t("header.signedIn")
	};
	const listName = lists.find((list) => list.itemId === task?.list)?.name ?? "";
	const loading = taskQuery.isLoading || listsQuery.isLoading;
	const failed = taskQuery.isError || listsQuery.data?.ok === false;
	const situation = loading ? "normal" : failed ? "error" : !loading && !failed && !task ? "not-allowed" : task?.done ? "done" : "normal";
	function refresh() {
		queryClient.invalidateQueries({ queryKey: ["task", taskId] });
		queryClient.invalidateQueries({ queryKey: ["tasks"] });
	}
	async function edit(draft) {
		setErrorMessage(void 0);
		try {
			if (!(await updateTask(taskId, {
				list: draft.list,
				name: draft.name.trim()
			})).ok) return t("task.saveFailed");
			refresh();
			return;
		} catch (caught) {
			console.error("The task couldn't be saved:", caught);
			return t("task.saveFailed");
		}
	}
	async function toggle() {
		if (!task) return;
		setErrorMessage(void 0);
		try {
			if (!(await updateTask(taskId, { done: !task.done })).ok) {
				setErrorMessage(t("task.toggleFailed"));
				return;
			}
			refresh();
		} catch (caught) {
			console.error("The change didn't save:", caught);
			setErrorMessage(t("task.toggleFailed"));
		}
	}
	return /* @__PURE__ */ jsx(TaskScreen, {
		errorMessage,
		listName,
		lists,
		onEdit: edit,
		onNavigate,
		onRetry: () => {
			setErrorMessage(void 0);
			taskQuery.refetch();
			listsQuery.refetch();
		},
		onSignOut: () => void logout(),
		onToggle: () => void toggle(),
		person,
		situation,
		task
	});
}
// src/app/router/routes.tsx
function AppRouter() {
	const [path, setPath] = useState(() => window.location.pathname);
	const [search, setSearch] = useState(() => window.location.search);
	useEffect(() => {
		const onPopState = () => {
			setPath(window.location.pathname);
			setSearch(window.location.search);
		};
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);
	function navigate(nextPath) {
		const [nextPathname = "/", queryString = ""] = nextPath.split("?");
		window.history.pushState({}, "", nextPath);
		setPath(nextPathname);
		setSearch(queryString ? `?${queryString}` : "");
	}
	if (path === "/login/callback") return /* @__PURE__ */ jsx(CallbackPage, { onNavigate: navigate });
	if (path === "/login") return /* @__PURE__ */ jsx(RedirectIfAuthenticated, {
		onNavigate: navigate,
		children: /* @__PURE__ */ jsx(WelcomePage, { onNavigate: navigate })
	});
	if (path === "/error") return /* @__PURE__ */ jsx(ErrorPage, {});
	if (path === "/") return /* @__PURE__ */ jsx(RedirectIfAuthenticated, {
		onNavigate: navigate,
		children: /* @__PURE__ */ jsx(WelcomePage, { onNavigate: navigate })
	});
	const taskMatch = path.match(/^\/tasks\/([^/]+)$/);
	if (taskMatch) return /* @__PURE__ */ jsx(RequireAuth, {
		currentPath: path,
		onNavigate: navigate,
		children: /* @__PURE__ */ jsx(TaskPage, {
			taskId: decodeURIComponent(taskMatch[1] ?? ""),
			onNavigate: navigate
		})
	});
	if (path === "/lists") return /* @__PURE__ */ jsx(RequireAuth, {
		currentPath: path,
		onNavigate: navigate,
		children: /* @__PURE__ */ jsx(ListsPage, { onNavigate: navigate })
	});
	return /* @__PURE__ */ jsx(NotFoundPage, { onNavigate: navigate });
}
// src/app/App.tsx
function App() {
	return /* @__PURE__ */ jsx(AppProviders, { children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(AppRouter, {}) }) });
}
export { App };
