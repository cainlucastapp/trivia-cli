//Mock questions
jest.mock('../src/data/questions', () => ([
  {
    id: 1,
    question: "In Back to the Future 1985 what speed does the DeLorean need to reach to time travel?",
    choices: ["55 mph", "66 mph", "88 mph", "77 mph"],
    answerIndex: 2,
  },
  {
    id: 2,
    question: "In The Breakfast Club 1985 how many students are in detention?",
    choices: ["5", "6", "7", "8"],
    answerIndex: 0,
  },
  {
    id: 3,
    question: "Which 1984 movie features a friendly alien who wants to phone home?",
    choices: ["Short Circuit", "E.T. the Extra Terrestrial", "The Last Starfighter", "Batteries Not Included"],
    answerIndex: 1,
  },
]));


// Mock enquirer
const mockRun = jest.fn();
jest.mock('enquirer', () => ({
    // Mock select
    Select: jest.fn().mockImplementation(() => ({ 
        run: mockRun 
    })),
}));

// Mock startGame Function
const game = require('../src/lib/gameLogic');
game.startGame = jest.fn().mockResolvedValue();


// Reset mocks after each test
afterEach(() => jest.clearAllMocks());


// gameLogic fucntions
const { showMainMenu, startGame, askQuestion } = require('../src/lib/gameLogic');
const { showScore, resetScore } = require('../src/lib/state');
const state = require('../src/lib/state');


// Sample question
const sampleQuestion = {
  id: 1,
  question: "In Back to the Future 1985 what speed does the DeLorean need to reach to time travel?",
  choices: ["55 mph", "66 mph", "88 mph", "77 mph"],
  answerIndex: 2,
};


// Sample gameState
const gameState = {
  correct: 0,
  incorrect: 0,
  timeouts: 0
};


// Test showMainMenu
describe('showMainMenu', () => {

    // Start game
    it('start game', async () => {
        // Select start
        mockRun.mockResolvedValueOnce('start');
        // Reject promise                
        mockRun.mockRejectedValueOnce(new Error('STOP'));
        // Expect stop
        await expect(showMainMenu(state)).rejects.toThrow('STOP');
    });

    //Exit game
    it('exit game', async () => {
        // Mock exit
        process.exit = jest.fn(() => { throw new Error('EXIT'); });
        // Reject promise
        mockRun.mockResolvedValueOnce('quit');
        // Expect exit
        await expect(showMainMenu(gameState)).rejects.toThrow('EXIT');
    });

});


// Test startGame fuction
describe('startGame', () => {

    it('continue through 3 questions', async () => {
        // make sure prior calls don’t leak in
        mockRun.mockReset();
        // Run through questions
        mockRun.mockResolvedValueOnce('2');
        mockRun.mockResolvedValueOnce('continue');
        mockRun.mockResolvedValueOnce('2');
        mockRun.mockResolvedValueOnce('continue');
        mockRun.mockResolvedValueOnce('2');
        // Mock startGame
        await jest.isolateModulesAsync(async () => {
            const game = require('../src/lib/gameLogic');
            game.showScore = () => {};                    
            await game.startGame({ gameState });
        });
        // 3 answers 2 continues 5 total prompt runs
        expect(mockRun).toHaveBeenCalledTimes(5);
    });

});


// Test askQuestion function
describe('askQuestion', () => {
    
    // gameState correct = 1
    it('returns correct = 1', async () => {
        // Mock imput 
        mockRun.mockResolvedValue('2');
        // Ask questiona and returns gameState
        const score = await askQuestion(sampleQuestion, gameState);
        // Check askQuestion function
        expect(score.correct).toBe(1);
    });

    // gameState incorrect = 1
    it('returns incorrect = 1', async () => {
        // Mock imput 
        mockRun.mockResolvedValue('0');
        // Ask questiona and returns gameState
        const score = await askQuestion(sampleQuestion, gameState);
        // Check askQuestion function
        expect(score.incorrect).toBe(1);
    });


    // gameState timeouts = 1
    it('returns timeouts = 1', async () => {
        // Reject promise and catch returns timeout true
          mockRun.mockRejectedValue(new Error('timeout'));
        // Ask question and returns gameState
        const score = await askQuestion(sampleQuestion, gameState);
        // Check askQuestion function
        expect(score.timeouts).toBe(1);
    });

});


// Test resetScore
describe('resetScore', () => {

    // Final gameState with points
    const finalGameState = {
        correct: 6,
        incorrect: 1,
        timeouts: 9
    };
    // Reset scores to 0
    it('resets scores to 0', () => {
        // Call resetScore
        resetScore(finalGameState);
        // Correct = 0
        expect(finalGameState.correct).toBe(0);
        // Incorrect = 0
        expect(finalGameState.incorrect).toBe(0);
        // Timeouts  0
        expect(finalGameState.timeouts).toBe(0);
    });

});


// Test showScore
describe('showScore', () => {

    it('prints the final score lines', () => {
        // Mock console.log to capture calls
        console.log = jest.fn();
        // Finished gameState with points
        const finishedGameState = {
            correct: 9,
            incorrect: 2,
            timeouts: 8
        };
        // Call showScore 
        showScore(finishedGameState);
        // Read all console.log calls
        const calls = console.log.mock.calls;
        // Game Over
        expect(calls[0][0]).toEqual(expect.stringContaining("Game Over"));
        // Correct line
        expect(calls[1]).toEqual(["Correct:", 9]);
        // Incorrect line
        expect(calls[2]).toEqual(["Incorrect:", 2]);
        // Timeouts line
        expect(calls[3]).toEqual(["Timeouts:", 8]);
        // Thanks for playing
        expect(calls[4][0]).toEqual(expect.stringContaining("Thanks for playing!"));
    });

});
