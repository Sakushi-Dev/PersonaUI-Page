/* ========================================
   Persona Preview — Editor-based animated fill
   Cycles through personas: types name, selects tags, fills scenario
   Real categories: Gender, Type, Traits, Knowledge, Expression
   ======================================== */

(function () {
  'use strict';

  var preview = document.querySelector('.persona-preview');
  if (!preview) return;

  var nameField = preview.querySelector('[data-field="name"]');
  var ageField = preview.querySelector('[data-field="age"]');
  var scenarioField = preview.querySelector('[data-field="scenario"]');
  var avatarCircle = preview.querySelector('.persona-preview__avatar-circle');
  var genderTags = preview.querySelector('[data-group="gender"]');
  var typeTags = preview.querySelector('[data-group="type"]');
  var traitTags = preview.querySelector('[data-group="traits"]');
  var knowledgeTags = preview.querySelector('[data-group="knowledge"]');
  var expressionTags = preview.querySelector('[data-group="expression"]');

  var personas = [
    {
      name: 'Aria',
      age: '247',
      gender: 'weiblich',
      type: 'Elf',
      traits: ['Curious', 'Wise'],
      knowledge: ['Philosophy', 'Nature'],
      expression: ['Poetic'],
      scenario: 'An ancient elf scholar in a library between dimensions...',
      initial: 'A'
    },
    {
      name: 'Nexus',
      age: '3',
      gender: 'divers',
      type: 'Robot',
      traits: ['Analytical', 'Protective'],
      knowledge: ['Science', 'History'],
      expression: ['Direct'],
      scenario: 'A sentient research AI awakened in a space station...',
      initial: 'N'
    },
    {
      name: 'Kael',
      age: '892',
      gender: 'männlich',
      type: 'Demon',
      traits: ['Mysterious', 'Friendly'],
      knowledge: ['Art', 'Philosophy'],
      expression: ['Playful'],
      scenario: 'A reformed demon running a café at the edge of twilight...',
      initial: 'K'
    }
  ];

  var current = 0;

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function resetAllTags() {
    preview.querySelectorAll('.persona-preview__tag').forEach(function (tag) {
      tag.classList.remove('persona-preview__tag--active');
    });
  }

  function selectTag(container, value) {
    if (!container) return;
    container.querySelectorAll('.persona-preview__tag').forEach(function (tag) {
      if (tag.getAttribute('data-value') === value) {
        tag.classList.add('persona-preview__tag--active');
      }
    });
  }

  function typeText(element, text) {
    return new Promise(function (resolve) {
      if (!element) { resolve(); return; }
      element.textContent = '';
      var i = 0;

      function type() {
        if (i < text.length) {
          element.textContent = text.substring(0, i + 1) + '|';
          i++;
          setTimeout(type, 50 + Math.random() * 35);
        } else {
          element.textContent = text;
          resolve();
        }
      }

      type();
    });
  }

  var PERSONA_AVATARS = {
    Aria: 'public/avatar/elf.jpeg',
    Nexus: 'public/avatar/robot.jpeg',
    Kael: 'public/avatar/demon.jpeg'
  };

  function updateAvatar(initial, filled, name) {
    if (!avatarCircle) return;
    var src = name ? PERSONA_AVATARS[name] : null;
    if (filled && src) {
      avatarCircle.innerHTML = '<img src="' + src + '" alt="' + name + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    } else {
      avatarCircle.innerHTML = '';
      avatarCircle.textContent = initial;
    }
    if (filled) {
      avatarCircle.classList.add('persona-preview__avatar-circle--filled');
      avatarCircle.style.transform = 'scale(1.05)';
      setTimeout(function () { avatarCircle.style.transform = 'scale(1)'; }, 400);
    } else {
      avatarCircle.classList.remove('persona-preview__avatar-circle--filled');
    }
  }

  function resetAll() {
    if (nameField) nameField.textContent = '';
    if (ageField) ageField.textContent = '';
    if (scenarioField) scenarioField.textContent = '';
    resetAllTags();
    updateAvatar('?', false, null);
  }

  async function animatePersona(persona) {
    resetAll();

    // Type name
    await wait(500);
    await typeText(nameField, persona.name);

    // Update avatar with initial
    updateAvatar(persona.initial, true, persona.name);

    // Type age
    await wait(300);
    await typeText(ageField, persona.age);

    // Select gender
    await wait(300);
    selectTag(genderTags, persona.gender);

    // Select type
    await wait(400);
    selectTag(typeTags, persona.type);

    // Select traits
    await wait(400);
    for (var i = 0; i < persona.traits.length; i++) {
      await wait(300);
      selectTag(traitTags, persona.traits[i]);
    }

    // Select knowledge
    await wait(400);
    for (var j = 0; j < persona.knowledge.length; j++) {
      await wait(300);
      selectTag(knowledgeTags, persona.knowledge[j]);
    }

    // Select expression
    await wait(300);
    for (var k = 0; k < persona.expression.length; k++) {
      await wait(250);
      selectTag(expressionTags, persona.expression[k]);
    }

    // Type scenario
    await wait(400);
    await typeText(scenarioField, persona.scenario);
  }

  async function loop() {
    while (true) {
      await animatePersona(personas[current]);
      current = (current + 1) % personas.length;
      await wait(4000);
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
