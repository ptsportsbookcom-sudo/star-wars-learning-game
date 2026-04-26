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
const resultPopupElement = document.getElementById("resultPopup");
const streakDisplayElement = document.getElementById("streakDisplay");
const roundSplashElement = document.getElementById("roundSplash");
const roundSplashImageElement = document.getElementById("roundSplashImage");
const roundSplashTextElement = document.getElementById("roundSplashText");
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
let answerStuckTimeout = null;
let resultPopupTimeout = null;
let roundSplashTimeout = null;
let currentBackgroundTheme = "theme-space";
let answerLocked = false;
let lastQuestion = "";
let gameMode = "math"; // math | number | object
let playerScore = 0;
let enemyScore = 0;
const TARGET_SCORE = 15;

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
const LETTER_ALIASES = {
  A: ["a", "ay", "αλφα", "alfa", "alpha"],
  B: ["b", "bee", "μπι", "βητα", "βίτα", "vita", "beta"],
  C: ["c", "see", "σι", "γαμα", "γάμα", "gama", "gamma"],
  D: ["d", "dee", "ντι", "δελτα", "δέλτα", "delta"],
  E: ["e", "ee", "ι", "εψιλον", "έψιλον", "epsilon", "epsilo"],
  F: ["f", "ef", "εφ", "ζητα", "ζήτα", "zita", "zeta"],
  G: ["g", "gee", "τζι", "ητα", "ήτα", "ita", "eta"],
  H: ["h", "eitch", "ειτς", "θητα", "θήτα", "thita", "theta"],
  I: ["i", "ai", "ιωτα", "ιώτα", "iota"],
  J: ["j", "jay", "τζει", "καπα", "κάπα", "kapa", "kappa"],
  K: ["k", "kay", "κει", "λαμδα", "λάμδα", "lamda", "lambda"],
  L: ["l", "el", "ελ", "μι", "my", "mu"],
  M: ["m", "em", "εμ", "νι", "ny", "ni", "nu"],
  N: ["n", "en", "εν", "ξι", "ksi", "xi"],
  O: ["o", "oh", "ομικρον", "όμικρον", "omikron", "omicron"],
  P: ["p", "pee", "πι", "pi"],
  Q: ["q", "cue", "κιου", "ρω", "ro", "rho"],
  R: ["r", "ar", "αρ", "σιγμα", "σίγμα", "sigma"],
  S: ["s", "ess", "ες", "ταυ", "tav", "taf", "tau"],
  T: ["t", "tee", "τι", "υψιλον", "ύψιλον", "ipsilon", "ypsilon", "upsilon"],
  U: ["u", "you", "γιου", "φι", "fi", "phi"],
  V: ["v", "vee", "βι", "χι", "chi", "xi"],
  W: ["w", "double u", "doubleyou", "ψι", "psi"],
  X: ["x", "eks", "ωμεγα", "ωμέγα", "omega"],
};
const ALPHABET_IMAGES = [
  "Images/Luke.png",
  "Images/Darth.png",
  "Images/Emperor.png",
  "Images/r2d2.png",
];
const OBJECTS = [
  { name: "apple", el: "μηλο", alt: ["milo"], img: createEmojiObjectImage("🍎", "#c73a3a") },
  { name: "dog", el: "σκυλος", alt: ["skilos", "skylos"], img: createEmojiObjectImage("🐶", "#37517a") },
  { name: "cat", el: "γατα", alt: ["gata"], img: createEmojiObjectImage("🐱", "#684d3c") },
  { name: "car", el: "αυτοκινητο", alt: ["aftokinito"], img: createEmojiObjectImage("🚗", "#2f4858") },
  { name: "banana", el: "μπανανα", alt: ["banana"], img: createEmojiObjectImage("🍌", "#8a7400") },
  { name: "house", el: "σπιτι", alt: ["spiti"], img: createEmojiObjectImage("🏠", "#324a67") },
  { name: "tree", el: "δεντρο", alt: ["dentro"], img: createEmojiObjectImage("🌳", "#345e3a") },
  { name: "phone", el: "τηλεφωνο", alt: ["tilefono"], img: createEmojiObjectImage("📱", "#394150") },
  { name: "book", el: "βιβλιο", alt: ["vivlio"], img: createEmojiObjectImage("📘", "#214166") },
  { name: "chair", el: "καρεκλα", alt: ["karekla"], img: createEmojiObjectImage("🪑", "#574334") },
  { name: "table", el: "τραπεζι", alt: ["trapezi"], img: createEmojiObjectImage("🪵", "#4d3d31") },
  { name: "bike", el: "ποδηλατο", alt: ["podilato"], img: createEmojiObjectImage("🚲", "#2d4e6f") },
  { name: "bus", el: "λεωφορειο", alt: ["leoforeio"], img: createEmojiObjectImage("🚌", "#654017") },
  { name: "train", el: "τρενο", alt: ["treno"], img: createEmojiObjectImage("🚆", "#4a2f57") },
  { name: "plane", el: "αεροπλανο", alt: ["aeroplano"], img: createEmojiObjectImage("✈️", "#2b4f68") },
  { name: "boat", el: "βαρκα", alt: ["varka"], img: createEmojiObjectImage("⛵", "#27506f") },
  { name: "fish", el: "ψαρι", alt: ["psari"], img: createEmojiObjectImage("🐟", "#215568") },
  { name: "bird", el: "πουλι", alt: ["pouli"], img: createEmojiObjectImage("🐦", "#345578") },
  { name: "cow", el: "αγελαδα", alt: ["agelada"], img: createEmojiObjectImage("🐄", "#4f4f4f") },
  { name: "horse", el: "αλογο", alt: ["alogo"], img: createEmojiObjectImage("🐴", "#5d3f30") }
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

function showResultPopup(message, type) {
  if (!resultPopupElement) return;
  if (resultPopupTimeout) {
    clearTimeout(resultPopupTimeout);
  }
  resultPopupElement.textContent = message;
  resultPopupElement.classList.remove("hidden", "win", "lose", "show");
  resultPopupElement.classList.add(type);
  // Force reflow so repeated popups still animate.
  void resultPopupElement.offsetWidth;
  resultPopupElement.classList.add("show");
  resultPopupTimeout = setTimeout(() => {
    resultPopupElement.classList.remove("show", "win", "lose");
    resultPopupElement.classList.add("hidden");
    resultPopupTimeout = null;
  }, 1400);
}

function updateStreakDisplay() {
  if (!streakDisplayElement) return;
  streakDisplayElement.textContent = `Hero ${playerScore} - Enemy ${enemyScore} (first to ${TARGET_SCORE})`;
}

function playOutcomeSound(kind) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const notes =
    kind === "win"
      ? [740, 880, 988]
      : [330, 262, 196];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = kind === "win" ? "triangle" : "sawtooth";
    osc.frequency.value = freq;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const startAt = ctx.currentTime + idx * 0.12;
    const endAt = startAt + 0.16;
    gain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    osc.start(startAt);
    osc.stop(endAt);
  });
}

