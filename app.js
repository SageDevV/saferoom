const messages = [
  "Você sobreviveu a dias difíceis antes. Hoje não exige perfeição, só presença.",
  "Pausar não é fracasso. Pausar é manutenção de sistema.",
  "O medo pode estar alto sem que ele esteja certo sobre tudo.",
  "Seu corpo merece sinais claros de segurança: água, ar, apoio e tempo.",
  "Uma decisão pequena e gentil ainda é uma decisão poderosa."
];

const moodProfiles = {
  calmo: {
    status: "Estável",
    response: "Estado detectado: espaço seguro disponível. Vamos manter esse ritmo gentil.",
    suggestion: "Prolongue esse estado com uma pausa silenciosa de dois minutos e respiração nasal lenta."
  },
  vigilante: {
    status: "Em observação",
    response: "Você parece em alerta. Não é hora de se cobrar clareza total, e sim reduzir ruído.",
    suggestion: "Afaste uma fonte de estímulo, alongue as mãos e observe três sons ao redor."
  },
  sobrecarregado: {
    status: "Pressão alta",
    response: "Há peso demais ativo ao mesmo tempo. Vamos diminuir o número de coisas competindo pela sua atenção.",
    suggestion: "Escolha apenas uma tarefa essencial para os próximos 15 minutos e silencie o restante."
  },
  exausto: {
    status: "Energia crítica",
    response: "Cansaço intenso identificado. Seu sistema pode precisar mais de restauração do que de produtividade.",
    suggestion: "Sente-se com apoio nas costas, beba água e permita cinco minutos sem meta alguma."
  }
};

const breathSequence = [
  { label: "Inspirar", seconds: 4, expanded: true },
  { label: "Segurar", seconds: 4, expanded: true },
  { label: "Expirar", seconds: 6, expanded: false },
  { label: "Descansar", seconds: 2, expanded: false }
];

const messageText = document.getElementById("message-text");
const roomIntegrity = document.getElementById("room-integrity");
const emotionalStatus = document.getElementById("emotional-status");
const newMessageButton = document.getElementById("new-message");
const emergencyProtocol = document.getElementById("emergency-protocol");
const moodButtons = Array.from(document.querySelectorAll(".mood-chip"));
const checkinResponse = document.getElementById("checkin-response");
const suggestionText = document.getElementById("suggestion-text");
const ritualList = document.getElementById("ritual-list");
const ritualProgress = document.getElementById("ritual-progress");
const breathOrb = document.getElementById("breath-orb");
const breathPhase = document.getElementById("breath-phase");
const breathTimer = document.getElementById("breath-timer");
const toggleBreath = document.getElementById("toggle-breath");
const journalInput = document.getElementById("journal-input");
const journalStatus = document.getElementById("journal-status");
const saveNote = document.getElementById("save-note");
const clearNote = document.getElementById("clear-note");
const scrollButton = document.querySelector("[data-scroll-target]");
const safeRoomAudio = document.getElementById("safe-room-audio");
const toggleMusicButton = document.getElementById("toggle-music");
const musicVolumeInput = document.getElementById("music-volume");
const storageKey = "sage-room-state";
const suggestionBox = document.querySelector(".suggestion-box");
const revealPanels = Array.from(document.querySelectorAll(".reveal-panel"));
const consoleText = document.getElementById("console-text");
const consoleResult = document.getElementById("console-result");
const commandButtons = Array.from(document.querySelectorAll(".command-button"));
const missionTitle = document.getElementById("mission-title");
const missionFill = document.getElementById("mission-fill");
const missionProgress = document.getElementById("mission-progress");
const newMissionButton = document.getElementById("new-mission");
const roomMeterFill = document.getElementById("room-meter-fill");
const roomMeterLabel = document.getElementById("room-meter-label");
const biohazardLabel = document.getElementById("biohazard-label");
const roomLog = document.getElementById("room-log");
const statusLight = document.querySelector(".status-light");
const saveStatus = document.getElementById("save-status");
const saveTimestamp = document.getElementById("save-timestamp");
const saveCheckpointButton = document.getElementById("save-checkpoint");
const loadCheckpointButton = document.getElementById("load-checkpoint");
const ribbonStock = document.getElementById("ribbon-stock");
const itemButtons = Array.from(document.querySelectorAll(".item-button"));
const itemResult = document.getElementById("item-result");
const radioChannelState = document.getElementById("radio-channel-state");
const radioMessage = document.getElementById("radio-message");
const radioChoices = Array.from(document.querySelectorAll(".radio-choice"));
const radioFeedback = document.getElementById("radio-feedback");
const radioNext = document.getElementById("radio-next");
const sectorNodes = Array.from(document.querySelectorAll(".sector-node"));
const sectorStatus = document.getElementById("sector-status");
const collapsibleCards = Array.from(document.querySelectorAll(".collapsible-card"));
const heroWindow = document.querySelector(".hero-window");

