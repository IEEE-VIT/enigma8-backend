require("dotenv").config();

const express = require("express");
//const cors = require("cors");
const express = require('express');
require('dotenv').config();
const passport = require('passport');
const cookieSession = require('cookie-session');
require('./config/passport-google-setup');
const mongoose = require('mongoose');
const User= require('./models/user-model');
const authRoutes = require('./routes/auth-routes-google');
const bodyParser = require('body-parser')

const mongoose = require("mongoose");
const apiRoutes = require("./routes/api");
const app = express();

const DB_URL = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

app.use(express.json());

//configure session storage
app.use(cookieSession({
  name: 'session-name',
  keys: [process.env.COOKIE_KEY]
}))


//app.use(cors());

app.use("/api", apiRoutes);

//connect to database
mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Database Connected!");
  });


//configure passportjs
app.use(passport.initialize());
app.use(passport.session());

//load routes
app.use('/', require('./routes/auth-routes-google'))
app.use('/profile', require('./routes/profile-routes'))

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server Ready! at port: localhost", PORT);
});
