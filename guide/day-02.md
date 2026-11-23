# Day 2: Dates, History, and the 77% Rule

**Goal:** the app knows what day it is, records each day's result separately, resets ticks on a new day, and shows whether today counts toward the streak.

**Starting point:** the Day 1 checklist, which saves tasks and ticks in `localStorage`.

**Final result:** under the date, the page shows a line like "67% done, keep going", or "100% done, today counts". Each day's result is stored in a `history` object under that day's date.

---

## Step 2a: Today's date as a key

**Why:** history is stored by date, like a Python dict: `{"2026-11-19": {...}}`. We need today's date as a text label (a key).

**New concepts**
- `return` hands a value back from a function.
- `getFullYear()`, `getMonth()`, `getDate()` give the date parts as numbers.
- `getMonth()` starts at 0 (January is 0), so add 1.
- `String(x).padStart(2, "0")` turns `7` into `"07"`.
- `toISOString()` uses UTC, which gives the wrong day in India between midnight and 5:30 AM, so we build the date from local parts.

**Decision:** the key format is `YYYY-MM-DD`, not `DD-MM-YYYY`. It sorts in date order as plain text, which streaks and the heatmap need. The format shown on screen can be anything later.

```js
function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

**Checkpoint:** `console.log(getTodayKey())` prints something like `2026-11-19`.

## Step 2b: The `history` object

**New concepts**
- An object works as a lookup table. A variable key uses square brackets: `history[key] = value`.
- `array.filter(fn)` keeps only the items where `fn` returns true, and `.length` counts them.
- Rule: history never changes. The app only ever writes today's key.

**What you write**
- `let history = {}` plus loading it from `localStorage` (use a new variable name for the saved text, because a `const` name can only be declared once).
- `saveHistory()` using `setItem` and `JSON.stringify`.
- `updateToday()` that counts done tasks, stores `{ done, total }` under today's key, and saves.
- A call to `updateToday()` at the end of `saveTasks()` and once at the bottom of the file.

```js
let history = {};
const histSave = localStorage.getItem("history");
if (histSave) {
  history = JSON.parse(histSave);
}

function saveHistory() {
  localStorage.setItem("history", JSON.stringify(history));
}
```

**Checkpoint:** in F12 > Application > Local Storage, the `history` key shows today's record and updates when you tick or add.

## Step 2c: A new day starts fresh

**Idea:** remember the last day the app was opened under the key `"lastDate"`. On startup, if it differs from today's key, untick every task and save.

```js
const lastDate = localStorage.getItem("lastDate");
if (lastDate !== getTodayKey()) {
  tasks.forEach((task) => { task.done = false; });
  localStorage.setItem("lastDate", getTodayKey());
  saveTasks();
}
```

**New concepts:** `!==` means "not equal" (Python's `!=`). Use `===` and `!==`, not `==`.

**Checkpoint:** the first refresh after adding this resets ticks once (expected). To fake a new day, change `lastDate` to `2020-01-01` in Local Storage and refresh.

## Step 2d and 2e: Completion percentage and the 77% rule

**New concepts**
- A named constant, `const THRESHOLD = 0.77`, keeps the rule in one place.
- `getStats()` does all the counting once and returns an object. The page and `history` both use it.
- A ternary, `total === 0 ? 0 : doneCount / total`, is Python's `0 if total == 0 else ...`. It avoids dividing by zero.
- `Math.round(ratio * 100)` is for display only.
- The decision (`counts`) uses the exact ratio, not the rounded percent. For example, 10 of 13 tasks is 76.9%, which is below 77, but it would round up to 77 and wrongly count.

**What you write, in four places**

1. In `index.html`, add a paragraph right under `<p id="today"></p>`:

```html
<p id="progress"></p>
```

2. In `css/style.css`, add at the bottom:

```css
#progress { font-weight: 600; }
```

3. In `js/app.js`, add these two lines near your other `const` lines at the top:

```js
const THRESHOLD = 0.77;
const progressEl = document.getElementById("progress");
```

4. In `js/app.js`, add `getStats` and replace your old `updateToday` with the version below, so the page shows the result and `history` stores `counts`:

```js
function getStats() {
  const total = tasks.length;
  const doneCount = tasks.filter((task) => task.done).length;
  const ratio = total === 0 ? 0 : doneCount / total;
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
  progressEl.textContent = `${s.percent}% done, ${s.counts ? "today counts" : "keep going"}`;
}
```

`updateToday` already runs after every tick, every added task, and on page load, so the text on the page stays current without extra calls.

**Checkpoint:** the page starts at "0% done, keep going". Ticking all tasks shows "100% done, today counts", and `history` in Local Storage stores `"counts":true`.

**Experiment:** set `THRESHOLD` to `0.5`, tick half the tasks, and watch the message flip. Then set it back to `0.77`.

---

## Day 2 final checklist

- [ ] `getTodayKey()` prints today's date as `YYYY-MM-DD`.
- [ ] `history` in Local Storage updates when I tick or add.
- [ ] Ticks survive a refresh on the same day and reset when `lastDate` is old.
- [ ] The page shows the percentage and whether today counts.
- [ ] No red errors in the Console.

## In my own words (fill this in)

**Why is the history key `YYYY-MM-DD` and not `DD-MM-YYYY`?**
~~ it sorts clearly & easily in YYYY-MM-DD than rather DD-MM-YYYY. also its standard ,so any future save/backup will expect it.

- **Why does `counts` use `ratio` and not `percent`?**
~~ used ratio cuz it measures in decimal and show accurate result while percentage take round figure .
EX : ratio takes .769 & there same thing in percentage takes 77 .
     here ratio does the task perfectly while percentage makes it wrong 

- **Why does the app save `lastDate`, and what would happen without it?**
~~ it saves last date because we don't have any other way to know new a new day begins. 
Also when new day start and you open app ,it checks whether the date is same or not, then proceeds to uncheck all the tasks.
Without lastDate, yesterday’s ticks would still be ticked today, and every day would look the same.

- **With 3 tasks, how many ticks make today count, and why?**
~~ with 3 tasks it takes all 3 tasks to be done . 
Reason: according to the formula 2 tasks make it 0.6667 count which is not 77 according to the limit.
Formula: Checked-boxes / total-boxes

- **The hardest moment today was:**
~~ well it was easy than day-1 ,because the code format are all-most same which makes it faster.
But the real hard part was the overcoming the lazy-ness & to stay consistent.
AI made the most tasks easier today. 

## Mistakes and fixes

| Mistake | Fix |
|---|---|
| Month off by one | `getMonth()` starts at 0, so add 1. |
| Single-digit day like `2026-11-9` | Pad with `String(...).padStart(2, "0")`. |
| Reusing the name `saved` for a second `const` | Use a different name, like `histSave`. |
| Changing the key to `DD-MM-YYYY` | Keep `YYYY-MM-DD` for keys, and format only for display. |

## Tomorrow (Day 3)

Goals with their own start dates, rest days (3 per month), and counting the streak from `history`.