let breathInterval = null;
let breathStep = 0;
let countdown = breathSequence[0].seconds;
let roomStability = 47;
let missionCount = 0;
let bonusActions = 0;
let radioIndex = 0;
let radioTypingTimer = null;
let radioLastChoice = "";
let radioProfile = { ground: 0, pace: 0, support: 0 };
let journalDraftTimer = null;
let inventory = { herb: 2, spray: 1, flash: 1, ribbon: 2 };
let cleanedSectors = [];
let checkpoint = null;
let musicEnabled = false;
let musicVolumeLevel = 0.45;
let performanceLite = false;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sectorLabels = {
  "corredor-leste": "Corredor Leste",
  arquivo: "Sala de Arquivo",
  enfermaria: "Enfermaria",
  deposito: "Depósito"
};

const commands = {
  ground: {
    title: "Aterrar o corpo",
    console: "Protocolo sugerido: pressione os pés no chão e nomeie três sensações físicas reais.",
    result: "Aterramento executado. O sistema reduziu dispersão corporal e aumentou a sensação de presença.",
    stability: 8
  },
  focus: {
    title: "Recuperar foco",
    console: "Protocolo sugerido: selecione uma única tarefa curta e esconda todo o resto por 10 minutos.",
    result: "Foco restaurado. A sala isolou estímulos concorrentes e liberou energia para o essencial.",
    stability: 7
  },
  release: {
    title: "Despressurizar",
    console: "Protocolo sugerido: solte o maxilar, expire longo e permita uma pausa sem cobrança.",
    result: "Pressão interna reduzida. O ambiente respondeu com ganho de estabilidade respiratória.",
    stability: 9
  },
  contact: {
    title: "Pedir contato",
    console: "Protocolo sugerido: envie uma mensagem simples pedindo companhia, escuta ou presença.",
    result: "Canal de apoio ativado. A sala reconhece que regulação também pode ser compartilhada.",
    stability: 6
  }
};

const missions = [
  "Reduzir o ruído interno em 3 passos.",
  "Trocar urgência por presença em 3 ações.",
  "Reconstruir sensação de controle com 3 escolhas pequenas.",
  "Sair do modo alerta com 3 protocolos curtos."
];

const radioScenes = [
  {
    line: "Confirme sua posição: encoste as costas e me diga se seus pés estão em contato com o chão.",
    choices: {
      ground: {
        label: "Sim, corpo ancorado.",
        feedback: "Excelente. Contato físico confirmado. Vamos manter essa base por mais 20 segundos.",
        stability: 8
      },
      pace: {
        label: "Ainda estou agitado(a).",
        feedback: "Recebido. Reduza ritmo da fala e expire mais longo do que inspira.",
        stability: 5
      },
      support: {
        label: "Estou sozinho(a), isso pesa.",
        feedback: "Entendido. A próxima ação é abrir um canal humano de suporte, mesmo breve.",
        stability: 4
      }
    }
  },
  {
    line: "Varredura interna: escolha uma parte do corpo que esteja tensa e solte 10% dela agora.",
    choices: {
      ground: {
        label: "Consegui liberar ombros.",
        feedback: "Ótimo ajuste. Menos carga muscular, mais margem para pensar com clareza.",
        stability: 7
      },
      pace: {
        label: "Minha mente continua correndo.",
        feedback: "Vamos desacelerar por etapas: uma tarefa, um minuto, uma respiração por vez.",
        stability: 5
      },
      support: {
        label: "Preciso que alguém me escute.",
        feedback: "Pedido válido. Escreva uma frase curta e envie agora para alguém confiável.",
        stability: 6
      }
    }
  },
  {
    line: "Checagem final do turno: qual compromisso possível você consegue assumir pelos próximos 15 minutos?",
    choices: {
      ground: {
        label: "Vou ficar presente com o corpo.",
        feedback: "Compromisso aceito. Presença corporal é defesa ativa contra sobrecarga.",
        stability: 7
      },
      pace: {
        label: "Vou reduzir estímulos ao redor.",
        feedback: "Boa decisão. Menos entrada sensorial, mais autonomia emocional.",
        stability: 6
      },
      support: {
        label: "Vou pedir ajuda agora.",
        feedback: "Excelente priorização. Suporte humano eleva segurança psicológica rapidamente.",
        stability: 8
      }
    }
  }
];

