const startGameButton = document.getElementById("startGameBtn");
const startListeningButton = document.getElementById("startListeningBtn");
const transcriptElement = document.getElementById("transcript");
const statusElement = document.getElementById("listeningStatus");
const languageSelect = document.getElementById("languageSelect");
const selectionResultElement = document.getElementById("selectionResult");

let selectedCharacter = "";
let waitingForCharacter = false;

function speakMessage(message) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  }
  statusElement.textContent = `Status: ${message}`;
}

function startGame() {
  alert("Game started");
  waitingForCharacter = true;
  selectedCharacter = "";
  selectionResultElement.textContent = "You chose: ...";
  speakMessage("Choose your character by saying their name");
}

startGameButton.addEventListener("click", startGame);

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  startListeningButton.disabled = true;
  statusElement.textContent =
    "Status: Speech recognition is not supported in this browser.";
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  const allowedCommands = ["start game", "ξεκίνα παιχνίδι"];
  const characterMap = [
    { keywords: ["luke"], character: "Luke Skywalker" },
    { keywords: ["chewbacca"], character: "Chewbacca" },
    { keywords: ["vader"], character: "Darth Vader" },
    { keywords: ["emperor"], character: "Emperor" },
    { keywords: ["r2", "r2d2"], character: "R2-D2" },
    { keywords: ["maul"], character: "Darth Maul" },
  ];

  function normalizeTranscript(text) {
    return text.toLowerCase().trim().replace(/\s+/g, " ");
  }

  function findCharacterFromTranscript(normalizedTranscript) {
    const match = characterMap.find((item) =>
      item.keywords.some((keyword) => normalizedTranscript.includes(keyword))
    );
    return match ? match.character : "";
  }

  recognition.onstart = () => {
    statusElement.textContent = "Status: Listening...";
  };

  recognition.onresult = (event) => {
    let combinedTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      combinedTranscript += event.results[i][0].transcript;
    }

    const cleanedTranscript = combinedTranscript.trim();
    transcriptElement.textContent = `You said: ${
      cleanedTranscript || "..."
    }`;

    const normalizedTranscript = normalizeTranscript(cleanedTranscript);
    const shouldStartGame = allowedCommands.some((command) =>
      normalizedTranscript.includes(command)
    );

    if (shouldStartGame) {
      startGame();
      return;
    }

    const hasFinalResult = Array.from(event.results).some(
      (result) => result.isFinal
    );

    if (waitingForCharacter && hasFinalResult && normalizedTranscript) {
      const matchedCharacter = findCharacterFromTranscript(normalizedTranscript);

      if (matchedCharacter) {
        selectedCharacter = matchedCharacter;
        waitingForCharacter = false;
        selectionResultElement.textContent = `You chose: ${selectedCharacter}`;
        speakMessage(`Great choice! You chose ${selectedCharacter}.`);
      } else {
        speakMessage("I didn't understand, try again");
      }
    }
  };

  recognition.onerror = (event) => {
    statusElement.textContent = `Status: Error (${event.error})`;
  };

  recognition.onend = () => {
    if (!statusElement.textContent.startsWith("Status: Error")) {
      statusElement.textContent = "Status: Idle";
    }
  };

  startListeningButton.addEventListener("click", () => {
    recognition.lang = languageSelect.value;
    statusElement.textContent = "Status: Starting microphone...";
    transcriptElement.textContent = "You said: ...";
    recognition.start();
  });
}
