const board = document.getElementById("gameBoard");
const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");
const player1Display = document.getElementById("player1");
const player2Display = document.getElementById("player2");

const socket = io();
let locked = false;

socket.on("start", (state) => {
  board.innerHTML = "";
  state.board.forEach((_, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.index = index;
    card.addEventListener("click", () => {
      if (locked || card.classList.contains("matched")) return;
      socket.emit("flip", index);
    });
    board.appendChild(card);
  });

  score1.textContent = 0;
  score2.textContent = 0;
  player1Display.classList.add("active");
  player2Display.classList.remove("active");
});

socket.on("flip", ({ index, emoji }) => {
  const card = board.children[index];
  if (!card) return;
  card.textContent = emoji;
  card.classList.add("flipped");
});

socket.on("update", (data) => {
  score1.textContent = data.scores[1];
  score2.textContent = data.scores[2];

  player1Display.classList.toggle("active", data.currentPlayer === 1);
  player2Display.classList.toggle("active", data.currentPlayer === 2);
  locked = true;
});

socket.on("clear", (state) => {
  board.childNodes.forEach((card, index) => {
    if (!card.classList.contains("matched")) {
      card.textContent = "";
      card.classList.remove("flipped");
    }
  });

  const [i1, i2] = state.flipped;
  if (i1 !== undefined && i2 !== undefined) {
    const c1 = board.children[i1];
    const c2 = board.children[i2];
    if (c1.textContent === c2.textContent) {
      c1.classList.add("matched");
      c2.classList.add("matched");
    }
  }

  locked = false;
});

socket.on("waiting", () => {
  alert("Esperando outro jogador...");
});

socket.on("full", () => {
  alert("Sala cheia! Tente novamente mais tarde.");
});