function loadState() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function saveState(nextState) {
  const current = loadState();
  window.localStorage.setItem(storageKey, JSON.stringify({ ...current, ...nextState }));
}

function setupPerformanceProfile() {
  if (prefersReducedMotion) {
    performanceLite = true;
    document.body.classList.add("perf-lite");
    return;
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const lowPowerMode = Boolean(connection?.saveData);
  const slowNetwork = typeof connection?.effectiveType === "string" && /(^|-)2g/.test(connection.effectiveType);
  const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  const lowThreads = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  const compactViewport = window.matchMedia("(max-width: 900px)").matches;

  performanceLite = lowPowerMode || slowNetwork || lowMemory || lowThreads || (compactViewport && (lowMemory || lowThreads));
  document.body.classList.toggle("perf-lite", performanceLite);
}

function addLogEntry(text) {
  const entry = document.createElement("p");
  entry.textContent = text;
  roomLog.prepend(entry);

  while (roomLog.children.length > 6) {
    roomLog.removeChild(roomLog.lastElementChild);
  }
}

function formatTimestamp(isoTimestamp) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(isoTimestamp));
  } catch {
    return "--";
  }
}

function setSaveStatus(text) {
  saveStatus.textContent = text;
}

function renderInventory() {
  itemButtons.forEach((button) => {
    const itemKey = button.dataset.item;
    const stock = Math.max(0, Number(inventory[itemKey]) || 0);
    const stockNode = button.querySelector(`[data-stock="${itemKey}"]`);
    if (stockNode) stockNode.textContent = `x${stock}`;
    button.disabled = stock <= 0;
  });
  ribbonStock.textContent = String(Math.max(0, Number(inventory.ribbon) || 0));
  saveState({ inventory });
}

function renderSectors() {
  sectorNodes.forEach((node) => {
    node.classList.toggle("secured", cleanedSectors.includes(node.dataset.sector));
  });
  const total = sectorNodes.length;
  const done = cleanedSectors.length;
  sectorStatus.textContent = `${done} de ${total} setores estabilizados.`;
  saveState({ cleanedSectors });
}

function toggleCardExpansion(card) {
  const isExpanded = card.classList.toggle("expanded");
  card.setAttribute("aria-expanded", String(isExpanded));
}

function setupCollapsibleCards() {
  collapsibleCards.forEach((card, index) => {
    const shouldStartExpanded = false;
    card.classList.toggle("expanded", shouldStartExpanded);
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-expanded", String(shouldStartExpanded));

    card.addEventListener("click", (event) => {
      const interactive = event.target.closest("button, input, textarea, label, a, select");
      if (interactive) return;
      toggleCardExpansion(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.target !== card) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleCardExpansion(card);
    });
  });
}

function syncMusicUi() {
  toggleMusicButton.textContent = musicEnabled ? "Pausar trilha" : "Tocar trilha";
  toggleMusicButton.classList.toggle("is-active", musicEnabled);
  toggleMusicButton.setAttribute("aria-pressed", String(musicEnabled));
  musicVolumeInput.value = String(Math.round(musicVolumeLevel * 100));
}

function applyMusicState() {
  safeRoomAudio.volume = musicVolumeLevel;
  if (!musicEnabled) {
    safeRoomAudio.pause();
    syncMusicUi();
    return;
  }

  const playAttempt = safeRoomAudio.play();
  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {
      musicEnabled = false;
      syncMusicUi();
    });
  }
  syncMusicUi();
}

function typeRadioMessage(text) {
  if (radioTypingTimer) window.clearInterval(radioTypingTimer);
  if (prefersReducedMotion) {
    radioChannelState.textContent = "Conectado";
    radioMessage.textContent = text;
    return;
  }
  radioMessage.textContent = "";
  radioChannelState.textContent = "Transmitindo";
  let index = 0;
  radioTypingTimer = window.setInterval(() => {
    index += 1;
    radioMessage.textContent = text.slice(0, index);
    if (index >= text.length) {
      window.clearInterval(radioTypingTimer);
      radioTypingTimer = null;
      radioChannelState.textContent = "Conectado";
    }
  }, 18);
}

