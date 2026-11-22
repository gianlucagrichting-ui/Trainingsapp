const KEY = "training-app-sets";

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
};
const save = (sets) => {
  try { localStorage.setItem(KEY, JSON.stringify(sets)); } catch {}
};

let sets = load();

const $ = (id) => document.getElementById(id);
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("de-CH", { weekday: "short", day: "numeric", month: "short" });

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Montag = 0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

function render() {
  // Übungsvorschläge
  const names = [...new Set(sets.map((s) => s.exercise))];
  $("exercises").innerHTML = names.map((n) => `<option value="${n}">`).join("");

  // Woche
  const from = startOfWeek();
  const week = sets.filter((s) => new Date(s.date) >= from);
  const days = new Set(week.map((s) => s.date.slice(0, 10))).size;
  const volume = week.reduce((sum, s) => sum + s.weight * s.reps, 0);
  $("week").textContent = week.length
    ? `${days} Trainingstage · ${week.length} Sätze · ${Math.round(volume)} kg Volumen`
    : "Noch kein Training diese Woche.";

  // Verlauf
  const list = $("history");
  list.innerHTML = "";
  [...sets].reverse().slice(0, 30).forEach((s) => {
    const li = document.createElement("li");
    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = s.exercise;
    const sub = document.createElement("small");
    sub.textContent = `${s.weight} kg × ${s.reps} · ${fmtDate(s.date)}`;
    info.append(title, sub);
    const del = document.createElement("button");
    del.textContent = "✕";
    del.setAttribute("aria-label", "Löschen");
    del.onclick = () => {
      sets = sets.filter((x) => x.id !== s.id);
      save(sets);
      render();
    };
    li.append(info, del);
    list.append(li);
  });
}

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  sets.push({
    id: Date.now(),
    date: new Date().toISOString(),
    exercise: $("exercise").value.trim(),
    weight: parseFloat($("weight").value),
    reps: parseInt($("reps").value, 10),
  });
  save(sets);
  $("reps").value = "";
  $("reps").focus();
  render();
});

render();
