// Dependencies
const chalk = require("chalk");


// Game state to track correct, incorrect answers and timeouts
module.exports = {
  correct: 0,
  incorrect: 0,
  timeouts: 0
};


// Show final score
function showScore(state) {
  console.log(chalk.cyan("\n=== Game Over ==="));
  console.log("Correct:", state.correct);
  console.log("Incorrect:", state.incorrect);
  console.log("Timeouts:", state.timeouts);
  console.log("\n" + chalk.cyan("Thanks for playing!") + "\n");
}


// Reset score on new game
function resetScore(state) {
  state.correct = 0;
  state.incorrect = 0;
  state.timeouts = 0;
}


module.exports = { showScore, resetScore };