function applyRadioScene(sceneIndex) {
  const safeIndex = ((sceneIndex % radioScenes.length) + radioScenes.length) % radioScenes.length;
  const scene = radioScenes[safeIndex];
  radioIndex = safeIndex;
  typeRadioMessage(scene.line);
  radioChoices.forEach((button) => {
    const choice = scene.choices[button.dataset.choice];
    button.textContent = choice.label;
    button.classList.remove("active");
  });
  radioFeedback.textContent = "Selecione uma resposta para continuar o contato.";
  saveState({ radioIndex });
}

function buildRadioInsight() {
  const entries = Object.entries(radioProfile);
  const total = entries.reduce((acc, [, count]) => acc + count, 0);
  if (!total || total % 3 !== 0) return "";
  const dominant = entries.reduce((acc, current) => (current[1] > acc[1] ? current : acc), entries[0])[0];
  if (dominant === "ground") return "Operadora Helena: seu padrão indica boa resposta corporal. Continue priorizando aterramento.";
  if (dominant === "pace") return "Operadora Helena: aceleração recorrente detectada. Foque em reduzir estímulos externos.";
  return "Operadora Helena: busca por suporte frequente detectada. Compartilhar carga segue sendo uma escolha estratégica.";
}

function handleRadioChoice(choiceKey, options = {}) {
  const { restoreOnly = false } = options;
  const scene = radioScenes[radioIndex];
  if (!scene) return;
  const choice = scene.choices[choiceKey];
  if (!choice) return;

  radioChoices.forEach((button) => button.classList.toggle("active", button.dataset.choice === choiceKey));
  radioFeedback.textContent = choice.feedback;
  if (!restoreOnly) {
    radioProfile[choiceKey] += 1;
    bonusActions += 1;
    updateMissionProgress();
    applyRoomStability(roomStability + choice.stability, `Rádio: ${choice.feedback}`);
    const insight = buildRadioInsight();
    if (insight) {
      radioFeedback.textContent = `${choice.feedback} ${insight}`;
      addLogEntry(insight);
    }
    addLogEntry("Operadora Helena registrou resposta terapêutica.");
  }
  radioLastChoice = choiceKey;
  if (!restoreOnly) saveState({ radioLastChoice: choiceKey, radioProfile });
}

