const startGameButton = document.getElementById("startGameBtn");
const startListeningButton = document.getElementById("startListeningBtn");
const transcriptElement = document.getElementById("transcript");
const statusElement = document.getElementById("listeningStatus");
const selectionResultElement = document.getElementById("selectionResult");
const selectionScreenElement = document.getElementById("selectionScreen");
const gameScreenElement = document.getElementById("gameScreen");
const voiceEnablePrompt = document.getElementById("voiceEnablePrompt");
const characterGridElement = document.getElementById("characterGrid");
const bgMusicElement = document.getElementById("bgMusic");
const musicToggleButton = document.getElementById("musicToggleBtn");
const playerCardElement = document.getElementById("playerCard");
const enemyCardElement = document.getElementById("enemyCard");
const playerNameElement = document.getElementById("playerName");
const enemyNameElement = document.getElementById("enemyName");
const playerImageElement = document.getElementById("playerImage");
const enemyImageElement = document.getElementById("enemyImage");
const questionDisplayElement = document.getElementById("questionDisplay");
const questionImageElement = document.getElementById("questionImage");
const battleResultElement = document.getElementById("battleResult");
const impactTextElement = document.getElementById("impactText");

let selectedCharacter = "";
let enemyCharacter = "";
let gameState = "idle";
let voiceActivated = false;
let shouldKeepListening = false;
let isRecognitionRunning = false;
let appIsActive = true;
let restartPending = false;
let musicEnabled = true;
let currentQuestion = null;
let nextRoundTimeout = null;
let currentBackgroundTheme = "theme-space";
let answerLocked = false;
let lastQuestion = "";
let ignoreSpeechUntil = 0;
let gameMode = "math"; // default

const HEROES = ["Luke Skywalker", "R2-D2"];
const VILLAINS = ["Darth Vader", "Emperor"];
const LETTERS = [
  { en: "A", el: "α" },
  { en: "B", el: "β" },
  { en: "C", el: "γ" },
  { en: "D", el: "δ" },
  { en: "E", el: "ε" },
  { en: "F", el: "ζ" },
  { en: "G", el: "η" },
  { en: "H", el: "θ" },
  { en: "I", el: "ι" },
  { en: "J", el: "κ" },
  { en: "K", el: "λ" },
  { en: "L", el: "μ" },
  { en: "M", el: "ν" },
  { en: "N", el: "ξ" },
  { en: "O", el: "ο" },
  { en: "P", el: "π" },
  { en: "Q", el: "ρ" },
  { en: "R", el: "σ" },
  { en: "S", el: "τ" },
  { en: "T", el: "υ" },
  { en: "U", el: "φ" },
  { en: "V", el: "χ" },
  { en: "W", el: "ψ" },
  { en: "X", el: "ω" },
];
const ALPHABET_IMAGES = [
  "Images/Luke.png",
  "Images/Darth.png",
  "Images/Emperor.png",
  "Images/r2d2.png",
];
const CHARACTER_IMAGES = {
  "Luke Skywalker": "Images/Luke.png",
  "R2-D2": "Images/r2d2.png",
  "Darth Vader": "Images/Darth.png",
  Emperor: "Images/Emperor.png",
};
const BACKGROUND_IMAGES = [
  "Images/Designer (1).png",
  "Images/Designer (2).png",
  "Images/Designer (3).png",
  "Images/Designer (4).png",
  "Images/Designer (5).png",
  "Images/Designer (6).png",
  "Images/Designer (7).png",
  "Images/Designer (8).png",
  "Images/Designer (9).png",
  "Images/Designer (10).png",
  "Images/e.png",
  "Images/f.png",
];
bgMusicElement.src = "audio/music.mp3";
bgMusicElement.loop = true;
bgMusicElement.volume = 0.2;

function playBackgroundMusic() {
  if (!musicEnabled) return;

  bgMusicElement.play().catch((err) => {
    console.log("Music failed:", err);
  });
}

musicToggleButton.addEventListener("click", () => {
  musicEnabled = !musicEnabled;

  if (musicEnabled) {
    playBackgroundMusic();
  } else {
    bgMusicElement.pause();
  }
});

