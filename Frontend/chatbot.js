const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const inputField = document.getElementById('chat-input');
        inputField.value = transcript;
        sendMessage(); // Auto-send the voice command
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        const voiceBtn = document.getElementById('voice-btn');
        if(voiceBtn) {
            voiceBtn.style.color = '#ef4444'; // Red error
            setTimeout(() => { voiceBtn.style.color = '#475569'; }, 2000);
        }
    };
    
    recognition.onend = () => {
        const voiceBtn = document.getElementById('voice-btn');
        if(voiceBtn) {
            voiceBtn.style.color = '#475569';
            voiceBtn.style.background = '#e2e8f0';
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // Show prompts initially if chat is mostly empty
    if (document.getElementById('chat-messages') && document.getElementById('chat-messages').children.length <= 1) {
        showSuggestedPrompts();
    }

    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            if (recognition) {
                voiceBtn.style.color = 'white';
                voiceBtn.style.background = '#ef4444'; // Recording red
                recognition.start();
            } else {
                alert("Voice recognition is not supported in this browser.");
            }
        });
    }

    // 🔥 SMART POPUP: Suggest help after 15 seconds of idle time
    setTimeout(() => {
        const chatWindow = document.getElementById('chatbot-window');
        if (chatWindow && chatWindow.style.display !== 'none') {
            triggerSmartPopup();
        }
    }, 15000);
});

function triggerSmartPopup() {
    const isManager = window.location.pathname.includes('manager_dashboard');
    const msg = isManager ? 
        "Manager, I noticed you're reviewing the dashboard. Need advice on slow-moving stock?" : 
        "Looking for something specific? I can suggest the cheapest pens or a full semester kit!";
    
    // Only show if no messages yet
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages && chatMessages.children.length <= 2) {
        appendMessage('Bot', msg);
    }
}

function appendMessage(sender, text) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    
    msgDiv.style.padding = '0.8rem 1.2rem';
    msgDiv.style.borderRadius = '12px';
    msgDiv.style.maxWidth = '80%';
    msgDiv.style.marginBottom = '1rem';
    msgDiv.style.lineHeight = '1.5';
    msgDiv.style.position = 'relative';
    msgDiv.style.animation = 'fadeInUp 0.3s ease';
    
    if (sender === 'You') {
        msgDiv.style.alignSelf = 'flex-end';
        msgDiv.style.background = 'var(--primary-color)';
        msgDiv.style.color = 'white';
        msgDiv.style.borderBottomRightRadius = '2px';
        msgDiv.innerText = text;
    } else {
        msgDiv.style.alignSelf = 'flex-start';
        msgDiv.style.background = '#e2e8f0';
        msgDiv.style.color = '#334155';
        msgDiv.style.borderBottomLeftRadius = '2px';
        msgDiv.innerHTML = '<strong><i class="fas fa-robot" style="margin-right: 5px; color: var(--primary-color);"></i></strong> ' + text;
    }
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showSuggestedPrompts() {
    const isManager = window.location.pathname.includes('manager_dashboard');
    const prompts = isManager ? 
        ["How are sales today?", "Slowest items?", "Profit advice", "Low stock alerts"] :
        ["Cheapest pens", "Any combo offers?", "Exam kits", "Budget notebooks", "Track order"];
        
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const promptsDiv = document.createElement('div');
    promptsDiv.style.display = 'flex';
    promptsDiv.style.flexWrap = 'wrap';
    promptsDiv.style.gap = '0.8rem';
    promptsDiv.style.marginTop = '0.5rem';
    promptsDiv.style.marginBottom = '1rem';
    promptsDiv.id = 'suggested-prompts';
    
    prompts.forEach(p => {
        const btn = document.createElement('button');
        btn.innerText = p;
        btn.className = 'prompt-pill';
        btn.style.cssText = `
            background: white; border: 1.5px solid var(--primary-color);
            border-radius: 20px; padding: 0.5rem 1rem; font-size: 0.85rem;
            color: var(--primary-color); cursor: pointer; transition: 0.3s;
            font-weight: 500;
        `;
        
        btn.onmouseover = () => { btn.style.background = 'var(--primary-color)'; btn.style.color = 'white'; };
        btn.onmouseout = () => { btn.style.background = 'white'; btn.style.color = 'var(--primary-color)'; };
        
        btn.onclick = () => {
            document.getElementById('chat-input').value = p;
            sendMessage();
            promptsDiv.remove();
        };
        promptsDiv.appendChild(btn);
    });
    
    chatMessages.appendChild(promptsDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const inputField = document.getElementById('chat-input');
    if (!inputField) return;

    const text = inputField.value.trim();
    if (!text) return;

    const promptsDiv = document.getElementById('suggested-prompts');
    if (promptsDiv) promptsDiv.remove();

    appendMessage('You', text);
    inputField.value = '';

    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.style.cssText = 'align-self: flex-start; color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem;';
    typingIndicator.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Smart AI is typing...';
    document.getElementById('chat-messages').appendChild(typingIndicator);
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;

    try {
        const isManager = window.location.pathname.includes('manager_dashboard');
        const role = isManager ? 'MANAGER' : 'STUDENT';

        const response = await fetch('http://localhost:8080/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, role: role })
        });
        
        const data = await response.json();
        document.getElementById('typing-indicator')?.remove();
        
        appendMessage('Bot', data.reply);
    } catch (error) {
        document.getElementById('typing-indicator')?.remove();
        appendMessage('Bot', "System is busy, please try again!");
    }
}
