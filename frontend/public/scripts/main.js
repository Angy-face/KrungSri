import { api } from "./api.js";

/* =========================
   Tabs
   ========================= */
const tabs   = document.querySelectorAll('.nav-tab');
const panels = document.querySelectorAll('[data-panel]');
function switchTab(name){
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  panels.forEach(p => p.hidden = (p.dataset.panel !== name));
}
tabs.forEach(tab => tab.addEventListener('click', async () => {
  switchTab(tab.dataset.tab);
  if (tab.dataset.tab === 'saved') {
    const value = document.getElementById('timeFilter')?.value;
    await renderSavedList(value ? Number(value) : undefined);
  }
}));
switchTab('chat');

/* =========================
   Elements
   ========================= */
const fileInput     = document.getElementById('fileInput');
const uploadArea    = document.getElementById('uploadArea');
const imagePreview  = document.getElementById('imagePreview');
const chatContainer = document.getElementById('chatContainer');
const chatInput     = document.getElementById('chatInput');
const sendBtn       = document.getElementById('sendBtn');

const createFromChatBtn  = document.getElementById('createFromChat');
const createFromImageBtn = document.getElementById('createFromImage');

const rTitle = document.getElementById('rTitle');
const rMeta  = document.getElementById('rMeta');
const rThumb = document.getElementById('rThumb');
const rIng   = document.getElementById('rIngredients');
const rSteps = document.getElementById('rSteps');
const rTips  = document.getElementById('rTips');
const rNutri = document.getElementById('rNutrition');
const rView  = document.getElementById('recipeView');
const rEmpty = document.getElementById('recipeEmpty');
const servEl = document.getElementById('servings');
const btnDelete = document.getElementById('btnDelete');
const btnSave   = document.getElementById('btnSave'); // optional
const btnClose = document.getElementById('btnClose');
const savedList = document.getElementById('savedList');
const statusBar = document.getElementById('statusBar');

/* =========================
   Helpers
   ========================= */
const escapeHTML = (s='') => s
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  .replaceAll('"','&quot;').replaceAll("'",'&#39;');
const autoscroll = () => { chatContainer.scrollTop = chatContainer.scrollHeight; };
const isImage = f => f && f.type && f.type.startsWith('image/');
function setStatus(msg, type='info'){
  if (!statusBar) return;
  const color = type==='success' ? '#16a34a' : type==='error' ? '#b42318' : '#6b7280';
  statusBar.textContent = msg || ''; statusBar.style.color = color;
}
const objectIdTime = (id='') => parseInt((id||'').slice(0,8), 16) || 0;

/* =========================
   Upload
   ========================= */
uploadArea.addEventListener('click', () => fileInput.click());
['dragover','dragleave','drop'].forEach(type=>{
  uploadArea.addEventListener(type, e=>{
    e.preventDefault();
    uploadArea.classList.toggle('dragover', type==='dragover');
  });
});
uploadArea.addEventListener('drop', e=>{
  const f = e.dataTransfer?.files?.[0]; if (!f) return;
  if (!isImage(f)) { setStatus('Please upload an image file.', 'error'); return; }
  handleFile(f);
});
fileInput.addEventListener('change', e=>{
  const f = e.target.files?.[0]; if (!f) return;
  if (!isImage(f)) { setStatus('Please upload an image file.', 'error'); fileInput.value=''; return; }
  handleFile(f);
});
function handleFile(file){
  const r = new FileReader();
  r.onload = e => {
    renderPreview(e.target.result, file.name);
    addBotMessage('Great! I can see your food photo. What recipe would you like me to create?');
    setStatus('Photo loaded.', 'success');
  };
  r.readAsDataURL(file);
}
function renderPreview(src, name){
  imagePreview.innerHTML = `
    <img src="${src}" alt="Uploaded food photo" class="preview-image">
    <p style="text-align:center;color:#6b7280;margin:.5rem 0 .75rem;font-size:.95rem;">${escapeHTML(name||'')}</p>
    <div style="text-align:center;">
      <button class="remove-image" id="removeImg">Remove Photo</button>
    </div>
  `;
  document.getElementById('removeImg').addEventListener('click', ()=>{
    imagePreview.innerHTML = ''; fileInput.value = ''; setStatus('Photo removed.');
  }, { once: true });
}
const dataURLtoRawBase64 = (dataURL='') => (dataURL.split(',')[1] || '').trim();

