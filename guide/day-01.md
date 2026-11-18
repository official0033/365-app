# Day 1: A Checklist That Remembers

**Goal:** a phone-friendly checklist page where you can add tasks, tick them, and have everything still there after a refresh. Built from zero with plain HTML, CSS, and JavaScript.

**Starting point:** Python experience only. No web development background.

**Final result:** a page showing the title, today's date, a list of task cards with tick boxes, and an input with an Add button. Ticks and new tasks survive a refresh.

---

## Folder structure

```
365-app/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

| File | Job | House analogy |
|---|---|---|
| `index.html` | Structure: what is on the page | Walls |
| `css/style.css` | Looks: colors, spacing | Paint |
| `js/app.js` | Behavior: what happens on click | Electricity |

---

## Step 1: Set up the workspace

- Install **VS Code** (free editor).
- Create the folder `365-app`, open it in VS Code, and create the three files above.
- **Checkpoint:** the Explorer sidebar shows the same tree as above.

## Step 2: HTML skeleton

**New concepts**
- **Tags** wrap content: `<h1>Hello</h1>`. Tags can nest inside other tags.
- A page has a `<head>` (invisible info) and a `<body>` (what the user sees).

**What you write:** doctype, `<html lang="en">`, a charset meta tag, a viewport meta tag (needed for phones), a `<title>`, and one `<h1>365</h1>`.

**Checkpoint:** the browser shows a big "365" and the tab says "365".

## Step 3: Checklist markup

**New concepts**
- `<ul>` / `<li>`: a list and its items.
- `<input type="checkbox">` and `<input type="text">`.
- `<label>` wrapping an input makes the text tappable too.
- `id` attributes give elements unique names that JavaScript can find.

**What you write:** an empty `<p id="today">`, a `<ul id="task-list">` with three `<li>` items, a text input `id="new-task"`, and a button `id="add-btn"`.

**Checkpoint:** three tick boxes that toggle, plus an input and a button.

## Step 4: Link CSS and JS

**New concepts**
- `<link rel="stylesheet" href="css/style.css">` goes in `<head>`.
- `<script src="js/app.js"></script>` goes just before `</body>`, so the page elements exist before the JS runs.
- Paths like `css/style.css` start from the folder that `index.html` is in.

**Test:** in `app.js`, write `console.log("it works")`, open the browser console with **F12**, and refresh.

**Mistake I made:** I typed `consol.log` and got `ReferenceError: consol is not defined`. Lesson: JavaScript does not guess what you meant, so check the spelling. The error also means the file *is* linked, since the browser ran it.

## Step 5: CSS styling

**New concepts**
- A rule has the shape `selector { property: value; }`.
- `#name` selects by id.
- `box-sizing: border-box` makes padding count inside an element's width.
- `max-width` with `margin: 0 auto` keeps the app phone-width and centered.
- **Flexbox** (`display: flex`, `align-items`, `gap`) lines items up in a row.
- Big tap targets (22px checkboxes, 12px padding) suit fingers.

**Checkpoint:** task cards with rounded corners, a styled input, and a colored button. Change the button color to make it yours.

## Step 6: Show today's date

**New concepts**
- **The DOM** is the browser's live model of your HTML. JS can read and change it.
- `document.getElementById("today")` finds an element by its id.
- `const` declares a variable that will not be reassigned. Use `let` when it must change.
- `.textContent` sets an element's text.
- `new Date()` is the current date, and `.toLocaleDateString("en-GB", {...})` formats it.

**Mistake I made:** I wrote `todayEl.textContent.toLocaleDateString;`. Three problems: the method belongs to the **date**, not to `textContent`; it needs `( )` to actually run; and nothing was assigned with `=`.

**Checkpoint:** the page shows a date like "Wed, 18 Nov 2026".

## Step 7: Add a task from the input

