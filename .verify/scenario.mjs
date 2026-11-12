import { state, makeEnv, mount } from "./fields.mjs";

const scenario = process.argv[2];
const out = {};

function setup(lists, tasks, foreign = []) {
  state.lists = lists;
  state.tasks = tasks;
  state.nextTaskId = 30;
  state.nextListId = 30;
  state.sent = [];
  state.foreignTaskIds = new Set(foreign);
  state.failSaves = false;
}

const home = { ItemId: "l1", name: "Home", CreatedDate: "2026-11-07T09:00:00.000Z" };
const work = { ItemId: "l2", name: "Work", CreatedDate: "2026-11-08T09:00:00.000Z" };

if (scenario === "open") {
  setup([home, work], [{ ItemId: "t1", name: "Buy milk", list: "l1", done: true, CreatedDate: "2026-11-07T10:00:00.000Z" }]);
  const env = await mount(makeEnv("/tasks/t1"));
  await env.settle(() => env.text().includes("Buy milk"));
  const text = env.text();
  const input = document.querySelector("#task-name-done");
  const select = document.querySelector("#task-list-done");
  out.tk03ac1 = {
    name: text.includes("Buy milk"),
    list: text.includes("Home"),
    done: text.includes("Done"),
    notDoneWordsAbsent: !text.includes("Not done yet"),
    heading: document.querySelector("h1")?.textContent
  };
  out.form = { name: input?.value, list: select?.value, options: [...select.options].map((o) => o.textContent) };

  await env.typeInto(input, "Buy bread");
  await env.submitForm("form.ds-form");
  out.tk04ac1 = {
    saved: state.tasks.find((t) => t.ItemId === "t1")?.name === "Buy bread",
    heading: document.querySelector("h1")?.textContent,
    doneKept: state.tasks.find((t) => t.ItemId === "t1")?.done === true,
    notice: /Saved\. This task shows in Home\./.test(env.text())
  };

  await env.choose(document.querySelector("#task-list-done"), "l2");
  await env.submitForm("form.ds-form");
  out.tk04ac2 = {
    moved: state.tasks.find((t) => t.ItemId === "t1")?.list === "l2",
    doneKept: state.tasks.find((t) => t.ItemId === "t1")?.done === true,
    notice: /Saved\. This task shows in Work\./.test(env.text())
  };
}

if (scenario === "blank") {
  setup([home], [{ ItemId: "t2", name: "Buy milk", list: "l1", done: true, CreatedDate: "2026-11-07T10:00:00.000Z" }]);
  const env = await mount(makeEnv("/tasks/t2"));
  await env.settle(() => env.text().includes("Buy milk"));
  await env.typeInto(document.querySelector("#task-name-done"), "   ");
  await env.submitForm("form.ds-form");
  out.blankName = {
    message: env.text().includes("Give the task a name."),
    unchanged: state.tasks.find((t) => t.ItemId === "t2")?.name === "Buy milk",
    noSaveSent: !state.sent.some((b) => b.includes("updateTask"))
  };
}

if (scenario === "foreign") {
  setup([home], [{ ItemId: "t3", name: "Hidden task", list: "l1", done: false, CreatedDate: "2026-11-07T10:00:00.000Z" }], ["t3"]);
  const env = await mount(makeEnv("/tasks/t3"));
  await env.settle(() => env.text().includes("This task isn't yours"));
  out.tk03ac2 = {
    message: env.text().includes("This task isn't yours."),
    noDetails: !env.text().includes("Hidden task") && !document.querySelector("#task-name") && !document.querySelector("#task-name-done")
  };
}

if (scenario === "toggle") {
  setup([home], [{ ItemId: "t4", name: "Buy milk", list: "l1", done: false, CreatedDate: "2026-11-07T10:00:00.000Z" }]);
  const env = await mount(makeEnv("/tasks/t4"));
  await env.settle(() => document.querySelector("h1")?.textContent === "Buy milk");
  console.log("DEBUG buttons", JSON.stringify([...document.querySelectorAll("button")].map((b) => b.textContent.trim())), "HEADING", JSON.stringify(document.querySelector("h1")?.textContent));
  await env.click(env.byText("button", "Mark done"));
  await env.settle(() => env.text().includes("Mark not done"));
  out.markDone = {
    saved: state.tasks.find((t) => t.ItemId === "t4")?.done === true,
    badge: document.querySelector(".ds-badge")?.textContent?.trim(),
    notDoneGone: !env.text().includes("Not done yet")
  };
  await env.click(env.byText("button", "Mark not done"));
  await env.settle(() => env.text().includes("Mark done"));
  out.markNotDone = {
    saved: state.tasks.find((t) => t.ItemId === "t4")?.done === false,
    statusHeading: [...document.querySelectorAll(".tk-status-band h2")][0]?.textContent,
    notDoneBack: env.text().includes("Not done yet")
  };
}

if (scenario === "fromlists") {
  setup([home], [{ ItemId: "t5", name: "Buy milk", list: "l1", done: false, CreatedDate: "2026-11-07T10:00:00.000Z" }]);
  const env = await mount(makeEnv("/lists"));
  await env.settle(() => env.text().includes("Buy milk"));
  const link = [...document.querySelectorAll(".task-name")].find((a) => a.textContent === "Buy milk");
  await env.click(link);
  await env.settle(() => window.location.pathname === "/tasks/t5");
  await env.settle(() => env.text().includes("Buy milk"));
  console.log("DEBUG from lists heading", JSON.stringify(document.querySelector("h1")?.textContent), "els", document.querySelectorAll("h1").length);
  out.fromLists = {
    path: window.location.pathname,
    heading: document.querySelector("h1")?.textContent,
    showsList: env.text().includes("Home")
  };
}

console.log(JSON.stringify(out, null, 2));
process.exit(0);
