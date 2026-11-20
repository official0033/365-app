const todayEl = document.getElementById("today");
const date = new Date();
const THRESHOLD = 0.77;
const progressEl = document.getElementById("progress");

todayEl.textContent = date.toLocaleDateString("en-GB", {
    weekday:"short" , day:"numeric", month:"short" , year:"numeric"
})

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
const lastDate = localStorage.getItem("lastDate");
if (lastDate !== getTodayKey()) {
    tasks.forEach((task) => task.done = false);
    localStorage.setItem("lastDate", getTodayKey());
    saveTasks()
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
  progressEl.textContent = `${s.percent}% done, ${s.counts ? "today counts ✅" : "keep going"}`;}

render()
updateToday()