function updateSelectedCharacterCard(characterName) {
  const cards = characterGridElement.querySelectorAll(".character-card");
  cards.forEach((card) => {
    const isSelected = card.dataset.character === characterName;
    card.classList.toggle("selected", isSelected);
  });
}

function getRandomEnemyCharacter(playerCharacter) {
  const playerIsHero = HEROES.includes(playerCharacter);
  const playerIsVillain = VILLAINS.includes(playerCharacter);

  let enemies = [];
  if (playerIsHero) {
    enemies = [...VILLAINS];
  } else if (playerIsVillain) {
    enemies = [...HEROES];
  }

  if (!enemies.length) {
    return "Unknown";
  }
  const randomIndex = Math.floor(Math.random() * enemies.length);
  return enemies[randomIndex];
}

function setBattleBackground(mode) {
  document.body.classList.remove(
    "theme-space",
    "theme-desert",
    "theme-electric",
    "theme-night",
    "theme-battle",
    "state-win",
    "state-lose"
  );
  if (mode) {
    currentBackgroundTheme = mode;
    document.body.classList.add(mode);
  }
}

function setRandomBackground() {
  const random =
    BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];

  document.body.style.backgroundImage = `
    linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)),
    url('${random}')
  `;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
}

function applyOutcomeOverlay(outcomeClass) {
  document.body.classList.remove("state-win", "state-lose");
  if (outcomeClass) {
    document.body.classList.add(outcomeClass);
  }
}

function flashScreen(flashClass) {
  document.body.classList.remove("flash-win", "flash-lose");
  void document.body.offsetWidth;
  document.body.classList.add(flashClass);
  setTimeout(() => {
    document.body.classList.remove(flashClass);
  }, 360);
}

function setQuestionBackground() {
  const themes = ["theme-desert", "theme-space", "theme-electric", "theme-night"];
  const randomTheme = themes[getRandomInt(0, themes.length - 1)];
  setBattleBackground(randomTheme);
  applyOutcomeOverlay("");
}

setBattleBackground("theme-space");

function triggerEffect(element, className, durationMs = 450) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
  }, durationMs);
}

function resetFighterAnimationState() {
  playerImageElement.classList.remove("attack", "hit");
  enemyImageElement.classList.remove("attack", "hit");
  playerImageElement.classList.add("idle");
  enemyImageElement.classList.add("idle");
}

function runMiniFightAnimation(playerWon) {
  resetFighterAnimationState();
  playerImageElement.classList.remove("idle");
  enemyImageElement.classList.remove("idle");

  let hitCardElement = enemyCardElement;
  if (playerWon) {
    playerImageElement.classList.add("attack");
    enemyImageElement.classList.add("hit");
    impactTextElement.textContent = "HIT!";
    impactTextElement.classList.remove("show-miss");
    impactTextElement.classList.add("show-hit");
  } else {
    enemyImageElement.classList.add("attack");
    playerImageElement.classList.add("hit");
    hitCardElement = playerCardElement;
    impactTextElement.textContent = "MISS!";
    impactTextElement.classList.remove("show-hit");
    impactTextElement.classList.add("show-miss");
  }

  hitCardElement.classList.remove("impact-flash");
  void hitCardElement.offsetWidth;
  hitCardElement.classList.add("impact-flash");
  setTimeout(() => {
    hitCardElement.classList.remove("impact-flash");
  }, 260);

  setTimeout(() => {
    resetFighterAnimationState();
    impactTextElement.textContent = "";
    impactTextElement.classList.remove("show-hit", "show-miss");
  }, 800);
}

function animateAttack(attacker, defender, isPlayer) {
  attacker.style.animation = "attack 0.4s ease";
  defender.style.animation = "hit 0.4s ease";

  setTimeout(() => {
    attacker.style.animation = "idle 2s infinite ease-in-out";
    defender.style.animation = "idle 2s infinite ease-in-out";
  }, 400);
}

function resolveBattleRound(isCorrectAnswer) {
  if (!selectedCharacter || !enemyCharacter) {
    return;
  }

  if (isCorrectAnswer) {
    battleResultElement.textContent = "You Win!";
    speakMessage("Correct!");
    applyOutcomeOverlay("state-win");
    flashScreen("flash-win");
    runMiniFightAnimation(true);
  } else {
    battleResultElement.textContent = "You Lose!";
    speakMessage("You Lose!");
    applyOutcomeOverlay("state-lose");
    flashScreen("flash-lose");
    runMiniFightAnimation(false);
  }
}

