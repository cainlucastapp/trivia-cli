// tests/gameLogic.test.js

// ----- Mocks FIRST (chalk is NOT mocked) -----

// Route-aware inquirer mock so different prompts don't consume each other's stubs
jest.mock("inquirer", () => ({
  prompt: jest.fn(),
}));

// EXACT paths as imported by gameLogic.js from the test's perspective
jest.mock("../src/lib/visualTimer", () => ({
  reserveListRow: jest.fn((choices) => ({ choices, pageSize: choices.length })),
  runWithTimer: jest.fn(),
}));

// Keep unit tests fast & deterministic. (Delete this mock to use real questions.)
jest.mock("../src/data/questions", () => ([
  { question: "What is 2+2?",       choices: ["3", "4", "5"],         answerIndex: 1 },
  { question: "Capital of France?", choices: ["Berlin", "Paris", "Rome"], answerIndex: 1 },
]));

// Match what gameLogic.js imports for state helpers
jest.mock("../src/lib/state", () => ({
  showScore: jest.fn(),
  resetScore: jest.fn(),
}));

// ----- Now require after mocks -----
const inquirer = require("inquirer");
const { runWithTimer } = require("../src/lib/visualTimer");
const { showScore, resetScore } = require("../src/lib/state");
const { showMainMenu, startGame, askQuestion } = require("../src/lib/gameLogic");

// Helper: route-aware prompt mock
function installPromptRouter() {
  const actionQueue = [];
  const nextQueue = [];

  const setAction = (...vals) => actionQueue.push(...vals);
  const setNext = (...vals) => nextQueue.push(...vals);

  inquirer.prompt.mockImplementation((arr) => {
    const q = Array.isArray(arr) ? arr[0] : arr;
    const name = q && q.name;

    if (name === "action") {
      if (!actionQueue.length) throw new Error("Test did not enqueue an action response");
      return Promise.resolve({ action: actionQueue.shift() });
    }
    if (name === "next") {
      if (!nextQueue.length) throw new Error("Test did not enqueue a next response");
      return Promise.resolve({ next: nextQueue.shift() });
    }
    if (name === "answer") {
      // Let runWithTimer control resolution; don't consume action/next queues here.
      return new Promise(() => {});
    }
    return Promise.resolve({});
  });

  return { setAction, setNext };
}

describe("gameLogic", () => {
  let gameState;
  const originalExit = process.exit;

  beforeEach(() => {
    gameState = { correct: 0, incorrect: 0, timeouts: 0 };
    jest.clearAllMocks();
    process.exit = jest.fn(); // don’t actually exit Jest
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  describe("showMainMenu", () => {
    it("exits when user selects quit", async () => {
      const { setAction } = installPromptRouter();
      setAction("quit");

      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      await showMainMenu(gameState);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Goodbye!"));
      expect(process.exit).toHaveBeenCalledWith(0);
      logSpy.mockRestore();
    });

    it("starts game when user selects start, exits round, then quits from menu", async () => {
      const { setAction, setNext } = installPromptRouter();
      setAction("start"); // first menu
      setNext("exit");    // after first question
      setAction("quit");  // back to menu

      // askQuestion will call runWithTimer once for Q1
      runWithTimer.mockResolvedValueOnce({ answerIndex: 1 });

      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      await showMainMenu(gameState);

      expect(resetScore).toHaveBeenCalledWith(gameState);
      expect(process.exit).toHaveBeenCalledWith(0);
      logSpy.mockRestore();
    });
  });

  describe("startGame loop", () => {
    it("increments correct then timeouts across two questions", async () => {
      const { setNext } = installPromptRouter();

      // Q1: correct → then prompt 'next' → continue
      runWithTimer
        .mockResolvedValueOnce({ answerIndex: 1 }) // Q1
        .mockResolvedValueOnce({ timedOut: true }); // Q2
      setNext("continue");

      showScore.mockImplementation(() => {});
      await startGame(gameState);

      expect(gameState.correct).toBe(1);
      expect(gameState.timeouts).toBe(1);
      expect(gameState.incorrect).toBe(0);
      expect(showScore).toHaveBeenCalled();
    });

    it("increments incorrect on wrong answer and exits round", async () => {
      const { setNext } = installPromptRouter();

      // Q1: wrong (correct index is 1)
      runWithTimer.mockResolvedValueOnce({ answerIndex: 0 });
      setNext("exit");

      showScore.mockImplementation(() => {});
      await startGame(gameState);

      expect(gameState.incorrect).toBe(1);
      expect(gameState.correct).toBe(0);
      expect(gameState.timeouts).toBe(0);
    });
  });

  describe("askQuestion", () => {
    it("returns answerIndex when answered", async () => {
      installPromptRouter(); // ensures the 'answer' prompt doesn't eat action/next
      runWithTimer.mockResolvedValueOnce({ answerIndex: 1 });

      const q = { question: "Test Q?", choices: ["A", "B"], answerIndex: 0 };
      await expect(askQuestion(q)).resolves.toEqual({ answerIndex: 1 });
    });

    it("returns timedOut when timed out", async () => {
      installPromptRouter();
      runWithTimer.mockResolvedValueOnce({ timedOut: true });

      const q = { question: "Test Q?", choices: ["A", "B"], answerIndex: 0 };
      await expect(askQuestion(q)).resolves.toEqual({ timedOut: true });
    });
  });
});