/* =========================
   Chat
   ========================= */
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e=>{ if (e.key==='Enter'){ e.preventDefault(); sendMessage(); }});
function addUserMessage(msg){
  const wrap = document.createElement('div');
  wrap.className = 'chat-message user-message';
  wrap.innerHTML = `<div class="message-content">${escapeHTML(msg)}</div>`;
  chatContainer.appendChild(wrap); autoscroll();
}
function addBotMessage(html){
  const wrap = document.createElement('div');
  wrap.className = 'chat-message bot-message';
  wrap.innerHTML = `<div class="avatar">🤖</div><div class="message-content">${html}</div>`;
  chatContainer.appendChild(wrap); autoscroll();
}
function sendMessage(){
  const text = chatInput.value.trim();
  if (!text){ setStatus('Please type a dish name or a question first.', 'error'); chatInput.focus(); return; }
  addUserMessage(text); chatInput.value=''; chatInput.focus();
  sendBtn.disabled = true;
  setTimeout(()=>{ addBotMessage('Got it! I will prepare a detailed recipe.'); sendBtn.disabled = false; }, 500);
}

/* =========================
   Backend -> UI shape adapter
   ========================= */
function toUIRecipe(b){
  const ingredients = (b.ingredients||[]).map(it => ({
    name: it.name || "",
    qty: [it.amount, it.unit].filter(Boolean).join(" ").trim()
  }));
  const steps = (b.instructions||[])
    .sort((a,c)=> (a.step||0) - (c.step||0))
    .map(it => it.description || "");
  const nutritionText = b.nutrition
    ? `Carbs ${b.nutrition.carbs}g • Protein ${b.nutrition.protein}g • Fat ${b.nutrition.fat}g`
    : "";

  return {
    _id: b._id,
    title: b.name || "Untitled",
    imageUrl: b.imageUrl || "",
    ingredients,
    steps,
    tips: [],
    servings: 2,
    estimatedCalories: b.nutrition?.calories,
    nutrition: nutritionText,
    meta: (b.time!=null) ? `${b.time} min` : ""
  };
}

/* =========================
   Render recipe
   ========================= */
let currentRecipe = null;

function renderRecipe(data){
  currentRecipe = data;
  rEmpty.style.display = 'none';
  rView.style.display  = '';

  const servings = data.servings ?? 2;
  const extras = [data.meta, data.estimatedCalories ? `~${data.estimatedCalories} kcal` : ""].filter(Boolean).join(" • ");

  rTitle.textContent = data.title || 'Untitled';
  rMeta.textContent  = [ `${servings} servings`, extras ].filter(Boolean).join(' • ');

  if (data.imageUrl){ rThumb.src = data.imageUrl; rThumb.style.display = 'block'; }
  else { rThumb.style.display = 'none'; }

  rIng.innerHTML = (data.ingredients||[]).map(it=>{
    const qty = it.qty ? `<strong>${escapeHTML(it.qty)}</strong> ` : '';
    return `<li class="ing-item"><input type="checkbox"> <span>${qty}${escapeHTML(it.name||'')}</span></li>`;
  }).join('');
  rSteps.innerHTML = (data.steps||[]).map(s=>`<li>${escapeHTML(s)}</li>`).join('');
  rTips.innerHTML  = (data.tips||[]).map(t=>`<li class="ing-item">${escapeHTML(t)}</li>`).join('');
  rNutri.textContent = data.nutrition || '';

  servEl.textContent = servings;
  setStatus('Recipe ready.', 'success');
}

/* =========================
   Buttons on Recipe page
   ========================= */
