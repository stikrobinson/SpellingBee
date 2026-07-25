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
let maxSegmentTimerId = null;
let currentSegmentIndex = 0;
let transcriptDetailsVisible = false;
let mediaRecorder = null;
let mediaStream = null;
let mediaChunks = [];
let segmentAudioUrls = [];
let recordingSegmentIndex = -1;
let audioStopPromise = null;
let consecutiveNoSpeechErrors = 0;
const supportNotes = new Set();
const recognitionSilenceGraceMs = 3200;
const maxSegmentDurationMs = 15000;
const segmentLabels = ["palabra inicial", "deletreo", "palabra final"];

function normalizeWordEntry(entry) {
  return {
    category: entry.category,
    word: String(entry.word || "").toLowerCase(),
    definition: entry.definition || "No hay definicion disponible para esta palabra.",
    examples: Array.isArray(entry.examples) ? entry.examples : [],
  };
}

function getRecognitionLanguage() {
  const browserLanguage = (navigator.language || navigator.languages?.[0] || "").toLowerCase();

  if (browserLanguage.startsWith("es")) {
    return "es-ES";
  }

  return "en-US";
}

function isLikelyMobileDevice() {
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || "");
}

function shouldCaptureSegmentAudio() {
  return !isLikelyMobileDevice();
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

function getSegmentTextByIndex(index) {
  if (index < capturedSegments.length) {
    return capturedSegments[index];
  }

  if (recognitionSessionActive && index === capturedSegments.length) {
    return currentSegmentChunks.join(" ").trim();
  }

  return "";
}

function getSegmentEvaluation(segmentText, index) {
  if (!segmentText || !currentWord) {
    return "pending";
  }

  const cleanedWord = normalizeText(currentWord.word);

  if (index === 1) {
    return extractSpelledLetters(segmentText) === cleanedWord ? "correct" : "incorrect";
  }

  return segmentMatchesWord(segmentText, cleanedWord) ? "correct" : "incorrect";
}

function canRecordAudioSegments() {
  return Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
}

function renderSupportMessage() {
  supportMessageEl.textContent = Array.from(supportNotes).join(" ");
}

function addSupportNote(message) {
  if (!message) {
    return;
  }

  supportNotes.add(message);
  renderSupportMessage();
}

function initializeSupportNotes() {
  if (!SpeechRecognition) {
    addSupportNote(
      "El reconocimiento de voz no esta disponible en este navegador. Prueba con una version reciente de Chrome o Edge."
    );
  }

  if (!canRecordAudioSegments()) {
    addSupportNote(
      "La grabacion de audio por segmento no esta disponible en este navegador."
    );
  }

  if (isLikelyMobileDevice()) {
    addSupportNote(
      "En movil se prioriza el reconocimiento de voz y se desactiva el guardado de audio por segmento para evitar bloqueos del microfono."
    );
  }

  const isSecureOrigin =
    window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (!isSecureOrigin) {
    addSupportNote(
      "El acceso al microfono suele requerir HTTPS o localhost; en HTTP puede fallar en movil."
    );
  }
}

async function ensureMediaStream() {
  if (mediaStream) {
    return mediaStream;
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return mediaStream;
}

function releaseMediaStream() {
  if (!mediaStream) {
    return;
  }

  mediaStream.getTracks().forEach((track) => track.stop());
  mediaStream = null;
}

function revokeSegmentAudioUrl(index) {
  if (!segmentAudioUrls[index]) {
    return;
  }

  URL.revokeObjectURL(segmentAudioUrls[index]);
  segmentAudioUrls[index] = null;
}

function clearSegmentAudios() {
  segmentAudioUrls.forEach((_, index) => {
    revokeSegmentAudioUrl(index);
  });
  segmentAudioUrls = [];
}

async function startSegmentAudioRecording(index) {
  if (!shouldCaptureSegmentAudio() || !canRecordAudioSegments()) {
    return false;
  }

  const stream = await ensureMediaStream();
  mediaChunks = [];
  recordingSegmentIndex = index;
  revokeSegmentAudioUrl(index);

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      mediaChunks.push(event.data);
    }
  };

  audioStopPromise = new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      resolve(true);
    };

    mediaRecorder.onerror = () => {
      resolve(false);
    };
  });

  mediaRecorder.start();
  return true;
}