function pickRandomMessage() {
  const next = messages[Math.floor(Math.random() * messages.length)];
  messageText.textContent = next;
  messageText.animate(
    [
      { opacity: 0.4, transform: "translateY(6px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    { duration: 420, easing: "ease-out" }
  );
}

function applyMood(moodKey, options = {}) {
  const { restoreOnly = false } = options;
  const profile = moodProfiles[moodKey];
  if (!profile) return;
  emotionalStatus.textContent = profile.status;
  checkinResponse.textContent = profile.response;
  suggestionText.textContent = profile.suggestion;
  suggestionBox.classList.remove("flash");
  void suggestionBox.offsetWidth;
  suggestionBox.classList.add("flash");
  if (!restoreOnly) {
    addLogEntry(`Leitura emocional atualizada: ${profile.status.toLowerCase()}.`);
    saveState({ mood: moodKey });
  }
}

function setMoodSelection(moodKey, options = {}) {
  const button = moodButtons.find((item) => item.dataset.mood === moodKey);
  if (!button) return;
  moodButtons.forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  applyMood(moodKey, options);
}

function updateRitualProgress() {
  const total = ritualList.querySelectorAll('input[type="checkbox"]').length;
  const done = ritualList.querySelectorAll('input[type="checkbox"]:checked').length;
  ritualProgress.textContent = `${done} de ${total} etapas concluídas.`;
  const checks = Array.from(ritualList.querySelectorAll('input[type="checkbox"]')).map((input) => input.checked);
  updateMissionProgress();
  saveState({ ritualChecks: checks });
}

function updateMissionProgress() {
  const target = Math.max(missionCount, 1);
  const ritualDone = ritualList.querySelectorAll('input[type="checkbox"]:checked').length;
  const totalCompleted = ritualDone + bonusActions;
  const percent = Math.min((totalCompleted / target) * 100, 100);
  missionFill.style.width = `${percent}%`;
  missionProgress.textContent = `${Math.min(totalCompleted, target)} de ${target} ações concluídas.`;
  saveState({ missionCount, missionTitle: missionTitle.textContent, bonusActions });
}

function applyRoomStability(nextValue, reason) {
  roomStability = Math.max(0, Math.min(nextValue, 100));
  roomMeterFill.style.width = `${roomStability}%`;
  roomMeterLabel.textContent = `${roomStability}%`;
  roomIntegrity.textContent = `${roomStability}%`;
  statusLight.dataset.state = roomStability >= 70 ? "stable" : roomStability >= 45 ? "warning" : "critical";
  const bioLevel = roomStability >= 75 ? "Baixo" : roomStability >= 50 ? "Moderado" : roomStability >= 30 ? "Alto" : "Crítico";
  biohazardLabel.textContent = `Nível de bio-risco: ${bioLevel}`;
  if (reason) addLogEntry(reason);
  saveState({ roomStability });
}

function generateMission() {
  const mission = missions[Math.floor(Math.random() * missions.length)];
  missionTitle.textContent = mission;
  missionCount = 3;
  bonusActions = 0;
  updateMissionProgress();
  addLogEntry(`Nova missão atribuída: ${mission}`);
}

function executeCommand(key) {
  const command = commands[key];
  if (!command) return;

  commandButtons.forEach((button) => button.classList.toggle("active", button.dataset.command === key));
  consoleText.textContent = command.console;
  consoleResult.textContent = command.result;
  bonusActions += 1;
  updateMissionProgress();
  applyRoomStability(roomStability + command.stability, `Protocolo executado: ${command.title}.`);
  saveState({ lastCommand: key });
}

function renderBreathStep() {
  const step = breathSequence[breathStep];
  breathPhase.textContent = step.label;
  breathTimer.textContent = `${countdown} segundos`;
  breathOrb.classList.toggle("expanded", step.expanded);
}

function stopBreathing() {
  window.clearInterval(breathInterval);
  breathInterval = null;
  breathStep = 0;
  countdown = breathSequence[0].seconds;
  breathPhase.textContent = "Preparar";
  breathTimer.textContent = "4 segundos";
  breathOrb.classList.remove("expanded");
  toggleBreath.textContent = "Iniciar ciclo";
}

function startBreathing() {
  toggleBreath.textContent = "Encerrar ciclo";
  breathStep = 0;
  countdown = breathSequence[0].seconds;
  renderBreathStep();

  breathInterval = window.setInterval(() => {
    countdown -= 1;

    if (countdown <= 0) {
      breathStep = (breathStep + 1) % breathSequence.length;
      countdown = breathSequence[breathStep].seconds;
    }

    renderBreathStep();
  }, 1000);
}

function saveJournal() {
  const content = journalInput.value.trim();
  if (!content) {
    journalStatus.textContent = "Escreva algo antes de salvar.";
    return;
  }

  saveState({ journal: content });
  journalStatus.textContent = "Nota guardada nesta sessão. Você não precisa carregar isso sozinho agora.";
}

function scheduleJournalAutosave() {
  if (journalDraftTimer) window.clearTimeout(journalDraftTimer);
  journalDraftTimer = window.setTimeout(() => {
    const content = journalInput.value.trim();
    if (!content) return;
    saveState({ journal: content });
    journalStatus.textContent = "Rascunho salvo automaticamente.";
  }, 450);
}

function useItem(itemKey) {
  const stock = Number(inventory[itemKey]) || 0;
  if (stock <= 0) {
    itemResult.textContent = "Item indisponível no baú.";
    return;
  }

  const effects = {
    herb: {
      text: "Erva verde aplicada: respiração e tensão corporal estabilizadas.",
      stability: 8,
      mood: "calmo"
    },
    spray: {
      text: "Spray de primeiros socorros utilizado: recuperação rápida do sistema.",
      stability: 14,
      mood: "calmo"
    },
    flash: {
      text: "Granada de luz acionada: ruído mental reduzido e foco restaurado.",
      stability: 6,
      mood: "vigilante"
    }
  };

  const effect = effects[itemKey];
  if (!effect) return;

  inventory[itemKey] = stock - 1;
  renderInventory();
  itemResult.textContent = effect.text;
  bonusActions += 1;
  updateMissionProgress();
  setMoodSelection(effect.mood);
  applyRoomStability(roomStability + effect.stability, `Item Box: ${effect.text}`);
  addLogEntry(`Baú: ${effect.text}`);
}

function buildCheckpointPayload() {
  const activeMood = moodButtons.find((button) => button.classList.contains("active"))?.dataset.mood || "calmo";
  return {
    timestamp: new Date().toISOString(),
    mood: activeMood,
    roomStability,
    missionTitle: missionTitle.textContent,
    missionCount,
    bonusActions,
    radioIndex,
    radioLastChoice,
    radioProfile,
    ritualChecks: Array.from(ritualList.querySelectorAll('input[type="checkbox"]')).map((input) => input.checked),
    journal: journalInput.value,
    cleanedSectors
  };
}

function saveCheckpoint() {
  if ((Number(inventory.ribbon) || 0) <= 0) {
    setSaveStatus("Sem fita de tinta. Explore ou estabilize setores para encontrar mais recursos.");
    return;
  }

  inventory.ribbon -= 1;
  checkpoint = buildCheckpointPayload();
  renderInventory();
  setSaveStatus("Checkpoint salvo com sucesso.");
  saveTimestamp.textContent = `Último registro: ${formatTimestamp(checkpoint.timestamp)}`;
  saveState({ checkpoint });
  addLogEntry("Terminal: checkpoint gravado na máquina de escrever.");
}

function restoreCheckpoint() {
  if (!checkpoint) {
    setSaveStatus("Nenhum checkpoint disponível para restauração.");
    return;
  }

  missionTitle.textContent = checkpoint.missionTitle || missionTitle.textContent;
  missionCount = Number(checkpoint.missionCount) || 3;
  bonusActions = Number(checkpoint.bonusActions) || 0;
  cleanedSectors = Array.isArray(checkpoint.cleanedSectors) ? [...checkpoint.cleanedSectors] : [];
  radioIndex = Number.isFinite(checkpoint.radioIndex) ? checkpoint.radioIndex : 0;
  radioLastChoice = checkpoint.radioLastChoice || "";
  if (checkpoint.radioProfile && typeof checkpoint.radioProfile === "object") {
    radioProfile = {
      ground: Number(checkpoint.radioProfile.ground) || 0,
      pace: Number(checkpoint.radioProfile.pace) || 0,
      support: Number(checkpoint.radioProfile.support) || 0
    };
  }

  if (Array.isArray(checkpoint.ritualChecks)) {
    ritualList.querySelectorAll('input[type="checkbox"]').forEach((input, index) => {
      input.checked = Boolean(checkpoint.ritualChecks[index]);
    });
  }

  if (typeof checkpoint.journal === "string") {
    journalInput.value = checkpoint.journal;
    journalStatus.textContent = "Nota restaurada a partir do checkpoint.";
  }

  setMoodSelection(checkpoint.mood || "calmo", { restoreOnly: true });
  saveState({ mood: checkpoint.mood || "calmo" });
  updateRitualProgress();
  updateMissionProgress();
  renderSectors();
  applyRoomStability(Number(checkpoint.roomStability) || 47, "Terminal: checkpoint restaurado.");
  applyRadioScene(radioIndex);
  if (radioLastChoice) handleRadioChoice(radioLastChoice, { restoreOnly: true });

  setSaveStatus("Checkpoint restaurado.");
  saveTimestamp.textContent = `Último registro: ${formatTimestamp(checkpoint.timestamp)}`;
}

function secureSector(sectorKey) {
  if (cleanedSectors.includes(sectorKey)) {
    sectorStatus.textContent = `${sectorLabels[sectorKey] || "Setor"} já está estabilizado.`;
    return;
  }

  cleanedSectors.push(sectorKey);
  renderSectors();
  bonusActions += 1;
  updateMissionProgress();
  applyRoomStability(roomStability + 4, `Setor estabilizado: ${sectorLabels[sectorKey] || sectorKey}.`);
  addLogEntry(`Mapa: ${sectorLabels[sectorKey] || sectorKey} liberado.`);

  if (cleanedSectors.length % 2 === 0) {
    inventory.ribbon += 1;
    renderInventory();
    setSaveStatus("Nova fita de tinta encontrada durante a varredura.");
    addLogEntry("Suprimento encontrado: +1 fita de tinta.");
  }
}

function runEmergencyProtocol() {
  if (breathInterval) stopBreathing();
  setMoodSelection("sobrecarregado");
  commandButtons.forEach((button) => button.classList.toggle("active", button.dataset.command === "ground"));
  consoleText.textContent = "Modo emergência ativo: protocolo de 90 segundos focado em corpo e respiração.";
  consoleResult.textContent = "Ação imediata: pés no chão, mãos apoiadas e expiração longa por 6 ciclos.";
  applyRadioScene(0);
  radioFeedback.textContent = "Canal terapêutico priorizado para estabilização imediata.";
  bonusActions += 1;
  updateMissionProgress();
  applyRoomStability(roomStability + 12, "Protocolo de emergência acionado.");
}

function registerKeyboardShortcuts() {
  window.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
    if (isTyping) return;

    const key = event.key.toLowerCase();
    if (key === "n") {
      event.preventDefault();
      pickRandomMessage();
    }
    if (key === "b") {
      event.preventDefault();
      toggleBreath.click();
    }
    if (key === "t") {
      event.preventDefault();
      radioNext.click();
    }
  });
}

