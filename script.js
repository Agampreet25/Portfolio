(function () {
  'use strict';

  /* =====================================================================
     EDIT HERE
     ---------------------------------------------------------------------
     LAB_URL: paste the Symbianthro Labs link once it's live, e.g.
              'https://symbianthro.org'. While empty, every lab link on the
              page shows "site coming soon" and does nothing when clicked.
     CONTACT_EMAIL: used by the chat guide.
     ===================================================================== */
  var LAB_URL = 'https://agampreet25.github.io/symbianthro/';
  var CONTACT_EMAIL = 'agampreet342@gmail.com';
  var SCHOLAR_URL = 'https://scholar.google.com/citations?user=vXO4BAkAAAAJ&hl=en';
  var MEDIUM_URL = 'https://medium.com/@agampreet342';

  var THEMES = [
    { name: 'Affective', long: 'Affective Computing & Emotion Modelling', color: '#E25A6E', words: ['affective', 'emotion', 'emotional', 'sentiment', 'feeling', 'feelings', 'nlp', 'language', 'opinion'] },
    { name: 'Financial', long: 'Sequential Modeling for Financial Systems', color: '#D9B660', words: ['financial', 'finance', 'forecasting', 'forecast', 'stock', 'stocks', 'market', 'markets', 'price', 'crypto', 'time series'] },
    { name: 'Clinical', long: 'Interpretable & Uncertainty-Aware Clinical AI', color: '#E89A8F', words: ['clinical', 'medical', 'medicine', 'imaging', 'healthcare', 'diagnosis', 'xai', 'explainable', 'interpretable', 'interpretability', 'uncertainty', 'cancer'] },
    { name: 'Biomedical', long: 'Multimodal & Foundation Models for Biomedicine', color: '#D7834F', words: ['biomedical', 'foundation', 'multimodal', 'llm', 'llms', 'biology'] }
  ];
  var ZONES = [[16, 16], [308, 16], [16, 168], [308, 168]];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Symbianthro link placeholder ---------- */
  $$('[data-lab-link]').forEach(function (a) {
    if (LAB_URL) {
      a.href = LAB_URL;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.href = '#';
      a.setAttribute('aria-disabled', 'true');
      a.title = 'Symbianthro Labs site coming soon';
      a.addEventListener('click', function (e) { e.preventDefault(); });
    }
  });
  $$('[data-lab-soon]').forEach(function (s) { s.hidden = !!LAB_URL; });

  /* ---------- publications: read from the DOM ---------- */
  var cards = $$('#pubs .pub');
  var pubs = cards.map(function (el, i) {
    var t = +el.getAttribute('data-t');
    var num = (i + 1 < 10 ? '0' : '') + (i + 1);
    var top = document.createElement('div');
    top.className = 'pub-top';
    var tag = document.createElement('span');
    tag.className = 'tag';
    tag.style.background = THEMES[t].color;
    tag.textContent = num + ' · ' + THEMES[t].name;
    top.appendChild(tag);
    if (el.hasAttribute('data-new')) {
      var nw = document.createElement('span');
      nw.className = 'new blink';
      nw.textContent = 'New!';
      top.appendChild(nw);
    }
    el.insertBefore(top, el.firstChild);
    var link = el.querySelector('h3 a');
    return {
      el: el, t: t, num: num, isNew: el.hasAttribute('data-new'),
      title: link.textContent.trim(),
      url: link.getAttribute('href'),
      venue: el.querySelector('.venue').textContent.trim(),
      status: el.querySelector('.status').textContent.replace(/^[\s·]+/, '').trim(),
      authors: el.querySelector('.authors').textContent.trim(),
      abs: el.querySelector('.abs').textContent.trim(),
      metrics: $$('.metrics span', el).map(function (m) { return m.textContent.trim(); })
    };
  });

  var reviews = $$('.review-item');
  reviews.forEach(function (li, i) { $('.rv-n', li).textContent = (i + 1 < 10 ? '0' : '') + (i + 1); });
  $('#statPapers').textContent = pubs.length;
  $('#statReview').textContent = reviews.length;
  $('#reviewCount').textContent = reviews.length;

  /* ---------- world map ---------- */
  var map = $('#map');
  var zoneEls = THEMES.map(function (th, i) {
    var z = document.createElement('div');
    z.className = 'zone';
    z.style.left = ZONES[i][0] + 'px';
    z.style.top = ZONES[i][1] + 'px';
    z.style.borderColor = th.color;
    var s = document.createElement('span');
    s.style.color = th.color;
    s.textContent = th.name;
    z.appendChild(s);
    map.appendChild(z);
    return z;
  });
  var perTheme = [0, 0, 0, 0];
  pubs.forEach(function (p, i) {
    var k = perTheme[p.t]++;
    var b = document.createElement('button');
    b.className = 'tile';
    b.type = 'button';
    b.textContent = p.num;
    b.setAttribute('aria-label', p.title);
    b.style.background = THEMES[p.t].color;
    b.style.left = (ZONES[p.t][0] + 18 + (k % 5) * 46) + 'px';
    b.style.top = (ZONES[p.t][1] + 40 + Math.floor(k / 5) * 46) + 'px';
    b.addEventListener('mouseenter', function () { select(i); });
    b.addEventListener('focus', function () { select(i); });
    b.addEventListener('click', function () {
      select(i);
      p.el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });
    map.appendChild(b);
    p.tile = b;
  });

  var mdTag = $('#mdTag'), mdTitle = $('#mdTitle'), mdVenue = $('#mdVenue'), mdAbs = $('#mdAbs');
  var selected = -1;
  function select(i) {
    if (i === selected) return;
    if (selected >= 0) pubs[selected].tile.classList.remove('sel');
    selected = i;
    var p = pubs[i];
    p.tile.classList.add('sel');
    mdTag.textContent = 'Tile ' + p.num + ' · ' + THEMES[p.t].name;
    mdTag.style.color = THEMES[p.t].color;
    mdTitle.textContent = p.title;
    mdVenue.textContent = p.venue;
    mdAbs.textContent = p.abs;
  }
  select(0);

  /* ---------- filters (map + list share one state) ---------- */
  var opts = [{ key: 'all', short: 'All', long: 'All themes' }].concat(THEMES.map(function (th, i) {
    return { key: i, short: th.name, long: th.name };
  }));
  var filterBtns = [];
  $$('.filters').forEach(function (bar) {
    var size = bar.getAttribute('data-size') || 'sm';
    opts.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn ' + size;
      b.textContent = size === 'xs' ? o.short : o.long;
      b.addEventListener('click', function () { setFilter(o.key); });
      bar.appendChild(b);
      filterBtns.push({ el: b, key: o.key });
    });
  });
  var countEl = $('#pubCount');
  function setFilter(key) {
    filterBtns.forEach(function (fb) {
      var on = fb.key === key;
      fb.el.classList.toggle('active', on);
      fb.el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var shown = 0;
    pubs.forEach(function (p) {
      var on = key === 'all' || key === p.t;
      p.el.hidden = !on;
      p.tile.classList.toggle('dim', !on);
      if (on) shown++;
    });
    zoneEls.forEach(function (z, i) { z.classList.toggle('dim', !(key === 'all' || key === i)); });
    countEl.textContent = 'Showing ' + shown + ' of ' + pubs.length + ' published' + (key === 'all' ? '' : ' · ' + THEMES[key].long);
    if (key !== 'all') {
      for (var i = 0; i < pubs.length; i++) { if (pubs[i].t === key) { select(i); break; } }
    }
  }
  setFilter('all');

  /* =====================================================================
     PIXEL GUIDE CHAT
     Scripted and fully client-side: nothing leaves the visitor's browser,
     no API keys, no server. Answers come from the papers on this page plus
     the hand-written entries in INTENTS below. Every message is rendered
     with textContent (never innerHTML), so typed input can't inject HTML.
     ===================================================================== */
  var STOP = ('a an the and or of in on to for with about is are was were be been your you me my i it its this that these those what whats which who how do does did can could would should tell show give any some please there their them they from at by as into more most so much paper papers work').split(' ');
  var stopSet = {};
  STOP.forEach(function (w) { stopSet[w] = 1; });

  function tokens(s) {
    return (s || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9²\s-]/g, ' ').split(/[\s-]+/)
      .filter(function (w) { return w && w.length > 1 && !stopSet[w]; });
  }
  function close(a, b) {
    if (a === b) return true;
    if (a.length >= 4 && b.length >= 4) {
      var n = Math.min(a.length, b.length, 6);
      return a.slice(0, n - 1) === b.slice(0, n - 1); // emotion ~ emotional, forecast ~ forecasting
    }
    return false;
  }
  function score(qt, words) {
    var s = 0;
    qt.forEach(function (q) {
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (w.indexOf(' ') > -1) continue;
        if (close(q, w)) { s += 1; break; }
      }
    });
    return s;
  }

  // Parts are plain strings, or {text, href} for links.
  function L(text, href) { return { text: text, href: href }; }
  function paperAnswer(p) {
    var out = [p.title + '\n', p.venue + ' · ' + p.status + '\n\n', p.abs];
    if (p.metrics.length) out.push('\n\nHeadline result is ' + p.metrics.join(', ') + '.');
    out.push('\n\nWritten with ' + p.authors.replace(/A\. Saini,?\s*/, '').replace(/,\s*$/, '') + '.\n');
    if (p.url && p.url.charAt(0) !== '#') out.push(L('Read the paper →', p.url));
    return out;
  }
  function themeAnswer(t) {
    var list = pubs.filter(function (p) { return p.t === t; });
    var out = [THEMES[t].long + ' (' + list.length + ' paper' + (list.length === 1 ? '' : 's') + ')\n'];
    list.forEach(function (p) { out.push('\n• ' + p.title); });
    out.push('\n\nAsk me about any of them by name or keyword.');
    return out;
  }

  var newest = pubs.filter(function (p) { return p.isNew; })[0] || pubs[0];
  var upcoming = reviews.map(function (li) { return { title: $('.rv-t', li).textContent.trim(), status: li.getAttribute('data-short') || 'coming soon' }; });

  var INTENTS = [
    { words: ['hi', 'hello', 'hey', 'hiya', 'yo', 'namaste', 'sup'], reply: function () {
      return ['Hi! I’m pixel Agampreet. Ask me about any paper on this page, my research themes, Symbianthro Labs, or how to get in touch.'];
    } },
    { words: ['research', 'focus', 'area', 'areas', 'interests', 'interest', 'field', 'study', 'studies', 'specialise', 'specialize', 'about'], reply: function () {
      return ['I work in affective computing and emotion modelling, studying how emotion is expressed in language, how it’s represented inside models, and how it shifts from one state to the next. The same toolkit carries into financial forecasting and clinical imaging, always with a push for models that can explain themselves.\n\nMy themes are ' + THEMES.map(function (t) { return t.name; }).join(', ') + '.'];
    } },
    { words: ['newest', 'latest', 'recent', 'new', 'emnlp', 'acl', 'trajectory', 'trajectories'], reply: function () {
      return ['My newest one is\n\n'].concat(paperAnswer(newest));
    } },
    { words: ['how', 'many', 'count', 'number', 'total', 'publications', 'published'], need: ['many', 'count', 'number', 'total'], reply: function () {
      return [pubs.length + ' published papers across ' + THEMES.length + ' themes, plus ' + reviews.length + ' upcoming ones. My publishers so far are IEEE, Springer, NeurIPS, ACL, ASH and ASCO.'];
    } },
    { words: ['review', 'reviewing', 'submitted', 'submission', 'pending', 'upcoming', 'progress', 'accepted', 'forthcoming', 'soon', 'presented', 'churn', 'business', 'retail', 'agent', 'upcon', 'summit', 'information', 'theory'], reply: function () {
      var out = ['I have ' + reviews.length + ' upcoming papers\n'];
      upcoming.forEach(function (u) { out.push('\n• ' + u.title + ', ' + u.status); });
      out.push('\n\nFull papers go up here as soon as they’re out.');
      return out;
    } },
    { words: ['symbianthro', 'lab', 'labs', 'founder', 'founded', 'startup', 'organisation', 'organization'], reply: function () {
      var out = ['I founded Symbianthro Labs to bridge the gap between students who want to do research and the mentors who can guide them. It grew out of mentoring 10+ undergraduate researchers across 8+ interdisciplinary projects.'];
      out.push(LAB_URL ? L('\n\nVisit Symbianthro Labs →', LAB_URL) : '\n\nThe lab’s website is coming soon!');
      return out;
    } },
    { words: ['mentor', 'mentoring', 'mentorship', 'students', 'student', 'guide', 'guidance', 'teach', 'teaching', 'join', 'undergrad', 'undergraduate'], reply: function () {
      return ['I’ve mentored 10+ undergraduate researchers in ML and NLP, from first idea to publication and conference submission, and coordinated 8+ interdisciplinary projects across academia and healthcare. That’s now growing into Symbianthro Labs. If you’re a student who wants to get into research, drop me an email at ', L(CONTACT_EMAIL, 'mailto:' + CONTACT_EMAIL)];
    } },
    { words: ['sentic', 'senticnet', 'ntu', 'nanyang', 'singapore', 'cambria', 'erik', 'internship', 'intern'], reply: function () {
      return ['Since Oct 2025 I’ve been a research intern with the Sentic team at NTU Singapore (SenticNet), working under Prof. Erik Cambria on NLP, sentiment analysis and affective computing, focusing on emotion modelling and the computational analysis of emotional and semantic information in language.'];
    } },
    { words: ['moleculyst', 'engineer', 'job', 'current', 'currently', 'agentic', 'agents', 'reasoning', 'linguistics', 'linguistic', 'ontology', 'semantics', 'morphology'], reply: function () {
      return ['Since Sep 2026 I’m an NLP Engineer (internship) at Moleculyst, working on LLM-based research problems like agentic systems, multi-step reasoning, and making model outputs more reliable and interpretable. I also bring in linguistic structure like ontology, semantics and morphology to make LLM systems more deterministic.'];
    } },
    { words: ['experience', 'resume', 'cv', 'background', 'career', 'worked', 'roles'], reply: function () {
      return ['Here’s my quest log\n\n• Founder, Symbianthro Labs (Nov 2026 – now)\n• Research Intern, Sentic Team @ NTU Singapore (Oct 2025 – now)\n• NLP Engineer, Moleculyst (Sep 2026 – now)\n• Research Mentor & Project Lead, UPES (Oct 2023 – Dec 2026)\n• ML & Data Science Intern, Groove Innovations (2025)\n\nThe full details are in the Experience section.'];
    } },
    { words: ['contact', 'email', 'mail', 'reach', 'collaborate', 'collaboration', 'hire', 'connect', 'linkedin', 'talk'], reply: function () {
      return ['The best way to reach me is ', L(CONTACT_EMAIL, 'mailto:' + CONTACT_EMAIL), '\n\nYou can also find me on ', L('LinkedIn', 'https://www.linkedin.com/in/agampreet-saini-99a529342/'), ', ', L('Google Scholar', SCHOLAR_URL), ' and ', L('Medium', MEDIUM_URL), '. Always happy to talk research or collaborations.'];
    } },
    { words: ['projects', 'project', 'github', 'code', 'built', 'build', 'repo', 'repos'], reply: function () {
      return ['A few things I’ve built\n\n• AurumPulse Insights, emotion-aware gold-price forecasting\n• Chef’s Code, a compiler that teaches C through cooking\n• iPredict, Apple stock forecasting\n\nMore on ', L('GitHub', 'https://github.com/Agampreet25'), '.'];
    } },
    { words: ['skills', 'tools', 'stack', 'python', 'pytorch', 'tensorflow', 'languages', 'frameworks', 'tech'], reply: function () {
      return ['Mostly Python with PyTorch, TensorFlow, Transformers and scikit-learn, plus NLTK and spaCy for NLP, Pandas and NumPy for data, and Docker and Git for workflow. On the methods side I work with explainable AI, domain adaptation, uncertainty quantification and time-series forecasting.'];
    } },
    { words: ['medium', 'blog', 'blogs', 'writing', 'articles', 'posts', 'write'], reply: function () {
      return ['I write on Medium too. You can read my posts ', L('here', MEDIUM_URL), '.'];
    } },
    { words: ['scholar', 'citations', 'cited', 'google'], reply: function () {
      return ['All my papers are on ', L('Google Scholar', SCHOLAR_URL), '.'];
    } },
    { words: ['who', 'bot', 'real', 'human', 'chatgpt', 'gpt', 'claude', 'robot'], need: ['bot', 'real', 'human', 'chatgpt', 'gpt', 'claude', 'who', 'robot'], reply: function () {
      return ['I’m a scripted guide, not a live AI. My answers are pre-written from the papers on this page, so I can’t make things up, but I also might not know everything yet. I’m still under development!'];
    } },
    { words: ['thanks', 'thank', 'thx', 'cool', 'nice', 'great', 'awesome'], reply: function () {
      return ['Anytime! Ask me something else or go explore the world map.'];
    } }
  ];

  // Extra search words per paper (beyond its own title + venue).
  var PAPER_TAGS = [
    ['emotion', 'latent', 'dynamics', 'trajectory', 'transitions', 'emnlp', 'acl', 'findings'],
    ['sentiment', 'transfer', 'domain', 'adaptation', 'wbige', 'bigru', 'tcss'],
    ['opinion', 'mining', 'tf-idf', 'scaling', 'ictacs'],
    ['gold', 'lstm', 'autoencoder', 'springer'],
    ['bitcoin', 'crypto', 'cryptocurrency', 'otcon'],
    ['apple', 'stock', 'stocks', 'icecet'],
    ['wavelet', 'gnn', 'graph', 'crypto', 'cryptocurrency', 'cicn'],
    ['leukocyte', 'smear', 'blood', 'hematology', 'gradcam', 'lime', 'ash', 'mobilenet'],
    ['pcos', 'ultrasound', 'pcause', 'densenet', 'gan'],
    ['sarcoma', 'metastasis', 'lung', 'mri', 'pet', 'asco', 'dropout', 'uncertainty'],
    ['spatial', 'transcriptomics', 'neurips', 'imageomics', 'scoping'],
    ['wellguide', 'biomedgpt', 'health', 'chatbot', 'assistant']
  ];
  pubs.forEach(function (p, i) {
    p.words = tokens(p.title + ' ' + p.venue).concat(PAPER_TAGS[i] || []);
  });

  function answer(q) {
    var qt = tokens(q);
    if (!qt.length) return ['Try asking about a paper, a topic like “emotion” or “forecasting”, or Symbianthro Labs.'];

    // 1) best matching paper
    var bestP = null, bestPS = 0;
    pubs.forEach(function (p) {
      var s = score(qt, p.words);
      if (s > bestPS) { bestPS = s; bestP = p; }
    });
    // 2) best intent
    var bestI = null, bestIS = 0;
    INTENTS.forEach(function (it) {
      if (it.need && !qt.some(function (q) { return it.need.indexOf(q) > -1; })) return;
      var s = score(qt, it.words);
      if (s > bestIS) { bestIS = s; bestI = it; }
    });
    // 3) theme listing ("financial papers", "anything on emotion?")
    var bestT = -1, bestTS = 0;
    THEMES.forEach(function (th, i) {
      var s = score(qt, th.words.concat([th.name.toLowerCase()]));
      if (s > bestTS) { bestTS = s; bestT = i; }
    });

    var wantsList = /\b(list|all|papers|publications|which|any)\b/i.test(q);
    if (bestTS > 0 && wantsList && bestPS < 3) return themeAnswer(bestT);
    if (bestPS >= 2 && bestPS >= bestIS) return paperAnswer(bestP);
    if (bestI && bestIS >= 1) return bestI.reply();
    if (bestPS >= 1) return paperAnswer(bestP);
    if (bestTS > 0) return themeAnswer(bestT);
    return ['Hmm, I don’t have an answer for that yet (I’m still learning!). Try one of the suggestions below, or email me directly at ', L(CONTACT_EMAIL, 'mailto:' + CONTACT_EMAIL)];
  }

  var chat = $('#chat'), log = $('#chatLog'), form = $('#chatForm'), input = $('#chatInput'), chipsEl = $('#chatChips');
  var CHIPS = ['What do you research?', 'What’s your newest paper?', 'Financial papers', 'Any explainable AI papers?', 'What is Symbianthro Labs?', 'Upcoming papers', 'How can I contact you?'];
  CHIPS.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = c;
    b.addEventListener('click', function () { ask(c); });
    chipsEl.appendChild(b);
  });

  function addMsg(who, parts) {
    var row = document.createElement('div');
    row.className = 'msg ' + who;
    if (who === 'bot') {
      var img = document.createElement('img');
      img.className = 'pixel';
      img.src = 'assets/avatar.png';
      img.alt = '';
      row.appendChild(img);
    }
    var b = document.createElement('div');
    b.className = 'b';
    (typeof parts === 'string' ? [parts] : parts).forEach(function (p) {
      if (typeof p === 'string') { b.appendChild(document.createTextNode(p)); return; }
      var a = document.createElement('a');
      a.textContent = p.text;
      a.href = p.href;
      if (/^https?:/.test(p.href)) { a.target = '_blank'; a.rel = 'noopener'; }
      b.appendChild(a);
    });
    row.appendChild(b);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  var busy = false;
  function ask(q) {
    q = (q || '').trim().slice(0, 200);
    if (!q || busy) return;
    busy = true;
    addMsg('user', q);
    var typing = addMsg('bot', '');
    typing.classList.add('typing');
    var tb = $('.b', typing);
    for (var i = 0; i < 3; i++) tb.appendChild(document.createElement('span'));
    setTimeout(function () {
      typing.remove();
      addMsg('bot', answer(q));
      busy = false;
    }, reduce ? 0 : 450 + Math.random() * 350);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value);
    input.value = '';
  });

  var greeted = false;
  function openChat() {
    chat.hidden = false;
    hideBubble();
    walking = false;
    walker.setAttribute('data-walk', '0');
    walker.style.visibility = 'hidden';
    if (!greeted) {
      greeted = true;
      addMsg('bot', ['Hi! I’m pixel Agampreet, your guide to this portfolio. Ask me about any of my ' + pubs.length + ' papers, my research themes, Symbianthro Labs, or how to reach me.']);
    }
    setTimeout(function () { input.focus(); }, 30);
  }
  function closeChat() {
    chat.hidden = true;
    walker.style.visibility = '';
    walking = !reduce;
    $('#avatarBtn').focus();
  }
  $('#chatClose').addEventListener('click', closeChat);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !chat.hidden && chat.contains(document.activeElement)) closeChat();
  });
  $$('[data-chat-open]').forEach(function (b) { b.addEventListener('click', openChat); });

  /* ---------- wandering avatar ---------- */
  var walker = $('#walker');
  var bubble = $('#bubble');
  var walking = false, sayTimer = null;
  var x = 40, dir = 1, pauseUntil = 0, last = 0;

  function hideBubble() { clearTimeout(sayTimer); bubble.hidden = true; }
  function speak(text, ms) {
    if (!chat.hidden) return;
    clearTimeout(sayTimer);
    bubble.textContent = text;
    bubble.hidden = false;
    walking = false;
    walker.setAttribute('data-walk', '0');
    sayTimer = setTimeout(function () {
      bubble.hidden = true;
      walking = !reduce;
    }, ms || 2600);
  }

  $('#avatarBtn').addEventListener('click', openChat);
  $$('[data-say]').forEach(function (a) {
    a.addEventListener('click', function () { speak(a.getAttribute('data-say')); });
  });

  function step(t) {
    requestAnimationFrame(step);
    if (!last) last = t;
    var dt = Math.min(50, t - last);
    last = t;
    if (!walking) return;
    if (t < pauseUntil) {
      if (walker.getAttribute('data-walk') !== '0') walker.setAttribute('data-walk', '0');
      return;
    }
    if (walker.getAttribute('data-walk') !== '1') walker.setAttribute('data-walk', '1');
    var maxX = window.innerWidth - 90;
    x += dir * dt * 0.07;
    if (x > maxX) { x = maxX; dir = -1; }
    if (x < 16) { x = 16; dir = 1; }
    if (Math.random() < 0.002) {
      pauseUntil = t + 1400 + Math.random() * 1800;
      if (Math.random() < 0.5) dir *= -1;
      // now and then, remind visitors she can answer questions
      if (Math.random() < 0.35) speak('Questions about my research? Click me!', 2800);
    }
    walker.style.left = Math.round(x / 2) * 2 + 'px'; // snap to the pixel grid
  }

  speak('Hi! Got a question about my research? Click me!', 3600);
  if (!reduce) requestAnimationFrame(step);
})();
