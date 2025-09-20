// Dependencies
const chalk = require("chalk");
const { Select } = require("enquirer");

// Questions data
const questions = require("../data/questions");


// Game state functions
const { showScore, resetScore } = require("./state");
//const { format } = require("path");


// Main menu
async function showMainMenu(gameState) {
    // Show menu options
    const prompt = new Select({
        name: "action",
        message: "\n=== Welcome to Trivia CLI! === \n      80s Movie Edition\n\nSelect an option:",
        prefix: "",
        hint: "",
        choices: [
            // Start game
            { name: "start", message: "Start Game" },
            // Quit game
            { name: "quit",  message: "Quit" }
        ],
        initial: 0,
        clear: true,
        format: () => ""
    });

    // Await the player's input
    const action = await prompt.run();

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
            // Resets Score
            resetScore(gameState);
            // Starts game
            await module.exports.startGame(gameState);
            // Player ends game early
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
		await module.exports.askQuestion(question, gameState);

		// If there are more questions, ask to continue questions or exit game
		const isLastQuestion = questionIndex === questions.length - 1;
		if (!isLastQuestion) {
			const prompt = new Select({
					name: "next",
					message: "Continue or exit to main menu?",
					choices: [
                        // player proceeds to next question
						{ name: "continue", message: "Next Question" },
                        // player quits game and return to menu
						{ name: "exit", message: "Exit to Main Menu" }
					],
					initial: 0, // default "continue"
                    prefix: ""
				});

            // Await the player's input        
            const next = await prompt.run();

			// Stop early if exit is chosen
			if (next === "exit") break;
		}
	}

	// Show the score for this game
	showScore(gameState);
}


// Ask one question, checks the answer and returns the gameState
async function askQuestion(question, gameState) {
    console.log(chalk.cyan(`\nQuestion: ${question.question}`));

    // Answer list
    const answerList = question.choices.map((text, index) => ({
        message: text,
        name: String(index),
    }));

    // Initialize function's variables
    let timedOut = false;     
    let answer = null;
    let remainingTime = 10;
      
    // Creates answer list prompt
    const prompt = new Select({
        name: " -Select an answer (You have 10 seconds)- \n",
        message: "",
        prefix: "",
        suffix: "",
        hint: "",
        choices: answerList,
        limit: answerList.length,
        clear: true,
        format: () => ``,
        footer: () => `\n${chalk.yellow(`Time Remaining: ${remainingTime}s`)}`
    });

    // Start timer to count down every second
    const timerId = setInterval(() => {
                
        // Decrease remaining time
        remainingTime -= 1;
        
        // forces redraw each second
        prompt.render();           

        // Check if time has run out
        if (remainingTime <= 0) {
            // Time's up
            clearInterval(timerId);
            // Set timeout result
            timedOut = true;
            prompt.cancel();
        }
        // Increment every second 
    },  1000);

    // Await the player's answer and return the index
    await prompt.run()
        // Player answers in time
        .then((selectedText) => {
            timedOut = false;
            answer = Number(selectedText); 
        })
        // Timeout
        .catch(() => { 
            timedOut = true;
            answer = null;
    });

    // Stop the countdown if it’s still running
    clearInterval(timerId);

    // Check the answer and update score
    if (timedOut) {
        // Timeout
        gameState.timeouts += 1;
        console.log(chalk.yellow("\nTime is up. \n"));
    } else if (answer === question.answerIndex) {
        // Correct answer
        gameState.correct += 1;
        console.log(chalk.green(`\nCorrect! ${question.choices[question.answerIndex]} \n`));
    } else {
        // Wrong answer
        gameState.incorrect += 1;
        console.log(chalk.red(`\nIncorrect! The correct answer was: ${question.choices[question.answerIndex]} \n`));
    }

    // Returns gameState
    return gameState; 
}


module.exports = { showMainMenu, startGame, askQuestion };