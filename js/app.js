// all constants important for implementing later
const todayEl = document.getElementById("today");
const date = new Date();
const THRESHOLD = 0.77;
const MAX_REST = 3;
const progressEl = document.getElementById("progress");
const restInfo = document.getElementById("rest-info");
const restTodayBtn = document.getElementById("rest-today-btn");
const restTomorrowBtn = document.getElementById("rest-tomorrow-btn");
const restConfirm = document.getElementById("rest-confirm");
const restMsg = document.getElementById("rest-msg");
const restYes = document.getElementById("rest-yes");
const restNo = document.getElementById("rest-no");
const restUndoBtn = document.getElementById("rest-undo-btn");

//codes for Rest day buttons only.
let pendingKey = null;
restTodayBtn.addEventListener("click", () => {
    pendingKey = getTodayKey();
    restMsg.textContent = "Use a rest day for today? This cannot be undone.";
    restConfirm.hidden = false;
});
restTomorrowBtn.addEventListener("click",() => {
    pendingKey = shiftKey(getTodayKey(),1);
    restMsg.textContent = "Use a rest day for tomorrow?";
    restConfirm.hidden = false;
});
restNo.addEventListener("click",() => {
    restConfirm.hidden = true;
    pendingKey = null;
});
restYes.addEventListener("click",() => {
    addRestDay(pendingKey);
    restConfirm.hidden = true;
    pendingKey = null;
    updateRestUI();
});
restUndoBtn.addEventListener("click",() => {
    removeRestDay(shiftKey(getTodayKey(),1));
    updateRestUI();
})
//..............................................................

todayEl.textContent = date.toLocaleDateString("en-GB", {
    weekday:"short" , day:"numeric", month:"short" , year:"numeric"
});

function dateToKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2,"0")
    const day = String(date.getDate()).padStart(2,"0")

    return `${year}-${month}-${day}`;
}
function getTodayKey() {
    return (dateToKey(new Date()));
}
function shiftKey(key, days) {
    const [y,m,d] = key.split("-").map(Number);
    const date = new Date(y, m-1 ,d)
    date.setDate(date.getDate() + days)
    return dateToKey(date); 
}

const newTask = document.getElementById("new-task")
const addBtn = document.getElementById("add-btn")
const taskList = document.getElementById("task-list")

addBtn.addEventListener("click", fn);

function fn() {
    const taskText = newTask.value.trim();
    if (!taskText) {return ;}
    tasks.push({text:taskText, done:false, startDate: getTodayKey()})
    saveTasks()
    render()

    newTask.value = "";
}

let tasks = [{text:"Study 1 hour", done:false}, {text:"Workout", done:false}, {text:"Read a book", done:false}];
const saved = localStorage.getItem("tasks");
if (saved) {
    tasks = JSON.parse(saved);
}
tasks.forEach((task) => {
    if (!task.startDate) {
        task.startDate = getTodayKey();
    }  
})

let history = {}
const histSave = localStorage.getItem("history")
if (histSave) {
    history = JSON.parse(histSave);
}
let restDays = [];
const restSave = localStorage.getItem("restDays");
if (restSave) {
    restDays = JSON.parse(restSave)
}
const lastDate = localStorage.getItem("lastDate");
if (lastDate !== getTodayKey()) {
    tasks.forEach((task) => task.done = false);
    localStorage.setItem("lastDate", getTodayKey());
    saveTasks()
}


function getStreak() {
    let streak = 0
    const todayRec = history[getTodayKey()]
    if (todayRec && todayRec.counts) {
        streak++;
    }
    let key = shiftKey(getTodayKey(), -1) // key = the last day's date.
    while (history[key] && history[key].counts) {
        streak++;
        key = shiftKey(key, -1) 
        //if tab freezes close it then re-correct the while loop and reopen tab.
    }
    return streak;
}

function render(){
    taskList.innerHTML = "";
    tasks.forEach((task) => {
        const li = document.createElement("li")
        const label = document.createElement("label")
        const input = document.createElement("input")

        input.type = "checkbox"
        input.checked = task.done;
        input.addEventListener("change", () => {
            task.done = input.checked;
            saveTasks()
        })
        label.append(`${task.text}`,input);
        li.appendChild(label);
        taskList.appendChild(li);
    })
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateToday()
}

function saveHistory(){
    localStorage.setItem("history", JSON.stringify(history))
}

// functions for rest days. 
function saveRestDays() {
    localStorage.setItem("restDays", JSON.stringify(restDays));
}
function restUsedInMonth(key) {
    return restDays.filter((d) => d.slice(0,7) === key.slice(0,7)).length;
}
function addRestDay(key) {
    if (key !== getTodayKey() && key !== shiftKey(getTodayKey(), 1)) {return false;}
    if (restDays.includes(key)) {return false;}
    if (restUsedInMonth(key) >= MAX_REST) {return false;}
    restDays.push(key);
    saveRestDays();
    return true;
}
function removeRestDay(key) {
    if (key !== shiftKey(getTodayKey(),1)) {return false;}
    if (!restDays.includes(key)) {return false;}
    restDays = restDays.filter((d) => d !== key);
    saveRestDays();
    return true;
}
function updateRestUI() {
    const left = MAX_REST - restUsedInMonth(getTodayKey());
    restInfo.textContent = `Rest days left this month: ${left} of ${MAX_REST}`;
    const todayKey = getTodayKey();
    const tomorrowKey = shiftKey(getTodayKey(),1);
    restTodayBtn.disabled = getStats().counts || restDays.includes(todayKey) || restUsedInMonth(todayKey) >= MAX_REST
    restTomorrowBtn.disabled = restDays.includes(tomorrowKey) || restUsedInMonth(tomorrowKey) >= MAX_REST
    restUndoBtn.hidden = !restDays.includes(tomorrowKey);
}
//........................................................

function getStats() {
  const total = tasks.length;
  const doneCount = tasks.filter((task) => task.done).length;
  const ratio = total === 0 ? 0 : doneCount / total; // its same like python: 0 if total == 0 else doneCount / total
  return {
    doneCount,
    total,
    percent: Math.round(ratio * 100),
    counts: ratio >= THRESHOLD,
  };
}

function updateToday() {
  const s = getStats();
  history[getTodayKey()] = { done: s.doneCount, total: s.total, counts: s.counts };
  saveHistory();
  progressEl.textContent = `${s.percent}% done, ${s.counts ? "today counts ✅" : "keep going"}`;
  updateRestUI();
}

render();
updateToday();
updateRestUI();