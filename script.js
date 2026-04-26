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
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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
let gameMode = "math"; // math | alphabet | object

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
const OBJECTS = [
  { name: "apple", el: "μηλο", alt: ["milo"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "dog", el: "σκυλος", alt: ["skilos", "skylos"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "cat", el: "γατα", alt: ["gata"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "car", el: "αυτοκινητο", alt: ["aftokinito"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "banana", el: "μπανανα", alt: ["banana"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "house", el: "σπιτι", alt: ["spiti"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "tree", el: "δεντρο", alt: ["dentro"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "phone", el: "τηλεφωνο", alt: ["tilefono"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "book", el: "βιβλιο", alt: ["vivlio"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "chair", el: "καρεκλα", alt: ["karekla"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "table", el: "τραπεζι", alt: ["trapezi"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "bike", el: "ποδηλατο", alt: ["podilato"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "bus", el: "λεωφορειο", alt: ["leoforeio"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "train", el: "τρενο", alt: ["treno"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "plane", el: "αεροπλανο", alt: ["aeroplano"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "boat", el: "βαρκα", alt: ["varka"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "fish", el: "ψαρι", alt: ["psari"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "bird", el: "πουλι", alt: ["pouli"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "cow", el: "αγελαδα", alt: ["agelada"], img: "https://picsum.photos/300?random=" + Math.random() },
  { name: "horse", el: "αλογο", alt: ["alogo"], img: "https://picsum.photos/300?random=" + Math.random() }
];
const CHARACTER_IMAGES = {
  "Luke Skywalker": {
    idle: "Images/Luke defend.png",
    attack: "Images/Luke attack.png",
    lose: "Images/Luke lost.png"
  },
  "Darth Vader": {
    idle: "Images/darth vader defend.png",
    attack: "Images/Darth attack.png",
    lose: "Images/Darth Lose.png"
  },
  Emperor: {
    idle: "Images/Emperor defend.png",
    attack: "Images/Emperor Attack.png",
    lose: "Images/emperor lose.png"
  },
  "R2-D2": {
    idle: "Images/r2d2 defend.png",
    attack: "Images/r2d2 attack.png",
    lose: "Images/r2d2 lose.png"
  }
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
const MUSIC_TRACKS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
];
let currentTrackIndex = 0;

function playBackgroundMusic() {
  if (!musicEnabled) return;

  if (!bgMusicElement.src) {
    currentTrackIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);
    bgMusicElement.src = MUSIC_TRACKS[currentTrackIndex];
  }

  if (!bgMusicElement.paused) return;

  bgMusicElement.volume = 0.2;

  bgMusicElement.play().catch(err => {
    console.log("Music failed:", err);
  });
}

bgMusicElement.addEventListener("ended", () => {
  currentTrackIndex = (currentTrackIndex + 1) % MUSIC_TRACKS.length;
  bgMusicElement.src = MUSIC_TRACKS[currentTrackIndex];
  bgMusicElement.play();
});

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

function setQuestionBackground() {
  const themes = ["theme-desert", "theme-space", "theme-electric", "theme-night"];
  const randomTheme = themes[getRandomInt(0, themes.length - 1)];
  setBattleBackground(randomTheme);
  applyOutcomeOverlay("");
}

setBattleBackground("theme-space");

function resolveBattleRound(isCorrectAnswer) {
  if (!selectedCharacter || !enemyCharacter) {
    return;
  }

  if (isCorrectAnswer) {
    battleResultElement.textContent = "You Win!";
    applyOutcomeOverlay("state-win");
  } else {
    battleResultElement.textContent = "You Lose!";
    applyOutcomeOverlay("state-lose");
  }
}

function handleCorrectAnswer() {
  resolveBattleRound(true);
  setGameState("result");
  document.body.classList.add("flash-win");
  setTimeout(() => {
    document.body.classList.remove("flash-win");
  }, 200);

  // SHOW ATTACK VS LOSE
  setCharacterImage(playerImageElement, selectedCharacter, "attack");
  setCharacterImage(enemyImageElement, enemyCharacter, "lose");

  speakMessage("Correct!");

  // WAIT 10 SECONDS (NO INPUT)
  setTimeout(() => {
    // RESET TO DEFEND
    setCharacterImage(playerImageElement, selectedCharacter, "idle");
    setCharacterImage(enemyImageElement, enemyCharacter, "idle");

    // WAIT 5 SECONDS BEFORE NEXT QUESTION
    setTimeout(() => {
      answerLocked = false;
      generateQuestion();
    }, 5000);

  }, 10000);
}

function handleWrongAnswer() {
  resolveBattleRound(false);
  setGameState("result");
  document.body.classList.add("flash-lose");
  setTimeout(() => {
    document.body.classList.remove("flash-lose");
  }, 200);

  // ENEMY ATTACK
  setCharacterImage(playerImageElement, selectedCharacter, "lose");
  setCharacterImage(enemyImageElement, enemyCharacter, "attack");

  speakMessage("Wrong!");

  setTimeout(() => {
    setCharacterImage(playerImageElement, selectedCharacter, "idle");
    setCharacterImage(enemyImageElement, enemyCharacter, "idle");

    setTimeout(() => {
      answerLocked = false;
      generateQuestion();
    }, 5000);

  }, 10000);
}

function speakMessage(message) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
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

function setCharacterImage(imgElement, characterName, state = "idle") {
  const imagePath = CHARACTER_IMAGES[characterName]?.[state];
  if (!imagePath) return;

  imgElement.classList.remove("attack", "lose", "idle");
  imgElement.classList.add(state);
  imgElement.src = imagePath;
  imgElement.alt = characterName;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  answerLocked = false;
  battleResultElement.textContent = "Ready to fight";
  setCharacterImage(playerImageElement, selectedCharacter, "idle");
  setCharacterImage(enemyImageElement, enemyCharacter, "idle");
  document.body.classList.remove("flash-win", "flash-lose");
  questionDisplayElement.style.transform = "scale(0.7)";
  questionDisplayElement.style.opacity = "0";
  setTimeout(() => {
    questionDisplayElement.style.transform = "scale(1.1)";
    questionDisplayElement.style.opacity = "1";
  }, 100);
  setTimeout(() => {
    questionDisplayElement.style.transform = "scale(1)";
  }, 250);

  gameMode = ["math", "alphabet", "object"][Math.floor(Math.random() * 3)];
  console.log("MODE:", gameMode);

  if (gameMode === "alphabet") {
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];

    currentQuestion = {
      type: "alphabet",
      answers: [letter.en.toLowerCase(), letter.el.toLowerCase()],
    };

    answerLocked = false;
    questionDisplayElement.textContent = `Say this letter: ${letter.en} (${letter.el})`;
    battleResultElement.textContent = "Ready to fight";
    setRandomBackground();
    setQuestionBackground();

    if (questionImageElement) {
      questionImageElement.classList.add("hidden");
    }

    speakMessage("Say the letter");
    setGameState("answer");
    return;
  }

  if (gameMode === "object") {
    const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];

    currentQuestion = {
      type: "object",
      answers: [obj.name.toLowerCase(), obj.el.toLowerCase()],
      alt: obj.alt || [],
    };

    answerLocked = false;
    questionDisplayElement.textContent = "What is this?";
    battleResultElement.textContent = "Ready to fight";
    setRandomBackground();
    setQuestionBackground();

    if (questionImageElement) {
      questionImageElement.src = obj.img;
      questionImageElement.alt = obj.name;
      questionImageElement.classList.remove("hidden");
    }

    speakMessage("What is this?");
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
  battleResultElement.textContent = "Ready to fight";
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

function normalizeGreek(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
    .replace(/[^\w\s]/g, " ");

  const tokens = normalized.split(/\s+/).filter(Boolean);

  const tokenMap = {
    one: 1, ena: 1,
    two: 2, dio: 2, duo: 2,
    three: 3, tria: 3,
    four: 4, tessera: 4, tesera: 4,
    five: 5, pente: 5,
    six: 6, exi: 6,
    seven: 7, efta: 7, epta: 7,
    eight: 8, okto: 8,
    nine: 9, ennia: 9, ennea: 9, enya: 9,
    ten: 10, deka: 10
  };

  for (let i = tokens.length - 1; i >= 0; i--) {
    const t = tokens[i];

    if (/^\d+$/.test(t)) return parseInt(t, 10);

    if (tokenMap[t] !== undefined) {
      return tokenMap[t];
    }
  }

  return null;
}

function selectCharacter(character) {
  selectedCharacter = character;
  enemyCharacter = getRandomEnemyCharacter(selectedCharacter);
  selectionResultElement.textContent = `You chose: ${selectedCharacter}`;
  playerNameElement.textContent = selectedCharacter;
  enemyNameElement.textContent = enemyCharacter;
  setCharacterImage(playerImageElement, selectedCharacter, "idle");
  setCharacterImage(enemyImageElement, enemyCharacter, "idle");
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
  setCharacterImage(playerImageElement, "Luke Skywalker", "idle");
  setCharacterImage(enemyImageElement, "Darth Vader", "idle");
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

  function isPromptEcho(text) {
    const t = text.toLowerCase();
    return (
      t.includes("what is") ||
      t.includes("say the letter") ||
      t.includes("correct") ||
      t.includes("wrong") ||
      t.includes("get ready")
    );
  }

  function processAnswer(transcript) {
    if (!currentQuestion) return;
    if (answerLocked) return;

    console.log("PROCESS ANSWER:", transcript);
    console.log("TYPE:", currentQuestion.type);

    if (isPromptEcho(transcript)) {
      console.log("PROMPT ECHO IGNORED");
      return;
    }

    if (currentQuestion.type === "alphabet") {
      console.log("ANSWER TRANSCRIPT:", transcript);
      console.log("QUESTION:", currentQuestion);
      const answer = normalizeGreek(transcript);
      const allAnswers = [
        ...currentQuestion.answers,
        ...(currentQuestion.alt || []),
      ];
      const isCorrect = allAnswers.some((a) =>
        answer.includes(normalizeGreek(a))
      );
      console.log("MATCH RESULT:", isCorrect);

      if (isCorrect) {
        answerLocked = true;
        handleCorrectAnswer();
        return;
      }

      if (answer.length >= 2) {
        answerLocked = true;
        handleWrongAnswer();
      }
      return;
    }

    if (currentQuestion.type === "object") {
      console.log("ANSWER TRANSCRIPT:", transcript);
      console.log("QUESTION:", currentQuestion);
      const answer = normalizeGreek(transcript);
      const allAnswers = [
        ...currentQuestion.answers,
        ...(currentQuestion.alt || []),
      ];
      const isCorrect = allAnswers.some((a) =>
        answer.includes(normalizeGreek(a))
      );
      console.log("MATCH RESULT:", isCorrect);

      if (isCorrect) {
        answerLocked = true;
        handleCorrectAnswer();
      }
      return;
    }

    const spokenNumber = getNumberFromSpeech(transcript);
    console.log("NUMBER DETECTED:", spokenNumber);
    console.log("EXPECTED:", currentQuestion?.answer);
    if (spokenNumber === null) {
      console.log("NO NUMBER MATCH");
      return;
    }
    answerLocked = true;
    if (spokenNumber === currentQuestion.answer) {
      console.log("MATCH RESULT:", true);
      handleCorrectAnswer();
    } else {
      console.log("MATCH RESULT:", false);
      handleWrongAnswer();
    }
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
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript.trim();
    if (!transcript) return;
    console.log("----------");
    console.log("MOBILE HEARD:", transcript);
    console.log("MODE:", gameMode);
    console.log("QUESTION:", currentQuestion);
    console.log("HEARD:", transcript);
    transcriptElement.textContent = `You said: ${transcript}`;

    const normalizedTranscript = normalizeVoiceTranscript(transcript);
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
      const character = getCharacterFromSpeech(transcript);
      console.log("CHARACTER MATCH:", character);
      if (character) {
        selectCharacter(character);
      }
      return;
    }

    if (gameState === "answer") {
      processAnswer(transcript);
      return;
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

    if (shouldKeepListening && appIsActive) {
      try {
        recognition.start();
      } catch (e) {
        console.log("Restart blocked");
      }
    }
  };

  function handleFirstInteraction() {
    playBackgroundMusic();
    startContinuousVoiceMode();
    window.removeEventListener("pointerdown", handleFirstInteraction);
  }

  if (isMobile) {
    window.addEventListener("pointerdown", handleFirstInteraction);
    statusElement.textContent = "Tap once, then speak.";
  } else {
    // DESKTOP -> start immediately
    startContinuousVoiceMode();
  }
}
