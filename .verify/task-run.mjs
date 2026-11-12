import { state, makeEnv, mount } from "./fields.mjs";

function reset() {
  state.lists = [
    { ItemId: "l1", name: "Home", CreatedDate: "2026-11-07T09:00:00.000Z" },
    { ItemId: "l2", name: "Work", CreatedDate: "2026-11-08T09:00:00.000Z" }
  ];
  state.tasks = [{ ItemId: "t1", name: "Buy milk", list: "l1", done: true, CreatedDate: "2026-11-07T10:00:00.000Z" }];
  state.nextTaskId = 10;
  state.nextListId = 10;
  state.sent = [];
  state.foreignTaskIds = new Set();
  state.failSaves = false;
}

const out = {};

// TK-03 AC1, TK-04 AC1, TK-04 AC2
reset();
{
  const dom = makeEnv("/tasks/t1");
  const env = await mount(dom);
  await env.settle(() => env.text().includes("Buy milk"));
  const first = env.text();
  const input = document.querySelector("#task-name-done");
  const select = document.querySelector("#task-list-done");
  out.tk03ac1 = {
    name: first.includes("Buy milk"),
    list: first.includes("Home"),
    done: first.includes("Done"),
    notDoneWordsAbsent: !first.includes("Not done yet"),
    pageHeading: document.querySelector("h1")?.textContent
  };
  out.formPrefilled = { name: input?.value, list: select?.value, options: [...select.options].map((o) => o.textContent) };

  await env.typeInto(input, "Buy bread");
  await env.submitForm("form.ds-form");
  out.tk04ac1 = {
    saved: state.tasks.find((task) => task.ItemId === "t1")?.name === "Buy bread",
    headingShowsNewName: document.querySelector("h1")?.textContent === "Buy bread",
    doneKept: state.tasks.find((task) => task.ItemId === "t1")?.done === true
  };

  const selectNow = document.querySelector("#task-list-done");
  await env.choose(selectNow, "l2");
  await env.submitForm("form.ds-form");
  out.tk04ac2 = {
    listMoved: state.tasks.find((task) => task.ItemId === "t1")?.list === "l2",
    doneKept: state.tasks.find((task) => task.ItemId === "t1")?.done === true,
    notice: /Saved\. This task shows in Work\./.test(env.text()),
    headingStillName: document.querySelector("h1")?.textContent
  };
}

// blank name
reset();
{
  const dom = makeEnv("/tasks/t1");
  const env = await mount(dom);
  await env.settle(() => env.text().includes("Buy milk"));
  const input = document.querySelector("#task-name-done");
  await env.typeInto(input, "   ");
  await env.submitForm("form.ds-form");
  out.blankName = {
    message: env.text().includes("Give the task a name."),
    unchanged: state.tasks.find((task) => task.ItemId === "t1")?.name === "Buy milk",
    noSaveSent: !state.sent.some((b) => b.includes("updateTask"))
  };
}

// TK-03 AC2 not my task
reset();
state.foreignTaskIds = new Set(["t1"]);
{
  const dom = makeEnv("/tasks/t1");
  const env = await mount(dom);
  await env.settle(() => env.text().includes("This task isn't yours"));
  out.tk03ac2 = {
    message: env.text().includes("This task isn't yours."),
    noDetails: !env.text().includes("Buy milk") && !document.querySelector("#task-name") && !document.querySelector("#task-name-done")
  };
}

// mark done / undo from details
resetMk();
console.log("DEBUG after reset tasks", JSON.stringify(state.tasks.map((t) => [t.ItemId, t.done])));
state.tasks = [{ ItemId: "tm", name: "Buy milk", list: "l1", done: false, CreatedDate: "2026-11-07T10:00:00.000Z" }];
{
  const dom = makeEnvMk("/tasks/t1");
  const env = await mount(dom);
  await env.settle(() => env.text().includes("Buy milk"));
  console.log("DEBUG TEXT", env.text().slice(0, 220));
  await env.click(env.byText("button", "Mark done"));
  await env.settle(() => env.text().includes("Mark not done"));
  const afterDone = env.text();
  console.log("DEBUG after done saved", state.tasks.find((t) => t.ItemId === "tm")?.done, "text has markNotDone", afterDone.includes("Mark not done"), "has notDoneYet", afterDone.includes("Not done yet"));
  out.markDone = {
    saved: state.tasks.find((task) => task.ItemId === "tm")?.done === true,
    showsDone: afterDone.includes("Mark not done") && !afterDone.includes("Not done yet")
  };
  await env.click(env.byText("button", "Mark not done"));
  await env.settle(() => env.text().includes("Mark done"));
  out.markNotDone = {
    saved: state.tasks.find((task) => task.ItemId === "tm")?.done === false,
    showsNotDone: env.text().includes("Not done yet")
  };
}

// saved task appears on its list with the new name, and the list link opens the details
resetMk();
{
  const dom = makeEnvMk("/lists");
  const env = await mount(dom);
  const taskLink = [...document.querySelectorAll(".task-name")].find((a) => a.textContent === "Buy milk");
  await env.click(taskLink);
  await env.settle(() => window.location.pathname === "/tasks/t1");
  out.openedFromLists = {
    path: window.location.pathname,
    heading: document.querySelector("h1")?.textContent,
    showsList: env.text().includes("Home")
  };
}

function resetMk() {
  state.lists = [{ ItemId: "lm1", name: "Home", CreatedDate: "2026-11-07T09:00:00.000Z" }];
  state.tasks = [{ ItemId: "tm", name: "Buy milk", list: "lm1", done: false, CreatedDate: "2026-11-07T10:00:00.000Z" }];
  state.nextTaskId = 20;
  state.foreignTaskIds = new Set();
}
function makeEnvMk(path) { return makeEnv(path); }
console.log(JSON.stringify(out, null, 2));
process.exit(0);
