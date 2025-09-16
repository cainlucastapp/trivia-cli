#!/usr/bin/env node
const { program } = require("commander");
const gameState = require("../src/lib/state");    
const { showMainMenu } = require("../src/lib/gameLogic");

showMainMenu(gameState);
program.parse(process.argv);
