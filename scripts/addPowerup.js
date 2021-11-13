const prompt = require("prompt");
require("dotenv").config();
const connectToMongo = require("../models/db");
const Powerup = require("../models/powerupModel");

//connect to mongoDB
connectToMongo().on("connected", () => {});

//use || operator to enter multiple values

prompt.start();

prompt.get(["name", "beAlias", "detail", "icon"], async (err, result) => {
  if (err) {
    console.log("Error");
  }

  var powerupp = new Powerup({
    name: result.name,
    beAlias: result.beAlias,
    detail: result.detail,
    icon: result.icon,
  });

  try {
    await powerupp.save();
    console.log("powerup added");
  } catch (e) {
    console.log("error updating powerup");
  }
});