function handleScoreProgress(isCorrectAnswer) {
  if (isCorrectAnswer) {
    playerScore += 3;
  } else {
    enemyScore += 2;
  }
  updateStreakDisplay();
}

function getMatchWinImage(character) {
  return HEROES.includes(character)
    ? "Images/good guy wins final.png"
    : "Images/bad guy wins.png";
}

function showRoundSplash(winnerCharacter, message) {
  if (!roundSplashElement || !roundSplashImageElement || !roundSplashTextElement) return;
  if (roundSplashTimeout) {
    clearTimeout(roundSplashTimeout);
  }
  roundSplashImageElement.src = getMatchWinImage(winnerCharacter);
  roundSplashImageElement.alt = `${winnerCharacter} wins`;
  roundSplashTextElement.textContent = message;
  roundSplashElement.classList.remove("hidden", "show");
  void roundSplashElement.offsetWidth;
  roundSplashElement.classList.add("show");
  roundSplashTimeout = setTimeout(() => {
    roundSplashElement.classList.remove("show");
    roundSplashElement.classList.add("hidden");
    roundSplashTimeout = null;
  }, 1700);
}

function getAllObjectAliases() {
  const aliases = [];
  OBJECTS.forEach((obj) => {
    aliases.push(obj.name, obj.el, ...(obj.alt || []));
  });
  return aliases.map((a) => normalizeGreek(String(a)));
}

function showMatchOutcomeIcon(winnerCharacter, loserCharacter, winnerOnPlayerSide) {
  const winnerImage = winnerOnPlayerSide ? playerImageElement : enemyImageElement;
  const loserImage = winnerOnPlayerSide ? enemyImageElement : playerImageElement;
  winnerImage.src = getMatchWinImage(winnerCharacter);
  winnerImage.alt = `${winnerCharacter} wins`;
  winnerImage.classList.remove("attack", "lose", "idle");
  winnerImage.classList.add("attack");
  setCharacterImage(loserImage, loserCharacter, "lose");
}

