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
    const taskText = newTask.value.trim();
    if (!taskText) {return ;}
    tasks.push({text:taskText, done:false})
    render()

    newTask.value = "";
}

let tasks = [{text:"Study 1 hour", done:false}, {text:"Workout", done:false}, {text:"Read a book", done:false}];

function render(){
    taskList.innerHTML = "";
    tasks.forEach((task) => {
        const li = document.createElement("li");
        const label = document.createElement("label")
        const input = document.createElement("input")

        input.type = "checkbox"
        input.checked = task.done;
        input.addEventListener("change", () => {
            task.done = input.checked;
        })
        label.append(`${task.text}`,input);
        li.appendChild(label);
        taskList.appendChild(li);

    })
}

render()