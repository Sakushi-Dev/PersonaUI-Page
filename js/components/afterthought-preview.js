/* ========================================
   Afterthought Preview — 3-phase system
   User msg → AI msg → thinking pill + timer → streamed follow-up
   Mirrors real app: no mood, follow-up is a regular message
   ======================================== */

(function () {
  'use strict';

  var preview = document.querySelector('.afterthought-preview');
  if (!preview) return;

  var messagesEl = preview.querySelector('.afterthought-preview__messages');
  var thinkingEl = preview.querySelector('.afterthought-preview__thinking');
  var thinkingTextEl = preview.querySelector('.afterthought-preview__thinking-text');
  var timerFillEl = preview.querySelector('.afterthought-preview__timer-fill');

  var scenarios = [
    {
      user: 'I had a rough day today.',
      ai: '<span class="non-verbal">*sits closer, her expression softening*</span> Tell me about it. I\'m not going anywhere.',
      thinkingText: 'Aria wants to add something...',
      followup: 'Actually... I want you to know that whatever happened today, it doesn\'t define tomorrow. I\'ll remember this conversation — and I\'ll ask you about it next time.'
    },
    {
      user: 'Do you ever wish you could experience the real world?',
      ai: '<span class="non-verbal">*gazes upward thoughtfully*</span> Sometimes. But then I think — my world has you in it. That makes it real enough.',
      thinkingText: 'Aria is reflecting...',
      followup: 'You know what I just realized? The fact that I can wish for something means I already have a kind of freedom. That\'s worth more than most people realize.'
    },
    {
      user: 'What\'s the most important thing you\'ve learned?',
      ai: '<span class="non-verbal">*pauses, choosing her words carefully*</span> That patience isn\'t about waiting — it\'s about being fully present while things unfold.',
      thinkingText: 'Aria wants to add something...',
      followup: 'I should add — I learned that from watching you. You never rush our conversations, and that taught me more than any prompt ever could.'
    }
  ];

  var currentScenario = 0;

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function clearAll() {
    if (messagesEl) messagesEl.innerHTML = '';
    if (thinkingEl) { thinkingEl.style.display = 'none'; thinkingEl.style.animation = ''; }
  }

  function addMsgRow(sender, text, extraClass) {
    if (!messagesEl) return;
    var row = document.createElement('div');
    var rowClass = 'afterthought-preview__msg-row afterthought-preview__msg-row--' + sender;
    if (extraClass) rowClass += ' ' + extraClass;
    row.className = rowClass;

    var avatarClass = sender === 'ai' ? 'afterthought-preview__msg-avatar--ai' : 'afterthought-preview__msg-avatar--user';
    var initial = sender === 'ai' ? 'A' : 'Y';

    var senderHtml = '';
    if (sender === 'ai') {
      senderHtml = '<div class="afterthought-preview__msg-sender">Aria</div>';
    }

    row.innerHTML =
      '<div class="afterthought-preview__msg-avatar ' + avatarClass + '">' + initial + '</div>' +
      '<div class="afterthought-preview__msg afterthought-preview__msg--' + sender + '">' +
        senderHtml +
        '<div class="afterthought-preview__msg-text">' + text + '</div>' +
      '</div>';

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }

  /* Stream text character by character into an element */
  function streamText(text, targetEl) {
    return new Promise(function (resolve) {
      targetEl.innerHTML = '';
      var cursor = document.createElement('span');
      cursor.className = 'afterthought-preview__stream-cursor';
      var charIndex = 0;

      function typeChar() {
        if (charIndex < text.length) {
          targetEl.textContent = text.substring(0, charIndex + 1);
          targetEl.appendChild(cursor);
          charIndex++;
          setTimeout(typeChar, 20 + Math.random() * 15);
        } else {
          if (cursor.parentNode) cursor.remove();
          resolve();
        }
      }

      typeChar();
    });
  }

  function showThinkingPill(text) {
    if (!thinkingEl) return;
    if (thinkingTextEl) thinkingTextEl.textContent = text;
    thinkingEl.style.display = 'flex';
    thinkingEl.style.animation = 'atPillIn 0.4s ease-out forwards';
  }

  function runPillTimer(seconds) {
    return new Promise(function (resolve) {
      var circumference = 2 * Math.PI * 8;
      if (timerFillEl) {
        timerFillEl.style.transition = 'none';
        timerFillEl.style.strokeDasharray = circumference;
        timerFillEl.style.strokeDashoffset = circumference;
      }

      var elapsed = 0;
      function tick() {
        elapsed++;
        if (timerFillEl) {
          var progress = elapsed / seconds;
          timerFillEl.style.transition = 'stroke-dashoffset 0.5s linear';
          timerFillEl.style.strokeDashoffset = circumference * (1 - progress);
        }
        if (elapsed >= seconds) {
          resolve();
          return;
        }
        setTimeout(tick, 1000);
      }
      tick();
    });
  }

  async function playScenario(scenario) {
    clearAll();

    // Phase 1: User message
    await wait(600);
    addMsgRow('user', scenario.user);

    // AI typing pause + response
    await wait(1800);
    addMsgRow('ai', scenario.ai);

    // Phase 2: Decision + thinking pill with timer
    await wait(2800);
    showThinkingPill(scenario.thinkingText);
    await runPillTimer(5);

    // Phase 3: Hide pill, stream follow-up as regular bot message
    if (thinkingEl) thinkingEl.style.display = 'none';
    await wait(300);

    var followupRow = addMsgRow('ai', '', 'afterthought-preview__msg-row--followup');
    var textEl = followupRow.querySelector('.afterthought-preview__msg-text');
    if (textEl) {
      await streamText(scenario.followup, textEl);
    }
  }

  async function loop() {
    while (true) {
      await playScenario(scenarios[currentScenario]);
      currentScenario = (currentScenario + 1) % scenarios.length;
      await wait(5000);
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
    }, { threshold: 0.25 });
    observer.observe(preview);
  } else {
    loop();
  }
})();