function handleScoreFinishIfNeeded() {
  if (playerScore >= TARGET_SCORE) {
    setGameState("idle");
    showResultPopup("YOU WON THE MATCH!", "win");
    speakMessage("Amazing! You won the match!");
    statusElement.textContent = "Match complete. Say start for a new game.";
    showMatchOutcomeIcon(selectedCharacter, enemyCharacter, true);
    return true;
  }
  if (enemyScore >= TARGET_SCORE) {
    setGameState("idle");
    showResultPopup("ENEMY WON THE MATCH!", "lose");
    speakMessage("The enemy won this match. Say start to play again.");
    statusElement.textContent = "Match complete. Say start for a new game.";
    showMatchOutcomeIcon(enemyCharacter, selectedCharacter, false);
    return true;
  }
  return false;
}

function clearAnswerStuckTimer() {
  if (answerStuckTimeout) {
    clearTimeout(answerStuckTimeout);
    answerStuckTimeout = null;
  }
}

function scheduleAnswerStuckTimer() {
  clearAnswerStuckTimer();
  answerStuckTimeout = setTimeout(() => {
    if (gameState !== "answer" || answerLocked) return;
    statusElement.textContent = "Tip: say the answer, or say 'next'.";
    speakMessage("Say the answer or say next.");
    forceNextQuestion();
  }, 12000);
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
  clearAnswerStuckTimer();
  handleScoreProgress(true);
  showRoundSplash(selectedCharacter, "Great answer!");
  resolveBattleRound(true);
  setGameState("result");
  showResultPopup("CORRECT!", "win");
  playOutcomeSound("win");
  document.body.classList.add("flash-win");
  setTimeout(() => {
    document.body.classList.remove("flash-win");
  }, 200);

  // Keep cards neutral while full-screen splash is visible.
  setCharacterImage(playerImageElement, selectedCharacter, "idle");
  setCharacterImage(enemyImageElement, enemyCharacter, "idle");
  if (!isMobile) {
    speakMessage("Correct!");
  } else {
    statusElement.textContent = "Correct!";
  }

  // WAIT 5 SECONDS BEFORE NEXT QUESTION
  if (nextRoundTimeout) {
    clearTimeout(nextRoundTimeout);
  }
  if (handleScoreFinishIfNeeded()) {
    return;
  }
  nextRoundTimeout = setTimeout(() => {
    setCharacterImage(playerImageElement, selectedCharacter, "idle");
    setCharacterImage(enemyImageElement, enemyCharacter, "idle");
    answerLocked = false;
    nextRoundTimeout = null;
    generateQuestion();
  }, 5000);
}