async function stopSegmentAudioRecording(discard = false) {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    return false;
  }

  mediaRecorder.stop();
  const stopped = await audioStopPromise;
  const chunkCount = mediaChunks.length;

  if (!discard && stopped && chunkCount > 0 && recordingSegmentIndex >= 0) {
    const blob = new Blob(mediaChunks, { type: "audio/webm" });
    segmentAudioUrls[recordingSegmentIndex] = URL.createObjectURL(blob);
  }

  mediaRecorder = null;
  mediaChunks = [];
  audioStopPromise = null;
  recordingSegmentIndex = -1;
  releaseMediaStream();
  return stopped;
}

function renderTranscript() {
  transcriptEl.innerHTML = "";

  const fragment = document.createDocumentFragment();
  let hasAnySegment = false;

  segmentLabels.forEach((label, index) => {
    const segmentText = getSegmentTextByIndex(index);
    const status = getSegmentEvaluation(segmentText, index);
    const row = document.createElement("div");
    row.className = `segment-row ${status}`;

    const header = document.createElement("div");
    header.className = "segment-summary";

    const labelEl = document.createElement("span");
    labelEl.className = "segment-label";
    labelEl.textContent = label;

    const statusEl = document.createElement("span");
    statusEl.className = `segment-status ${status}`;
    statusEl.textContent = status === "correct" ? "✓" : status === "incorrect" ? "✗" : "·";

    header.append(labelEl, statusEl);
    row.append(header);

    const detail = document.createElement("p");
    detail.className = `segment-text ${status === "pending" ? "pending-text" : ""}`.trim();
    detail.hidden = !transcriptDetailsVisible;

    if (segmentText) {
      hasAnySegment = true;
      detail.textContent = segmentText;
    } else {
      detail.textContent = recognitionSessionActive && index === capturedSegments.length ? "Grabando..." : "Pendiente";
    }

    row.append(detail);

    const segmentAudioUrl = segmentAudioUrls[index];
    if (segmentAudioUrl) {
      hasAnySegment = true;
      const audioEl = document.createElement("audio");
      audioEl.className = "segment-audio";
      audioEl.controls = true;
      audioEl.preload = "metadata";
      audioEl.src = segmentAudioUrl;
      row.append(audioEl);
    }

    fragment.append(row);
  });

  if (!hasAnySegment && !recognitionSessionActive) {
    transcriptEl.textContent = "Aun no hay respuesta.";
    return;
  }

  transcriptEl.append(fragment);
}

function clearSilenceTimer() {
  if (silenceTimerId) {
    window.clearTimeout(silenceTimerId);
    silenceTimerId = null;
  }
}

