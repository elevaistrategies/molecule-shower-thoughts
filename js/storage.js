// storage.js — localStorage wrappers (saved thoughts, settings)

const KEY = "elevai_shower_thoughts_v1";

const DEFAULT_STATE = {
  theme: "dark",
  categoryKey: "any",
  vibeKey: "any",
  spiceLevel: 3,
  saved: [], // {id, text, ts}
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function addSaved(state, item) {
  const exists = state.saved.some(s => s.id === item.id);
  if (exists) return state;
  const next = { ...state, saved: [{ id: item.id, text: item.text, ts: Date.now() }, ...state.saved].slice(0, 30) };
  return next;
}

export function clearSaved(state) {
  return { ...state, saved: [] };
}