function handleWrongAnswer() {
  clearAnswerStuckTimer();
  handleScoreProgress(false);
  showRoundSplash(enemyCharacter, "Oops! Enemy attacks!");
  resolveBattleRound(false);
  setGameState("result");
  showResultPopup("TRY AGAIN!", "lose");
  playOutcomeSound("lose");
  document.body.classList.add("flash-lose");
  setTimeout(() => {
    document.body.classList.remove("flash-lose");
  }, 200);

  // Keep cards neutral while full-screen splash is visible.
  setCharacterImage(playerImageElement, selectedCharacter, "idle");
  setCharacterImage(enemyImageElement, enemyCharacter, "idle");
  if (!isMobile) {
    speakMessage("Wrong!");
  } else {
    statusElement.textContent = "Wrong!";
  }

  if (nextRoundTimeout) {
    clearTimeout(nextRoundTimeout);
  }
  if (handleScoreFinishIfNeeded()) {
    return;
  }
  nextRoundTimeout = setTimeout(() => {
    setCharacterImage(playerImageElement, selectedCharacter, "idle");
    setCharacterImage(enemyImageElement, enemyCharacter, "idle");
    answerLocked = false;
    nextRoundTimeout = null;
    generateQuestion();
  }, 5000);
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

function forceNextQuestion() {
  if (!selectedCharacter || !enemyCharacter) return;
  clearAnswerStuckTimer();
  if (nextRoundTimeout) {
    clearTimeout(nextRoundTimeout);
    nextRoundTimeout = null;
  }
  answerLocked = false;
  setCharacterImage(playerImageElement, selectedCharacter, "idle");
  setCharacterImage(enemyImageElement, enemyCharacter, "idle");
  generateQuestion();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getLetterAnswers(letter) {
  const aliases = LETTER_ALIASES[letter.en] || [];
  return [
    letter.en.toLowerCase(),
    letter.el.toLowerCase(),
    ...aliases.map((a) => a.toLowerCase()),
  ];
}

function createEmojiObjectImage(emoji, color) {
  const safeEmoji = String(emoji).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect width="420" height="420" rx="36" fill="url(#bg)"/>
    <text x="210" y="238" text-anchor="middle" font-size="195">${safeEmoji}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function generateQuestion() {
  clearAnswerStuckTimer();
  answerLocked = false;
  battleResultElement.textContent = "Ready to fight";
  // Answer phase stance: both characters are ready to attack.
  setCharacterImage(playerImageElement, selectedCharacter, "attack");
  setCharacterImage(enemyImageElement, enemyCharacter, "attack");
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

  gameMode = ["math", "number", "object"][Math.floor(Math.random() * 3)];
  console.log("MODE:", gameMode);

  if (gameMode === "number") {
    const numberValue = getRandomInt(1, 10);
    currentQuestion = {
      type: "number",
      answer: numberValue,
    };
    answerLocked = false;
    questionDisplayElement.textContent = `${numberValue}`;
    battleResultElement.textContent = "Ready to fight";
    setRandomBackground();
    setQuestionBackground();
    if (questionImageElement) {
      questionImageElement.classList.add("hidden");
    }
    statusElement.textContent = "Say the number shown on screen.";
    setGameState("answer");
    scheduleAnswerStuckTimer();
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
    scheduleAnswerStuckTimer();
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
  scheduleAnswerStuckTimer();
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

function getLevenshteinDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
}

function isCloseWordMatch(spokenText, expectedWord) {
  const spoken = normalizeGreek(spokenText);
  const expected = normalizeGreek(expectedWord);
  if (!spoken || !expected) return false;

  if (spoken.includes(expected) || expected.includes(spoken)) {
    return true;
  }

  const words = spoken.split(/\s+/).filter((w) => w.length >= 2);
  return words.some((word) => {
    const distance = getLevenshteinDistance(word, expected);
    const maxLen = Math.max(word.length, expected.length);

    if (maxLen <= 4) return distance <= 1;
    if (maxLen <= 7) return distance <= 2;
    return distance <= 3;
  });
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
  playerScore = 0;
  enemyScore = 0;
  updateStreakDisplay();
  clearAnswerStuckTimer();
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
  const nextCommands = ["next", "επομενο", "epomeno"];
  function setWaitingStatus() {
    statusElement.textContent = "Waiting for command...";
  }

  function hideListeningButton() {
    startListeningButton.classList.add("hidden");
  }

  function goToNextQuestionNow() {
    forceNextQuestion();
  }

  function isPromptEcho(text) {
    const t = text.toLowerCase();
    return (
      t.includes("what is") ||
      t.includes("say the letter") ||
      t.includes("say number") ||
      t.includes("say this number") ||
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
    const result = event.results[event.resultIndex] || event.results[event.results.length - 1];
    if (!result || !result[0]) return;
    const transcript = result[0].transcript.trim().toLowerCase();

    if (!transcript) return;

    console.log("HEARD:", transcript);
    console.log("STATE:", gameState);
    transcriptElement.textContent = `You said: ${transcript}`;

    const normalizedTranscript = normalizeVoiceTranscript(transcript);
    if (!normalizedTranscript) return;

    const nextMatch = nextCommands.some((command) =>
      normalizedTranscript.includes(command)
    );
    if (nextMatch && (gameState === "answer" || gameState === "result")) {
      goToNextQuestionNow();
      return;
    }

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
      if (character) {
        selectCharacter(character);
      }
      return;
    }

    if (gameState !== "answer") return;

    if (!currentQuestion) return;
    if (answerLocked) return;
    if (isPromptEcho(transcript)) return;

    // MATH
    if (currentQuestion.type === "math") {
      const spokenNumber = getNumberFromSpeech(transcript);

      if (spokenNumber === null) return;

      answerLocked = true;

      if (spokenNumber === currentQuestion.answer) {
        handleCorrectAnswer();
      } else {
        handleWrongAnswer();
      }

      return;
    }

    // NUMBER
    if (currentQuestion.type === "number") {
      const spokenNumber = getNumberFromSpeech(transcript);
      if (spokenNumber === null) return;
      answerLocked = true;
      if (spokenNumber === currentQuestion.answer) {
        handleCorrectAnswer();
      } else {
        handleWrongAnswer();
      }
      return;
    }

    // OBJECT
    if (currentQuestion.type === "object") {
      const answer = normalizeGreek(transcript);
      const possibleAnswers = [
        ...currentQuestion.answers,
        ...(currentQuestion.alt || [])
      ];
      const isCorrect = possibleAnswers.some((a) => isCloseWordMatch(answer, a));

      // Ignore tiny/noisy chunks instead of auto-wrong.
      if (answer.replace(/\s+/g, "").length < 2) return;

      answerLocked = true;
      if (isCorrect) {
        handleCorrectAnswer();
      } else {
        // Mark wrong only when speech resembles a known object word.
        const knownObjectSaid = getAllObjectAliases().some((a) => isCloseWordMatch(answer, a));
        if (knownObjectSaid) {
          handleWrongAnswer();
        } else {
          answerLocked = false;
        }
      }

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
