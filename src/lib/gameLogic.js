// Dependencies
const chalk = require("chalk");
const inquirer = require("inquirer");


// Questions data
const questions = require("../data/questions");

// Game state functions
const { showScore, resetScore } = require("./state");


// Main menu
async function showMainMenu(gameState) {
    // Show menu options
    const { action } = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "\nWelcome to Trivia CLI! \n80s Movie Edition\n\nSelect an option:",
            choices: [
                // Start game
                { name: "Start Game", value: "start" },
                // Quit game
                { name: "Quit \n", value: "quit" }
            ], 
            prefix: ""
        }
    ]);

    // Handle menu action
    switch (action) {
        // Exit
        case "quit":
            console.log(chalk.cyan("Goodbye! \n"));
            process.exit(0);

        // Start game
        case "start":
        default:
            resetScore(gameState);
            await startGame(gameState);
            return showMainMenu(gameState);
    }
}

// Start game loop
async function startGame(gameState) {

    // Go through each question in order
	for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {

        // Current question
		const question = questions[questionIndex];

		// Ask the question and wait for the player's choice
		const result = await askQuestion(question);
        
        // Player's answer
        const playerAnswer = result.answerIndex
        const timedOut = Boolean(result.timedOut);

        // Check the answer and update score
        if (timedOut) {
            gameState.timeouts += 1;
            console.log(chalk.yellow("\nTime is up. \n"));
        } else if (playerAnswer === question.answerIndex) {
            gameState.correct += 1;
            console.log(chalk.green("Correct! \n"));
        } else {
            gameState.incorrect += 1;
            console.log(chalk.red(`Incorrect! The correct answer was: ${question.choices[question.answerIndex]} \n`));
        }

		// If there are more questions, ask to continue or exit
		const isLastQuestion = questionIndex === questions.length - 1;
		if (!isLastQuestion) {
			const { next } = await inquirer.prompt([
				{
					type: "list",
					name: "next",
					message: "Continue or exit to main menu?",
					choices: [
						{ name: "Next Question", value: "continue" }, // proceed to next question
						{ name: "Exit to Main Menu", value: "exit" }  // stop and return to menu
					],
					default: "continue",
                    prefix: ""
				}
			]);

			// Stop early if exit is chosen
			if (next === "exit") break;
		}
	}

	// Show the score for this game
	showScore(gameState);
}


// Ask one question and return the player answer or timeout
async function askQuestion(question) {
    
    // Prints the question
    console.log(chalk.cyan(`\nQuestion: ${question.question}`));

    // Answers list
    const answerList = question.choices.map((text, index) => ({
        name: text,
        value: index
    }));

    // Create the prompt and keep its UI handle on the returned promise
    const promptPromise = inquirer.prompt([
        {
            type: "list",
            name: "answer",
            message: "Select Answer:",
            choices: answerList,
            loop: false,
            prefix: ""
        }
    ]);

    // Build a timeout that closes the prompt and resolves with { timedOut: true }
    const timeoutPromise = new Promise((resolve) => {
        const id = setTimeout(() => {
        try { if (promptPromise.ui) promptPromise.ui.close(); } catch {}
        resolve({ timedOut: true });
    }, 10000);

    // If the player answers first, clear the timeout
    promptPromise.finally(() => clearTimeout(id));
    });

    // Promise race: player answer vs timeout
    const result = await Promise.race([
        promptPromise.then(({ answer }) => ({ answerIndex: answer })),
        timeoutPromise
    ]);

    // Small spacer to separate from the next prompt rendering
    console.log("");

    return result;
}

module.exports = { showMainMenu };