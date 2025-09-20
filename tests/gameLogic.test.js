// tests/gameLogic.test.js

// Mock Enquirer BEFORE requiring SUT
const mockRun = jest.fn();
jest.mock('enquirer', () => ({
  Select: jest.fn().mockImplementation(() => ({ run: mockRun })),
}));

const { askQuestion } = require('../src/lib/gameLogic');

const sampleQuestion = [{
  id: 1,
  question: "In Back to the Future 1985 what speed does the DeLorean need to reach to time travel?",
  choices: ["55 mph", "66 mph", "88 mph", "77 mph"],
  answerIndex: 2,
}];

afterEach(() => jest.clearAllMocks());

describe('askQuestion', () => {
  test('returns { answerIndex: 2, timer: false }', async () => {
    mockRun.mockResolvedValue('2'); // Select.run() returns a STRING
    await expect(askQuestion(sampleQuestion[0]))
      .resolves.toEqual({ answerIndex: 2, timer: false });
  });

  test('handles index 0 correctly', async () => {
    mockRun.mockResolvedValue('0');
    await expect(askQuestion(sampleQuestion[0]))
      .resolves.toEqual({ answerIndex: 0, timer: false });
  });

  test('handles cancel/timeout shape', async () => {
    // Whatever you use to signal timeout/cancel; adjust expected accordingly
    mockRun.mockRejectedValue(new Error('cancel'));
    await expect(askQuestion(sampleQuestion[0]))
      .resolves.toEqual({ answerIndex: null, timer: true });
  });
});
