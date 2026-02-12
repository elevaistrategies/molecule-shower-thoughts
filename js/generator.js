// generator.js — thought selection + filtering
// Later: this will load /data/thoughts.json. For now we use a curated fallback list.

const FALLBACK_THOUGHTS = [
  { id: "st_0001", text: "A towel is basically a portable drying privilege.", category: ["life"], vibe: ["calm","silly"], length: "short", spice: 2 },
  { id: "st_0002", text: "If you say “shampoo” in your head, your brain auto-adds the bubbles.", category: ["funny"], vibe: ["silly"], length: "short", spice: 1 },
  { id: "st_0003", text: "We’re all just water with anxiety wearing outfits.", category: ["existential"], vibe: ["deep"], length: "short", spice: 3 },
  { id: "st_0004", text: "Soap is a social contract: you agree to remove yesterday from your body.", category: ["meta","life"], vibe: ["deep","calm"], length: "medium", spice: 2 },
  { id: "st_0005", text: "The shower is the only place you can be both a philosopher and a rotisserie chicken.", category: ["funny","meta"], vibe: ["silly","chaos"], length: "medium", spice: 3 },
  { id: "st_0006", text: "Every ‘new habit’ is just your future self trying to rescue your current self from vibes-based decisions.", category: ["life"], vibe: ["deep"], length: "medium", spice: 3 },
  { id: "st_0007", text: "If time is money, why does it feel like my schedule is sponsored by chaos?", category: ["existential"], vibe: ["chaos","deep"], length: "medium", spice: 4 },
  { id: "st_0008", text: "Your reflection is a real-time simulation with questionable lighting choices.", category: ["tech","meta"], vibe: ["silly","deep"], length: "short", spice: 2 },
  { id: "st_0009", text: "Some problems only exist because you refused to drink water like a responsible mammal.", category: ["life","funny"], vibe: ["silly"], length: "medium", spice: 2 },
  { id: "st_0010", text: "We invented ‘adulting’ so we could feel guilty for not having a user manual.", category: ["existential","life"], vibe: ["deep"], length: "medium", spice: 3 },
  { id: "st_0011", text: "If your brain had patch notes, the update would just say: ‘fixed nothing, added worries.’", category: ["tech","funny"], vibe: ["chaos"], length: "medium", spice: 4 },
  { id: "st_0012", text: "A routine is just a loop you keep running until you either level up or rage quit.", category: ["life","tech"], vibe: ["deep","chaos"], length: "medium", spice: 3 },
  { id: "st_0013", text: "The most honest alarm clock is the one that simply screams “consequences.”", category: ["funny","life"], vibe: ["chaos"], length: "short", spice: 4 },
  { id: "st_0014", text: "A ‘quick shower’ is a myth told by optimistic people who don’t dissociate.", category: ["funny"], vibe: ["silly","chaos"], length: "short", spice: 3 },
  { id: "st_0015", text: "If you ever feel lost, remember: even GPS is wrong sometimes and it still speaks confidently.", category: ["life"], vibe: ["calm","deep"], length: "medium", spice: 2 },
  { id: "st_0016", text: "The brain is the only device that can lag while doing absolutely nothing.", category: ["tech","meta"], vibe: ["silly"], length: "short", spice: 2 },
  { id: "st_0017", text: "Every ‘later’ is just a calendar invitation you never sent.", category: ["life","existential"], vibe: ["deep"], length: "short", spice: 3 },
  { id: "st_0018", text: "Confidence is just your nervous system bluffing with a straight face.", category: ["life"], vibe: ["deep"], length: "short", spice: 3 },
  { id: "st_0019", text: "If your thoughts were subtitles, you’d turn them off to enjoy the movie.", category: ["meta"], vibe: ["deep","chaos"], length: "short", spice: 4 },
  { id: "st_0020", text: "Sometimes the ‘fresh start’ is just you, wet, rethinking everything.", category: ["existential","life"], vibe: ["calm","deep"], length: "medium", spice: 2 },
];

export const CATEGORIES = [
  { key: "any", label: "Any", emoji: "✨" },
  { key: "funny", label: "Funny", emoji: "😂" },
  { key: "life", label: "Life", emoji: "🧠" },
  { key: "existential", label: "Existential", emoji: "🕳️" },
  { key: "tech", label: "Tech", emoji: "🤖" },
  { key: "meta", label: "Meta", emoji: "🪞" },
];

export const VIBES = [
  { key: "any", label: "Any", emoji: "🎛️" },
  { key: "calm", label: "Calm", emoji: "🫧" },
  { key: "deep", label: "Deep", emoji: "🧬" },
  { key: "silly", label: "Silly", emoji: "🫠" },
  { key: "chaos", label: "Chaos", emoji: "🌪️" },
];

function matchesFilters(t, { categoryKey, vibeKey, spiceLevel }) {
  const categoryOk = categoryKey === "any" ? true : (t.category || []).includes(categoryKey);
  const vibeOk = vibeKey === "any" ? true : (t.vibe || []).includes(vibeKey);
  const spiceOk = typeof t.spice === "number" ? t.spice <= spiceLevel : true;
  return categoryOk && vibeOk && spiceOk;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Try to load future JSON; fallback gracefully.
export async function loadThoughts() {
  try {
    const res = await fetch("./data/thoughts.json", { cache: "no-store" });
    if (!res.ok) throw new Error("no json yet");
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("invalid json");
    return data;
  } catch {
    return FALLBACK_THOUGHTS;
  }
}

export function makePicker(thoughts) {
  // Create a rolling bag (prevents rapid repeats without being overly strict)
  let bag = shuffle(thoughts);
  let idx = 0;

  function refill(nextBase) {
    bag = shuffle(nextBase);
    idx = 0;
  }

  return {
    pick(filters) {
      const eligible = thoughts.filter(t => matchesFilters(t, filters));
      const pool = eligible.length ? eligible : thoughts;

      // if bag doesn't match pool (filters changed), rebuild bag
      const bagIds = new Set(bag.map(b => b.id));
      const poolIds = new Set(pool.map(p => p.id));
      const samePool = bagIds.size === poolIds.size && [...bagIds].every(id => poolIds.has(id));
      if (!samePool) refill(pool);

      if (idx >= bag.length) refill(pool);
      const item = bag[idx++];
      return item;
    }
  };
}
