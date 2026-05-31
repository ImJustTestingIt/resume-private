const STORAGE_KEY = "memoryResumeEntries";

const form = document.querySelector("#memoryForm");
const titleInput = document.querySelector("#titleInput");
const memoryInput = document.querySelector("#memoryInput");
const whenInput = document.querySelector("#whenInput");
const feelingInput = document.querySelector("#feelingInput");
const exportBtn = document.querySelector("#exportBtn");
const clearBtn = document.querySelector("#clearBtn");
const memoriesList = document.querySelector("#memoriesList");
const emptyState = document.querySelector("#emptyState");
const memoryTemplate = document.querySelector("#memoryTemplate");

async function getMemories() {
  const result = await chrome.storage.local.get({ [STORAGE_KEY]: [] });
  return result[STORAGE_KEY];
}

async function setMemories(memories) {
  await chrome.storage.local.set({ [STORAGE_KEY]: memories });
}

function formatTimestamp(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function addMetaValue(list, label, value) {
  if (!value) return;

  const term = document.createElement("dt");
  const detail = document.createElement("dd");

  term.textContent = label;
  detail.textContent = value;
  list.append(term, detail);
}

function createMemoryElement(memory) {
  const fragment = memoryTemplate.content.cloneNode(true);
  const item = fragment.querySelector(".memory-card");
  const title = fragment.querySelector("h3");
  const text = fragment.querySelector(".memory-text");
  const meta = fragment.querySelector(".memory-meta");
  const time = fragment.querySelector("time");
  const deleteButton = fragment.querySelector(".delete-button");

  item.dataset.id = memory.id;
  title.textContent = memory.title || "Untitled memory";
  text.textContent = memory.body || "No memory added.";
  time.dateTime = memory.createdAt;
  time.textContent = formatTimestamp(memory.createdAt);

  addMetaValue(meta, "When", memory.when);
  addMetaValue(meta, "Feeling", memory.feeling);

  if (!meta.children.length) {
    meta.remove();
  }

  deleteButton.addEventListener("click", async () => {
    const memories = await getMemories();
    await setMemories(memories.filter((savedMemory) => savedMemory.id !== memory.id));
    await renderMemories();
  });

  return fragment;
}

async function renderMemories() {
  const memories = await getMemories();
  memoriesList.replaceChildren(...memories.map(createMemoryElement));
  emptyState.hidden = memories.length > 0;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = memoryInput.value.trim();
  const when = whenInput.value.trim();
  const feeling = feelingInput.value.trim();

  if (!title && !body && !when && !feeling) return;

  const memories = await getMemories();
  const nextMemory = {
    id: crypto.randomUUID(),
    title,
    body,
    when,
    feeling,
    createdAt: new Date().toISOString()
  };

  await setMemories([nextMemory, ...memories]);
  form.reset();
  await renderMemories();
});

clearBtn.addEventListener("click", async () => {
  const confirmed = confirm("Delete all saved memories from this browser?");
  if (!confirmed) return;

  await setMemories([]);
  await renderMemories();
});

exportBtn.addEventListener("click", async () => {
  const memories = await getMemories();
  const blob = new Blob([JSON.stringify(memories, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `memory-resume-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
});

renderMemories();