function handleCorrectAnswer() {
  setRandomBackground();
  animateAttack(playerImageElement, enemyImageElement, true);
  document.body.style.filter = "brightness(1.3)";
  setTimeout(() => {
    document.body.style.filter = "";
  }, 400);
  playerImageElement.classList.remove("lose-effect");
  playerImageElement.classList.add("win-effect");
  setTimeout(() => {
    playerImageElement.classList.remove("win-effect");
  }, 500);

  resolveBattleRound(true);
  if (nextRoundTimeout) {
    clearTimeout(nextRoundTimeout);
  }
  nextRoundTimeout = setTimeout(() => {
    console.log("ANSWER DONE");
    console.log("STATE:", gameState);
    console.log("NEXT QUESTION TRIGGERED");
    generateQuestion();
  }, 1000);
}

function handleWrongAnswer() {
  setRandomBackground();
  animateAttack(enemyImageElement, playerImageElement, false);
  document.body.style.animation = "shake 0.4s";
  setTimeout(() => {
    document.body.style.animation = "";
  }, 400);
  playerImageElement.classList.remove("win-effect");
  playerImageElement.classList.add("lose-effect");
  setTimeout(() => {
    playerImageElement.classList.remove("lose-effect");
  }, 500);

  resolveBattleRound(false);
  if (nextRoundTimeout) {
    clearTimeout(nextRoundTimeout);
  }
  nextRoundTimeout = setTimeout(() => {
    console.log("ANSWER DONE");
    console.log("STATE:", gameState);
    console.log("NEXT QUESTION TRIGGERED");
    generateQuestion();
  }, 1000);
}

function speakMessage(message) {
  ignoreSpeechUntil = Date.now() + 900;
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    const isVillain = VILLAINS.includes(selectedCharacter);
    utterance.rate = isVillain ? 0.82 : 0.85;
    utterance.pitch = isVillain ? 0.7 : 0.8;
    utterance.onend = () => {
      // Keep a short extra buffer to avoid capturing tail audio.
      ignoreSpeechUntil = Date.now() + 200;
    };
    window.speechSynthesis.speak(utterance);
  }
  statusElement.textContent = message;
}

function setGameState(nextState) {
  if (gameState !== nextState) {
    console.log(`STATE: ${gameState} -> ${nextState}`);
    gameState = nextState;
  }
}

function setCharacterImage(imgElement, characterName) {
  const imagePath = CHARACTER_IMAGES[characterName] || "Images/Luke.png";
  console.log("Loading image:", imagePath);
  imgElement.src = imagePath;
  imgElement.alt = characterName;
  imgElement.classList.add("idle");
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  gameMode = Math.random() > 0.5 ? "math" : "alphabet";
  console.log("MODE:", gameMode);

  if (gameMode === "alphabet") {
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const randomImage =
      ALPHABET_IMAGES[Math.floor(Math.random() * ALPHABET_IMAGES.length)];

    currentQuestion = {
      type: "alphabet",
      answers: [letter.en.toLowerCase(), letter.el.toLowerCase()],
    };

    answerLocked = false;
    questionDisplayElement.textContent = `Say the letter: ${letter.en} (${letter.el})`;
    battleResultElement.textContent = "Battle result: Ready to fight";
    setRandomBackground();
    setQuestionBackground();

    if (questionImageElement) {
      questionImageElement.src = randomImage;
      questionImageElement.alt = `Letter ${letter.en}`;
      questionImageElement.classList.remove("hidden");
    }

    speakMessage(`Say the letter ${letter.en}`);
    setGameState("answer");
    return;
  }

  const a = getRandomInt(1, 5);
  const b = getRandomInt(1, 5);
  const key = `${a}-${b}`;

  if (key === lastQuestion) {
    generateQuestion();
    return;
  }

  lastQuestion = key;
  currentQuestion = {
    type: "math",
    a,
    b,
    answer: a + b,
  };

  answerLocked = false;
  questionDisplayElement.textContent = `${a} + ${b} = ?`;
  if (questionImageElement) {
    questionImageElement.classList.add("hidden");
  }
  battleResultElement.textContent = "Battle result: Ready to fight";
  setRandomBackground();
  setQuestionBackground();
  setGameState("answer");
  speakMessage(`What is ${a} plus ${b}?`);
  console.log("NEW QUESTION:", a, b, "=", currentQuestion.answer);
}

