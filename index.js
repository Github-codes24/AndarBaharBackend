const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const http = require("http");
const { MainCard } = require("./models/test.model");
require("dotenv").config();
const { registerUser, updatedUserAfterWin } = require("./Controllers/users");
const {
  cardID,
  MainCardGenerator,
  gameCardHandler,
} = require("./Controllers/mainCard");
const { handlebet, betWinHandler } = require("./Controllers/handleBet");
const { connection } = require("./config/db");
const { GameHistory } = require("./models/gameHistory.model");

const PORT = process.env.PORT || 6000;
const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const io = socketIO(server);

app.get("/", (req, res) => {
  res.send("server is running");
});

let timerState = {
  duration: 45,
  isRunning: false,
  stateFlag: true,
  betFlag: true,
  dbFlag:false
};

const sendMainCardData = async () => {
  let main_card = await MainCard.findById(cardID.cardID);
  const result = await GameHistory.aggregate([
    {
      $project: {
        lastTenElements: { $slice: ["$andarBaharGameHistory", -10] },
      },
    },
  ]);
  io.to("AndarBaharRoom").emit("Main_Card", {
    mainCard: main_card,
    gameHistory: result[0]?.lastTenElements,
  });
};
function starttimer() {
  if (!timerState.isRunning) {
    timerState.isRunning = true;
    setInterval(() => {
      timerState.duration--;

      if (
        (timerState.duration == 0 && timerState.stateFlag == true) ||
        (timerState.duration <= 45 &&
          timerState.duration >= 43 &&
          timerState.stateFlag == true)
      ) {
        MainCardGenerator();
        timerState.stateFlag = false;
      }
      if (
        timerState.duration <= 21 &&
        timerState.duration >= 20 &&
        timerState.stateFlag == false
      ) {
        gameCardHandler(cardID.cardID);
        timerState.stateFlag = true;
      }
      if (
        timerState.duration <= 14 &&
        timerState.duration >= 12 &&
        timerState.betFlag == true
      ) {
        betWinHandler(cardID.cardID);
        timerState.betFlag = false;
      }
      if (timerState.duration < 0) {
        timerState.duration = 45;
        timerState.isRunning = false;
        timerState.betFlag = true;
      }

      io.to("AndarBaharRoom").emit("gameUpdate", {
        gamestate: { value: timerState.duration },
      });
      if (cardID?.cardID) {
        sendMainCardData();
      }
    }, 1000);
  }
}

const IOConnection=()=>{
  io.on("connection", (socket) => {
   
    console.log("socket connected successfully");
    const userId = socket.handshake.query.userID;
    socket.join("AndarBaharRoom");
      registerUser(userId, socket);
    handlebet(userId, socket);
    updatedUserAfterWin(userId, socket);
  
    socket.on("disconnect", () => {
      console.log("socket disconnected successfully");
      // Clean up resources associated with the user ID when the socket disconnects
    });
  });

}

server.listen(PORT, async () => {
  try {
    await connection.then(() => {
      IOConnection()
      starttimer()
    });
    console.log("Connected to DB");
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.log(error);
  }
});