function clearMaxSegmentTimer() {
  if (maxSegmentTimerId) {
    window.clearTimeout(maxSegmentTimerId);
    maxSegmentTimerId = null;
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

function queueMaxSegmentFinalization() {
  if (!recognitionSessionActive) {
    return;
  }

  clearMaxSegmentTimer();
  maxSegmentTimerId = window.setTimeout(() => {
    if (!recognitionSessionActive || !recognition) {
      return;
    }

    finalizeWhenRecognitionEnds = true;
    recognition.stop();
  }, maxSegmentDurationMs);
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

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    void stopSegmentAudioRecording(true);
  } else {
    releaseMediaStream();
  }

  recognitionSessionActive = false;
  finalizeWhenRecognitionEnds = false;
  clearSilenceTimer();
  clearMaxSegmentTimer();
  clearSegmentAudios();
  capturedSegments = [];
  currentSegmentChunks = [];
  currentSegmentIndex = 0;
  transcriptDetailsVisible = false;
  statusPanelEl.hidden = true;
  toggleTranscriptButton.textContent = "Ver segmentos";
  renderTranscript();
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
      "Formato invalido: debes decir la palabra al inicio y al cierre.",
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

async function finishSegmentCapture() {
  const segmentText = currentSegmentChunks.join(" ").trim();
  recognitionSessionActive = false;
  finalizeWhenRecognitionEnds = false;
  clearSilenceTimer();
  clearMaxSegmentTimer();
  await stopSegmentAudioRecording(!segmentText);

  if (!segmentText) {
    currentSegmentChunks = [];
    updateCaptureButtonState();
    setFeedback("No se detecto voz en ese segmento. Intentalo de nuevo.", "error");
    return;
  }

  capturedSegments.push(segmentText);
  currentSegmentChunks = [];
  currentSegmentIndex = capturedSegments.length;
  renderTranscript();
  updateCaptureButtonState();

  if (capturedSegments.length === segmentLabels.length) {
    setFeedback("Los tres segmentos ya quedaron grabados. Evaluando el intento...", "");
    verifyAttempt(capturedSegments);
    return;
  }

  setFeedback(`Segmento guardado. Presiona para grabar la ${getCurrentSegmentLabel()}.`, "");
}

async function startSegmentCapture() {
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

  let audioRecordingEnabled = false;
  try {
    audioRecordingEnabled = await startSegmentAudioRecording(currentSegmentIndex);
  } catch {
    audioRecordingEnabled = false;
  }

  renderTranscript();
  queueMaxSegmentFinalization();

  const audioMessage = audioRecordingEnabled
    ? " Tambien se esta guardando el audio del segmento."
    : "";

  setFeedback(
    `Grabando la ${getCurrentSegmentLabel()}. Di solo ese segmento y espera a que se guarde.${audioMessage}`,
    ""
  );
  updateCaptureButtonState();

  try {
    recognition.start();
  } catch {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      await stopSegmentAudioRecording(true);
    }
    releaseMediaStream();
    recognitionSessionActive = false;
    currentSegmentChunks = [];
    updateCaptureButtonState();
    setFeedback("No se pudo iniciar el reconocimiento de voz.", "error");
  }
}

function setupRecognition() {
  if (!SpeechRecognition) {
    captureSegmentButton.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = getRecognitionLanguage();
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
        consecutiveNoSpeechErrors = 0;
        currentSegmentChunks.push(segment);
      }
    }

    if (currentSegmentChunks.length > 0) {
      queueSilenceFinalization();
    }

    renderTranscript();
  };

  recognition.onerror = (event) => {
    if (!recognitionSessionActive) {
      return;
    }

    if (event.error === "no-speech" && !finalizeWhenRecognitionEnds) {
      consecutiveNoSpeechErrors += 1;
      if (consecutiveNoSpeechErrors >= 2) {
        addSupportNote(
          "No se detecta voz con estabilidad. Revisa permiso de microfono, acerca el microfono y habla despues de pulsar grabar."
        );
      }

      if (currentSegmentChunks.length > 0 && recognition) {
        finalizeWhenRecognitionEnds = true;
        recognition.stop();
        return;
      }

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

    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      addSupportNote(
        "El navegador bloqueo el microfono. Activa el permiso de microfono para este sitio y vuelve a intentar."
      );
    }

    if (event.error === "audio-capture") {
      addSupportNote(
        "No se detecto una entrada de microfono utilizable en el dispositivo."
      );
    }

    if (event.error === "network") {
      addSupportNote(
        "Hubo un error de red del reconocimiento de voz. En movil, revisa conexion y vuelve a intentar."
      );
    }

    recognitionSessionActive = false;
    clearSilenceTimer();
    updateCaptureButtonState();
    setFeedback(`No se pudo reconocer la ${getCurrentSegmentLabel()}: ${event.error}.`, "error");
  };

  recognition.onend = async () => {
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
          clearMaxSegmentTimer();
          updateCaptureButtonState();
          setFeedback("No se pudo continuar escuchando la voz.", "error");
        }
      }, 250);
      return;
    }

    await finishSegmentCapture();
    renderTranscript();
  };

  recognition.onspeechend = () => {
    if (!recognitionSessionActive) {
      return;
    }

    queueSilenceFinalization();
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
  if (statusPanelEl.hidden) {
    statusPanelEl.hidden = false;
    transcriptDetailsVisible = false;
    toggleTranscriptButton.textContent = "Mostrar texto de segmentos";
    renderTranscript();
    return;
  }

  if (!transcriptDetailsVisible) {
    transcriptDetailsVisible = true;
    toggleTranscriptButton.textContent = "Ocultar segmentos";
    renderTranscript();
    return;
  }

  statusPanelEl.hidden = true;
  transcriptDetailsVisible = false;
  toggleTranscriptButton.textContent = "Ver segmentos";
});

updateVoices();
if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = updateVoices;
}

setupRecognition();
initializeSupportNotes();

updateCaptureButtonState();
renderTranscript();

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