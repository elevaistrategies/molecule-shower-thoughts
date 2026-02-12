// ui.js — DOM rendering + interactions helpers
import { CATEGORIES, VIBES } from "./generator.js";

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
}

export function spiceLabel(level) {
  const map = {
    1: "Mild 🫧",
    2: "Chill 🌿",
    3: "Medium 🌶️",
    4: "Spicy 🔥",
    5: "Chaos 🌋",
  };
  return map[level] || "Medium 🌶️";
}

export function renderCategories(container, selectedKey, onSelect) {
  container.innerHTML = "";
  for (const c of CATEGORIES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill";
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", c.key === selectedKey ? "true" : "false");
    btn.innerHTML = `<span class="pill__dot" aria-hidden="true"></span><span>${c.emoji} ${c.label}</span>`;
    btn.addEventListener("click", () => onSelect(c.key));
    container.appendChild(btn);
  }
}

export function renderVibes(container, selectedKey, onSelect) {
  container.innerHTML = "";
  for (const v of VIBES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "seg";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", v.key === selectedKey ? "true" : "false");
    btn.textContent = `${v.emoji} ${v.label}`;
    btn.addEventListener("click", () => onSelect(v.key));
    container.appendChild(btn);
  }
}

export function renderThought({ thought, categoryKey, vibeKey, spiceLevel }) {
  const meta = document.getElementById("thoughtMeta");
  const text = document.getElementById("thoughtText");
  const tags = document.getElementById("thoughtTags");
  const id = document.getElementById("thoughtId");

  const cats = (thought.category || []).join(", ");
  const vibes = (thought.vibe || []).join(", ");

  meta.textContent = `${labelFor(categoryKey, "category")} • ${labelFor(vibeKey, "vibe")} • ${spiceLevelLabel(spiceLevel)}`;
  text.textContent = thought.text;
  tags.textContent = `${cats || "—"} • ${vibes || "—"}`;
  id.textContent = thought.id || "st_unknown";
}

function labelFor(key, kind) {
  const list = kind === "category" ? CATEGORIES : VIBES;
  const item = list.find(x => x.key === key);
  return item ? item.label : "Any";
}

function spiceLevelLabel(level) {
  const map = { 1:"Mild", 2:"Chill", 3:"Medium", 4:"Spicy", 5:"Chaos" };
  return map[level] || "Medium";
}

export function renderSaved(container, savedList) {
  container.innerHTML = "";
  if (!savedList.length) {
    const div = document.createElement("div");
    div.className = "mini muted";
    div.textContent = "None yet. Save your first brain-spark. 💡";
    container.appendChild(div);
    return;
  }

  for (const item of savedList) {
    const card = document.createElement("div");
    card.className = "savedItem";
    const when = new Date(item.ts).toLocaleString();
    card.innerHTML = `
      <div class="savedItem__text">${escapeHtml(item.text)}</div>
      <div class="savedItem__meta">
        <span class="mono">${escapeHtml(item.id)}</span>
        <span>${escapeHtml(when)}</span>
      </div>
    `;
    container.appendChild(card);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