function hydrateFromStorage() {
  const saved = loadState();

  if (saved.mood && moodProfiles[saved.mood]) {
    setMoodSelection(saved.mood, { restoreOnly: true });
  }

  if (Array.isArray(saved.ritualChecks)) {
    ritualList.querySelectorAll('input[type="checkbox"]').forEach((input, index) => {
      input.checked = Boolean(saved.ritualChecks[index]);
    });
  }

  if (saved.journal) {
    journalInput.value = saved.journal;
    journalStatus.textContent = "Última nota restaurada desta sala local.";
  }

  if (saved.missionTitle) {
    missionTitle.textContent = saved.missionTitle;
  }

  if (saved.missionCount) {
    missionCount = saved.missionCount;
  }

  if (typeof saved.bonusActions === "number") {
    bonusActions = saved.bonusActions;
  }

  if (typeof saved.roomStability === "number") {
    roomStability = saved.roomStability;
  }

  if (saved.lastCommand && commands[saved.lastCommand]) {
    commandButtons.forEach((button) => button.classList.toggle("active", button.dataset.command === saved.lastCommand));
    consoleText.textContent = commands[saved.lastCommand].console;
    consoleResult.textContent = commands[saved.lastCommand].result;
  }

  if (typeof saved.radioIndex === "number") {
    radioIndex = saved.radioIndex;
  }

  if (saved.radioLastChoice) {
    radioLastChoice = saved.radioLastChoice;
  }

  if (saved.radioProfile && typeof saved.radioProfile === "object") {
    radioProfile = {
      ground: Number(saved.radioProfile.ground) || 0,
      pace: Number(saved.radioProfile.pace) || 0,
      support: Number(saved.radioProfile.support) || 0
    };
  }

  if (saved.inventory && typeof saved.inventory === "object") {
    inventory = {
      herb: Number(saved.inventory.herb) || 0,
      spray: Number(saved.inventory.spray) || 0,
      flash: Number(saved.inventory.flash) || 0,
      ribbon: Number(saved.inventory.ribbon) || 0
    };
  }

  if (Array.isArray(saved.cleanedSectors)) {
    cleanedSectors = saved.cleanedSectors.filter((sector) => sectorLabels[sector]);
  }

  if (saved.checkpoint && typeof saved.checkpoint === "object") {
    checkpoint = saved.checkpoint;
  }

  if (typeof saved.musicEnabled === "boolean") {
    musicEnabled = saved.musicEnabled;
  }

  if (typeof saved.musicVolume === "number") {
    musicVolumeLevel = Math.min(1, Math.max(0, saved.musicVolume));
  }
}

