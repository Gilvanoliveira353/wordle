// Configuração do Jogo
const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;

// Banco de palavras em português (apenas 5 letras)
const wordBank = [
  "CASAS", "LIVRO", "MELAO", "TERRA", "FOLHA", "GRAMA",
  "PEDRA", "AREIA", "NUVEM", "PLANO", "RUMOS", "VINHO"
];

// Filtra apenas palavras com 5 letras
const validWords = wordBank.filter(w => w.length === WORD_LENGTH);

// Sorteia uma palavra aleatória
const targetWord = validWords[Math.floor(Math.random() * validWords.length)];

// Estado do Jogo
let guesses = [];
let currentGuess = "";
let gameOver = false;

const board = document.getElementById("board");
const keyboardContainer = document.getElementById("keyboard-container");
const debugPanel = document.getElementById("debug-panel");
const messageContainer = document.getElementById("message-container");

// Layout do Teclado
const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
];

// Inicialização
function initGame() {
  createGrid();
  createKeyboard();
  updateDebug();
  window.addEventListener("keydown", handleKeydown);
}

// Criar Grid 6x5
function createGrid() {
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < WORD_LENGTH; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.id = `tile-${i}-${j}`;
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

// Criar Teclado
function createKeyboard() {
  keyboardLayout.forEach((rowKeys, rowIndex) => {
    const rowDiv = document.getElementById(`row-${rowIndex + 1}`);
    rowKeys.forEach(key => {
      const button = document.createElement("button");
      button.textContent = key;
      button.className = key.length > 1 ? "key key-wide" : "key";
      button.setAttribute("data-key", key);
      button.addEventListener("click", () => handleInput(key));
      rowDiv.appendChild(button);
    });
  });
}

// Manipular entrada
function handleKeydown(e) {
  if (gameOver) return;
  let key = e.key.toUpperCase();
  if (key === "ENTER") handleInput("ENTER");
  else if (key === "BACKSPACE") handleInput("⌫");
  else if (/^[A-Z]$/.test(key)) handleInput(key);
}

function handleInput(key) {
  if (gameOver) return;
  if (key === "⌫") {
    deleteLetter();
  } else if (key === "ENTER") {
    submitGuess();
  } else {
    addLetter(key);
  }
}

function addLetter(letter) {
  if (currentGuess.length < WORD_LENGTH) {
    currentGuess += letter;
    updateBoard();
  }
}

function deleteLetter() {
  if (currentGuess.length > 0) {
    currentGuess = currentGuess.slice(0, -1);
    updateBoard();
  }
}

function updateBoard() {
  const row = guesses.length;
  for (let i = 0; i < WORD_LENGTH; i++) {
    const tile = document.getElementById(`tile-${row}-${i}`);
    tile.textContent = currentGuess[i] || "";
    tile.setAttribute("data-state", currentGuess[i] ? "active" : "");
    if (!currentGuess[i]) tile.removeAttribute("data-state");
  }
  updateDebug();
}

function showMessage(msg) {
  const messageEl = document.createElement("div");
  messageEl.textContent = msg;
  messageEl.className = "message";
  messageContainer.appendChild(messageEl);
  setTimeout(() => {
    messageEl.style.opacity = "0";
    setTimeout(() => {
      messageContainer.removeChild(messageEl);
    }, 300);
  }, 2000);
}

function shakeTiles(row) {
  const rowEl = board.children[row];
  rowEl.classList.add("shake");
  setTimeout(() => rowEl.classList.remove("shake"), 600);
}

function submitGuess() {
  if (currentGuess.length !== WORD_LENGTH) {
    shakeTiles(guesses.length);
    showMessage("Não há letras suficientes");
    return;
  }

  const row = guesses.length;
  const guess = currentGuess;
  guesses.push(guess);

  const targetLetters = targetWord.split("");
  const guessLetters = guess.split("");
  const states = Array(WORD_LENGTH).fill("absent");

  // Verificar verdes
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      states[i] = "correct";
      targetLetters[i] = null;
      guessLetters[i] = null;
    }
  }

  // Verificar amarelos
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
      states[i] = "present";
      const index = targetLetters.indexOf(guessLetters[i]);
      targetLetters[index] = null;
    }
  }

  // Aplicar animações
  for (let i = 0; i < WORD_LENGTH; i++) {
    setTimeout(() => {
      const tile = document.getElementById(`tile-${row}-${i}`);
      tile.classList.add("flip");
      setTimeout(() => {
        tile.setAttribute("data-state", states[i]);
        updateKeyboardColor(guess[i], states[i]);
      }, FLIP_ANIMATION_DURATION / 2);
      if (i === WORD_LENGTH - 1) {
        setTimeout(checkWinCondition, FLIP_ANIMATION_DURATION);
      }
    }, i * 250);
  }

  currentGuess = "";
  updateDebug();
}

function updateKeyboardColor(letter, state) {
  const keyButton = document.querySelector(`button[data-key="${letter}"]`);
  if (!keyButton) return;
  if (state === "correct") {
    keyButton.style.backgroundColor = "var(--color-correct)";
  } else if (state === "present" && keyButton.style.backgroundColor !== "var(--color-correct)") {
    keyButton.style.backgroundColor = "var(--color-present)";
  } else if (state === "absent" && keyButton.style.backgroundColor !== "var(--color-correct)" && keyButton.style.backgroundColor !== "var(--color-present)") {
    keyButton.style.backgroundColor = "#3a3a3c";
  }
}

function checkWinCondition() {
  const lastGuess = guesses[guesses.length - 1];
  if (lastGuess === targetWord) {
    showMessage("Parabéns!");
    gameOver = true;
  } else if (guesses.length === 6) {
    showMessage(`A palavra era: ${targetWord}`);
    gameOver = true;
  }
}

function updateDebug() {
  debugPanel.innerHTML = `Palavra: ${targetWord} | Tentativas: ${guesses.length}/6 | Atual: ${currentGuess}`;
}
// Botão Reiniciar
document.getElementById("restart-btn").addEventListener("click", () => {
  location.reload();
});
// Iniciar
initGame();