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
  if (tab.dataset.tab === 'saved') await renderSavedList();
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
const btnSave   = document.getElementById('btnSave');

const savedList = document.getElementById('savedList');
const statusBar = document.getElementById('statusBar');

let currentRecipe = null;

/* =========================
   Helpers
   ========================= */
const API_BASE = "http://localhost:3000"; // set to your backend base URL

const escapeHTML = (s='') => s
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  .replaceAll('"','&quot;').replaceAll("'",'&#39;');

const autoscroll = () => { chatContainer.scrollTop = chatContainer.scrollHeight; };

const isImage = f => f && f.type && f.type.startsWith('image/');

function setStatus(msg, type='info'){ // info | success | error
  const color = type === 'success' ? '#16a34a' : type === 'error' ? '#b42318' : '#6b7280';
  statusBar.textContent = msg || '';
  statusBar.style.color = color;
}

/* =========================
   Upload
   ========================= */
uploadArea.addEventListener('click', () => fileInput.click());
['dragover','dragleave','drop'].forEach(type=>{
  uploadArea.addEventListener(type, e=>{
    e.preventDefault();
    if (type==='dragover') uploadArea.classList.add('dragover');
    else uploadArea.classList.remove('dragover');
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
    imagePreview.innerHTML = ''; fileInput.value = '';
    setStatus('Photo removed.');
  }, { once: true });
}

/* =========================
   Chat
   ========================= */
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e=>{
  if (e.key === 'Enter'){ e.preventDefault(); sendMessage(); }
});
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
   API helpers (with silent mock fallback)
   ========================= */
