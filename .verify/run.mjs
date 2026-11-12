import { state, makeEnv, mount } from "./fields.mjs";

const scenario = process.argv[2];
const out = {};
const home = { ItemId: "l1", name: "Home", CreatedDate: "2026-11-07T09:00:00.000Z" };
const work = { ItemId: "l2", name: "Work", CreatedDate: "2026-11-08T09:00:00.000Z" };

function setup(lists, tasks) {
  state.lists = lists;
  state.tasks = tasks;
  state.nextListId = 50;
  state.nextTaskId = 50;
  state.sent = [];
  state.failSaves = false;
}

async function openMenuFor(env, name) {
  const cards = [...document.querySelectorAll("article.list-card")];
  const card = cards.find((article) => article.querySelector(".list-name")?.textContent === name);
  console.log("DEBUG card names", cards.map((a) => a.querySelector(".list-name")?.textContent), "target", name, "found", Boolean(card));
  const summary = card.querySelector("details > summary");
  await env.click(summary);
  const details = card.querySelector("details");
  if (!details.open) await env.act(async () => { details.open = true; details.dispatchEvent(new env.dom.window.Event("toggle")); await env.wait(60); });
}

if (scenario === "rename") {
  setup([work, home], [
    { ItemId: "t1", name: "Buy milk", list: "l1", done: false, CreatedDate: "2026-11-07T10:00:00.000Z" },
    { ItemId: "t2", name: "Book the dentist", list: "l1", done: true, CreatedDate: "2026-11-07T11:00:00.000Z" }
  ]);
  const env = await mount(makeEnv("/lists"));
  await env.settle(() => env.listNames().length === 2);
  out.before = env.listNames();
  out.cards = [...document.querySelectorAll(".list-name")].map((n) => n.textContent);
  await openMenuFor(env, "Home");
  await env.click(env.byText("button", "Rename list"));
  console.log("DEBUG rename target", document.querySelector("#rename-list-name")?.value);
  out.renamePrefill = document.querySelector("#rename-list-name")?.value;
  const input = document.querySelector("#rename-list-name");
  out.formOpensWith = input?.value;
  await env.typeInto(input, "House");
  await env.submitForm(".ds-modal form.ds-form");
  out.ac2 = {
    renamedInStore: state.lists.some((l) => l.ItemId === "l1" && l.name === "House"),
    shown: env.listNames(),
    tasksKept: state.tasks.filter((t) => t.list === "l1").length,
    tasksStillShown: [...document.querySelectorAll(".task-name")].map((n) => n.textContent)
  };
}

if (scenario === "remove") {
  setup([work, home], [
    { ItemId: "w1", name: "Send the handover notes", list: "l2", done: false, CreatedDate: "2026-11-08T10:00:00.000Z" },
    { ItemId: "w2", name: "Book the room", list: "l2", done: false, CreatedDate: "2026-11-08T11:00:00.000Z" },
    { ItemId: "w3", name: "Reply to Dana", list: "l2", done: true, CreatedDate: "2026-11-08T12:00:00.000Z" },
    { ItemId: "h1", name: "Buy milk", list: "l1", done: false, CreatedDate: "2026-11-07T10:00:00.000Z" }
  ]);
  const env = await mount(makeEnv("/lists"));
  await env.settle(() => env.listNames().length === 2);
  await openMenuFor(env, "Work");
  await env.click(env.byText("button", "Remove list"));
  out.confirmWording = env.text().includes("Remove this list and its tasks? This can't be undone.");
  await env.click(env.byText("button", "Remove"));
  out.ac1 = {
    listGone: !state.lists.some((l) => l.ItemId === "l2"),
    tasksGone: state.tasks.filter((t) => t.list === "l2").length === 0,
    shownLists: env.listNames(),
    workGoneFromScreen: !env.listNames().includes("Work")
  };
}

if (scenario === "cancel") {
  setup([work], [{ ItemId: "w1", name: "Send the handover notes", list: "l2", done: false, CreatedDate: "2026-11-08T10:00:00.000Z" }]);
  const env = await mount(makeEnv("/lists"));
  await env.settle(() => env.listNames().length === 1);
  await openMenuFor(env, "Work");
  await env.click(env.byText("button", "Remove list"));
  await env.click(env.byText("button", "Cancel"));
  out.cancelKeeps = { lists: env.listNames(), tasks: state.tasks.length, noDelete: !state.sent.some((b) => b.includes("deleteList")) };
}

if (scenario === "lastlist") {
  setup([work], [{ ItemId: "w1", name: "Send the handover notes", list: "l2", done: false, CreatedDate: "2026-11-08T10:00:00.000Z" }]);
  const env = await mount(makeEnv("/lists"));
  await env.settle(() => env.listNames().length === 1);
  await openMenuFor(env, "Work");
  await env.click(env.byText("button", "Remove list"));
  await env.click(env.byText("button", "Remove"));
  await env.settle(() => env.text().includes("No lists yet"));
  out.lastList = { wording: env.text().includes("No lists yet. Make your first list."), lists: env.listNames() };
}

if (scenario === "duplicate") {
  setup([work, home], []);
  const env = await mount(makeEnv("/lists"));
  await env.settle(() => env.listNames().length === 2);
  await openMenuFor(env, "Home");
  await env.click(env.byText("button", "Rename list"));
  await env.typeInto(document.querySelector("#rename-list-name"), "work");
  await env.submitForm(".ds-modal form.ds-form");
  out.duplicate = {
    message: env.text().includes("You already have a list called that."),
    unchanged: state.lists.filter((l) => l.name.toLowerCase() === "work").length === 1
  };
}

console.log(JSON.stringify(out, null, 2));
process.exit(0);
