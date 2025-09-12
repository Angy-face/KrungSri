// ---- Minimal client for your backend (no proxy? set API_BASE to http://localhost:3222) ----
export const API_BASE = "http://localhost:3222"; // if you use a reverse proxy, set: ""

const JSON_HEADERS = { "Content-Type": "application/json" };
const ok = async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json(); };

export const api = {
  // CRUD
  listRecipes: (time) => {
    let url = `${API_BASE}/recipes`;
    if (time) url += `?time=${time}`;
    return fetch(url).then(ok);
  },//+filter time :D

  createRecipe: (data) =>
    fetch(`${API_BASE}/recipes`, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(data) }).then(ok),
  deleteRecipe: (id) =>
    fetch(`${API_BASE}/recipes/${id}`, { method: "DELETE" }).then(ok),

  // LLM
  generateByText: (foodName) =>
    fetch(`${API_BASE}/recipes/chef`, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ foodName }) }).then(ok),

  // backend expects raw base64 (without data URL header); it will prepend "data:image/jpeg;base64," itself
  generateByImageBase64: (base64Image) =>
    fetch(`${API_BASE}/recipes/chef-image`, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ base64Image }) }).then(ok),


};