function normalizeVoiceTranscript(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s\u0370-\u03ff]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getCharacterFromSpeech(text) {
  const lower = text.toLowerCase();
  const normalized = normalizeVoiceTranscript(text);
  const combined = `${lower} ${normalized}`;

  if (combined.includes("luke") || combined.includes("skywalker")) {
    return "Luke Skywalker";
  }

  if (combined.includes("vader") || combined.includes("darth")) {
    return "Darth Vader";
  }

  if (combined.includes("emperor") || combined.includes("palpatine")) {
    return "Emperor";
  }

  if (
    combined.includes("r2") ||
    combined.includes("d2") ||
    combined.includes("r2d2")
  ) {
    return "R2-D2";
  }

  return null;
}

function getNumberFromSpeech(text) {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  console.log("CHECKING:", normalized);

  // digit fallback
  const digitMatch = normalized.match(/\d+/);
  if (digitMatch) return parseInt(digitMatch[0], 10);

  if (normalized.includes("one") || normalized.includes("ena")) return 1;
  if (normalized.includes("two") || normalized.includes("dio") || normalized.includes("duo")) return 2;
  if (normalized.includes("three") || normalized.includes("tria")) return 3;
  if (normalized.includes("four") || normalized.includes("tessera") || normalized.includes("tesera")) return 4;
  if (normalized.includes("five") || normalized.includes("pente")) return 5;
  if (normalized.includes("six") || normalized.includes("exi")) return 6;

  // IMPORTANT FIXES
  if (normalized.includes("seven") || normalized.includes("efta") || normalized.includes("epta")) return 7;
  if (normalized.includes("eight") || normalized.includes("okto") || normalized.includes("oktoh")) return 8;
  if (normalized.includes("nine") || normalized.includes("ennia") || normalized.includes("ennea") || normalized.includes("enya")) return 9;
  if (normalized.includes("ten") || normalized.includes("deka")) return 10;

  return null;
}

function selectCharacter(character) {
  selectedCharacter = character;
  enemyCharacter = getRandomEnemyCharacter(selectedCharacter);
  selectionResultElement.textContent = `You chose: ${selectedCharacter}`;
  playerNameElement.textContent = selectedCharacter;
  enemyNameElement.textContent = enemyCharacter;
  setCharacterImage(playerImageElement, selectedCharacter);
  setCharacterImage(enemyImageElement, enemyCharacter);
  updateSelectedCharacterCard(selectedCharacter);
  selectionScreenElement.classList.add("hidden");
  gameScreenElement.classList.remove("hidden");
  setBattleBackground("theme-battle");
  applyOutcomeOverlay("");
  playBackgroundMusic();
  speakMessage("Get ready");
  generateQuestion();
}

function startGame() {
  setGameState("choose_character");
  selectedCharacter = "";
  enemyCharacter = "";
  currentQuestion = null;
  lastQuestion = "";
  answerLocked = false;
  if (nextRoundTimeout) {
    clearTimeout(nextRoundTimeout);
    nextRoundTimeout = null;
  }
  selectionResultElement.textContent = "You chose: ...";
  playerNameElement.textContent = "Waiting for selection...";
  enemyNameElement.textContent = "Unknown";
  questionDisplayElement.textContent = "Question: Waiting...";
  battleResultElement.textContent = "Battle result: Ready to fight";
  setCharacterImage(playerImageElement, "Luke Skywalker");
  setCharacterImage(enemyImageElement, "Darth Vader");
  updateSelectedCharacterCard("");
  setBattleBackground("theme-space");
  applyOutcomeOverlay("");
  playBackgroundMusic();
  selectionScreenElement.classList.remove("hidden");
  gameScreenElement.classList.add("hidden");
  speakMessage("Choose your character by saying their name");
}

