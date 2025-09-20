// gameLogic fucntions
const { showMainMenu, startGame, askQuestion } = require('../src/lib/gameLogic');


// Mock enquirer
const mockRun = jest.fn();
jest.mock('enquirer', () => ({
    // Mock select
    Select: jest.fn().mockImplementation(() => ({ run: mockRun })),
}));


// Sample question
const question = {
  id: 1,
  question: "In Back to the Future 1985 what speed does the DeLorean need to reach to time travel?",
  choices: ["55 mph", "66 mph", "88 mph", "77 mph"],
  answerIndex: 2,
};


// Reset mocks after each test
afterEach(() => jest.clearAllMocks());


// Test askQuestion function
describe('askQuestion', () => {
    
    // Return correct answer object
    it('returns { answerIndex: 2, timer: false }', async () => {
        // Mock imput 
        mockRun.mockResolvedValue('2');
        // Check askQuestion function
        await expect(askQuestion(question)).resolves.toEqual({ answerIndex: 2, timer: false });
    });

    // Return incorrect answer object
    it('returns { answerIndex: 0, timer: false }', async () => {
        // Mock imput 
        mockRun.mockResolvedValue('0');
        // Check askQuestion function
        await expect(askQuestion(question)).resolves.toEqual({ answerIndex: 0, timer: false });
    });


    // Return timeout object
    it('returns { answerIndex: null, timer: true }', async () => {
        // Reject promise trigger catch
        mockRun.mockRejectedValue(new Error('timeout')); 
        // Check askQuestion function
        await expect(askQuestion(question)).resolves.toEqual({ answerIndex: null, timer: true });
    });
});

// Test startGame function
describe('startGame', () => {

    

});