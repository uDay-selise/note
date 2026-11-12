import { state, makeEnv, mount } from "./fields.mjs";
const scenario = process.argv[2];
const out = {};
const home = { ItemId: "l1", name: "Home", CreatedDate: "2026-11-07T09:00:00.000Z" };
state.lists = [home];
state.tasks = [];
state.nextTaskId = 40;
state.sent = [];
state.foreignTaskIds = new Set();

if (scenario === "nolists") {
  state.lists = [];
  const env = await mount(makeEnv("/lists"));
  await env.settle(() => env.text().includes("Make a list first"));
  out.noLists = {
    wording: env.text().includes("Make a list first, then add tasks to it."),
    makeButton: Boolean(env.byText("button", "Make a list"))
  };
}

if (scenario === "addtask") {
  const env = await mount(makeEnv("/lists"));
  await env.settle(() => env.text().includes("Add a task") && env.text().includes("Home"));
  await env.click(env.byText("button", "Add a task"));
  const input = document.querySelector("#task-name");
  out.formOpens = Boolean(input);
  await env.typeInto(input, "Buy milk");
  await env.submitForm(".ds-modal form.ds-form");
  out.added = {
    saved: state.tasks.some((t) => t.name === "Buy milk" && t.list === "l1" && t.done === false),
    shown: [...document.querySelectorAll(".task-name")].some((a) => a.textContent === "Buy milk"),
    notice: env.text().includes("Task added to Home.")
  };
}

if (scenario === "tick") {
  state.tasks = [
    { ItemId: "a1", name: "Buy milk", list: "l1", done: false, CreatedDate: "2026-11-07T10:00:00.000Z" },
    { ItemId: "a2", name: "Book the dentist", list: "l1", done: false, CreatedDate: "2026-11-07T11:00:00.000Z" }
  ];
  const env = await mount(makeEnv("/lists"));
  await env.settle(() => env.text().includes("Buy milk"));
  const rows = () => [...document.querySelectorAll(".task")].map((row) => ({ name: row.querySelector(".task-name")?.textContent, done: row.classList.contains("task-done"), checked: Boolean(row.querySelector("input")?.checked) }));
  const box = (name) => [...document.querySelectorAll(".task")].find((row) => row.querySelector(".task-name")?.textContent === name)?.querySelector("input");
  out.before = rows();
  await env.act(async () => { box("Buy milk").click(); await env.wait(250); });
  out.afterTick = rows();
  await env.act(async () => { box("Buy milk").click(); await env.wait(250); });
  out.afterUntick = rows();
}
console.log(JSON.stringify(out, null, 2));
process.exit(0);
