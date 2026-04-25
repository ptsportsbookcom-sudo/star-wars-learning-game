const startGameButton = document.getElementById("startGameBtn");
const startListeningButton = document.getElementById("startListeningBtn");
const transcriptElement = document.getElementById("transcript");
const statusElement = document.getElementById("listeningStatus");
const languageSelect = document.getElementById("languageSelect");
const selectionResultElement = document.getElementById("selectionResult");
const voiceEnablePrompt = document.getElementById("voiceEnablePrompt");

let selectedCharacter = "";
let gameState = "idle";
let voiceActivated = false;
let shouldKeepListening = false;
let isRecognitionRunning = false;

function speakMessage(message) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  }
  statusElement.textContent = message;
}

function startGame() {
  alert("Game started");
  gameState = "waiting_for_character";
  selectedCharacter = "";
  selectionResultElement.textContent = "You chose: ...";
  speakMessage("Choose your character by saying their name");
}

startGameButton.addEventListener("click", startGame);

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  startListeningButton.disabled = true;
  statusElement.textContent = "Speech recognition is not supported in this browser.";
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
      return;
    }
    voiceActivated = true;
    shouldKeepListening = true;
    hideListeningButton();
    voiceEnablePrompt.classList.add("hidden");
    setWaitingStatus();
    recognition.lang = languageSelect.value;
    transcriptElement.textContent = "You said: ...";

    if (!isRecognitionRunning) {
      recognition.start();
    }
  }

  recognition.onstart = () => {
    isRecognitionRunning = true;
    statusElement.textContent = "Listening...";
  };

  recognition.onresult = (event) => {
    let combinedTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      combinedTranscript += event.results[i][0].transcript;
    }

    const cleanedTranscript = combinedTranscript.trim();
    console.log("Transcript:", cleanedTranscript);
    transcriptElement.textContent = `You said: ${
      cleanedTranscript || "..."
    }`;

    const normalizedTranscript = normalizeTranscript(cleanedTranscript);
    const hasFinalResult = Array.from(event.results).some(
      (result) => result.isFinal
    );

    if (!hasFinalResult || !normalizedTranscript) {
      return;
    }

    if (gameState === "waiting_for_character") {
      const matchedCharacter = findCharacterFromTranscript(normalizedTranscript);

      if (matchedCharacter) {
        selectedCharacter = matchedCharacter;
        gameState = "in_game";
        selectionResultElement.textContent = `You chose: ${selectedCharacter}`;
        speakMessage(`Great choice! You chose ${selectedCharacter}.`);
      } else {
        speakMessage("I didn't understand, try again");
      }
      return;
    }

    const shouldStartGame = allowedCommands.some((command) =>
      normalizedTranscript.includes(command)
    );

    if (shouldStartGame) {
      startGame();
    }
  };

  recognition.onerror = (event) => {
    isRecognitionRunning = false;

    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      shouldKeepListening = false;
      voiceActivated = false;
      voiceEnablePrompt.classList.remove("hidden");
      statusElement.textContent = "Tap anywhere once to enable voice";
      return;
    }

    statusElement.textContent = `Error: ${event.error}`;
  };

  recognition.onend = () => {
    isRecognitionRunning = false;

    if (shouldKeepListening) {
      recognition.lang = languageSelect.value;
      setTimeout(() => {
        if (!isRecognitionRunning && shouldKeepListening) {
          recognition.start();
        }
      }, 250);
    } else {
      if (voiceEnablePrompt.classList.contains("hidden")) {
        setWaitingStatus();
      }
    }
  };

  function handleFirstInteraction() {
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
