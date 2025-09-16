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
const btnEdit   = document.getElementById('btnEdit');
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
  r.onload = async e => {
    renderPreview(e.target.result, file.name);
    setStatus('Photo loaded.', 'success');
    
    // Auto-generate recipe from image
    const loadingMsg = addBotMessage('🔄 Analyzing image and generating recipe...');
    
    try {
      const base64 = dataURLtoRawBase64(e.target.result);
      const recipe = await api.generateByImageBase64(base64);
      loadingMsg.remove();
      addBotMessage('Recipe generated from your image! Check the Recipe tab to view it.');
      renderRecipe(toUIRecipe(recipe));
      switchTab('recipe');
      setStatus('Recipe generated successfully!', 'success');
    } catch (error) {
      loadingMsg.remove();
      addBotMessage('Sorry, I couldn\'t generate a recipe from this image. Please try again.');
      setStatus('Failed to generate recipe from image.', 'error');
    }
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
  return wrap;
}
async function sendMessage(){
  const text = chatInput.value.trim();
  if (!text){ setStatus('Please type a dish name or a question first.', 'error'); chatInput.focus(); return; }
  
  addUserMessage(text); 
  chatInput.value=''; 
  sendBtn.disabled = true;
  
  // Add loading message
  const loadingMsg = addBotMessage('🔄 Generating recipe...');
  
  try {
    const recipe = await api.generateByText(text);
    // Remove loading message
    loadingMsg.remove();
    addBotMessage('Recipe generated! Check the Recipe tab to view it.');
    renderRecipe(toUIRecipe(recipe));
    switchTab('recipe');
    setStatus('Recipe generated successfully!', 'success');
  } catch (error) {
    loadingMsg.remove();
    addBotMessage('Sorry, I couldn\'t generate a recipe. Please try again.');
    setStatus('Failed to generate recipe.', 'error');
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
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
    meta: (b.time!=null) ? `${b.time} min` : "",
    // Store original backend data for easy saving
    _backendData: {
      name: b.name,
      time: b.time,
      ingredients: b.ingredients,
      instructions: b.instructions,
      nutrition: b.nutrition
    }
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
  
  // Show save button only if recipe doesn't have _id (not saved yet)
  if (btnSave) {
    btnSave.style.display = data._id ? 'none' : 'inline-block';
  }
  // Show edit button only if recipe has _id (already saved)
  if (btnEdit) {
    btnEdit.style.display = data._id ? 'inline-block' : 'none';
  }
  
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

btnSave?.addEventListener('click', async ()=> {
  if (!currentRecipe){ setStatus('No recipe to save.', 'error'); return; }
  try {
    // Use stored backend data if available, otherwise convert UI format
    const backendRecipe = currentRecipe._backendData || {
      name: currentRecipe.title,
      time: parseInt(currentRecipe.meta) || 30,
      ingredients: currentRecipe.ingredients.map(ing => ({
        name: ing.name,
        amount: ing.qty.split(' ')[0] || '1',
        unit: ing.qty.split(' ').slice(1).join(' ') || ''
      })),
      instructions: currentRecipe.steps.map((step, index) => ({
        step: index + 1,
        description: step
      })),
      nutrition: {
        calories: currentRecipe.estimatedCalories || 0,
        carbs: 0,
        protein: 0,
        fat: 0
      }
    };
    console.log(backendRecipe);
    await api.createRecipe(backendRecipe);
    btnSave.style.display = 'none'; // Hide save button after saving
    setStatus('Recipe saved successfully!', 'success');
  } catch (error) {
    setStatus('Failed to save recipe.', 'error');
  }
});

let isEditing = false;

btnEdit?.addEventListener('click', async () => {
  if (!currentRecipe || !currentRecipe._id) { setStatus('No saved recipe to edit.', 'error'); return; }
  
  if (!isEditing) {
    // Enter edit mode
    isEditing = true;
    
    // Make title editable
    const titleEl = rTitle.querySelector('h2') || rTitle;
    titleEl.contentEditable = true;
    titleEl.style.border = '1px solid #ccc';
    titleEl.style.padding = '4px';
    titleEl.focus();
    
    // Make ingredients editable
    const ingredientItems = rIng.querySelectorAll('li');
    ingredientItems.forEach(li => {
      li.contentEditable = true;
      li.style.border = '1px solid #ccc';
      li.style.padding = '2px';
    });
    
    btnEdit.textContent = 'Save Changes';
  } else {
    // Save changes
    try {
      const titleEl = rTitle.querySelector('h2') || rTitle;
      const ingredientItems = rIng.querySelectorAll('li');
      
      const newName = titleEl.textContent.trim();
      const ingredients = Array.from(ingredientItems).map(li => {
        const text = li.textContent.trim();
        const parts = text.split(' ');
        const amount = parts[0] || '1';
        const name = parts.slice(1).join(' ') || parts[0];
        return { name, amount };
      });
      
      await api.updateRecipe(currentRecipe._id, { name: newName, ingredients });
      currentRecipe.name = newName;
      currentRecipe.ingredients = ingredients;
      
      // Reset UI
      titleEl.contentEditable = false;
      titleEl.style.border = 'none';
      titleEl.style.padding = '0';
      ingredientItems.forEach(li => {
        li.contentEditable = false;
        li.style.border = 'none';
        li.style.padding = '0';
      });
      
      btnEdit.textContent = 'Edit';
      isEditing = false;
      setStatus('Recipe updated successfully!', 'success');
    } catch (error) {
      console.error('Update error:', error);
      setStatus(`Failed to update recipe: ${error.message}`, 'error');
    }
  }
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
      const caloriesText = item.nutrition?.calories ? `${item.nutrition.calories} kcal` : '';
      return `
        <article class="card" data-id="${item._id}">
          <div class="card-body">
            <div style="margin-bottom:16px;">
              <strong style="display:block;font-size:16px;margin-bottom:4px;">${escapeHTML(item.name || 'Untitled')}</strong>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                ${timeText ? `<span class="pill" style="font-size:12px;">${timeText}</span>` : ``}
                ${caloriesText ? `<span class="pill" style="font-size:12px;background:#f0f9ff;color:#0369a1;">${caloriesText}</span>` : ``}
              </div>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button class="btn-ghost open-recipe" style="padding:6px 12px;font-size:14px;">📖 Open</button>
              <button class="btn-ghost danger delete-recipe" style="padding:6px 12px;font-size:14px;">🗑️ Delete</button>
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

