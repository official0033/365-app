# Day 3: Start Dates, Rest Days, and the Streak

**Goal:** every goal remembers when it started, you can mark rest days (today or tomorrow only, 3 per month), and the app counts your current streak, skipping rest days.

**Starting point:** the Day 2 app, which records each day in `history` and decides whether a day counts (77% rule).

**Final result:** the page shows "Streak: N days" under the percentage line, and a "Rest days" section at the bottom with a confirm box.

---

## Design decisions (made before coding)

- **A day counts** if its record in `history` has `counts: true`.
- **A rest day** neither adds to the streak nor breaks it.
- **A day with no record** (the app was never opened) breaks the streak, unless it was marked as rest. That is why rest days must be marked ahead of time.
- **Rest days can be marked for today or tomorrow only**, never further ahead. Max 3 per month.
- **Rest days live in their own list** (`restDays`), not in `history`. Marking tomorrow means writing about a day that hasn't happened, and `history` is only ever written for today.
- **Undo is allowed for tomorrow's rest day only.** Today's is final, so the past can't be edited.
- **The Rest buttons sit at the bottom, far from the checklist, with a confirm box**, so a thumb can't hit them by accident.

## Step 3a: Every goal gets a start date

**Why:** a goal added on day 40 should not pretend it existed on day 1. Late joiners are counted from their start date.

**New concepts**

- **Migration:** when the shape of saved data changes, old saved data needs updating on load.
- `!task.startDate` is true when `startDate` is missing.

```js
tasks.push({ text: taskText, done: false, startDate: getTodayKey() });

tasks.forEach((task) => {
  if (!task.startDate) {
    task.startDate = getTodayKey();
  }
});
```

The second block goes right after the tasks are loaded from `localStorage`.

**Checkpoint:** every task in Local Storage shows a `startDate`.

## Step 3b: Date helpers

**Why:** the streak walks backwards day by day, so we need "the key for one day earlier".

**New concepts**

- **Parameters:** `dateToKey(date)` gets its date from outside, so one function works for any day.
- `key.split("-").map(Number)` turns `"2026-11-21"` into `[2026, 11, 21]`.
- **Destructuring:** `const [y, m, d] = ...` unpacks the array into three variables.
- `date.setDate(date.getDate() + days)` moves by whole calendar days and handles month and year rollovers. Subtracting 24 hours in milliseconds can give the wrong date around daylight saving changes.

```js
function dateToKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return dateToKey(new Date());
}

function shiftKey(key, days) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return dateToKey(date);
}
```

**Why `m - 1`:** keys use human months (1 to 12), and JS dates use 0 to 11. This is the reverse of Step 2a, where we added 1.

**Checkpoint:** `shiftKey("2026-12-01", -1)` gives `2026-11-30`, `shiftKey("2026-12-31", 1)` gives `2027-01-01`, and `shiftKey("2026-03-01", -1)` gives `2026-02-28`.

## Step 3c: The streak counter

**New concepts**

- `while` loop: repeats as long as its condition is true.
- `&&` short-circuits: in `history[key] && history[key].counts`, if the day has no record, the right side is never read, so it can't crash.
- `streak++` adds 1. A changing value needs `let`, not `const`.

```js
function getStreak() {
  let streak = 0;
  const todayRec = history[getTodayKey()];
  if (todayRec && todayRec.counts && !restDays.includes(getTodayKey())) {
    streak++;
  }
  let key = shiftKey(getTodayKey(), -1);
  while (restDays.includes(key) || (history[key] && history[key].counts)) {
    if (!restDays.includes(key)) {
      streak++;
    }
    key = shiftKey(key, -1);
  }
  return streak;
}
```

If today is still in progress and doesn't count yet, the streak shows yesterday's count, so it doesn't drop to 0 mid-day.

**Important:** `key = shiftKey(key, -1)` must stay outside the inner `if`. Otherwise the loop never moves on a rest day and the tab freezes.

**Checkpoint:** with real data, the result matched my prediction, including a missing day breaking the chain.

## Step 3d: Rest-day data

**New concepts**

- `array.includes(x)` is Python's `x in list`.
- `key.slice(0, 7)` gives the year and month of a key (`"2026-11"`), another benefit of the `YYYY-MM-DD` format.
- Early returns: several `if (...) { return false; }` checks, then the real work.

```js
const MAX_REST = 3;

let restDays = [];
const restSave = localStorage.getItem("restDays");
if (restSave) {
  restDays = JSON.parse(restSave);
}

function saveRestDays() {
  localStorage.setItem("restDays", JSON.stringify(restDays));
}

function restUsedInMonth(key) {
  return restDays.filter((d) => d.slice(0, 7) === key.slice(0, 7)).length;
}

function addRestDay(key) {
  if (key !== getTodayKey() && key !== shiftKey(getTodayKey(), 1)) {
    return false;
  }
  if (restDays.includes(key)) {
    return false;
  }
  if (restUsedInMonth(key) >= MAX_REST) {
    return false;
  }
  restDays.push(key);
  saveRestDays();
  return true;
}
```

**Checkpoint:** in the Console, adding tomorrow gives `true`, adding it again gives `false`, and adding two days ahead or a past date gives `false`.

## Step 3e: The Rest section and confirm box

**What it does:** two quiet grey buttons ("Rest today", "Rest tomorrow") far below the checklist. Tapping one opens a confirm box with a warning. Only Confirm saves.

**New concepts**

- The `hidden` attribute hides an element, and JS toggles it with `element.hidden = true` or `false`.
- CSS can override `hidden` through `display`, so `[hidden] { display: none !important; }` makes sure it always wins.
- `pendingKey` remembers which day the confirm box is asking about (`null` when nothing is waiting).

