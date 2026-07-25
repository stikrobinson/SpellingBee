let words = [];
const wordsByText = new Map();

const letterAliases = {
  a: "a",
  ay: "a",
  b: "b",
  bee: "b",
  be: "b",
  c: "c",
  cee: "c",
  d: "d",
  dee: "d",
  e: "e",
  f: "f",
  ef: "f",
  g: "g",
  gee: "g",
  h: "h",
  aitch: "h",
  i: "i",
  eye: "i",
  j: "j",
  jay: "j",
  k: "k",
  kay: "k",
  l: "l",
  el: "l",
  m: "m",
  em: "m",
  n: "n",
  en: "n",
  o: "o",
  oh: "o",
  p: "p",
  pee: "p",
  q: "q",
  cue: "q",
  queue: "q",
  r: "r",
  are: "r",
  s: "s",
  ess: "s",
  t: "t",
  tee: "t",
  tea: "t",
  u: "u",
  you: "u",
  v: "v",
  vee: "v",
  w: "w",
  doubleu: "w",
  x: "x",
  ex: "x",
  y: "y",
  why: "y",
  z: "z",
  zee: "z",
  zed: "z",
  // Alias de letras en espanol para mejorar el deletreo por voz.
  bea: "b",
  ce: "c",
  de: "d",
  efe: "f",
  ge: "g",
  hache: "h",
  jota: "j",
  ka: "k",
  ele: "l",
  eme: "m",
  ene: "n",
  pe: "p",
  cu: "q",
  erre: "r",
  ese: "s",
  te: "t",
  uve: "v",
  ve: "b",
  dobleve: "w",
  dobleu: "w",
  equis: "x",
  ye: "y",
  "i griega": "y",
  zeta: "z",
};

const multiWordAliases = {
  "double u": "w",
  "double you": "w",
  "doble u": "w",
  "doble ve": "w",
  "i griega": "y",
};

const categoryEl = document.getElementById("category");
const hintEl = document.getElementById("hint");
const transcriptEl = document.getElementById("transcript");
const feedbackEl = document.getElementById("feedback");
const supportMessageEl = document.getElementById("support-message");
const answerEl = document.getElementById("answer");
const newWordButton = document.getElementById("new-word");
const playWordButton = document.getElementById("play-word");
const showHintButton = document.getElementById("show-hint");
const showAnswerButton = document.getElementById("show-answer");
const captureSegmentButton = document.getElementById("capture-segment");
const resetAttemptButton = document.getElementById("reset-attempt");
const toggleTranscriptButton = document.getElementById("toggle-transcript");
const statusPanelEl = document.getElementById("status-panel");
const hintTypeInputs = document.querySelectorAll('input[name="hint-type"]');

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let currentWord = words[0];
let recognition;
let availableVoices = [];
let playCount = 0;
const maxPlayCount = 2;
let roundVoice = null;
let roundRate = 0.8;
let roundPitch = 1;
let capturedSegments = [];
let currentSegmentChunks = [];
let recognitionSessionActive = false;
let finalizeWhenRecognitionEnds = false;
let silenceTimerId = null;
let currentSegmentIndex = 0;
const recognitionSilenceGraceMs = 3200;
const segmentLabels = ["palabra inicial", "deletreo", "palabra final"];

function normalizeWordEntry(entry) {
  return {
    category: entry.category,
    word: String(entry.word || "").toLowerCase(),
    definition: entry.definition || "No hay definicion disponible para esta palabra.",
    examples: Array.isArray(entry.examples) ? entry.examples : [],
  };
}

async function loadWordsFromJson() {
  const response = await fetch("words.json");
  if (!response.ok) {
    throw new Error("words-json-unavailable");
  }

  const payload = await response.json();
  words = payload.map(normalizeWordEntry);

  wordsByText.clear();
  words.forEach((entry) => {
    wordsByText.set(entry.word, entry);
  });
}

function updateVoices() {
  if (!("speechSynthesis" in window)) {
    return;
  }

  availableVoices = window.speechSynthesis.getVoices();
}

function createRoundVoiceProfile() {
  const englishVoices = availableVoices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("en")
  );
  const voicePool = englishVoices.length > 0 ? englishVoices : availableVoices;

  if (voicePool.length > 0) {
    const voiceIndex = Math.floor(Math.random() * voicePool.length);
    roundVoice = voicePool[voiceIndex];
  } else {
    roundVoice = null;
  }

  const rates = [0.72, 0.8, 0.9, 1.0];
  const pitches = [0.9, 1.0, 1.1, 1.2];
  roundRate = rates[Math.floor(Math.random() * rates.length)];
  roundPitch = pitches[Math.floor(Math.random() * pitches.length)];
}

