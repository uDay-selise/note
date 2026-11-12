import { createRequire } from "node:module";
const require = createRequire("/workspace/package.json");
const { JSDOM } = require("jsdom");

export const state = {
  lists: [],
  tasks: [],
  nextListId: 1,
  nextTaskId: 1,
  sent: [],
  failSaves: false
};

export function installFetch() {
  globalThis.fetch = async (url, init) => {
    const href = String(url);
    const body = init?.body ? String(init.body) : "";
    state.sent.push(body);
    const answer = (p, s = 200) => new Response(JSON.stringify(p), { status: s, headers: { "content-type": "application/json" } });
    const input = () => { try { return JSON.parse(body).variables?.input ?? {}; } catch { return {}; } };
    const filter = () => { try { return JSON.parse(JSON.parse(body).variables?.filter ?? "{}"); } catch { return {}; } };
    if (/signup-settings/.test(href)) return answer({ isSignUpEnable: true, isEmailPasswordSignUpEnabled: true });
    if (/iam\/me|auth\/me/.test(href)) return answer({ itemId: "u1", firstName: "Priya", lastName: "Shah", email: "p@somewhere.test", roles: [], permissions: [] });
    if (body.includes("getLists")) return answer({ data: { getLists: { items: state.lists.map((l) => ({ ItemId: l.ItemId, name: l.name, CreatedDate: l.CreatedDate })) } } });
    if (body.includes("getTasks")) {
      const wanted = filter();
      return answer({ data: { getTasks: { items: state.tasks.filter((t) => !wanted.ItemId || wanted.ItemId === t.ItemId).map((t) => ({ ItemId: t.ItemId, name: t.name, list: t.list, done: t.done, CreatedDate: t.CreatedDate })) } } });
    }
    if (body.includes("insertList")) {
      const list = { ItemId: "l" + state.nextListId++, name: input().name, CreatedDate: new Date().toISOString() };
      state.lists = [list, ...state.lists];
      return answer({ data: { insertList: { acknowledged: true, itemId: list.ItemId, message: null } } });
    }
    if (body.includes("updateList")) {
      if (state.failSaves) return answer({ data: { updateList: null }, errors: [{ message: "Refused." }] });
      const target = filter().ItemId;
      state.lists = state.lists.map((l) => (l.ItemId === target ? { ...l, ...input() } : l));
      return answer({ data: { updateList: { acknowledged: true, itemId: target, message: null } } });
    }
    if (body.includes("deleteList")) {
      if (state.failSaves) return answer({ data: { deleteList: null }, errors: [{ message: "Refused." }] });
      const target = filter().ItemId;
      state.lists = state.lists.filter((l) => l.ItemId !== target);
      return answer({ data: { deleteList: { acknowledged: true, itemId: target, message: null } } });
    }
    if (body.includes("deleteTask")) {
      const target = filter().ItemId;
      state.tasks = state.tasks.filter((t) => t.ItemId !== target);
      return answer({ data: { deleteTask: { acknowledged: true, itemId: target, message: null } } });
    }
    if (body.includes("insertTask")) {
      const task = { ItemId: "t" + state.nextTaskId++, name: input().name, list: input().list, done: Boolean(input().done), CreatedDate: new Date().toISOString() };
      state.tasks = [...state.tasks, task];
      return answer({ data: { insertTask: { acknowledged: true, itemId: task.ItemId, message: null } } });
    }
    if (body.includes("updateTask")) {
      const target = filter().ItemId;
      state.tasks = state.tasks.map((t) => (t.ItemId === target ? { ...t, ...input() } : t));
      return answer({ data: { updateTask: { acknowledged: true, itemId: target, message: null } } });
    }
    return answer({ data: {} });
  };
}

export function makeEnv(startPath) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://app.test" + startPath, pretendToBeVisual: true });
  for (const key of ["window", "document", "navigator", "localStorage", "sessionStorage", "HTMLElement", "HTMLInputElement", "HTMLSelectElement", "HTMLButtonElement", "Event", "MouseEvent", "Node"]) delete globalThis[key];
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
  globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
  globalThis.Event = dom.window.Event;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.Node = dom.window.Node;
  Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
  globalThis.localStorage = dom.window.localStorage;
  globalThis.sessionStorage = dom.window.sessionStorage;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
  installFetch();
  return dom;
}

export async function mount(dom) {
  const React = (await import("/workspace/node_modules/react/index.js")).default;
  const { act } = await import("/workspace/node_modules/react/index.js");
  const { createRoot } = await import("/workspace/node_modules/react-dom/client.js");
  const { App } = await import("/workspace/.verify/build/app.mjs");
  const container = document.createElement("div");
  document.body.appendChild(container);
  await act(async () => { createRoot(container).render(React.createElement(App)); });
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const settle = async (predicate, tries = 240) => { for (let i = 0; i < tries && !predicate(); i += 1) await act(async () => { await wait(25); }); };
  const click = async (el) => { await act(async () => { el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(100); }); };
  const byText = (tag, needle) => [...document.querySelectorAll(tag)].find((n) => n.textContent.trim() === needle);
  const text = () => document.body.textContent;
  const typeInto = async (element, value) => {
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, "value").set;
    await act(async () => { setter.call(element, value); element.dispatchEvent(new dom.window.Event("input", { bubbles: true })); await wait(20); });
  };
  const submitForm = async (selector) => { await act(async () => { document.querySelector(selector).dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); await wait(280); }); };
  const listNames = () => [...document.querySelectorAll(".list-name")].map((n) => n.textContent);
  return { dom, act, text, click, byText, typeInto, submitForm, listNames, settle, wait };
}
