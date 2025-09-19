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
            message: "\n=== Welcome to Trivia CLI! === \n      80s Movie Edition\n\nSelect an option:",
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
            break

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
        const playerAnswer = result.answerIndex;
        const timedOut = result.timer;

        // Check the answer and update score
        if (timedOut) {
            gameState.timeouts += 1;
            console.log(chalk.yellow("Time is up. \n"));
        } else if (playerAnswer === question.answerIndex) {
            gameState.correct += 1;
            console.log(chalk.green("Correct! \n"));
        } else {
            gameState.incorrect += 1;
            console.log(chalk.red(`Incorrect! The correct answer was: ${question.choices[question.answerIndex]} \n`));
        }

		// If there are more questions, ask to continue questions or exit game
		const isLastQuestion = questionIndex === questions.length - 1;
		if (!isLastQuestion) {
			const { next } = await inquirer.prompt([
				{
					type: "list",
					name: "next",
					message: "Continue or exit to main menu?",
					choices: [
                        // player proceeds to next question
						{ name: "Next Question", value: "continue" },
                        // player quits game and return to menu
						{ name: "Exit to Main Menu", value: "exit" }  
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
    console.log(chalk.cyan(`\nQuestion: ${question.question}`));

    // Answer list
    const answerList = question.choices.map((text, index) => ({
        name: text,
        value: index,
    }));

    // Initialize timer variables
    let timedOut = false;     
    let remainingTime = 10;
    
    // Visual timer bottom bar
    const bottomBar = new inquirer.ui.BottomBar();
    
    // add a spacer at the start of answer list
    answerList.push(new inquirer.Separator());

    // Start timer to count down every second
    const timerId = setInterval(() => {
                
        // Update bottom bar with remaining time
        bottomBar.updateBottomBar(chalk.yellow(`Time Remaining: ${remainingTime} seconds`));

        // Decrease remaining time
        remainingTime -= 1;

        // Check if time has run out
        if (remainingTime <= 0) {
            // Time's up
            clearInterval(timerId);
            // Set timeout result
            timedOut = true;
            // Simulate pressing Enter to submit no answer
            process.stdin.emit("data", Buffer.from("\n"));
        }
        // Increment every second 
    },  1000);

   
    
    // Creates the answer list prompt
    const { answer } = await inquirer.prompt([
        {
            type: "list",
            name: "answer",
            message: "",
            choices: answerList,
            pageSize: answerList.length,
        },
    ]);
    
    // Stop the countdown if it’s still running
    clearInterval(timerId);

    // Player Answer
    const result = { answerIndex: answer, timer: timedOut };

    // spacer
    console.log("");

    // Returns answerIndex & timer status
    return result; 
}


module.exports = { showMainMenu, startGame, askQuestion };