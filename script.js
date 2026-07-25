const words = [
  { word: "academic", category: "Universitaria / Academica" },
  { word: "accomplishment", category: "Universitaria / Academica" },
  { word: "adaptation", category: "Universitaria / Academica" },
  { word: "analysis", category: "Universitaria / Academica" },
  { word: "assignment", category: "Universitaria / Academica" },
  { word: "bibliography", category: "Universitaria / Academica" },
  { word: "cognitive", category: "Universitaria / Academica" },
  { word: "comprehension", category: "Universitaria / Academica" },
  { word: "curriculum", category: "Universitaria / Academica" },
  { word: "dissertation", category: "Universitaria / Academica" },
  { word: "evaluation", category: "Universitaria / Academica" },
  { word: "graduation", category: "Universitaria / Academica" },
  { word: "hypothesis", category: "Universitaria / Academica" },
  { word: "intellectual", category: "Universitaria / Academica" },
  { word: "knowledge", category: "Universitaria / Academica" },
  { word: "laboratory", category: "Universitaria / Academica" },
  { word: "literature", category: "Universitaria / Academica" },
  { word: "mathematics", category: "Universitaria / Academica" },
  { word: "methodology", category: "Universitaria / Academica" },
  { word: "phenomenon", category: "Universitaria / Academica" },
  { word: "philosophy", category: "Universitaria / Academica" },
  { word: "plagiarism", category: "Universitaria / Academica" },
  { word: "psychology", category: "Universitaria / Academica" },
  { word: "reference", category: "Universitaria / Academica" },
  { word: "scholarship", category: "Universitaria / Academica" },
  { word: "semester", category: "Universitaria / Academica" },
  { word: "statistics", category: "Universitaria / Academica" },
  { word: "synthesis", category: "Universitaria / Academica" },
  { word: "theoretical", category: "Universitaria / Academica" },
  { word: "vocabulary", category: "Universitaria / Academica" },

  { word: "accessibility", category: "Tecnologia e Innovacion" },
  { word: "algorithm", category: "Tecnologia e Innovacion" },
  { word: "automation", category: "Tecnologia e Innovacion" },
  { word: "bandwidth", category: "Tecnologia e Innovacion" },
  { word: "biodegradable", category: "Tecnologia e Innovacion" },
  { word: "biometrics", category: "Tecnologia e Innovacion" },
  { word: "cybernetics", category: "Tecnologia e Innovacion" },
  { word: "cybersecurity", category: "Tecnologia e Innovacion" },
  { word: "cyberspace", category: "Tecnologia e Innovacion" },
  { word: "data-driven", category: "Tecnologia e Innovacion" },
  { word: "digitization", category: "Tecnologia e Innovacion" },
  { word: "ecological", category: "Tecnologia e Innovacion" },
  { word: "efficient", category: "Tecnologia e Innovacion" },
  { word: "encryption", category: "Tecnologia e Innovacion" },
  { word: "environment", category: "Tecnologia e Innovacion" },
  { word: "fluorescent", category: "Tecnologia e Innovacion" },
  { word: "infrastructure", category: "Tecnologia e Innovacion" },
  { word: "innovation", category: "Tecnologia e Innovacion" },
  { word: "interface", category: "Tecnologia e Innovacion" },
  { word: "microprocessor", category: "Tecnologia e Innovacion" },
  { word: "nanotechnology", category: "Tecnologia e Innovacion" },
  { word: "programming", category: "Tecnologia e Innovacion" },
  { word: "prototype", category: "Tecnologia e Innovacion" },
  { word: "robotics", category: "Tecnologia e Innovacion" },
  { word: "satellite", category: "Tecnologia e Innovacion" },
  { word: "simulation", category: "Tecnologia e Innovacion" },
  { word: "synchronize", category: "Tecnologia e Innovacion" },
  { word: "technological", category: "Tecnologia e Innovacion" },
  { word: "telecommunication", category: "Tecnologia e Innovacion" },
  { word: "virtual", category: "Tecnologia e Innovacion" },
  { word: "wireless", category: "Tecnologia e Innovacion" },

  { word: "administration", category: "Profesional / Trabajo" },
  { word: "apprenticeship", category: "Profesional / Trabajo" },
  { word: "beneficial", category: "Profesional / Trabajo" },
  { word: "bureaucracy", category: "Profesional / Trabajo" },
  { word: "collaborate", category: "Profesional / Trabajo" },
  { word: "colleague", category: "Profesional / Trabajo" },
  { word: "compensation", category: "Profesional / Trabajo" },
  { word: "corporation", category: "Profesional / Trabajo" },
  { word: "delegate", category: "Profesional / Trabajo" },
  { word: "determination", category: "Profesional / Trabajo" },
  { word: "development", category: "Profesional / Trabajo" },
  { word: "efficiency", category: "Profesional / Trabajo" },
  { word: "employment", category: "Profesional / Trabajo" },
  { word: "entrepreneur", category: "Profesional / Trabajo" },
  { word: "executive", category: "Profesional / Trabajo" },
  { word: "feasible", category: "Profesional / Trabajo" },
  { word: "hierarchy", category: "Profesional / Trabajo" },
  { word: "leadership", category: "Profesional / Trabajo" },
  { word: "logistics", category: "Profesional / Trabajo" },
  { word: "maintenance", category: "Profesional / Trabajo" },
  { word: "management", category: "Profesional / Trabajo" },
  { word: "marketing", category: "Profesional / Trabajo" },
  { word: "negotiate", category: "Profesional / Trabajo" },
  { word: "productivity", category: "Profesional / Trabajo" },
  { word: "professional", category: "Profesional / Trabajo" },
  { word: "promotion", category: "Profesional / Trabajo" },
  { word: "recruitment", category: "Profesional / Trabajo" },
  { word: "revenue", category: "Profesional / Trabajo" },
  { word: "spreadsheet", category: "Profesional / Trabajo" },
  { word: "strategy", category: "Profesional / Trabajo" },

  { word: "assertive", category: "Comunicacion y Sociedad" },
  { word: "broadcast", category: "Comunicacion y Sociedad" },
  { word: "civilization", category: "Comunicacion y Sociedad" },
  { word: "communication", category: "Comunicacion y Sociedad" },
  { word: "community", category: "Comunicacion y Sociedad" },
  { word: "conscious", category: "Comunicacion y Sociedad" },
  { word: "consequence", category: "Comunicacion y Sociedad" },
  { word: "democracy", category: "Comunicacion y Sociedad" },
  { word: "diversity", category: "Comunicacion y Sociedad" },
  { word: "generation", category: "Comunicacion y Sociedad" },
  { word: "heritage", category: "Comunicacion y Sociedad" },
  { word: "immigration", category: "Comunicacion y Sociedad" },
  { word: "inequality", category: "Comunicacion y Sociedad" },
  { word: "influence", category: "Comunicacion y Sociedad" },
  { word: "integration", category: "Comunicacion y Sociedad" },
  { word: "journalism", category: "Comunicacion y Sociedad" },
  { word: "multicultural", category: "Comunicacion y Sociedad" },
  { word: "parliament", category: "Comunicacion y Sociedad" },
  { word: "participate", category: "Comunicacion y Sociedad" },
  { word: "population", category: "Comunicacion y Sociedad" },
  { word: "prejudice", category: "Comunicacion y Sociedad" },
  { word: "propaganda", category: "Comunicacion y Sociedad" },
  { word: "recommendation", category: "Comunicacion y Sociedad" },
  { word: "resolution", category: "Comunicacion y Sociedad" },
  { word: "stereotype", category: "Comunicacion y Sociedad" },
  { word: "sympathy", category: "Comunicacion y Sociedad" },
  { word: "tolerance", category: "Comunicacion y Sociedad" },
  { word: "tradition", category: "Comunicacion y Sociedad" },
  { word: "volunteer", category: "Comunicacion y Sociedad" },
  { word: "vulnerable", category: "Comunicacion y Sociedad" },

  { word: "abundant", category: "Abstracto y Descriptivo" },
  { word: "accommodation", category: "Abstracto y Descriptivo" },
  { word: "ambiguous", category: "Abstracto y Descriptivo" },
  { word: "bewildered", category: "Abstracto y Descriptivo" },
  { word: "boundary", category: "Abstracto y Descriptivo" },
  { word: "breathtaking", category: "Abstracto y Descriptivo" },
  { word: "captivating", category: "Abstracto y Descriptivo" },
  { word: "catastrophe", category: "Abstracto y Descriptivo" },
  { word: "challenge", category: "Abstracto y Descriptivo" },
  { word: "characteristic", category: "Abstracto y Descriptivo" },
  { word: "deficiency", category: "Abstracto y Descriptivo" },
  { word: "disappointed", category: "Abstracto y Descriptivo" },
  { word: "essential", category: "Abstracto y Descriptivo" },
  { word: "exception", category: "Abstracto y Descriptivo" },
  { word: "fascinating", category: "Abstracto y Descriptivo" },
  { word: "flexible", category: "Abstracto y Descriptivo" },
  { word: "generous", category: "Abstracto y Descriptivo" },
  { word: "guarantee", category: "Abstracto y Descriptivo" },
  { word: "hesitate", category: "Abstracto y Descriptivo" },
  { word: "illusion", category: "Abstracto y Descriptivo" },
  { word: "imagination", category: "Abstracto y Descriptivo" },
  { word: "incredible", category: "Abstracto y Descriptivo" },
  { word: "landscape", category: "Abstracto y Descriptivo" },
  { word: "magnificent", category: "Abstracto y Descriptivo" },
  { word: "obstacle", category: "Abstracto y Descriptivo" },
  { word: "optimistic", category: "Abstracto y Descriptivo" },
  { word: "resistance", category: "Abstracto y Descriptivo" },
  { word: "significant", category: "Abstracto y Descriptivo" },
  { word: "spectacular", category: "Abstracto y Descriptivo" },
  { word: "spontaneous", category: "Abstracto y Descriptivo" },
];

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

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let currentWord = words[0];
let recognition;
let availableVoices = [];
let playCount = 0;
const maxPlayCount = 2;
const hintCache = new Map();