function speakWithRoundVoice(text, onEnd, onError) {
  const utterance = new SpeechSynthesisUtterance(text);

  if (roundVoice) {
    utterance.voice = roundVoice;
    utterance.lang = roundVoice.lang;
  } else {
    utterance.lang = "en-US";
  }

  utterance.rate = roundRate;
  utterance.pitch = roundPitch;

  utterance.onend = onEnd;
  utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
}

function pickWord() {
  if (words.length === 0) {
    categoryEl.textContent = "Sin datos";
    hintEl.textContent = "No se cargaron palabras.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * words.length);
  currentWord = words[randomIndex];
  playCount = 0;
  createRoundVoiceProfile();
  resetAttemptState();
  categoryEl.textContent = currentWord.category;
  hintEl.textContent = "Pista en audio no reproducida.";
  answerEl.textContent = "Palabra correcta oculta.";
  transcriptEl.textContent = "Aun no hay respuesta.";
  updatePlayButtonState();
  showHintButton.disabled = false;
  setFeedback("", "");
}

function updatePlayButtonState() {
  const remaining = maxPlayCount - playCount;

  if (remaining <= 0) {
    playWordButton.textContent = "Escuchar palabra (0/2)";
    playWordButton.disabled = true;
    return;
  }

  playWordButton.textContent = `Escuchar palabra (${remaining}/2)`;
  playWordButton.disabled = false;
}

function getSelectedHintType() {
  const selectedInput = Array.from(hintTypeInputs).find((input) => input.checked);
  return selectedInput ? selectedInput.value : "definition";
}

function pickRandomExample(examples) {
  if (examples.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * examples.length);
  return examples[index];
}

function showOptionalHint() {
  if (!currentWord) {
    hintEl.textContent = "No hay palabra activa.";
    return;
  }

  if (!("speechSynthesis" in window)) {
    setFeedback("Tu navegador no soporta reproduccion de voz.", "error");
    return;
  }

  const hintType = getSelectedHintType();
  const wordEntry = wordsByText.get(currentWord.word);

  if (!wordEntry) {
    hintEl.textContent = "No hay pista disponible para esta palabra.";
    return;
  }

  let hintText = `Definition: ${wordEntry.definition}`;
  let hintLabel = "definicion";

  if (hintType === "example") {
    const randomExample = pickRandomExample(wordEntry.examples);
    hintText = randomExample
      ? `Example sentence: ${randomExample}`
      : "No example is available for this word.";
    hintLabel = "ejemplo";
  }

  window.speechSynthesis.cancel();
  showHintButton.disabled = true;
  hintEl.textContent = `Reproduciendo pista de ${hintLabel}...`;

  speakWithRoundVoice(
    hintText,
    () => {
      showHintButton.disabled = false;
      hintEl.textContent = `Pista de ${hintLabel} reproducida.`;
    },
    () => {
      showHintButton.disabled = false;
      hintEl.textContent = "No se pudo reproducir la pista.";
      setFeedback("No se pudo reproducir el audio de la pista.", "error");
    }
  );
}

function showCorrectWord() {
  if (!currentWord) {
    answerEl.textContent = "No hay palabra activa.";
    return;
  }

  answerEl.textContent = `Palabra correcta: ${currentWord.word}`;
}

function setFeedback(message, state) {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${state}`.trim();
}

function speakWord() {
  if (!currentWord) {
    setFeedback("No hay palabra activa para reproducir.", "error");
    return;
  }

  if (!("speechSynthesis" in window)) {
    setFeedback("Tu navegador no soporta reproduccion de voz.", "error");
    return;
  }

  if (playCount >= maxPlayCount) {
    setFeedback("Ya alcanzaste el maximo de 2 reproducciones para esta palabra.", "error");
    updatePlayButtonState();
    return;
  }

  playCount += 1;
  updatePlayButtonState();

  window.speechSynthesis.cancel();

  playWordButton.disabled = true;
  setFeedback("Reproduciendo audio de la palabra.", "");

  speakWithRoundVoice(
    currentWord.word,
    () => {
      updatePlayButtonState();
    },
    () => {
      if (playCount > 0) {
        playCount -= 1;
      }
      updatePlayButtonState();
      setFeedback("No se pudo reproducir el audio de la palabra.", "error");
    }
  );
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

function extractSpelledLetters(transcript) {
  let normalizedTranscript = transcript.toLowerCase();

  Object.entries(multiWordAliases).forEach(([phrase, replacement]) => {
    normalizedTranscript = normalizedTranscript.replaceAll(phrase, replacement);
  });

  const normalizedTokens = normalizedTranscript
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const letters = normalizedTokens
    .map((token) => letterAliases[token] || "")
    .join("");

  return letters;
}

function segmentContainsExactWord(segment, targetWord) {
  const normalizedTokens = segment
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return normalizedTokens.includes(targetWord);
}

function segmentMatchesWord(segment, targetWord) {
  const collapsedSegment = normalizeText(segment);
  if (collapsedSegment === targetWord) {
    return true;
  }

  return segmentContainsExactWord(segment, targetWord);
}

function getCurrentSegmentLabel() {
  return segmentLabels[currentSegmentIndex] || "segmento";
}

function getTranscriptDisplay() {
  const segments = [...capturedSegments];

  if (recognitionSessionActive && currentSegmentChunks.length > 0) {
    segments.push(currentSegmentChunks.join(" "));
  }

  return segments.length > 0
    ? segments.map((segment, index) => `${index + 1}) ${segment}`).join(" | ")
    : "Escuchando...";
}

function clearSilenceTimer() {
  if (silenceTimerId) {
    window.clearTimeout(silenceTimerId);
    silenceTimerId = null;
  }
}

function queueSilenceFinalization() {
  if (!recognitionSessionActive) {
    return;
  }

  clearSilenceTimer();
  silenceTimerId = window.setTimeout(() => {
    if (!recognitionSessionActive || !recognition) {
      return;
    }

    finalizeWhenRecognitionEnds = true;
    recognition.stop();
  }, recognitionSilenceGraceMs);
}

function updateCaptureButtonState() {
  if (!captureSegmentButton) {
    return;
  }

  if (!currentWord) {
    captureSegmentButton.textContent = "Grabar segmento";
    captureSegmentButton.disabled = true;
    return;
  }

  if (currentSegmentIndex >= segmentLabels.length) {
    captureSegmentButton.textContent = "Intento completado";
    captureSegmentButton.disabled = true;
    return;
  }

  captureSegmentButton.textContent = `Grabar ${getCurrentSegmentLabel()} (${currentSegmentIndex + 1}/3)`;
  captureSegmentButton.disabled = recognitionSessionActive;
}

function resetAttemptState() {
  if (recognitionSessionActive && recognition) {
    recognition.abort();
  }

  recognitionSessionActive = false;
  finalizeWhenRecognitionEnds = false;
  clearSilenceTimer();
  capturedSegments = [];
  currentSegmentChunks = [];
  currentSegmentIndex = 0;
  transcriptEl.textContent = "Aun no hay respuesta.";
  updateCaptureButtonState();
}

function verifyAttempt(segments) {
  const cleanedWord = normalizeText(currentWord.word);
  const normalizedSegments = segments
    .map((segment) => normalizeText(segment))
    .filter(Boolean);

  if (normalizedSegments.length < 3) {
    setFeedback(
      "Formato incompleto: haz tres segmentos con pausas claras (inicio, deletreo y cierre).",
      "error"
    );
    return;
  }

  const startMatches = segmentMatchesWord(segments[0], cleanedWord);
  const endMatches = segmentMatchesWord(
    segments[normalizedSegments.length - 1],
    cleanedWord
  );
  const middleRaw = segments.slice(1, -1).join(" ");
  const spelledLetters = extractSpelledLetters(middleRaw);
  const spellingMatches = spelledLetters === cleanedWord;

  if (startMatches && spellingMatches && endMatches) {
    setFeedback("Correcto. Seguiste el formato palabra, deletreo y palabra.", "success");
    return;
  }

  if (!startMatches || !endMatches) {
    setFeedback(
      "Formato invalido: debes decir la palabra al inicio y al cierre en segmentos separados.",
      "error"
    );
    return;
  }

  if (!spellingMatches) {
    setFeedback(
      "El orden fue correcto, pero el segmento central de deletreo no coincide.",
      "error"
    );
    return;
  }

  setFeedback("Intento invalido. Repite el patron con pausas claras.", "error");
}

function finishSegmentCapture() {
  const segmentText = currentSegmentChunks.join(" ").trim();
  recognitionSessionActive = false;
  finalizeWhenRecognitionEnds = false;
  clearSilenceTimer();

  if (!segmentText) {
    currentSegmentChunks = [];
    updateCaptureButtonState();
    setFeedback("No se detecto voz en ese segmento. Intentalo de nuevo.", "error");
    return;
  }

  capturedSegments.push(segmentText);
  currentSegmentChunks = [];
  currentSegmentIndex = capturedSegments.length;
  transcriptEl.textContent = getTranscriptDisplay();
  updateCaptureButtonState();

  if (capturedSegments.length === segmentLabels.length) {
    setFeedback("Segmentos completos. Evaluando el intento...", "");
    verifyAttempt(capturedSegments);
    return;
  }

  setFeedback(`Segmento guardado. Ahora graba la ${getCurrentSegmentLabel()}.`, "");
}

function startSegmentCapture() {
  if (!recognition) {
    return;
  }

  if (!currentWord) {
    setFeedback("No hay palabra activa para deletrear.", "error");
    return;
  }

  if (recognitionSessionActive) {
    return;
  }

  if (currentSegmentIndex >= segmentLabels.length) {
    setFeedback("El intento ya fue completado. Usa reiniciar para volver a empezar.", "error");
    return;
  }

  currentSegmentChunks = [];
  recognitionSessionActive = true;
  finalizeWhenRecognitionEnds = false;
  transcriptEl.textContent = getTranscriptDisplay();
  setFeedback(`Di la ${getCurrentSegmentLabel()} y espera a que termine ese segmento.`, "");
  updateCaptureButtonState();

  try {
    recognition.start();
  } catch {
    recognitionSessionActive = false;
    currentSegmentChunks = [];
    updateCaptureButtonState();
    setFeedback("No se pudo iniciar el reconocimiento de voz.", "error");
  }
}

function setupRecognition() {
  if (!SpeechRecognition) {
    supportMessageEl.textContent =
      "El reconocimiento de voz no esta disponible en este navegador. Prueba con una version reciente de Chrome o Edge.";
    captureSegmentButton.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (!result.isFinal) {
        continue;
      }

      const segment = result[0].transcript.trim();
      if (segment) {
        currentSegmentChunks.push(segment);
      }
    }

    if (currentSegmentChunks.length > 0) {
      queueSilenceFinalization();
    }

    transcriptEl.textContent = getTranscriptDisplay();
  };

  recognition.onerror = (event) => {
    if (!recognitionSessionActive) {
      return;
    }

    if (event.error === "no-speech" && !finalizeWhenRecognitionEnds) {
      window.setTimeout(() => {
        if (!recognitionSessionActive || finalizeWhenRecognitionEnds || !recognition) {
          return;
        }

        try {
          recognition.start();
        } catch {
          recognitionSessionActive = false;
          clearSilenceTimer();
          updateCaptureButtonState();
          setFeedback("No se pudo continuar escuchando la voz.", "error");
        }
      }, 250);
      return;
    }

    recognitionSessionActive = false;
    clearSilenceTimer();
    updateCaptureButtonState();
    setFeedback(`No se pudo reconocer la voz: ${event.error}.`, "error");
  };

  recognition.onend = () => {
    if (!recognitionSessionActive) {
      return;
    }

    if (!finalizeWhenRecognitionEnds) {
      window.setTimeout(() => {
        if (!recognitionSessionActive || finalizeWhenRecognitionEnds || !recognition) {
          return;
        }

        try {
          recognition.start();
        } catch {
          recognitionSessionActive = false;
          clearSilenceTimer();
          updateCaptureButtonState();
          setFeedback("No se pudo continuar escuchando la voz.", "error");
        }
      }, 250);
      return;
    }

    finishSegmentCapture();

    if (capturedSegments.length === 0 && currentSegmentIndex === 0) {
      transcriptEl.textContent = "Aun no hay respuesta.";
      return;
    }
  };
}

newWordButton.addEventListener("click", pickWord);
playWordButton.addEventListener("click", speakWord);
showHintButton.addEventListener("click", showOptionalHint);
showAnswerButton.addEventListener("click", showCorrectWord);
captureSegmentButton.addEventListener("click", startSegmentCapture);
resetAttemptButton.addEventListener("click", () => {
  resetAttemptState();
  setFeedback("Intento reiniciado. Empieza otra vez con la palabra inicial.", "");
});
toggleTranscriptButton.addEventListener("click", () => {
  const isHidden = statusPanelEl.hidden;
  statusPanelEl.hidden = !isHidden;
  toggleTranscriptButton.textContent = isHidden
    ? "Ocultar lo que entendio el navegador"
    : "Ver lo que entendio el navegador";
});

updateVoices();
if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = updateVoices;
}

setupRecognition();

updateCaptureButtonState();

loadWordsFromJson()
  .then(() => {
    pickWord();
  })
  .catch(() => {
    categoryEl.textContent = "Sin datos";
    hintEl.textContent = "No se pudo cargar words.json.";
    answerEl.textContent = "No disponible.";
    newWordButton.disabled = true;
    playWordButton.disabled = true;
    showHintButton.disabled = true;
    showAnswerButton.disabled = true;
    captureSegmentButton.disabled = true;
    setFeedback("Error cargando words.json.", "error");
  });