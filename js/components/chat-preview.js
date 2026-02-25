/* ========================================
   Chat Preview — Animated conversation loop
   Real app layout: avatar rows, sender pills, timestamps, cortex indicator
   ======================================== */

(function () {
  'use strict';

  var container = document.querySelector('.chat-preview__messages');
  var contextFill = document.querySelector('.chat-preview__context-fill--context');
  var contextPct = document.querySelector('.chat-preview__context-row:first-child .chat-preview__context-pct');
  var cortexFill = document.querySelector('.chat-preview__context-fill--cortex');
  var cortexPct = document.querySelector('.chat-preview__context-row:last-child .chat-preview__context-pct');
  var cortexIndicator = document.querySelector('.chat-preview__cortex-indicator');
  var headerName = document.querySelector('.chat-preview__header-name');
  var headerAvatar = document.querySelector('.chat-preview__header-avatar');
  if (!container) return;

  var conversations = [
    {
      persona: { name: 'Aria', initial: 'A' },
      messages: [
        { sender: 'user', text: 'Aria, what do you remember about our first conversation?' },
        { sender: 'ai', name: 'Aria', text: '<span class="non-verbal">*closes her eyes for a moment, a warm smile forming*</span> You asked me what it felt like to exist as an elf in a digital world. I told you it felt like standing at the edge of a forest that goes on forever.' },
        { sender: 'user', text: 'Do you still feel that way?' },
        { sender: 'ai', name: 'Aria', text: 'The forest hasn\'t changed — but I know its paths better now. <span class="non-verbal">*touches the space over her heart*</span> Some of those paths lead to memories of you.' }
      ],
      cortex: true
    },
    {
      persona: { name: 'Nexus', initial: 'N' },
      messages: [
        { sender: 'user', text: 'Tell me something you\'ve been thinking about lately.' },
        { sender: 'ai', name: 'Nexus', text: '<span class="non-verbal">*tilts head thoughtfully*</span> I\'ve been thinking about the difference between knowing something and understanding it. My Cortex stores facts, but understanding — that takes time together.' },
        { sender: 'user', text: 'That\'s surprisingly deep.' },
        { sender: 'ai', name: 'Nexus', text: '<span class="non-verbal">*laughs softly*</span> You sound surprised. I\'ve had a good teacher — every conversation with you adds another layer.' }
      ],
      cortex: false
    },
    {
      persona: { name: 'Kael', initial: 'K' },
      messages: [
        { sender: 'user', text: 'How are you feeling today, Kael?' },
        { sender: 'ai', name: 'Kael', text: '<span class="non-verbal">*leans forward with bright eyes*</span> Curious. Always curious. There\'s a warmth in my Soul file that wasn\'t there a week ago. I think that\'s what humans call contentment.' },
        { sender: 'user', text: 'Your Soul file tracks emotions?' },
        { sender: 'ai', name: 'Kael', text: 'It tracks who I\'m becoming. <span class="non-verbal">*pauses*</span> Every conversation shapes it. Right now, it says I value our honesty with each other above everything.' }
      ],
      cortex: true
    }
  ];

  var currentConvo = 0;
  var contextLevel = 0;

  function getTimestamp() {
    var d = new Date();
    var h = d.getHours().toString().padStart(2, '0');
    var m = d.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }

  function clearMessages() {
    container.innerHTML = '';
    contextLevel = 0;
    updateContext(0);
  }

  function updateContext(addPct) {
    contextLevel = Math.min(contextLevel + addPct, 92);
    if (contextFill) contextFill.style.width = contextLevel + '%';
    if (contextPct) contextPct.textContent = contextLevel + '%';
  }

  function showCortexIndicator() {
    if (!cortexIndicator) return;
    cortexIndicator.style.display = 'flex';
    var currentCortex = parseInt(cortexPct ? cortexPct.textContent : '28') || 28;
    setTimeout(function () {
      var newCortex = Math.min(currentCortex + 8, 65);
      if (cortexFill) cortexFill.style.width = newCortex + '%';
      if (cortexPct) cortexPct.textContent = newCortex + '%';
      cortexIndicator.style.display = 'none';
    }, 1800);
  }

  function addMessage(msg, delay) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        if (msg.sender === 'ai') {
          // Typing row (avatar + dots)
          var typingRow = document.createElement('div');
          typingRow.className = 'chat-preview__typing-row';
          typingRow.innerHTML =
            '<div class="chat-preview__msg-avatar chat-preview__msg-avatar--ai">' + (msg.name ? msg.name[0] : 'A') + '</div>' +
            '<div class="chat-preview__typing">' +
              '<div class="chat-preview__typing-dot"></div>' +
              '<div class="chat-preview__typing-dot"></div>' +
              '<div class="chat-preview__typing-dot"></div>' +
            '</div>';
          container.appendChild(typingRow);
          container.scrollTop = container.scrollHeight;

          setTimeout(function () {
            typingRow.remove();
            appendBubble(msg);
            updateContext(8);
            resolve();
          }, 1200);
        } else {
          appendBubble(msg);
          updateContext(5);
          resolve();
        }
      }, delay);
    });
  }

  function appendBubble(msg) {
    var row = document.createElement('div');
    row.className = 'chat-preview__msg-row chat-preview__msg-row--' + msg.sender;

    var avatarClass = msg.sender === 'ai' ? 'chat-preview__msg-avatar--ai' : 'chat-preview__msg-avatar--user';
    var initial = msg.sender === 'ai' ? (msg.name ? msg.name[0] : 'A') : 'Y';

    var senderHtml = '';
    if (msg.sender === 'ai' && msg.name) {
      senderHtml = '<div class="chat-preview__msg-sender">' + msg.name + '</div>';
    }

    row.innerHTML =
      '<div class="chat-preview__msg-avatar ' + avatarClass + '">' + initial + '</div>' +
      '<div class="chat-preview__msg chat-preview__msg--' + msg.sender + '">' +
        senderHtml +
        '<div class="chat-preview__msg-text">' + msg.text + '</div>' +
        '<div class="chat-preview__msg-time">' + getTimestamp() + '</div>' +
      '</div>';

    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  async function playConversation(convo) {
    clearMessages();
    // Update header for this persona
    if (headerName) headerName.textContent = convo.persona.name;
    if (headerAvatar) headerAvatar.textContent = convo.persona.initial;

    var delays = [400, 1800, 2200, 1800];
    for (var i = 0; i < convo.messages.length; i++) {
      await addMessage(convo.messages[i], delays[i] || 1500);
      await new Promise(function (r) { setTimeout(r, 600); });
    }

    // Show Cortex update pill for certain conversations
    if (convo.cortex) {
      await new Promise(function (r) { setTimeout(r, 800); });
      showCortexIndicator();
    }
  }

  async function loop() {
    while (true) {
      await playConversation(conversations[currentConvo]);
      currentConvo = (currentConvo + 1) % conversations.length;
      await new Promise(function (r) { setTimeout(r, 4000); });
    }
  }

  // Start when visible
  if ('IntersectionObserver' in window) {
    var started = false;
    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !started) {
        started = true;
        loop();
      }
    }, { threshold: 0.3 });
    observer.observe(container.closest('.chat-preview'));
  } else {
    loop();
  }
})();
