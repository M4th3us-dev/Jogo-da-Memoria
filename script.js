const board = document.getElementById('gameBoard');
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const player1Display = document.getElementById('player1');
const player2Display = document.getElementById('player2');

const emojis = ['🐶', '🐱', '🐭', '🦊', '🐸', '🐵', '🐻', '🐼'];
const cards = [...emojis, ...emojis];
cards.sort(() => Math.random() - 0.5);

let flippedCards = [];
let lock = false;
let currentPlayer = 1;
let points = { 1: 0, 2: 0 };

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  player1Display.classList.toggle('active', currentPlayer === 1);
  player2Display.classList.toggle('active', currentPlayer === 2);
}

function updateScore() {
  score1.textContent = points[1];
  score2.textContent = points[2];
}

cards.forEach((emoji, index) => {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.emoji = emoji;
  card.dataset.index = index;

  card.addEventListener('click', () => {
    if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.textContent = emoji;
    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      lock = true;
      const [first, second] = flippedCards;

      if (first.dataset.emoji === second.dataset.emoji) {
        first.classList.add('matched');
        second.classList.add('matched');
        points[currentPlayer]++;
        updateScore();
        flippedCards = [];
        lock = false;
      } else {
        setTimeout(() => {
          first.textContent = '';
          second.textContent = '';
          first.classList.remove('flipped');
          second.classList.remove('flipped');
          flippedCards = [];
          lock = false;
          switchPlayer();
        }, 1000);
      }
    }
  });

  board.appendChild(card);
});

player1Display.classList.add('active');
updateScore();