startGameButton.addEventListener("click", startGame);

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  startListeningButton.disabled = true;
  statusElement.textContent = "Speech recognition is not supported in this browser.";
  const startMusicOnFirstInteraction = () => {
    playBackgroundMusic();
    window.removeEventListener("pointerdown", startMusicOnFirstInteraction);
    window.removeEventListener("keydown", startMusicOnFirstInteraction);
  };
  window.addEventListener("pointerdown", startMusicOnFirstInteraction);
  window.addEventListener("keydown", startMusicOnFirstInteraction);
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  const allowedCommands = ["start", "ξεκινα"];
  function setWaitingStatus() {
    statusElement.textContent = "Waiting for command...";
  }

  function hideListeningButton() {
    startListeningButton.classList.add("hidden");
  }

  function startContinuousVoiceMode() {
    if (voiceActivated) return;
    voiceActivated = true;
    shouldKeepListening = true;
    appIsActive = true;
    hideListeningButton();
    voiceEnablePrompt.classList.add("hidden");
    setWaitingStatus();
    recognition.lang = "en-US";
    transcriptElement.textContent = "You said: ...";
    playBackgroundMusic();

    if (!isRecognitionRunning) {
      recognition.start();
    }
  }


  recognition.onstart = () => {
    isRecognitionRunning = true;
    statusElement.textContent = "Listening...";
  };

  recognition.onresult = (event) => {
    if (Date.now() < ignoreSpeechUntil) {
      return;
    }

    let combinedTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      combinedTranscript += event.results[i][0].transcript;
    }

    const cleanedTranscript = combinedTranscript.trim();
    console.log("HEARD:", cleanedTranscript);
    transcriptElement.textContent = `You said: ${
      cleanedTranscript || "..."
    }`;

    const normalizedTranscript = normalizeVoiceTranscript(cleanedTranscript);
    if (!normalizedTranscript) {
      return;
    }

    console.log("STATE:", gameState);

    if (gameState === "idle") {
      const startMatch = allowedCommands.some((command) =>
        normalizedTranscript.includes(command)
      );
      if (startMatch) {
        startGame();
      }
      return;
    }

    if (gameState === "choose_character") {
      const character = getCharacterFromSpeech(cleanedTranscript);
      console.log("CHARACTER MATCH:", character);
      if (character) {
        selectCharacter(character);
      }
      return;
    }

    if (gameState === "answer") {
      if (answerLocked) {
        return;
      }

      if (currentQuestion && currentQuestion.type === "alphabet") {
        const answer = cleanedTranscript.toLowerCase();
        const isCorrect = currentQuestion.answers.some((a) => answer.includes(a));

        answerLocked = true;
        if (isCorrect) {
          handleCorrectAnswer();
        } else {
          handleWrongAnswer();
        }
        return;
      }

      const spokenNumber = getNumberFromSpeech(cleanedTranscript);
      console.log("NUMBER:", spokenNumber);
      console.log("EXPECTED:", currentQuestion ? currentQuestion.answer : null);

      if (spokenNumber === null) {
        console.log("NO MATCH — ignoring");
        return;
      }

      if (!currentQuestion) {
        return;
      }

      answerLocked = true;
      if (spokenNumber === currentQuestion.answer) {
        handleCorrectAnswer();
      } else {
        handleWrongAnswer();
      }
    }
  };

  recognition.onerror = (event) => {
    isRecognitionRunning = false;

    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      shouldKeepListening = false;
      voiceActivated = false;
      appIsActive = false;
      voiceEnablePrompt.classList.remove("hidden");
      statusElement.textContent = "Tap anywhere once to enable voice";
      return;
    }

    statusElement.textContent = `Error: ${event.error}`;
  };

  recognition.onend = () => {
    isRecognitionRunning = false;
    recognition.lang = "en-US";
    try {
      recognition.start();
    } catch (error) {
      if (voiceEnablePrompt.classList.contains("hidden")) {
        setWaitingStatus();
      }
    }
  };

  function handleFirstInteraction() {
    playBackgroundMusic();
    startContinuousVoiceMode();
    window.removeEventListener("pointerdown", handleFirstInteraction);
  }

  window.addEventListener("pointerdown", handleFirstInteraction);
  statusElement.textContent = "Tap once, then speak.";
}
