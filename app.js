require("dotenv").config();
const cors = require("cors");

const express = require("express");
const authorized = require("./middleware/auth");

const connectToMongo = require("./models/db");

//routes imports
const authorizedRoutes = require("./routes/authorized");
const authRoutes = require("./routes/authentication");
const staticRoutes = require("./routes/static");
const userRoutes = require("./routes/user");
<<<<<<< HEAD
const roomRoutes = require("./routes/room");
=======
const transactRoutes = require("./routes/transact");
const gameRoutes = require("./routes/game");
>>>>>>> 241a6d71617e1b1be820a2317919757efc2334f0

const app = express();
const DB_URL = process.env.DB_URI;
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

require("./config/passport");

//connect to mongoDB
connectToMongo().on("connected", () => {
  console.log("✅ Mongoose is connected");
});

app.use("/auth", authRoutes);
app.use("/authorized", authorized, authorizedRoutes);
app.use("/static", staticRoutes);
app.use("/user", authorized, userRoutes);
<<<<<<< HEAD
app.use("/room", authorized, roomRoutes);
=======
app.use("/transact", authorized, transactRoutes);

app.use("/game", authorized, gameRoutes);
>>>>>>> 241a6d71617e1b1be820a2317919757efc2334f0

app.get("/", (req, res) => {
  res.send("The server is running!");
});

app.listen(PORT, () => {
  console.log("🚀 Server Ready! at port:", PORT);
  console.log("Goto http://localhost:" + PORT);
});
