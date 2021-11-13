const express = require("express");
const router = express.Router();
const { response } = require("../config/responseSchema");

const getTimer = require("../controllers/timerController");

router.get("/timer", async (req, res) => {
  response(res, getTimer());
});

const intro = "This is a sample intro"

router.get("/intro", async (req, res) => {
  response(res, {
    intro: intro,
  });
});

const gameMechanics = ["Enigma 8 is an online cryptic hunt where players solve exciting riddles and puzzles to win amazing prizes.", "There are eight rooms in total and each room has three questions.", "On solving a question, the player will receive a key", "A particular amount of keys are required to unlock a room.", "Solve every question to be the first one to solve Enigma."];
const scoringSystem = ["Upon solving a question, a player shall receive a particular amount of points relative to the competition - the earlier you solve a question, the higher your score will be. These points determine your position on the leaderboard.", "Upon using a hint, X points will be deducted from the score earned on solving that particular question."];
const roomStates = ["A room can either be locked, unlocked, or solved.", "A room is locked when the player does not have the minimum amount of stars to unlock it else if the player hasn’t yet chosen a powerup for that room.", "A room is unlocked when the player has sufficient stars and has chosen a powerup for that room.", "A room is solved only when a player solves all three questions in that room."];
const powerUps = ["Every player gets eight power ups at the start of the game.", "Before a player enters the room, they have to choose a powerup and the powerup chosen can only be used in that particular room.", "Only one powerup can be chosen per room and can only be used  only for one question in that room.", "no points will be deducted for using a powerup.", "Each powerup can be used only once, during the entire game."];
const miscellaneous = ["To smoothen your experience during Enigma, please enable the notifications for this app/website to receive important updates.", "Malpractice in any form will be dealt with seriously. Players are requested to report us of any such practices .", "Enigma is an individual player game and the players are requested to maintain the integrity of the game and not to divulge the solutions anywhere..."];

router.get("/rules", async (req, res) => {
  response(res, {
    gameMechanics,
    scoringSystem,
    roomStates,
    powerUps,
    miscellaneous
  });
});

module.exports = router;