function updateVoices() {
  if (!("speechSynthesis" in window)) {
    return;
  }

  availableVoices = window.speechSynthesis.getVoices();
}

function pickWord() {
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

async function fetchHintFromDictionary(word) {
  const cachedHint = hintCache.get(word);
  if (cachedHint) {
    return cachedHint;
  }

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    if (!response.ok) {
      throw new Error("dictionary-unavailable");
    }

    const payload = await response.json();
    const meanings = payload[0]?.meanings || [];
    const definitions = [];
    const examples = [];

    meanings.forEach((meaning) => {
      (meaning.definitions || []).forEach((item) => {
        if (item.definition) {
          definitions.push(item.definition);
        }
        if (item.example) {
          examples.push(item.example);
        }
      });
    });

    const hintData = {
      definition: definitions[0] || "No hay definicion disponible para esta palabra.",
      example: examples[0] || null,
    };

    hintCache.set(word, hintData);
    return hintData;
  } catch (_error) {
    const fallbackHint = {
      definition: "No hay definicion disponible para esta palabra.",
      example: null,
    };
    hintCache.set(word, fallbackHint);
    return fallbackHint;
  }
}

async function showOptionalHint() {
  showHintButton.disabled = true;
  hintEl.textContent = "Cargando pista...";

  const hintData = await fetchHintFromDictionary(currentWord.word);
  const hintType = Math.random() < 0.5 ? "definition" : "example";

  if (hintType === "example" && hintData.example) {
    hintEl.textContent = `Ejemplo: ${hintData.example}`;
  } else {
    hintEl.textContent = `Definicion: ${hintData.definition}`;
  }

  showHintButton.disabled = false;
}

function setFeedback(message, state) {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${state}`.trim();
}

function speakWord() {
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
pickWord();