**Checkpoint:** Cancel closes the box and saves nothing. Confirm lowers the "Rest days left this month" counter, and it survives a refresh.

## Step 3f: Disabled buttons and undo for tomorrow

**What it does:** the Rest today button greys out when today already counts, today is already a rest day, or the month's rest days are used up. Rest tomorrow greys out when tomorrow is already marked or its month is used up. An "Undo tomorrow's rest" button appears only when tomorrow is marked.

**New concepts**

- `button.disabled = condition` greys out and blocks a button.
- `||` is Python's `or`, and `!` means "not".
- `restDays = restDays.filter((d) => d !== key)` removes one item (works because `restDays` is `let`).
- Tomorrow can fall in the next month (Nov 30 to Dec 1), so tomorrow's limit check uses tomorrow's own month.

**Lesson:** a `let` variable can't be used before its declaration line has run. The `restDays` loading block has to sit above the new-day check, because that check calls `saveTasks()`, which leads to `updateRestUI()`, which reads `restDays`. It stays invisible on days when the date hasn't changed, and would crash on the first open of a new day.

**Checkpoint:** ticking all tasks greys out Rest today. Marking tomorrow shows the undo button. After undo, everything returns to normal.

## Step 3g: The streak skips rest days and shows on the page

**What it does:** `streakEl.textContent` is written inside `updateToday`, and the rest buttons call `updateToday()` so the streak refreshes after marking or undoing a rest day.

**Checkpoint:** with a rest day on a missing date, the streak continues across it. Without the rest day, it stops. My real data showed "Streak: 1" because the app wasn't opened on one day, and that is the rule working as designed.

---

## Day 3 final checklist

- [ ] Every task in Local Storage has a `startDate`.
- [ ] The three `shiftKey` tests print the right dates.
- [ ] `getStreak()` matches my prediction on real data.
- [ ] Rest days can only be added for today or tomorrow, 3 per month, no duplicates.
- [ ] The confirm box opens, cancels, and confirms correctly.
- [ ] Buttons grey out when they should, and undo works for tomorrow only.
- [ ] The streak skips rest days and shows on the page.
- [ ] No red errors in the Console.

## In my own words (fill this in)

- **Why does each goal get its own `startDate`?**
  ~~ A new goal has no data for the days before it was added. Without a start date, those older days would look like days I missed that goal, and it would mess up the history and pull the completion percentage down.
  With a `startDate`, the app counts that goal only from the day it was added.
  EX: no start date => the days before I added the goal look like misses.
  start date => the goal is counted from today onwards, and nothing before it is held against me.

- **Why does `shiftKey` use `setDate` and not subtract 24 hours?**
  ~~ Because a day is not always exactly 24 hours long. On days when the clocks change (daylight saving), a day can be 23 or 25 hours.
  So adding 24 hours could land on the wrong date, or even the same date again.
  `setDate` moves by whole calendar days instead of counting hours, and it handles the end of a month or a year by itself (Dec 31 + 1 becomes Jan 1).

- **Why does a day with no record break the streak, and how do rest days fix that?**
  ~~ Streak simply means doing the tasks continuously, and skipping a day breaks it.
  The app does not write anything for a day it was never opened. When the loop looks at that day, `history[key]` is empty, so the check fails and the loop stops there.
  Marking the day as rest puts it in the `restDays` list. The loop sees that and skips the day without adding 1 (`streak++`), and then keeps counting the earlier days. So a rest day neither adds to the streak nor breaks it.

- **Why are the Rest buttons far from the checklist, and why is there a confirm box?**
  ~~ The reason is mis-clicks. People often tap the wrong button while scrolling, and a rest day used by mistake can't be taken back (today's one is final) and counts against the 3 rest days per month.
  So the buttons are kept far away from the checklist, and the confirm box adds a warning step before anything is saved.

- **Why must the `restDays` loading block come before the new-day check?**
  ~~ The new-day check calls `saveTasks()`, which calls `updateToday()`, which calls `updateRestUI()`, and that function reads `restDays`.
  A `let` variable can't be used before the line that creates it has run. If the loading block sits below the check, JS stops with the error "Cannot access 'restDays' before initialization".
  I would not see it on a normal day, because the check only runs when the date has changed. It would crash the first time I open the app on a new day.

- **The hardest moment today was:**
  ~~ The hardest part today was the rest days. Most of the code looked similar to the earlier steps, but the logic inside the functions was a bit tricky.
  It got easier once I understood the idea behind it, and when I read the code once with the task written next to it.

## Common Mistakes

| Mistake                                                | Fix                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `const date` declared twice in `dateToKey`             | The parameter already creates `date`, so delete the extra `const date = new Date()`. |
| `getTodayKey` called `dateToKey()` with nothing inside | Pass the current date: `dateToKey(new Date())`.                                      |
| `shiftKey` always added `1`                            | Use the `days` parameter instead of a fixed number.                                  |
| `shiftKey` written inside `getTodayKey`                | Functions that others need must sit at the top level, side by side.                  |
| `getElementById("rest-Msg")`                           | Ids are case-sensitive. The HTML has `rest-msg`.                                     |
| `restDay = JSON.parse(...)` (missing the s)            | Assign to `restDays`. JS silently creates a new global variable instead of warning.  |
| A template literal on its own line                     | Text built but never assigned does nothing. Write `restInfo.textContent = ...`.      |

## Tomorrow (Day 4)

The dashboard: a heatmap of the year and a completion percentage, built from `history`.