function initRevealPanels() {
  if (!("IntersectionObserver" in window)) {
    revealPanels.forEach((panel) => panel.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealPanels.forEach((panel, index) => {
    panel.style.animationDelay = `${index * 110}ms`;
    observer.observe(panel);
  });
}

function setupWindowParallax() {
  if (!heroWindow || prefersReducedMotion || performanceLite) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;

  const render = () => {
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;

    heroWindow.style.setProperty("--look-x", `${currentX.toFixed(2)}px`);
    heroWindow.style.setProperty("--look-y", `${currentY.toFixed(2)}px`);

    const nearSettled = Math.abs(targetX - currentX) < 0.05 && Math.abs(targetY - currentY) < 0.05;
    if (nearSettled) {
      rafId = null;
      return;
    }

    rafId = window.requestAnimationFrame(render);
  };

  const queueRender = () => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(render);
  };

  heroWindow.addEventListener("pointermove", (event) => {
    const rect = heroWindow.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    targetX = Math.max(-14, Math.min(14, relativeX * 28));
    targetY = Math.max(-9, Math.min(9, relativeY * 18));
    queueRender();
  });

  heroWindow.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    queueRender();
  });
}

function setupStormPulse() {
  if (!heroWindow || prefersReducedMotion || performanceLite) return;
  let flashTimeout = null;

  const triggerPulse = () => {
    heroWindow.classList.add("is-thunder");
    document.body.classList.add("storm-flash");
    const pulseDuration = 120 + Math.random() * 140;
    window.setTimeout(() => {
      heroWindow.classList.remove("is-thunder");
    }, pulseDuration);
    if (flashTimeout) window.clearTimeout(flashTimeout);
    flashTimeout = window.setTimeout(() => {
      document.body.classList.remove("storm-flash");
      flashTimeout = null;
    }, pulseDuration + 90);
  };

  const queuePulse = () => {
    const nextDelay = 4200 + Math.random() * 7600;
    window.setTimeout(() => {
      triggerPulse();

      if (Math.random() > 0.72) {
        window.setTimeout(triggerPulse, 110 + Math.random() * 210);
      }

      queuePulse();
    }, nextDelay);
  };

  queuePulse();
}

