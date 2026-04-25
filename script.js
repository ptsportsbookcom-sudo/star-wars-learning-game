const startGameButton = document.getElementById("startGameBtn");
const startListeningButton = document.getElementById("startListeningBtn");
const transcriptElement = document.getElementById("transcript");
const statusElement = document.getElementById("listeningStatus");
const languageSelect = document.getElementById("languageSelect");

function startGame() {
  alert("Game started");
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

  function normalizeTranscript(text) {
    return text.toLowerCase().trim().replace(/\s+/g, " ");
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