document.getElementById('servDec').addEventListener('click', ()=> {
  servEl.textContent = Math.max(1, (parseInt(servEl.textContent||'1',10) - 1));
});
document.getElementById('servInc').addEventListener('click', ()=> {
  servEl.textContent = (parseInt(servEl.textContent||'1',10) + 1);
});

btnDelete?.addEventListener('click', async ()=> {
  if (!currentRecipe?._id){ setStatus('No recipe id to delete.', 'error'); return; }
  await api.deleteRecipe(currentRecipe._id);
  currentRecipe = null;
  switchTab('saved');
  const value = document.getElementById('timeFilter')?.value;
  await renderSavedList(value ? Number(value) : undefined);
  setStatus('Recipe deleted.', 'success');
});

document.querySelectorAll('.btnBackToChat').forEach(btn => {
  btn.addEventListener('click', () => switchTab('chat'));
});

btnClose?.addEventListener('click', async () => {
  currentRecipe = null;
  rView.style.display = 'none';
  rEmpty.style.display = '';
  switchTab('saved');
  const value = document.getElementById('timeFilter')?.value;
  await renderSavedList(value ? Number(value) : undefined);
  setStatus('Closed recipe.', 'info');
});

/* =========================
   Saved list + filter
   ========================= */
async function renderSavedList(time) {
  if (!savedList) return;
  savedList.innerHTML = `<p style="color:#6b7280">Loading…</p>`;
  try {
    const items = await api.listRecipes(time);
    if (!items.length) {
      savedList.innerHTML = `<p style="color:#6b7280">No recipes found.</p>`;
      return;
    }
    savedList.innerHTML = items.map(item => {
      const timeText = (item.time!=null) ? `${item.time} min` : '';
      return `
        <article class="card" data-id="${item._id}">
          <div class="card-body">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <strong>${escapeHTML(item.name || 'Untitled')}</strong>
              ${timeText ? `<span class="pill">${timeText}</span>` : ``}
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn-ghost open-recipe">Open</button>
              <button class="btn-ghost danger delete-recipe">Delete</button>
            </div>
          </div>
        </article>`;
    }).join('');
  } catch {
    savedList.innerHTML = `<p style="color:#b42318">Error loading</p>`;
  }
}

savedList.addEventListener('click', async (e)=> {
  const card = e.target.closest('.card'); if (!card) return;
  const id = card.dataset.id;

  if (e.target.classList.contains('open-recipe')){
    const items = await api.listRecipes();
    const rec = items.find(x => x._id === id);
    if (rec){ renderRecipe(toUIRecipe(rec)); switchTab('recipe'); }
  }

  if (e.target.classList.contains('delete-recipe')){
    await api.deleteRecipe(id);
    card.remove();
    setStatus('Recipe deleted.', 'success');
    if (!savedList.querySelector('.card')){
      savedList.innerHTML = `<p style="color:#6b7280">No recipes yet.</p>`;
    }
  }
});

/* =========================
   Dropdown filter listener
   ========================= */
document.getElementById('timeFilter')?.addEventListener('change', async (e) => {
  const value = e.target.value;
  await renderSavedList(value ? Number(value) : undefined);
});

// Custom dropdown logic :D
// Custom dropdown logic
const timeFilterBtn = document.getElementById("timeFilterBtn");
const timeFilterMenu = document.getElementById("timeFilterMenu");

timeFilterBtn?.addEventListener("click", () => {
  timeFilterMenu.classList.toggle("hidden");
});

timeFilterMenu?.addEventListener("click", async (e) => {
  if (e.target.tagName === "LI") {
    const value = e.target.dataset.value;
    timeFilterBtn.textContent = e.target.textContent + " ▾";
    timeFilterMenu.classList.add("hidden");
    await renderSavedList(value ? Number(value) : undefined);
  }
});

document.addEventListener("click", (e) => {
  if (!timeFilterBtn.contains(e.target) && !timeFilterMenu.contains(e.target)) {
    timeFilterMenu.classList.add("hidden");
  }
});

