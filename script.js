const startGameButton = document.getElementById("startGameBtn");
const startListeningButton = document.getElementById("startListeningBtn");
const transcriptElement = document.getElementById("transcript");
const statusElement = document.getElementById("listeningStatus");
const languageSelect = document.getElementById("languageSelect");
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
const battleResultElement = document.getElementById("battleResult");
const impactTextElement = document.getElementById("impactText");

let selectedCharacter = "";
let enemyCharacter = "";
let gameState = "idle";
let voiceActivated = false;
let shouldKeepListening = false;
let isRecognitionRunning = false;
let isProcessing = false;
let appIsActive = true;
let restartPending = false;
let musicEnabled = true;
let currentQuestionAnswer = null;
let nextRoundTimeout = null;
let currentBackgroundTheme = "theme-space";
let answerLocked = false;

const HEROES = ["Luke Skywalker", "R2-D2"];
const VILLAINS = ["Darth Vader", "Emperor"];
const CHARACTER_IMAGES = {
  "Luke Skywalker": "Images/Luke.png",
  "R2-D2": "Images/r2d2.png",
  "Darth Vader": "Images/Darth.png",
  Emperor: "Images/Emperor.png",
};
bgMusicElement.volume = 0.2;

function playBackgroundMusic() {
  if (!musicEnabled) {
    return;
  }
  bgMusicElement.play().catch(() => {
    // Playback may still be blocked until user interaction.
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

function speakMessage(message) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    const isVillain = VILLAINS.includes(selectedCharacter);
    utterance.rate = isVillain ? 0.82 : 0.85;
    utterance.pitch = isVillain ? 0.7 : 0.8;
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

function askNextQuestion() {
  const left = getRandomInt(1, 3);
  const right = getRandomInt(1, 3);
  currentQuestionAnswer = left + right;
  answerLocked = false;
  questionDisplayElement.textContent = `${left} + ${right} = ?`;
  battleResultElement.textContent = "Battle result: Ready to fight";
  setQuestionBackground();
  setGameState("answer");
  speakMessage(`What is ${left} plus ${right}?`);
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
  const lower = text.toLowerCase();
  const normalized = normalizeVoiceTranscript(text);
  const combined = `${lower} ${normalized}`;

  if (combined.includes("one") || combined.includes("ένα") || combined.includes("ena")) return 1;
  if (combined.includes("two") || combined.includes("δύο") || combined.includes("dio") || combined.includes("δυο") || combined.includes("duo")) return 2;
  if (combined.includes("three") || combined.includes("τρία") || combined.includes("tria") || combined.includes("τρια")) return 3;
  if (combined.includes("four") || combined.includes("τέσσερα") || combined.includes("tessera") || combined.includes("τεσσερα")) return 4;
  if (combined.includes("five") || combined.includes("πέντε") || combined.includes("pente") || combined.includes("πεντε")) return 5;

  const directDigitMatch = normalized.match(/\b[1-5]\b/);
  if (directDigitMatch) {
    return Number(directDigitMatch[0]);
  }

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
  speakMessage("Get ready");
  askNextQuestion();
}

function startGame() {
  alert("Game started");
  setGameState("choose_character");
  selectedCharacter = "";
  enemyCharacter = "";
  currentQuestionAnswer = null;
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
    recognition.lang = languageSelect.value;
    transcriptElement.textContent = "You said: ...";
    playBackgroundMusic();

    if (!isRecognitionRunning) {
      recognition.start();
    }
  }

  languageSelect.addEventListener("change", () => {
    recognition.lang = languageSelect.value;
  });

  recognition.onstart = () => {
    isRecognitionRunning = true;
    statusElement.textContent = "Listening...";
  };

  recognition.onresult = (event) => {
    if (isProcessing) {
      return;
    }

    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }

    const cleanedTranscript = finalTranscript.trim();
    console.log("HEARD:", cleanedTranscript);
    transcriptElement.textContent = `You said: ${
      cleanedTranscript || "..."
    }`;

    const normalizedTranscript = normalizeVoiceTranscript(cleanedTranscript);
    if (!normalizedTranscript) {
      return;
    }

    console.log("STATE:", gameState);
    isProcessing = true;

    try {
      if (gameState === "idle") {
        const startMatch = allowedCommands.some((command) =>
          normalizedTranscript.includes(command)
        );
        console.log("MATCH:", startMatch ? "start" : "none");
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
        const spokenAnswer = getNumberFromSpeech(cleanedTranscript);
        console.log("NUMBER MATCH:", spokenAnswer);
        if (spokenAnswer === null || currentQuestionAnswer === null) {
          return;
        }

        const isCorrectAnswer = spokenAnswer === currentQuestionAnswer;
        answerLocked = true;
        resolveBattleRound(isCorrectAnswer);
        if (isCorrectAnswer) {
          nextRoundTimeout = setTimeout(() => {
            if (gameState === "answer") {
              askNextQuestion();
            }
          }, 1500);
        } else {
          nextRoundTimeout = setTimeout(() => {
            if (gameState === "answer") {
              setBattleBackground(currentBackgroundTheme);
              applyOutcomeOverlay("");
              answerLocked = false;
            }
          }, 800);
        }
        return;
      }
    } finally {
      isProcessing = false;
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
    restartPending = false;

    if (shouldKeepListening && appIsActive && !isProcessing) {
      recognition.lang = languageSelect.value;
      restartPending = true;
      setTimeout(() => {
        if (
          restartPending &&
          !isRecognitionRunning &&
          shouldKeepListening &&
          appIsActive &&
          !isProcessing
        ) {
          recognition.start();
        }
        restartPending = false;
      }, 250);
    } else {
      if (voiceEnablePrompt.classList.contains("hidden")) {
        setWaitingStatus();
      }
    }
  };

  function handleFirstInteraction() {
    playBackgroundMusic();
    startContinuousVoiceMode();
    window.removeEventListener("pointerdown", handleFirstInteraction);
    window.removeEventListener("keydown", handleFirstInteraction);
  }

  window.addEventListener("pointerdown", handleFirstInteraction);
  window.addEventListener("keydown", handleFirstInteraction);
  statusElement.textContent = "Tap once, then speak.";
}
