const chalk = require("chalk");
const inquirer = require("inquirer");

// Main menu
async function showMainMenu(gameState) {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Welcome to Trivia CLI! \n ",
      choices: [
        { name: "Start Game (coming soon)", value: "start" },
        { name: "Quit", value: "quit" }
      ]
    }
  ]);

  switch (action) {
    case "quit":
      console.log(chalk.cyan("Goodbye!"));
      process.exit(0);

    case "start":
    default:
      console.log(chalk.yellow("Not implemented yet."));
      await inquirer.prompt([
        {
          type: "list",
          name: "back",
          message: "Press Enter to go back \n ",
          choices: [{ name: "Back", value: "back" }]
        }
      ]);
      return showMainMenu(gameState);
  }
}

module.exports = { showMainMenu };