newMessageButton.addEventListener("click", pickRandomMessage);
emergencyProtocol.addEventListener("click", runEmergencyProtocol);

moodButtons.forEach((button) => {
  button.addEventListener("click", () => setMoodSelection(button.dataset.mood));
});

ritualList.addEventListener("change", updateRitualProgress);

commandButtons.forEach((button) => {
  button.addEventListener("click", () => executeCommand(button.dataset.command));
});

radioChoices.forEach((button) => {
  button.addEventListener("click", () => handleRadioChoice(button.dataset.choice));
});

radioNext.addEventListener("click", () => {
  applyRadioScene(radioIndex + 1);
  addLogEntry("Canal terapêutico avançou para nova transmissão.");
});

saveCheckpointButton.addEventListener("click", saveCheckpoint);
loadCheckpointButton.addEventListener("click", restoreCheckpoint);

itemButtons.forEach((button) => {
  button.addEventListener("click", () => useItem(button.dataset.item));
});

sectorNodes.forEach((node) => {
  node.addEventListener("click", () => secureSector(node.dataset.sector));
});

toggleBreath.addEventListener("click", () => {
  if (breathInterval) {
    stopBreathing();
    return;
  }

  startBreathing();
  bonusActions += 1;
  updateMissionProgress();
  applyRoomStability(roomStability + 5, "Ciclo respiratório iniciado. Oscilação interna reduzida.");
});

saveNote.addEventListener("click", saveJournal);
journalInput.addEventListener("input", scheduleJournalAutosave);

toggleMusicButton.addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  applyMusicState();
  saveState({ musicEnabled, musicVolume: musicVolumeLevel });
});

musicVolumeInput.addEventListener("input", () => {
  musicVolumeLevel = Math.min(1, Math.max(0, Number(musicVolumeInput.value) / 100));
  safeRoomAudio.volume = musicVolumeLevel;
  saveState({ musicEnabled, musicVolume: musicVolumeLevel });
});

clearNote.addEventListener("click", () => {
  journalInput.value = "";
  saveState({ journal: "" });
  journalStatus.textContent = "Registro limpo. A sala continua disponível quando você quiser voltar.";
});

newMissionButton.addEventListener("click", generateMission);

scrollButton.addEventListener("click", () => {
  const target = document.querySelector(scrollButton.dataset.scrollTarget);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
});

hydrateFromStorage();
setupPerformanceProfile();
initRevealPanels();
setupWindowParallax();
setupStormPulse();
setupCollapsibleCards();
registerKeyboardShortcuts();
updateRitualProgress();
if (!missionCount) generateMission();
else updateMissionProgress();
renderInventory();
renderSectors();
if (checkpoint?.timestamp) {
  setSaveStatus("Checkpoint disponível.");
  saveTimestamp.textContent = `Último registro: ${formatTimestamp(checkpoint.timestamp)}`;
}
applyMusicState();
applyRoomStability(roomStability);
applyRadioScene(radioIndex);
if (radioLastChoice) handleRadioChoice(radioLastChoice, { restoreOnly: true });
pickRandomMessage();
