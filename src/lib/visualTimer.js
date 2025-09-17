// Dependencies
const inquirer = require("inquirer");

// Ensure the prompt list never collides with the BottomBar line
function reserveListRow(choices) {
  // blank sacrificial line
  const spacer = new inquirer.Separator(" ");
  return { choices: [...choices, spacer], pageSize: choices.length + 1 };
}

// Run any inquirer prompt with a countdown timer + clean UI handling.
// Returns either your mapped answer or { timedOut: true }.
function runWithTimer(promptPromise, { seconds = 10, mapAnswer = (x) => x } = {}) {
  const bottomBar = new inquirer.ui.BottomBar();

  let remaining = seconds;
  let latest = renderText(remaining);
  const render = () => bottomBar.updateBottomBar(latest);

  // initial paint
  render();

  // tick each second
  const interval = setInterval(() => {
    remaining -= 1;
    if (remaining >= 0) {
      latest = renderText(remaining);
      render();
    } else {
      clearInterval(interval);
    }
  }, 1000);

  // avoid flicker when list re-renders on keypress
  const repaintOnKey = () => { if (latest) render(); };
  process.stdin.on("data", repaintOnKey);

  // timeout branch that closes the prompt UI
  const timeoutMs = seconds * 1000;
  const timeoutPromise = new Promise((resolve) => {
    const id = setTimeout(() => {
      try { if (promptPromise.ui) promptPromise.ui.close(); } catch (uiError) {
        console.error("Failed to close prompt UI:", uiError);
      }
      resolve({ timedOut: true });
    }, timeoutMs);
    promptPromise.finally(() => clearTimeout(id));
  });

  return Promise.race([
    promptPromise.then((ans) => mapAnswer(ans)),
    timeoutPromise,
  ]).finally(() => {
    clearInterval(interval);
    process.stdin.off("data", repaintOnKey);
    bottomBar.updateBottomBar("");
    if (typeof bottomBar.close === "function") bottomBar.close();
  });
}

function renderText(s) {
  return `Time Remaining: ${String(s).padStart(2, "0")}s`;
}

module.exports = { reserveListRow, runWithTimer };

