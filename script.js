const startGameButton = document.getElementById("startGameBtn");
const startListeningButton = document.getElementById("startListeningBtn");
const transcriptElement = document.getElementById("transcript");
const statusElement = document.getElementById("listeningStatus");
const languageSelect = document.getElementById("languageSelect");
const selectionResultElement = document.getElementById("selectionResult");
const voiceEnablePrompt = document.getElementById("voiceEnablePrompt");
const characterGridElement = document.getElementById("characterGrid");
const bgMusicElement = document.getElementById("bgMusic");
const musicToggleButton = document.getElementById("musicToggleBtn");
const playerCardElement = document.getElementById("playerCard");
const enemyCardElement = document.getElementById("enemyCard");
const playerNameElement = document.getElementById("playerName");
const enemyNameElement = document.getElementById("enemyName");
const battleResultElement = document.getElementById("battleResult");

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

function getAvailableCharacters() {
  const cards = characterGridElement.querySelectorAll(".character-card");
  return Array.from(cards).map((card) => card.dataset.character);
}

function getRandomEnemyCharacter(playerCharacter) {
  const enemies = getAvailableCharacters().filter(
    (name) => name !== playerCharacter
  );
  if (!enemies.length) {
    return "Unknown";
  }
  const randomIndex = Math.floor(Math.random() * enemies.length);
  return enemies[randomIndex];
}

function setBattleBackground(mode) {
  document.body.classList.remove("battle-mode", "victory-mode", "defeat-mode");
  if (mode) {
    document.body.classList.add(mode);
  }
}

function triggerEffect(element, className, durationMs = 450) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
  }, durationMs);
}

function resolveBattleRound(isCorrectAnswer) {
  if (!selectedCharacter || !enemyCharacter) {
    return;
  }

  if (isCorrectAnswer) {
    battleResultElement.textContent = "You Win!";
    setBattleBackground("victory-mode");
    triggerEffect(playerCardElement, "attack");
    triggerEffect(enemyCardElement, "shake");
    triggerEffect(enemyCardElement, "fade", 650);
  } else {
    battleResultElement.textContent = "You Lose!";
    setBattleBackground("defeat-mode");
    triggerEffect(enemyCardElement, "attack");
    triggerEffect(playerCardElement, "shake");
  }

  setTimeout(() => {
    if (gameState === "in_game") {
      setBattleBackground("battle-mode");
    }
  }, 1200);
}

function speakMessage(message) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(message);
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

function startGame() {
  alert("Game started");
  setGameState("waiting_for_character");
  selectedCharacter = "";
  enemyCharacter = "";
  selectionResultElement.textContent = "You chose: ...";
  playerNameElement.textContent = "Waiting for selection...";
  enemyNameElement.textContent = "Unknown";
  battleResultElement.textContent = "Battle result: Waiting for battle...";
  updateSelectedCharacterCard("");
  setBattleBackground("");
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

  const allowedCommands = ["start game", "ξεκίνα παιχνίδι"];
  const characterMap = [
    { keywords: ["luke"], character: "Luke Skywalker" },
    { keywords: ["chewbacca", "chewy"], character: "Chewbacca" },
    { keywords: ["vader"], character: "Darth Vader" },
    { keywords: ["emperor", "palpatine"], character: "Emperor" },
    { keywords: ["r2", "r2d2"], character: "R2-D2" },
    { keywords: ["maul"], character: "Darth Maul" },
  ];

  function normalizeTranscript(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0370-\u03ff]/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function findCharacterFromTranscript(normalizedTranscript) {
    const match = characterMap.find((item) =>
      item.keywords.some((keyword) => normalizedTranscript.includes(keyword))
    );
    return match ? match.character : "";
  }

  function setWaitingStatus() {
    statusElement.textContent = "Waiting for command...";
  }

  function hideListeningButton() {
    startListeningButton.classList.add("hidden");
  }

  function enableVoiceMode() {
    if (voiceActivated) {
      playBackgroundMusic();
      return;
    }
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
    console.log("FINAL:", cleanedTranscript);
    transcriptElement.textContent = `You said: ${
      cleanedTranscript || "..."
    }`;

    const normalizedTranscript = normalizeTranscript(cleanedTranscript);
    if (!normalizedTranscript) {
      return;
    }

    isProcessing = true;

    try {
      if (gameState === "idle") {
        const shouldStartGame = allowedCommands.some((command) =>
          normalizedTranscript.includes(command)
        );

        if (shouldStartGame) {
          startGame();
        }
        return;
      }

      if (gameState === "waiting_for_character") {
        const matchedCharacter = findCharacterFromTranscript(normalizedTranscript);

        if (matchedCharacter) {
          selectedCharacter = matchedCharacter;
          enemyCharacter = getRandomEnemyCharacter(selectedCharacter);
          setGameState("in_game");
          selectionResultElement.textContent = `You chose: ${selectedCharacter}`;
          playerNameElement.textContent = selectedCharacter;
          enemyNameElement.textContent = enemyCharacter;
          battleResultElement.textContent = "Battle result: Ready to fight!";
          updateSelectedCharacterCard(selectedCharacter);
          setBattleBackground("battle-mode");
          speakMessage("Get ready...");
        } else {
          speakMessage("I didn't understand, try again");
        }
        return;
      }

      if (gameState === "in_game") {
        const isCorrectAnswer =
          normalizedTranscript.includes("correct") ||
          normalizedTranscript.includes("right") ||
          normalizedTranscript.includes("σωστό") ||
          normalizedTranscript.includes("σωστο");
        const isWrongAnswer =
          normalizedTranscript.includes("wrong") ||
          normalizedTranscript.includes("incorrect") ||
          normalizedTranscript.includes("λάθος") ||
          normalizedTranscript.includes("λαθος");

        if (isCorrectAnswer) {
          resolveBattleRound(true);
        } else if (isWrongAnswer) {
          resolveBattleRound(false);
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
    enableVoiceMode();
    window.removeEventListener("pointerdown", handleFirstInteraction);
    window.removeEventListener("keydown", handleFirstInteraction);
  }

  window.addEventListener("pointerdown", handleFirstInteraction);
  window.addEventListener("keydown", handleFirstInteraction);

  startListeningButton.addEventListener("click", enableVoiceMode);

  // Try auto-start immediately; if blocked, we ask for one tap.
  try {
    enableVoiceMode();
  } catch (error) {
    voiceEnablePrompt.classList.remove("hidden");
    statusElement.textContent = "Tap anywhere once to enable voice";
  }
}
