const todayEl = document.getElementById("today");
const date = new Date();
todayEl.textContent = date.toLocaleDateString("en-GB", {
    weekday:"short" , day:"numeric", month:"short" , year:"numeric"
})

const newTask = document.getElementById("new-task")
const addBtn = document.getElementById("add-btn")
const taskList = document.getElementById("task-list")

addBtn.addEventListener("click", fn)

function fn() {
    taskText = newTask.value.trim();
    if (!taskText) {return ;}
    const li = document.createElement("li");
    const label = document.createElement("label")
    const input = document.createElement("checkbox")

    input.type = "checkbox"
    input.TEXT_NODE = taskText.textContent
    label.appendChild(input,`${taskText}`);
    li.appendChild(label);
    taskList.appendChild(li);

    newTask.value = "";
}