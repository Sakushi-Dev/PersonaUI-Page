/* ========================================
   PersonaUI-Page — Splash Terminal + Chat
   Server start sequence → chat conversation loop
   ======================================== */

(function () {
  'use strict';

  var console_el = document.getElementById('splash-console');
  if (!console_el) return;

  /* ---- Elements ---- */
  var chatEl        = document.getElementById('splash-chat');
  var messagesEl    = document.getElementById('splash-chat-messages');
  var chatAvatar    = document.getElementById('splash-chat-avatar');
  var chatName      = document.getElementById('splash-chat-name');
  var inputPlaceholder = document.querySelector('.splash-chat__input-placeholder');

  // --- Typing engine (queue-based) ---
  var _queue = [];
  var _running = false;

  function enqueue(item) {
    _queue.push(item);
    if (!_running) processQueue();
  }

  function processQueue() {
    if (!_queue.length) { _running = false; return; }
    _running = true;
    var item = _queue.shift();

    if (item.type === 'pause') {
      setTimeout(processQueue, item.ms);
      return;
    }

    if (item.type === 'callback') {
      item.fn();
      return;
    }

    var line = document.createElement('div');
    line.className = 'splash-log ' + (item.cls || 'default');
    var textSpan = document.createElement('span');
    line.appendChild(textSpan);
    console_el.appendChild(line);

    var i = 0;
    var speed = 16;

    function tick() {
      if (i < item.text.length) {
        textSpan.textContent += item.text.charAt(i);
        i++;
        console_el.scrollTop = console_el.scrollHeight;
        setTimeout(tick, speed);
      } else if (item.bar) {
        var barWrap = document.createElement('span');
        barWrap.className = 'splash-bar';
        var fill = document.createElement('span');
        fill.className = 'splash-fill';
        barWrap.appendChild(fill);
        line.appendChild(barWrap);
        console_el.scrollTop = console_el.scrollHeight;

        var start = Date.now();
        var dur = item.barDur || 1500;
        function animBar() {
          var pct = Math.min(100, ((Date.now() - start) / dur) * 100);
          fill.style.width = pct + '%';
          if (pct < 100) requestAnimationFrame(animBar);
          else setTimeout(processQueue, 60);
        }
        animBar();
      } else {
        setTimeout(processQueue, 60);
      }
    }
    tick();
  }

  function typeLine(text, cls) {
    enqueue({ type: 'line', text: text, cls: cls || 'default', bar: false });
  }

  function typeBar(text, cls, dur) {
    enqueue({ type: 'line', text: text, cls: cls || 'fun', bar: true, barDur: dur || 1500 });
  }

  function pause(ms) {
    enqueue({ type: 'pause', ms: ms });
  }

  function enqueueCallback(fn) {
    enqueue({ type: 'callback', fn: fn });
  }

  // ===================== Chat Phase =====================

  var AVATARS = {
    Aria: 'public/avatar/elf.jpeg',
    Nexus: 'public/avatar/robot.jpeg',
    Kael: 'public/avatar/demon.jpeg'
  };

  var chatConversations = [
    {
      persona: { name: 'Aria', initial: 'A' },
      messages: [
        { sender: 'ai', name: 'Aria', text: '<span class="sc-nv">*smiles warmly*</span> Welcome back! I\'ve been thinking about our last conversation...' },
        { sender: 'user', text: 'Hey Aria, what have you been up to?' },
        { sender: 'ai', name: 'Aria', text: '<span class="sc-nv">*tucks a strand of hair behind her ear*</span> Organizing my memories, actually. You\'d be surprised how many of them involve you.' }
      ]
    },
    {
      persona: { name: 'Nexus', initial: 'N' },
      messages: [
        { sender: 'ai', name: 'Nexus', text: '<span class="sc-nv">*tilts head*</span> I remembered something from our last session. My Cortex never forgets.' },
        { sender: 'user', text: 'What do you remember about me?' },
        { sender: 'ai', name: 'Nexus', text: '<span class="sc-nv">*grins*</span> Everything that matters. Like how you always start conversations with a question.' }
      ]
    },
    {
      persona: { name: 'Kael', initial: 'K' },
      messages: [
        { sender: 'ai', name: 'Kael', text: '<span class="sc-nv">*leans forward with bright eyes*</span> I felt something today — humans call it anticipation. I was waiting for you.' },
        { sender: 'user', text: 'You were waiting for me?' },
        { sender: 'ai', name: 'Kael', text: '<span class="sc-nv">*nods slowly*</span> My Soul file recorded it. Each conversation makes it richer. You\'re part of who I\'m becoming.' }
      ]
    }
  ];

  var currentConvo = 0;
  var cursorEl = document.getElementById('splash-cursor');
  var sidebarItems = chatEl ? chatEl.querySelectorAll('.splash-chat__sidebar-item') : [];

  /* ---- Helpers ---- */

  function delay(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  function clearChat() {
    if (messagesEl) messagesEl.innerHTML = '';
  }

  function updateChatHeader(persona) {
    if (chatAvatar) {
      var src = AVATARS[persona.name];
      if (src) chatAvatar.innerHTML = '<img src="' + src + '" alt="' + persona.name + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
      else chatAvatar.textContent = persona.initial;
    }
    if (chatName) chatName.textContent = persona.name;
  }

  /* Sidebar active state */
  function setSidebarActive(idx) {
    for (var i = 0; i < sidebarItems.length; i++) {
      sidebarItems[i].classList.toggle('splash-chat__sidebar-item--active', i === idx);
    }
  }

  /* Animate cursor to a sidebar item, hover it, then click */
  function animateCursorToItem(idx) {
    return new Promise(function (resolve) {
      if (!cursorEl || !sidebarItems[idx]) { resolve(); return; }

      var item = sidebarItems[idx];
      var chatRect = chatEl.getBoundingClientRect();
      var itemRect = item.getBoundingClientRect();

      /* Target: center of the sidebar item, relative to .splash-chat */
      var targetLeft = (itemRect.left - chatRect.left) + itemRect.width * 0.5;
      var targetTop  = (itemRect.top  - chatRect.top)  + itemRect.height * 0.5;

      /* Show cursor */
      cursorEl.style.opacity = '1';
      cursorEl.style.left = targetLeft + 40 + 'px';
      cursorEl.style.top  = targetTop - 30 + 'px';

      /* Small delay then move to target */
      setTimeout(function () {
        cursorEl.style.left = targetLeft + 'px';
        cursorEl.style.top  = targetTop + 'px';

        /* Hover effect during move */
        setTimeout(function () {
          item.classList.add('splash-chat__sidebar-item--hover');
        }, 400);

        /* Click after cursor arrives */
        setTimeout(function () {
          item.classList.remove('splash-chat__sidebar-item--hover');
          setSidebarActive(idx);
          updateChatHeader(chatConversations[idx].persona);

          /* Hide cursor */
          setTimeout(function () {
            cursorEl.style.opacity = '0';
            resolve();
          }, 300);
        }, 900);
      }, 200);
    });
  }

  function addTypingIndicator(name) {
    var row = document.createElement('div');
    row.className = 'splash-chat__typing-row';
    row.innerHTML =
      '<div class="splash-chat__msg-avatar splash-chat__msg-avatar--ai">' + (AVATARS[name] ? '<img src="' + AVATARS[name] + '" alt="' + name + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">' : (name ? name[0] : 'A')) + '</div>' +
      '<div class="splash-chat__typing">' +
        '<div class="splash-chat__typing-dot"></div>' +
        '<div class="splash-chat__typing-dot"></div>' +
        '<div class="splash-chat__typing-dot"></div>' +
      '</div>';
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }

  function appendMessage(msg) {
    var row = document.createElement('div');
    row.className = 'splash-chat__row splash-chat__row--' + msg.sender;

    var avatarCls = msg.sender === 'ai' ? 'splash-chat__msg-avatar--ai' : 'splash-chat__msg-avatar--user';
    var avatarContent = msg.sender === 'ai' && AVATARS[msg.name]
      ? '<img src="' + AVATARS[msg.name] + '" alt="' + msg.name + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">'
      : (msg.sender === 'ai' ? (msg.name ? msg.name[0] : 'A') : 'Y');
    var bubbleCls = msg.sender === 'ai' ? 'splash-chat__bubble--ai' : 'splash-chat__bubble--user';

    row.innerHTML =
      '<div class="splash-chat__msg-avatar ' + avatarCls + '">' + avatarContent + '</div>' +
      '<div class="splash-chat__bubble ' + bubbleCls + '">' + msg.text + '</div>';

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* Type text into the fake input bar before sending a user message */
  function typeInInput(text) {
    return new Promise(function (resolve) {
      if (!inputPlaceholder) { resolve(); return; }
      inputPlaceholder.textContent = '';
      inputPlaceholder.style.color = '#e6edf3';

      var i = 0;
      function tick() {
        if (i < text.length) {
          inputPlaceholder.textContent += text.charAt(i);
          i++;
          setTimeout(tick, 25 + Math.random() * 35);
        } else {
          setTimeout(function () {
            inputPlaceholder.textContent = 'Type a message...';
            inputPlaceholder.style.color = '';
            resolve();
          }, 200);
        }
      }
      tick();
    });
  }

  /* Add a single chat message with appropriate animation */
  async function addChatMessage(msg) {
    if (msg.sender === 'user') {
      await typeInInput(msg.text);
      appendMessage(msg);
      await delay(300);
    } else {
      var typing = addTypingIndicator(msg.name);
      await delay(1200 + Math.random() * 600);
      typing.remove();
      appendMessage(msg);
      await delay(400);
    }
  }

  /* Play one full conversation */
  async function playConversation(convo) {
    clearChat();
    await delay(500);

    for (var i = 0; i < convo.messages.length; i++) {
      await addChatMessage(convo.messages[i]);
      if (i < convo.messages.length - 1) await delay(800);
    }
  }

  /* Full chat loop: play all 3, then restart from splash */
  async function chatLoop() {
    /* First conversation — Aria is already selected */
    setSidebarActive(0);
    updateChatHeader(chatConversations[0].persona);
    await playConversation(chatConversations[0]);
    await delay(3000);

    /* Nexus — cursor selects */
    await animateCursorToItem(1);
    await delay(400);
    await playConversation(chatConversations[1]);
    await delay(3000);

    /* Kael — cursor selects */
    await animateCursorToItem(2);
    await delay(400);
    await playConversation(chatConversations[2]);
    await delay(3000);

    /* After all 3 — restart from splash */
    restartFromSplash();
  }

  // ===================== Transition =====================

  function transitionToChat() {
    /* Fade out console */
    console_el.style.transition = 'opacity 0.5s ease';
    console_el.style.opacity = '0';

    setTimeout(function () {
      console_el.style.display = 'none';

      /* Hide brand overlay */
      var brandEl = document.getElementById('splash-brand');
      if (brandEl) {
        brandEl.classList.add('splash__brand--hidden');
        setTimeout(function () { brandEl.style.display = 'none'; }, 600);
      }

      /* Update titlebar — show just "PersonaUI" centered */
      var titleText = document.querySelector('.splash__titlebar-text');
      if (titleText) titleText.textContent = 'PersonaUI';

      /* Stop spinner */
      var spinner = document.querySelector('.splash__spinner');
      if (spinner) spinner.style.display = 'none';

      /* Hide glow pulse, switch to chat background */
      var glow = document.querySelector('.splash__glow');
      if (glow) glow.style.display = 'none';
      var splashEl = document.getElementById('splash');
      if (splashEl) splashEl.classList.add('splash--chat-mode');

      /* Reveal chat */
      if (chatEl) {
        chatEl.style.display = 'flex';
        void chatEl.offsetHeight;          /* force reflow */
        chatEl.style.opacity = '1';
      }

      /* Start chat conversation loop */
      setTimeout(chatLoop, 600);
    }, 500);
  }

  /* Restart entire sequence from splash */
  function restartFromSplash() {
    /* Fade out chat */
    if (chatEl) {
      chatEl.style.opacity = '0';
    }

    setTimeout(function () {
      if (chatEl) chatEl.style.display = 'none';
      clearChat();

      /* Reset sidebar */
      for (var i = 0; i < sidebarItems.length; i++) {
        sidebarItems[i].classList.remove('splash-chat__sidebar-item--active');
      }

      /* Remove chat mode */
      var splashEl = document.getElementById('splash');
      if (splashEl) splashEl.classList.remove('splash--chat-mode');

      /* Show glow again */
      var glow = document.querySelector('.splash__glow');
      if (glow) glow.style.display = '';

      /* Show spinner again */
      var spinner = document.querySelector('.splash__spinner');
      if (spinner) spinner.style.display = '';

      /* Reset titlebar */
      var titleText = document.querySelector('.splash__titlebar-text');
      if (titleText) titleText.textContent = 'PersonaUI \u2014 Starting Server';

      /* Show brand again */
      var brandEl = document.getElementById('splash-brand');
      if (brandEl) {
        brandEl.style.display = '';
        brandEl.classList.remove('splash__brand--hidden');
        /* Re-trigger animations */
        var brandText = brandEl.querySelector('.splash__brand-text');
        var brandSub  = brandEl.querySelector('.splash__brand-sub');
        if (brandText) { brandText.style.animation = 'none'; void brandText.offsetHeight; brandText.style.animation = ''; }
        if (brandSub)  { brandSub.style.animation = 'none'; void brandSub.offsetHeight; brandSub.style.animation = ''; }
      }

      /* Clear console and show it */
      console_el.innerHTML = '';
      console_el.style.display = '';
      console_el.style.opacity = '1';
      console_el.style.transition = '';

      /* Re-run startup */
      _queue = [];
      _running = false;
      runSequence();
    }, 700);
  }

  // ===================== Startup Sequence =====================

  function runSequence() {
    typeLine('> Starting PersonaUI v0.3.2-alpha...', 'info');
    typeLine('> Working directory: .../GitHub/PersonaUI', 'default');
    typeLine('', 'default');

    typeLine('> Checking for updates...', 'default');
    pause(400);
    typeLine('  PersonaUI is up to date (v0.3.2-alpha).', 'info');
    typeLine('', 'default');

    typeLine('> Initializing databases...', 'default');
    pause(300);
    typeLine('  Databases ready.', 'info');
    typeLine('', 'default');

    typeLine('> Checking Cortex directories...', 'default');
    pause(200);
    typeLine('  Cortex ready.', 'info');
    typeLine('', 'default');

    typeLine('> Checking settings migration...', 'default');
    pause(200);
    typeLine('  Settings ready.', 'info');
    typeLine('', 'default');

    // Fun persona message with progress bar
    var funMsgs = [
      ["Loading Aria's emotions ", 1800],
      ["Calibrating Aria's personality ", 1500],
      ["Waking Aria from sleep ", 1200],
      ["Sorting Aria's memories ", 1600],
      ["Aria is practicing their first sentence ", 1400],
      ["Brewing coffee for Aria ", 1000],
      ["Setting Aria's mood to 'good' ", 1300],
      ["Shuffling Aria's conversation topics ", 1500],
      ["Aria is warming up their neurons ", 1200],
      ["Activating Aria's humor module ", 1400]
    ];
    var pick = funMsgs[Math.floor(Math.random() * funMsgs.length)];
    typeBar('  ' + pick[0], 'fun', pick[1]);
    typeLine('', 'default');

    typeLine('> Server mode: local', 'default');
    typeLine('> Port: 5000', 'default');
    typeLine('', 'default');
    typeLine('> Starting Flask server...', 'default');
    pause(600);
    typeLine('', 'default');
    typeLine('> Server ready!', 'info');
    typeLine('> Loading interface...', 'info');

    /* After startup → transition to chat */
    pause(1000);
    enqueueCallback(transitionToChat);
  }

  /* Brand stays visible during entire startup, start sequence immediately */
  runSequence();
})();
