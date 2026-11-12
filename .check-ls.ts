import { JSDOM } from "/tmp/t01/node_modules/jsdom/lib/api.js";
const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { url: "https://example.app/" });
const g = globalThis as any;
g.window = dom.window; g.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
g.HTMLElement = dom.window.HTMLElement; g.Node = dom.window.Node;
g.HTMLInputElement = dom.window.HTMLInputElement; g.HTMLSelectElement = dom.window.HTMLSelectElement;
g.Event = dom.window.Event; g.KeyboardEvent = dom.window.KeyboardEvent;
g.PointerEvent = dom.window.PointerEvent ?? dom.window.Event;
g.localStorage = dom.window.localStorage; g.sessionStorage = dom.window.sessionStorage;
g.matchMedia = dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} } as any);
g.IS_REACT_ACT_ENVIRONMENT = true;
const { createServer } = await import("vite");
const server = await createServer({ configFile: "/workspace/.vite-check.config.ts", server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "error" });
const load = async (path: string) => server.ssrLoadModule(path);
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = await import("react");
const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");
const { blocksClient } = await load("/src/lib/blocks/client.ts");
const { LocalizationProvider } = await load("/src/lib/i18n/LocalizationProvider.tsx");
const { ListsScreen } = await load("/src/features/lists/ListsScreen.tsx");
const results: string[] = [];
function check(name: string, ok: boolean, detail: string) { results.push(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`); }
const person = { name: "Priya Shah", initials: "PS", role: "Signed in" };
const wait = () => new Promise((r) => setTimeout(r, 40));
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

// A stand-in gateway at the SDK boundary: the app's own ListsPage and listsApi run unchanged on top of it.
const db: { lists: any[]; tasks: any[] } = { lists: [], tasks: [] };
let nextId = 1;
const answer = (rows: any[], key: string) => ({ acknowledged: true, data: { [key]: { items: rows } } });
blocksClient.data.collection = ((name: string) => {
  const isList = name === "List";
  const key = isList ? "getLists" : "getTasks";
  const table = () => (isList ? db.lists : db.tasks);
  return {
    list: async (input: any) => {
      const rows = [...table()];
      if (input?.sort?.CreatedDate === -1) rows.sort((a, b) => String(b.CreatedDate).localeCompare(String(a.CreatedDate)));
      return { data: { [key]: { items: rows } } };
    },
    get: async (id: string) => ({ data: { [key]: { items: table().filter((r) => r.ItemId === id) } } }),
    create: async (payload: any) => {
      const row = { ...payload, ItemId: "id-" + nextId++, CreatedDate: "2026-11-12T12:00:" + String(nextId).padStart(2, "0") + ".000Z" };
      table().push(row);
      return { acknowledged: true, itemId: row.ItemId };
    },
    update: async (id: string, changes: any) => {
      const row = table().find((r) => r.ItemId === id);
      if (row) Object.assign(row, changes);
      return { acknowledged: true };
    },
    delete: async (id: string) => {
      const list = isList ? db.lists : db.tasks;
      const i = list.findIndex((r) => r.ItemId === id);
      if (i >= 0) list.splice(i, 1);
      return { acknowledged: true };
    }
  };
}) as any;

const { ListsPage } = await load("/src/features/lists/ListsPage.tsx");
const { AuthProvider } = await load("/src/app/providers/AuthProvider.tsx");

function mount() {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  return {
    host,
    render: async () => {
      await act(async () => {
        root.render(React.createElement(QueryClientProvider, { client }, React.createElement(AuthProvider, null, React.createElement(LocalizationProvider, null, React.createElement(ListsPage, { onNavigate: () => {} })))));
        await new Promise((res) => setTimeout(res, 250));
      });
    }
  };
}
const clickText = async (host: HTMLElement, text: string) => {
  const el = Array.from(host.querySelectorAll("button")).find((b) => (b.textContent ?? "").trim() === text) as HTMLElement | undefined;
  await act(async () => { el?.click(); await wait(); });
  return el;
};
const setInputOn = async (host: HTMLElement, id: string, value: string) => {
  const el = host.querySelector("#" + id) as HTMLInputElement | null;
  if (!el) throw new Error("no field #" + id);
  const desc = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, "value")!;
  await act(async () => { desc.set!.call(el, value); el.dispatchEvent(new dom.window.Event("input", { bubbles: true })); await wait(); });
};

// --- LS-01 AC1
const a = mount();
await a.render();
check("LS-01 AC1", (a.host.textContent ?? "").includes("No lists yet. Make your first list."), "with no lists the page shows the exact line: " + JSON.stringify((a.host.textContent ?? "").slice(-160)));

// --- LS-02 AC2 / AC1 on a second page instance
const b = mount();
await b.render();
await clickText(b.host, "Make a list");
check("LS-02 form opens", Boolean(b.host.querySelector("#list-name")), "Make a list opens a form with the name field");
if (!b.host.querySelector("#list-name")) console.log("DEBUG text:", JSON.stringify((b.host.textContent ?? "").slice(-300)), "buttons:", Array.from(b.host.querySelectorAll("button")).map((x) => x.textContent?.trim()).join("|"));
await setInputOn(b.host, "list-name", "Home");
await clickText(b.host, "Make list");
await clickText(b.host, "Make a list");
await setInputOn(b.host, "list-name", "Work");
await clickText(b.host, "Make list");
await b.render();
const names = Array.from(b.host.querySelectorAll(".list-name")).map((n) => n.textContent);
check("LS-02 AC2", names.length === 2 && names[0] === "Work" && names[1] === "Home", "both lists show, newest first: " + JSON.stringify(names));

await clickText(b.host, "Make a list");
await setInputOn(b.host, "list-name", "Work");
await clickText(b.host, "Make list");
const dupShown = (b.host.textContent ?? "").includes("You already have a list called that.");
const works = db.lists.filter((l) => l.name === "Work").length;
check("LS-02 AC1", dupShown && works === 1, "a second Work shows 'You already have a list called that.' and only one Work exists: message=" + dupShown + " works=" + works + " all=" + JSON.stringify(db.lists.map((l) => l.name)));

console.log(results.join(String.fromCharCode(10)));
await server.close();
process.exit(0);
