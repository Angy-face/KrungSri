// Tab switching functionality
/*const tabs = document.querySelectorAll('.nav-tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        console.log(`Switched to ${tab.dataset.tab} tab`);
    });
});

// Chat and upload functionality
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');
const chatContainer = document.getElementById('chatContainer');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

// Upload functionality
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            displayImagePreview(e.target.result, file.name);
            addBotMessage("Great! I can see your food image. What would you like to know about it or what recipe would you like me to create?");
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please select an image file.');
    }
}

function displayImagePreview(src, fileName) {
    imagePreview.innerHTML = `
        <img src="${src}" alt="Uploaded food image" class="preview-image">
        <p style="text-align: center; color: #718096; margin: 0.5rem 0; font-size: 0.9rem;">${fileName}</p>
        <div style="text-align: center;">
            <button class="remove-image" onclick="removeImage()">Remove Image</button>
        </div>
    `;
}

function removeImage() {
    imagePreview.innerHTML = '';
    fileInput.value = '';
}
window.removeImage = removeImage;
// Chat functionality
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        addUserMessage(message);
        chatInput.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            addBotMessage("I'd be happy to help you with that recipe! Let me analyze your request and provide you with detailed instructions.");
        }, 1000);
    }
}

function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot-message';
    messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
}
*/




// ===== Tab switching functionality =====
const tabs = document.querySelectorAll('.nav-tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    console.log(`Switched to ${tab.dataset.tab} tab`);
  });
});

// ===== Chat and upload elements =====
const fileInput     = document.getElementById('fileInput');
const uploadArea    = document.getElementById('uploadArea');
const imagePreview  = document.getElementById('imagePreview');
const chatContainer = document.getElementById('chatContainer');
const chatInput     = document.getElementById('chatInput');
const sendBtn       = document.getElementById('sendBtn');

// ===== Helpers =====
function autoscroll() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function isImageFile(file) {
  return file && file.type && file.type.startsWith('image/');
}

// ===== Upload functionality =====
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;
  if (!isImageFile(file)) {
    alert('Please select an image file.');
    return;
  }
  handleFileSelect(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!isImageFile(file)) {
    alert('Please select an image file.');
    fileInput.value = '';
    return;
  }
  handleFileSelect(file);
});

function handleFileSelect(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    displayImagePreview(e.target.result, file.name);
    addBotMessage(
      "Great! I can see your food image. What would you like to know about it or what recipe would you like me to create?"
    );
  };
  reader.readAsDataURL(file);
}

function displayImagePreview(src, fileName) {
  imagePreview.innerHTML = `
    <img src="${src}" alt="Uploaded food image" class="preview-image">
    <p style="text-align: center; color: #718096; margin: 0.5rem 0; font-size: 0.9rem;">${fileName}</p>
    <div style="text-align: center;">
      <button class="remove-image">Remove Image</button>
    </div>
  `;
  const btn = imagePreview.querySelector('.remove-image');
  btn.addEventListener('click', removeImage, { once: true });
}

function removeImage() {
  imagePreview.innerHTML = '';
  fileInput.value = '';
}

// ===== Chat functionality =====
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  addUserMessage(message);
  chatInput.value = '';
  chatInput.focus();

  // prevent spamming while bot "types"
  sendBtn.disabled = true;

  setTimeout(() => {
    addBotMessage(
      "I'd be happy to help you with that recipe! Let me analyze your request and provide you with detailed instructions."
    );
    sendBtn.disabled = false;
    chatInput.focus();
  }, 800);
}

function addUserMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message user-message';
  messageDiv.innerHTML = `<div class="message-content">${escapeHTML(message)}</div>`;
  chatContainer.appendChild(messageDiv);
  autoscroll();
}

function addBotMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message bot-message';
  messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
  chatContainer.appendChild(messageDiv);
  autoscroll();
}

// simple escape to avoid HTML injection in user messages
function escapeHTML(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
