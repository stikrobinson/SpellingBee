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
const newWordButton = document.getElementById("new-word");
const playWordButton = document.getElementById("play-word");
const showHintButton = document.getElementById("show-hint");
const startSpellingButton = document.getElementById("start-spelling");
const hintTypeInputs = document.querySelectorAll('input[name="hint-type"]');

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let currentWord = words[0];
let recognition;
let availableVoices = [];
let playCount = 0;
const maxPlayCount = 2;

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

function pickWord() {
  if (words.length === 0) {
    categoryEl.textContent = "Sin datos";
    hintEl.textContent = "No se cargaron palabras.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * words.length);
  currentWord = words[randomIndex];
  playCount = 0;
  categoryEl.textContent = currentWord.category;
  hintEl.textContent = "Pista oculta. Pulsa Mostrar pista (opcional).";
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

  const hintType = getSelectedHintType();
  const wordEntry = wordsByText.get(currentWord.word);

  if (!wordEntry) {
    hintEl.textContent = "No hay pista disponible para esta palabra.";
    return;
  }

  if (hintType === "example") {
    const randomExample = pickRandomExample(wordEntry.examples);
    hintEl.textContent = randomExample
      ? `Ejemplo: ${randomExample}`
      : "No hay ejemplos disponibles para esta palabra.";
    return;
  }

  hintEl.textContent = `Definicion: ${wordEntry.definition}`;
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
  const utterance = new SpeechSynthesisUtterance(currentWord.word);
  const englishVoices = availableVoices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("en")
  );
  const voicePool = englishVoices.length > 0 ? englishVoices : availableVoices;

  if (voicePool.length > 0) {
    const voiceIndex = Math.floor(Math.random() * voicePool.length);
    utterance.voice = voicePool[voiceIndex];
    utterance.lang = utterance.voice.lang;
  } else {
    utterance.lang = "en-US";
  }

  const rates = [0.72, 0.8, 0.9, 1.0];
  const pitches = [0.9, 1.0, 1.1, 1.2];
  utterance.rate = rates[Math.floor(Math.random() * rates.length)];
  utterance.pitch = pitches[Math.floor(Math.random() * pitches.length)];

  playWordButton.disabled = true;
  setFeedback("Reproduciendo audio de la palabra.", "");

  utterance.onend = () => {
    updatePlayButtonState();
  };

  utterance.onerror = () => {
    if (playCount > 0) {
      playCount -= 1;
    }
    updatePlayButtonState();
    setFeedback("No se pudo reproducir el audio de la palabra.", "error");
  };

  window.speechSynthesis.speak(utterance);
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

function verifyAttempt(transcript) {
  const cleanedWord = normalizeText(currentWord.word);
  const normalizedTranscript = normalizeText(transcript);
  const spelledLetters = extractSpelledLetters(transcript);

  const isCorrect =
    normalizedTranscript === cleanedWord || spelledLetters === cleanedWord;

  if (isCorrect) {
    setFeedback(`Correcto. La palabra era ${currentWord.word}.`, "success");
    return;
  }

  setFeedback(
    `Incorrecto. Dijiste "${transcript}" y la palabra correcta era ${currentWord.word}.`,
    "error"
  );
}

function startRecognition() {
  if (!recognition) {
    return;
  }

  if (!currentWord) {
    setFeedback("No hay palabra activa para deletrear.", "error");
    return;
  }

  transcriptEl.textContent = "Escuchando...";
  setFeedback("Di la palabra o deletreala letra por letra.", "");
  startSpellingButton.disabled = true;
  recognition.start();
}

function setupRecognition() {
  if (!SpeechRecognition) {
    supportMessageEl.textContent =
      "El reconocimiento de voz no esta disponible en este navegador. Prueba con una version reciente de Chrome o Edge.";
    startSpellingButton.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 5;

  recognition.onresult = (event) => {
    const alternatives = Array.from(event.results[0]).map((result) =>
      result.transcript.trim()
    );
    transcriptEl.textContent = alternatives.join(" | ");

    const hasCorrectAlternative = alternatives.some((option) => {
      const cleanedWord = normalizeText(currentWord.word);
      const normalizedTranscript = normalizeText(option);
      const spelledLetters = extractSpelledLetters(option);
      return (
        normalizedTranscript === cleanedWord || spelledLetters === cleanedWord
      );
    });

    if (hasCorrectAlternative) {
      setFeedback(`Correcto. La palabra era ${currentWord.word}.`, "success");
      return;
    }

    verifyAttempt(alternatives[0]);
  };

  recognition.onerror = (event) => {
    setFeedback(`No se pudo reconocer la voz: ${event.error}.`, "error");
  };

  recognition.onend = () => {
    startSpellingButton.disabled = false;
  };
}

newWordButton.addEventListener("click", pickWord);
playWordButton.addEventListener("click", speakWord);
showHintButton.addEventListener("click", showOptionalHint);
startSpellingButton.addEventListener("click", startRecognition);

updateVoices();
if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = updateVoices;
}

setupRecognition();

loadWordsFromJson()
  .then(() => {
    pickWord();
  })
  .catch(() => {
    categoryEl.textContent = "Sin datos";
    hintEl.textContent = "No se pudo cargar words.json.";
    newWordButton.disabled = true;
    playWordButton.disabled = true;
    showHintButton.disabled = true;
    startSpellingButton.disabled = true;
    setFeedback("Error cargando words.json.", "error");
  });