// app.js — glue + app lifecycle
import { loadThoughts, makePicker } from "./generator.js";
import { loadState, saveState, addSaved, clearSaved } from "./storage.js";
import { setTheme, renderCategories, renderVibes, renderThought, renderSaved, spiceLabel } from "./ui.js";

const $ = (id) => document.getElementById(id);

const floatersEmoji = ["🚿","🫧","💡","🧠","🧬","✨","🌈","🪞","🤖","⚡","🧪","🌪️","🌙","🔥","🌀"];

function rand(min, max){ return Math.random() * (max - min) + min; }
function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function spawnFloater() {
  const host = $("floaters");
  if (!host) return;
  const el = document.createElement("span");
  el.className = "floater";
  el.textContent = pick(floatersEmoji);
  el.style.left = `${rand(6, 94)}%`;
  el.style.top = `${rand(70, 98)}%`;
  el.style.animationDuration = `${rand(4.8, 9.2)}s`;
  el.style.fontSize = `${rand(14, 22)}px`;
  host.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

function shufflePalette() {
  // rotate accents a bit for “dynamic DNA” across molecules
  const palettes = [
    ["#7c3aed","#06b6d4","#22c55e","#f97316","#e11d48"],
    ["#22c55e","#60a5fa","#a78bfa","#f59e0b","#fb7185"],
    ["#06b6d4","#34d399","#f472b6","#f97316","#818cf8"],
    ["#f97316","#22c55e","#06b6d4","#a78bfa","#fb7185"],
    ["#fb7185","#60a5fa","#22c55e","#f59e0b","#a78bfa"],
  ];
  const p = pick(palettes);
  const root = document.documentElement;
  root.style.setProperty("--a1", p[0]);
  root.style.setProperty("--a2", p[1]);
  root.style.setProperty("--a3", p[2]);
  root.style.setProperty("--a4", p[3]);
  root.style.setProperty("--a5", p[4]);
}

async function main(){
  let state = loadState();
  setTheme(state.theme);

  // UI refs
  const categoryPills = $("categoryPills");
  const vibeTabs = $("vibeTabs");
  const spice = $("spice");
  const spiceLabelEl = $("spiceLabel");

  const btnTheme = $("btnTheme");
  const btnGenerate = $("btnGenerate");
  const btnCopy = $("btnCopy");
  const btnFav = $("btnFav");
  const btnShuffle = $("btnShuffle");
  const btnClearSaved = $("btnClearSaved");

  const savedList = $("savedList");

  // Load thoughts (fallback list for now)
  const thoughts = await loadThoughts();
  const picker = makePicker(thoughts);

  // Render selectors
  const rerenderSelectors = () => {
    renderCategories(categoryPills, state.categoryKey, (key) => {
      state = { ...state, categoryKey: key };
      saveState(state);
      rerenderSelectors();
    });
    renderVibes(vibeTabs, state.vibeKey, (key) => {
      state = { ...state, vibeKey: key };
      saveState(state);
      rerenderSelectors();
    });
    spice.value = String(state.spiceLevel);
    spiceLabelEl.textContent = spiceLabel(state.spiceLevel);
  };
  rerenderSelectors();

  // Saved list
  renderSaved(savedList, state.saved);

  // Floater loop
  shufflePalette();
  const floaterTimer = setInterval(spawnFloater, 650);

  // Thought state
  let current = null;

  function setActionEnabled(enabled){
    btnCopy.disabled = !enabled;
    btnFav.disabled = !enabled;
  }

  function generate(){
    const thought = picker.pick({
      categoryKey: state.categoryKey,
      vibeKey: state.vibeKey,
      spiceLevel: state.spiceLevel,
    });
    current = thought;
    renderThought({ thought, categoryKey: state.categoryKey, vibeKey: state.vibeKey, spiceLevel: state.spiceLevel });
    setActionEnabled(true);
    pulseVisuals();
  }

  function pulseVisuals(){
    // quick palette nudge
    if (Math.random() < 0.45) shufflePalette();
    // spawn a burst of floaters
    for (let i=0;i<4;i++) setTimeout(spawnFloater, i*90);
  }

  btnGenerate.addEventListener("click", generate);

  btnCopy.addEventListener("click", async () => {
    if (!current) return;
    const line = `🚿 Shower Thought: "${current.text}"\n— ElevAI Labs`;
    try{
      await navigator.clipboard.writeText(line);
      btnCopy.innerHTML = `<span class="btn__icon" aria-hidden="true">✅</span><span>Copied</span>`;
      setTimeout(() => btnCopy.innerHTML = `<span class="btn__icon" aria-hidden="true">📋</span><span>Copy</span>`, 900);
    }catch{
      // fallback: select text
      const t = $("thoughtText");
      const r = document.createRange();
      r.selectNodeContents(t);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      btnCopy.innerHTML = `<span class="btn__icon" aria-hidden="true">🖱️</span><span>Select</span>`;
      setTimeout(() => btnCopy.innerHTML = `<span class="btn__icon" aria-hidden="true">📋</span><span>Copy</span>`, 1100);
    }
  });

  btnFav.addEventListener("click", () => {
    if (!current) return;
    state = addSaved(state, current);
    saveState(state);
    renderSaved(savedList, state.saved);
    btnFav.innerHTML = `<span class="btn__icon" aria-hidden="true">💾</span><span>Saved</span>`;
    setTimeout(() => btnFav.innerHTML = `<span class="btn__icon" aria-hidden="true">💾</span><span>Save</span>`, 900);
  });

  btnTheme.addEventListener("click", () => {
    const next = state.theme === "light" ? "dark" : "light";
    state = { ...state, theme: next };
    saveState(state);
    setTheme(next);
    pulseVisuals();
  });

  spice.addEventListener("input", () => {
    const level = Number(spice.value);
    state = { ...state, spiceLevel: level };
    spiceLabelEl.textContent = spiceLabel(level);
    saveState(state);
  });

  btnShuffle.addEventListener("click", () => {
    shufflePalette();
    for (let i=0;i<6;i++) setTimeout(spawnFloater, i*70);
  });

  btnClearSaved.addEventListener("click", () => {
    state = clearSaved(state);
    saveState(state);
    renderSaved(savedList, state.saved);
  });

  // Hotkeys: space = generate, c = copy, s = save
  window.addEventListener("keydown", (e) => {
    if (e.target && ["INPUT","TEXTAREA"].includes(e.target.tagName)) return;
    if (e.code === "Space") { e.preventDefault(); generate(); }
    if (e.key.toLowerCase() === "c") btnCopy.click();
    if (e.key.toLowerCase() === "s") btnFav.click();
  });

  // First spawn after load
  setTimeout(() => { for (let i=0;i<6;i++) setTimeout(spawnFloater, i*110); }, 350);
  setActionEnabled(false);
}

main();
