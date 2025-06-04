// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static("public"));

// Estado do jogo
let players = {};
let gameState = {
  board: [],
  flipped: [],
  scores: { 1: 0, 2: 0 },
  currentPlayer: 1,
};

function shuffleBoard() {
  const emojis = ["🐶", "🐱", "🐭", "🦊", "🐸", "🐵", "🐻", "🐼"];
  const cards = [...emojis, ...emojis];
  return cards.sort(() => Math.random() - 0.5);
}

io.on("connection", (socket) => {
  console.log("Um jogador conectou:", socket.id);

  // Associa jogador a um número (1 ou 2)
  if (!players[1]) players[1] = socket.id;
  else if (!players[2]) players[2] = socket.id;
  else {
    socket.emit("full");
    return;
  }

  // Se dois jogadores conectados, inicia o jogo
  if (players[1] && players[2]) {
    gameState.board = shuffleBoard();
    gameState.flipped = [];
    gameState.scores = { 1: 0, 2: 0 };
    gameState.currentPlayer = 1;
    io.emit("start", gameState);
  }

  // Jogada
  socket.on("flip", (index) => {
    const playerNum = socket.id === players[1] ? 1 : 2;
    if (playerNum !== gameState.currentPlayer) return;

    if (gameState.flipped.includes(index)) return;

    gameState.flipped.push(index);

    if (gameState.flipped.length === 2) {
      const [i1, i2] = gameState.flipped;
      const match = gameState.board[i1] === gameState.board[i2];

      if (match) {
        gameState.scores[playerNum]++;
      } else {
        gameState.currentPlayer = playerNum === 1 ? 2 : 1;
      }

      io.emit("update", {
        flipped: [...gameState.flipped],
        board: gameState.board,
        scores: gameState.scores,
        currentPlayer: gameState.currentPlayer,
        match,
      });

      setTimeout(() => {
        gameState.flipped = [];
        io.emit("clear", gameState);
      }, 1000);
    } else {
      io.emit("flip", { index, emoji: gameState.board[index] });
    }
  });

  socket.on("disconnect", () => {
    console.log("Jogador saiu:", socket.id);
    if (socket.id === players[1]) delete players[1];
    if (socket.id === players[2]) delete players[2];
    gameState = {
      board: [],
      flipped: [],
      scores: { 1: 0, 2: 0 },
      currentPlayer: 1,
    };
    io.emit("waiting");
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