async function apiListRecipes(params={}){
  try{
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_BASE}/api/recipes${qs ? '?'+qs : ''}`);
    if (!r.ok) throw new Error('no-backend');
    return await r.json();
  }catch{
    setStatus('Demo mode: showing sample recipes (backend not connected).', 'info');
    return [
      { _id:'1', title:'Pad Thai', imageUrl:'https://images.unsplash.com/photo-1604908176997-431cce38bb50?q=80&w=1200&auto=format&fit=crop', tags:['thai'] },
      { _id:'2', title:'Tom Yum', imageUrl:'https://images.unsplash.com/photo-1598899134739-24a20d54f1d5?q=80&w=1200&auto=format&fit=crop', tags:['soup'] },
      { _id:'3', title:'Green Curry', imageUrl:'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop', tags:['curry'] },
    ];
  }
}
async function apiGetRecipe(id){
  try{
    const r = await fetch(`${API_BASE}/api/recipes/${id}`);
    if (!r.ok) throw new Error('no-backend');
    return await r.json();
  }catch{
    setStatus('Demo mode: showing a sample recipe.', 'info');
    return {
      _id:id, title:'Pad Thai', servings:2, estimatedCalories:780, tags:['thai','stir-fry'],
      imageUrl:'https://images.unsplash.com/photo-1604908176997-431cce38bb50?q=80&w=1200&auto=format&fit=crop',
      ingredients:[{name:'Rice noodles',qty:'200 g'},{name:'Eggs',qty:'2'},{name:'Tamarind sauce',qty:'3 tbsp'}],
      steps:['Soak noodles until pliable','Stir-fry aromatics and protein','Add sauce & noodles; toss well','Finish with peanuts and lime'],
      tips:['Do not over-soak noodles','Balance sweet/sour/salty to taste'],
      nutrition:'Carbs 86g • Protein 28g • Fat 22g'
    };
  }
}
async function apiDeleteRecipe(id){
  try{
    const r = await fetch(`${API_BASE}/api/recipes/${id}`, { method:'DELETE' });
    if (!r.ok) throw new Error('no-backend');
    return await r.json();
  }catch{
    setStatus('Demo mode: simulated delete.', 'info');
    return { ok:true };
  }
}
async function apiGenerateByName(name, options={}){
  try{
    const r = await fetch(`${API_BASE}/api/generate-text`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name, options })
    });
    if (!r.ok) throw new Error('no-backend');
    return await r.json();
  }catch{
    setStatus('Demo mode: generated sample recipe.', 'info');
    return {
      _id: 'demo-'+Date.now(),
      title: name,
      imageUrl: '',
      ingredients: [{name:'Ingredient A',qty:'100 g'},{name:'Ingredient B',qty:'2 tbsp'}],
      steps: [`Prepare basics for ${name}`, 'Cook and season to taste'],
      servings: options?.servings ?? 2,
      estimatedCalories: 500,
      tags: ['generated','demo']
    };
  }
}
async function apiCreateRecipe(recipe){
  try{
    const r = await fetch(`${API_BASE}/api/recipes`,{
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(recipe)
    });
    if (!r.ok) throw new Error('no-backend');
    return await r.json();
  }catch{
    setStatus('Demo mode: simulated save.', 'info');
    return { ...recipe, _id: 'local-'+Date.now() };
  }
}
async function apiUpdateRecipe(id, data){
  try{
    const r = await fetch(`${API_BASE}/api/recipes/${id}`,{
      method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('no-backend');
    return await r.json();
  }catch{
    setStatus('Demo mode: simulated update.', 'info');
    return { ...data, _id: id };
  }
}

/* =========================
   Recipe render / actions
   ========================= */
function renderRecipe(data){
  currentRecipe = data;
  rEmpty.style.display = 'none';
  rView.style.display  = '';

  const servings = data.servings ?? 2;
  const tags = Array.isArray(data.tags) ? data.tags.join(' · ') : '';
  const kcal = data.estimatedCalories ? `~${data.estimatedCalories} kcal` : '';

  rTitle.textContent = data.title || 'Untitled';
  rMeta.textContent  = [ `${servings} servings`, tags, kcal ].filter(Boolean).join(' • ');

  if (data.imageUrl){ rThumb.src = data.imageUrl; rThumb.style.display = 'block'; }
  else { rThumb.style.display = 'none'; }

  const ingredients = Array.isArray(data.ingredients) ? data.ingredients : [];
  rIng.innerHTML = ingredients.map(it=>{
    const qty = it.qty ? `<strong>${escapeHTML(it.qty)}</strong> ` : '';
    return `<li class="ing-item"><input type="checkbox"> <span>${qty}${escapeHTML(it.name||'')}</span></li>`;
  }).join('');

  const steps = Array.isArray(data.steps) ? data.steps : [];
  rSteps.innerHTML = steps.map(s=>`<li>${escapeHTML(s)}</li>`).join('');

  const tips = Array.isArray(data.tips) ? data.tips : [];
  rTips.innerHTML = tips.map(t=>`<li class="ing-item">${escapeHTML(t)}</li>`).join('');

  rNutri.textContent = data.nutrition || data.nutritionPerServing || '';
  servEl.textContent = servings;
  setStatus('Recipe ready.', 'success');
}

function showRecipeLoading(isLoading){
  if (!rEmpty) return;
  rEmpty.style.opacity = isLoading ? .6 : 1;
  rEmpty.style.pointerEvents = isLoading ? 'none' : '';
}

// servings +/- (UI only; add scaling logic if you parse numeric quantities)
document.getElementById('servDec').addEventListener('click', ()=> {
  servEl.textContent = Math.max(1, (parseInt(servEl.textContent||'1',10) - 1));
});
document.getElementById('servInc').addEventListener('click', ()=> {
  servEl.textContent = (parseInt(servEl.textContent||'1',10) + 1);
});

// Create from Chat / Image
createFromChatBtn?.addEventListener('click', async ()=>{
  const name = (chatInput?.value || '').trim();
  if (!name){ setStatus('Please type a dish name in chat first.', 'error'); return; }
  try{
    showRecipeLoading(true);
    const recipe = await apiGenerateByName(name, { calorieCap: 1000 });
    renderRecipe(recipe); switchTab('recipe');
  }catch(e){ setStatus(e.message || 'Generate failed', 'error'); }
  finally{ showRecipeLoading(false); }
});
createFromImageBtn?.addEventListener('click', ()=>{
  setStatus('Hook this to your /api/generate (image) endpoint when ready.', 'info');
});

// Save / Update
btnSave?.addEventListener('click', async ()=>{
  try{
    if (!currentRecipe) return;
    if (currentRecipe._id){
      const updated = await apiUpdateRecipe(currentRecipe._id, currentRecipe);
      renderRecipe(updated); setStatus('Recipe updated.', 'success');
    }else{
      const created = await apiCreateRecipe(currentRecipe);
      renderRecipe(created); setStatus('Recipe saved.', 'success');
    }
  }catch(e){ setStatus(e.message || 'Save failed', 'error'); }
});

// Delete on Recipe page
btnDelete?.addEventListener('click', async ()=>{
  if (!currentRecipe?._id){ setStatus('No recipe id to delete.', 'error'); return; }
  await apiDeleteRecipe(currentRecipe._id);
  currentRecipe = null;
  switchTab('saved');
  await renderSavedList();
  setStatus('Recipe deleted.', 'success');
});

// Back to Chat buttons (all panels)
document.querySelectorAll('.btnBackToChat').forEach(btn => {
  btn.addEventListener('click', () => switchTab('chat'));
});





/* =========================
   Saved list (with event delegation)
   ========================= */
async function renderSavedList(){
  if (!savedList) return;
  savedList.innerHTML = `<p style="color:#6b7280">Loading…</p>`;
  try{
    const items = await apiListRecipes();
    if (!items.length){
      savedList.innerHTML = `<p style="color:#6b7280">No saved recipes yet.</p>`;
      return;
    }
    savedList.innerHTML = items.map(item=>{
      const tag = (item.tags && item.tags[0]) ? item.tags[0] : 'recipe';
      const thumb = item.imageUrl ? `<img alt="${escapeHTML(item.title)}" src="${item.imageUrl}">` : '';
      return `
        <article class="card" data-id="${item._id}">
          ${thumb}
          <div class="card-body">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <strong>${escapeHTML(item.title)}</strong>
              <span class="pill">${escapeHTML(tag)}</span>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn-ghost open-recipe">Open</button>
              <button class="btn-ghost danger delete-recipe">Delete</button>
            </div>
          </div>
        </article>`;
    }).join('');

  }catch(e){
    savedList.innerHTML = `<p style="color:#b42318">Error: ${escapeHTML(e.message || 'Load failed')}</p>`;
  }
}

// Event delegation for Saved grid
savedList.addEventListener('click', async (e)=>{
  const card = e.target.closest('.card');
  if (!card) return;
  const id = card.dataset.id;

  if (e.target.classList.contains('open-recipe')){
    const rec = await apiGetRecipe(id);
    renderRecipe(rec); switchTab('recipe');
  }

  if (e.target.classList.contains('delete-recipe')){
    await apiDeleteRecipe(id);
    // Optimistic remove
    card.remove();
    setStatus('Recipe deleted.', 'success');
    // If grid becomes empty, show message
    if (!savedList.querySelector('.card')){
      savedList.innerHTML = `<p style="color:#6b7280">No saved recipes yet.</p>`;
    }
  }
});