**New concepts**
- **Events:** `button.addEventListener("click", fn)` runs a function on every click.
- `input.value` is the typed text, and `.trim()` removes extra spaces (like Python's `.strip()`).
- `document.createElement("li")` builds an element in memory. `appendChild` puts it on the page.
- An early exit: `if (!text) { return; }`.

**Mistake I made:** `document.createElement("checkbox")`. `createElement` needs a **tag name** (`"input"`), and `checkbox` is a **type**, set afterwards with `input.type = "checkbox"`.

**Checkpoint:** typing a task and clicking Add makes a new card. An empty box does nothing.

## Step 8: Make the page driven by data

This is the most important idea of the day.

**New concepts**
- **State** is the data your app remembers. The page is just a picture of the state.
- An **array of objects** is like a Python list of dicts: `[{ text: "Workout", done: false }]`.
- `array.push(item)` is like Python's `.append()`. `array.forEach(item => { ... })` is like a `for` loop.
- A `render()` function clears the list and redraws every task from the array.
- **The rule:** change the data first, then call `render()`.

**What you write**
- 8a: a `let tasks = [...]` array with the three starter tasks.
- 8b: delete the hardcoded `<li>` items, and build them inside `render()` with `forEach`.
- 8c: the Add handler pushes into `tasks` and calls `render()`.
- 8d: `input.checked = task.done` when drawing, and a `"change"` listener that writes the tick back to `task.done`.

**Mistake I made:** I forgot `const` in front of a variable. It still ran, but JS quietly made a global variable. Always declare with `const` or `let`.

## Step 9: Save and load with localStorage

**New concepts**
- `localStorage` is a small key-value store in the browser. It survives refreshes, needs no server and no login, and works offline.
- It stores only **text**. `JSON.stringify(tasks)` turns the array into text, and `JSON.parse(text)` turns it back (like Python's `json.dumps` and `json.loads`).
- `localStorage.getItem("tasks")` returns `null` if nothing was saved yet.

**What you write**
- 9a: `saveTasks()` using `setItem`, called after pushing a task and after a tick changes.
- 9b: on load, read `getItem`, and `if (saved) { tasks = JSON.parse(saved); }`.

**Checkpoint:** add a task, tick another, refresh. Everything is still there. Deleting the `tasks` key in **F12 > Application > Local Storage** brings back the starter tasks.

---

## Day 1 final checklist

- [ ] Page shows the title, today's date, and task cards.
- [ ] Add button creates a task. Empty input does nothing.
- [ ] Ticks and new tasks survive a refresh.
- [ ] No red errors in the Console.

## In my own words (fill this in)

- **What is the DOM?**
~~ stands for 'Document Object Model
Document: your web page.
Object: every tag becomes an object in JS.
Model: a structured copy of the page that JS can work with.
its an live model in browser for HTML which helps JS to read it and change/edit it.

- **Why do we change the array first and call `render()` after?**
~~ Cuz as you see in code the function: 'render()' erases the data fully if not saved. we puted it after the array change because so we can save it in the 'tasks' array and which doesn't remove to base task after refresh

- **Why does `localStorage` need `JSON.stringify`?**
~~ 'localStorage' reads the saved text but we have array which causes the data-type error .So , we use 'JSON.stringify' to convert the array to the text. (which later helps with saved it in 'localStorage')

- **The hardest moment today was:**
~~ the hardest part was to create the function and using loops inside it cuz its totaly different than python function and loop.also knowing what & where to write .EX: cuz if we write the 'saveTasks()' function after the 'render()' function cuz it will remove all the things first then save which literally won't help a inch (unit you want to erase all the data)

## Mistakes and fixes

| Mistake | Fix |
|---|---|
| `consol.log` | Typo. It is `console.log`. |
| `todayEl.textContent.toLocaleDateString;` | Call the method on the date, add `( )`, and assign with `=`. |
| `createElement("checkbox")` | Use the tag `"input"`, then set `input.type = "checkbox"`. |
| Missing `const` | Always declare variables with `const` or `let`. |

## Tomorrow (Day 2)

Streak and completion logic: per-day records, the 77% rule, and starting to think about dates properly.