const STORAGE_KEY = "peopleNotes";

const form = document.querySelector("#noteForm");
const personInput = document.querySelector("#personInput");
const noteInput = document.querySelector("#noteInput");
const sourceInput = document.querySelector("#sourceInput");
const capturePageBtn = document.querySelector("#capturePageBtn");
const captureSelectionBtn = document.querySelector("#captureSelectionBtn");
const exportBtn = document.querySelector("#exportBtn");
const clearBtn = document.querySelector("#clearBtn");
const notesList = document.querySelector("#notesList");
const emptyState = document.querySelector("#emptyState");
const noteTemplate = document.querySelector("#noteTemplate");

async function getNotes() {
  const result = await chrome.storage.local.get({ [STORAGE_KEY]: [] });
  return result[STORAGE_KEY];
}

async function setNotes(notes) {
  await chrome.storage.local.set({ [STORAGE_KEY]: notes });
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function getSelectedText(tabId) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.getSelection().toString().trim()
  });

  return result?.result ?? "";
}

function formatTimestamp(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function createNoteElement(note) {
  const fragment = noteTemplate.content.cloneNode(true);
  const item = fragment.querySelector(".note-card");
  const title = fragment.querySelector("h3");
  const text = fragment.querySelector(".note-text");
  const link = fragment.querySelector(".note-link");
  const time = fragment.querySelector("time");
  const deleteButton = fragment.querySelector(".delete-button");

  item.dataset.id = note.id;
  title.textContent = note.person || "Untitled";
  text.textContent = note.note || "No note added.";
  time.dateTime = note.createdAt;
  time.textContent = formatTimestamp(note.createdAt);

  if (note.source) {
    link.href = note.source;
    link.textContent = note.source;
  } else {
    link.remove();
  }

  deleteButton.addEventListener("click", async () => {
    const notes = await getNotes();
    await setNotes(notes.filter((savedNote) => savedNote.id !== note.id));
    await renderNotes();
  });

  return fragment;
}

async function renderNotes() {
  const notes = await getNotes();
  notesList.replaceChildren(...notes.map(createNoteElement));
  emptyState.hidden = notes.length > 0;
}

capturePageBtn.addEventListener("click", async () => {
  const tab = await getActiveTab();
  sourceInput.value = tab?.url ?? "";

  if (!personInput.value.trim() && tab?.title) {
    personInput.value = tab.title;
  }
});

captureSelectionBtn.addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab?.id) return;

  const selectedText = await getSelectedText(tab.id);
  if (!selectedText) return;

  const separator = noteInput.value.trim() ? "\n\n" : "";
  noteInput.value = `${noteInput.value}${separator}${selectedText}`;

  if (!sourceInput.value.trim() && tab.url) {
    sourceInput.value = tab.url;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const person = personInput.value.trim();
  const note = noteInput.value.trim();
  const source = sourceInput.value.trim();

  if (!person && !note && !source) return;

  const notes = await getNotes();
  const nextNote = {
    id: crypto.randomUUID(),
    person,
    note,
    source,
    createdAt: new Date().toISOString()
  };

  await setNotes([nextNote, ...notes]);
  form.reset();
  await renderNotes();
});

clearBtn.addEventListener("click", async () => {
  const confirmed = confirm("Delete all saved notes from this browser?");
  if (!confirmed) return;

  await setNotes([]);
  await renderNotes();
});

exportBtn.addEventListener("click", async () => {
  const notes = await getNotes();
  const blob = new Blob([JSON.stringify(notes, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `people-notes-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
});

renderNotes();
