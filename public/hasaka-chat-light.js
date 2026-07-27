/**
 * Hasaka support widget — light theme
 * -----------------------------------
 * Matches the interface design: soft gradient ground, white pill bubbles,
 * purple gradient avatar, composer card with an emoji picker.
 *
 * Same socket protocol as the dark build — drop-in swap.
 *
 *   <script src="/hasaka-chat-light.js"
 *           data-server="wss://support.hasaka.io"
 *           data-name="Hasaka"
 *           data-role="Creative Director & Brand Architect"
 *           data-mode="inline"          <!-- inline | floating -->
 *           data-mount="#chat"          <!-- required when mode=inline -->
 *           defer></script>
 */
(function () {
  'use strict';

  var script = document.currentScript;
  var d = (script && script.dataset) || {};
  var cfg = {
    server: d.server || 'wss://support.hasaka.io',
    name: d.name || 'Hasaka',
    role: d.role || 'Creative Director & Brand Architect',
    mode: d.mode === 'inline' ? 'inline' : 'floating',
    mount: d.mount || null,
    greeting: (d.greeting || 'Hey there 👋|Hope you\'re doing well today.|How may I help you?').split('|'),
  };

  var STORE_KEY = 'hasaka.visitor';
  var visitorId;
  try {
    visitorId = localStorage.getItem(STORE_KEY);
    if (!visitorId) {
      visitorId = 'vis_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(STORE_KEY, visitorId);
    }
  } catch (e) {
    visitorId = 'vis_' + Math.random().toString(36).slice(2);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ------------------------------------------------------------------ mount

  var container;
  if (cfg.mode === 'inline') {
    container = cfg.mount ? document.querySelector(cfg.mount) : null;
    if (!container) {
      console.warn('[hasaka-chat] mount target not found:', cfg.mount);
      return;
    }
  } else {
    container = document.createElement('div');
    document.body.appendChild(container);
  }
  container.setAttribute('data-hasaka-chat', '');
  var root = container.attachShadow({ mode: 'open' });

  var EMOJI = ['😊', '👋', '🙌', '👍', '🎉', '🔥', '✨', '💜', '🙏', '😅', '🤝', '💡'];

  root.innerHTML = [
    '<style>',
    ':host{all:initial}',
    '*{box-sizing:border-box;margin:0;font-family:inherit}',

    '.wrap{',
    "  font-family:'Neue Haas Grotesk','Helvetica Now Text',-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;",
    '  color:#16151A;-webkit-font-smoothing:antialiased;',
    '  --accent-a:#6D5BD0;--accent-b:#8B6FE0;',
    '  --ground:linear-gradient(135deg,#F8F0EB 0%,#F1EDF3 46%,#E9E9F6 100%);',
    '  --shadow:0 8px 24px rgba(74,58,110,.10),0 1px 2px rgba(74,58,110,.06);',
    '}',

    cfg.mode === 'floating'
      ? '.wrap{position:fixed;right:24px;bottom:24px;z-index:2147483000}' +
        '@media (max-width:560px){.wrap{right:12px;left:12px;bottom:12px}}'
      : '.wrap{width:100%}',

    /* launcher (floating only) */
    '.launch{display:flex;align-items:center;gap:10px;margin-left:auto;padding:12px 20px 12px 14px;',
    '  background:#fff;border:0;border-radius:999px;box-shadow:var(--shadow);cursor:pointer;',
    '  font-size:14px;font-weight:500;color:#16151A;line-height:1;',
    '  transition:transform .25s cubic-bezier(.2,.7,.3,1),box-shadow .25s ease}',
    '.launch:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(74,58,110,.16)}',
    '.launch:focus-visible{outline:2px solid var(--accent-a);outline-offset:3px}',
    '.launch .av{width:26px;height:26px;border-radius:50%;flex:none;display:grid;place-items:center;',
    '  background:linear-gradient(140deg,var(--accent-a),var(--accent-b));color:#fff;',
    '  font-size:12px;font-weight:600}',
    '.wrap[data-open="1"] .launch{display:none}',

    /* panel */
    '.panel{background:var(--ground);border-radius:28px;padding:26px 24px 22px;',
    '  box-shadow:var(--shadow);display:flex;flex-direction:column}',
    cfg.mode === 'floating'
      ? '.panel{width:400px;max-width:100%;height:min(600px,76vh);display:none}' +
        '.wrap[data-open="1"] .panel{display:flex;animation:rise .34s cubic-bezier(.2,.7,.3,1)}' +
        '@media (max-width:560px){.panel{width:100%;height:min(600px,72vh);border-radius:22px;padding:20px 16px 16px}}'
      : '.panel{width:100%;min-height:420px}',
    '@keyframes rise{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}',

    /* header */
    '.head{display:flex;align-items:center;gap:14px;flex:none}',
    '.avatar{width:46px;height:46px;flex:none;border-radius:50%;display:grid;place-items:center;',
    '  background:linear-gradient(140deg,var(--accent-a),var(--accent-b));color:#fff;',
    '  font-size:18px;font-weight:600;letter-spacing:.01em}',
    '.who{flex:1;min-width:0;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}',
    '.who b{font-size:17px;font-weight:700;letter-spacing:-.01em}',
    '.who span{font-size:13.5px;color:#9A97A5;font-weight:400}',
    '.x{background:none;border:0;color:#9A97A5;cursor:pointer;font-size:22px;line-height:1;',
    '  padding:4px 6px;border-radius:8px;flex:none}',
    '.x:hover{color:#16151A}.x:focus-visible{outline:2px solid var(--accent-a);outline-offset:2px}',
    cfg.mode === 'inline' ? '.x{display:none}' : '',

    /* log */
    '.log{flex:1;overflow-y:auto;padding:22px 2px 8px;display:flex;flex-direction:column;',
    '  gap:12px;scrollbar-width:thin;scrollbar-color:rgba(74,58,110,.18) transparent}',
    '.log::-webkit-scrollbar{width:6px}',
    '.log::-webkit-scrollbar-thumb{background:rgba(74,58,110,.16);border-radius:3px}',

    '.msg{max-width:80%;font-size:16px;line-height:1.45;padding:13px 20px;border-radius:26px;',
    '  white-space:pre-wrap;word-break:break-word;box-shadow:var(--shadow);',
    '  animation:in .32s cubic-bezier(.2,.7,.3,1)}',
    '@keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '.msg.agent{align-self:flex-start;background:#fff;color:#16151A;border-bottom-left-radius:8px}',
    '.msg.visitor{align-self:flex-end;color:#fff;border-bottom-right-radius:8px;',
    '  background:linear-gradient(140deg,var(--accent-a),var(--accent-b));',
    '  box-shadow:0 8px 22px rgba(109,91,208,.28)}',
    '.msg.system{align-self:center;background:none;box-shadow:none;font-size:12px;',
    '  color:#9A97A5;padding:2px}',

    '.typing{align-self:flex-start;display:flex;gap:5px;background:#fff;padding:16px 20px;',
    '  border-radius:26px;border-bottom-left-radius:8px;box-shadow:var(--shadow)}',
    '.typing i{width:6px;height:6px;border-radius:50%;background:#B9B5C7;animation:blink 1.3s infinite}',
    '.typing i:nth-child(2){animation-delay:.18s}.typing i:nth-child(3){animation-delay:.36s}',
    '@keyframes blink{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}',

    /* composer */
    '.compose{flex:none;margin-top:14px;background:rgba(255,255,255,.55);border-radius:24px;',
    '  padding:18px 20px 14px;backdrop-filter:blur(8px)}',
    '.compose label{display:block;font-size:15px;font-weight:500;margin-bottom:12px}',
    '.box{background:#fff;border-radius:18px;padding:14px 18px;box-shadow:0 1px 2px rgba(74,58,110,.06)}',
    'textarea{width:100%;resize:none;background:none;border:0;color:#16151A;font-size:16px;',
    '  line-height:1.45;max-height:110px;font-family:inherit}',
    'textarea::placeholder{color:#B9B5C7}',
    'textarea:focus{outline:none}',
    '.bar{display:flex;align-items:center;justify-content:flex-end;gap:14px;margin-top:10px}',
    '.note{margin-right:auto;font-size:12px;color:#9A97A5}',
    '.send{background:none;border:0;cursor:pointer;font-size:15px;font-weight:600;color:#9A97A5;',
    '  display:flex;align-items:center;gap:7px;padding:4px 2px;border-radius:8px;transition:color .2s}',
    '.send[data-ready="1"]{color:var(--accent-a)}',
    '.send:focus-visible{outline:2px solid var(--accent-a);outline-offset:3px}',

    /* emoji */
    '.emoji-row{display:flex;justify-content:flex-end;margin-top:10px;position:relative}',
    '.emoji-btn{background:none;border:0;cursor:pointer;font-size:26px;line-height:1;padding:2px;',
    '  border-radius:10px;transition:transform .2s}',
    '.emoji-btn:hover{transform:scale(1.12)}',
    '.emoji-btn:focus-visible{outline:2px solid var(--accent-a);outline-offset:2px}',
    '.picker{position:absolute;right:0;bottom:42px;display:none;grid-template-columns:repeat(6,1fr);',
    '  gap:4px;background:#fff;border-radius:16px;padding:10px;box-shadow:var(--shadow);z-index:5}',
    '.picker[data-open="1"]{display:grid}',
    '.picker button{background:none;border:0;cursor:pointer;font-size:20px;padding:5px;border-radius:8px}',
    '.picker button:hover{background:#F3F0FA}',

    '@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}',
    '</style>',

    '<div class="wrap" data-open="' + (cfg.mode === 'inline' ? '1' : '0') + '">',
    '  <div class="panel" role="dialog" aria-label="Chat with ' + esc(cfg.name) + '">',
    '    <div class="head">',
    '      <div class="avatar">' + esc(cfg.name.charAt(0).toUpperCase()) + '</div>',
    '      <div class="who"><b>' + esc(cfg.name) + '</b><span>' + esc(cfg.role) + '</span></div>',
    '      <button class="x" aria-label="Close chat">&#215;</button>',
    '    </div>',
    '    <div class="log" id="log" role="log" aria-live="polite"></div>',
    '    <div class="compose">',
    '      <label for="input">Message</label>',
    '      <div class="box">',
    '        <textarea id="input" rows="1" placeholder="Type your message…" aria-label="Message"></textarea>',
    '      </div>',
    '      <div class="bar">',
    '        <span class="note" id="note"></span>',
    '        <button class="send" id="send">Send <span aria-hidden="true">&#8677;</span></button>',
    '      </div>',
    '      <div class="emoji-row">',
    '        <div class="picker" id="picker">',
    EMOJI.map(function (e) {
      return '<button type="button" aria-label="Insert ' + e + '">' + e + '</button>';
    }).join(''),
    '        </div>',
    '        <button class="emoji-btn" id="emoji" aria-label="Add an emoji">&#128522;</button>',
    '      </div>',
    '    </div>',
    '  </div>',
    cfg.mode === 'floating'
      ? '  <button class="launch" aria-label="Open chat">' +
        '<span class="av">' + esc(cfg.name.charAt(0).toUpperCase()) + '</span>' +
        'Message ' + esc(cfg.name) + '</button>'
      : '',
    '</div>',
  ].join('');

  // ------------------------------------------------------------------ refs

  var wrap = root.querySelector('.wrap');
  var log = root.getElementById('log');
  var note = root.getElementById('note');
  var input = root.getElementById('input');
  var sendBtn = root.getElementById('send');
  var picker = root.getElementById('picker');
  var seen = Object.create(null);
  var typingEl = null;
  var ws = null;
  var retry = 0;
  var greeted = false;

  function open() {
    wrap.dataset.open = '1';
    input.focus();
    scroll();
  }
  function close() {
    wrap.dataset.open = '0';
  }

  var launcher = root.querySelector('.launch');
  if (launcher) launcher.addEventListener('click', open);
  root.querySelector('.x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (picker.dataset.open === '1') picker.dataset.open = '0';
      else if (cfg.mode === 'floating' && wrap.dataset.open === '1') close();
    }
  });

  function scroll() {
    log.scrollTop = log.scrollHeight;
  }

  function render(m) {
    if (m.id && seen[m.id]) return;
    if (m.id) seen[m.id] = 1;
    clearTyping();
    var el = document.createElement('div');
    el.className = 'msg ' + m.author;
    el.textContent = m.body;
    log.appendChild(el);
    scroll();
  }

  function showTyping() {
    if (typingEl) return;
    typingEl = document.createElement('div');
    typingEl.className = 'typing';
    typingEl.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(typingEl);
    scroll();
    setTimeout(clearTyping, 6000);
  }
  function clearTyping() {
    if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  /** Greeting lines land one after another, the way a person types them. */
  function greet(lines, index) {
    if (index >= lines.length) return;
    render({ author: 'agent', body: lines[index] });
    setTimeout(function () {
      greet(lines, index + 1);
    }, 520);
  }

  // ------------------------------------------------------------------ socket

  function connect() {
    var url =
      cfg.server.replace(/\/$/, '') +
      '/ws?role=visitor&visitorId=' + encodeURIComponent(visitorId) +
      '&page=' + encodeURIComponent(location.href) +
      '&locale=' + encodeURIComponent(navigator.language || '');

    try {
      ws = new WebSocket(url);
    } catch (e) {
      return schedule();
    }

    ws.onopen = function () {
      retry = 0;
      note.textContent = '';
    };

    ws.onmessage = function (ev) {
      var msg;
      try {
        msg = JSON.parse(ev.data);
      } catch (e) {
        return;
      }

      if (msg.type === 'session') {
        log.innerHTML = '';
        seen = Object.create(null);
        (msg.messages || []).forEach(render);
        if (!msg.messages.length && !greeted) {
          greeted = true;
          greet(cfg.greeting, 0);
        }
      }
      if (msg.type === 'message') render(msg.message);
      if (msg.type === 'typing' && msg.from === 'agent') showTyping();
    };

    ws.onclose = schedule;
    ws.onerror = function () {
      try { ws.close(); } catch (e) {}
    };
  }

  function schedule() {
    retry += 1;
    note.textContent = retry > 2 ? 'Reconnecting…' : '';
    setTimeout(connect, Math.min(1000 * Math.pow(2, retry), 20000));
  }

  // ------------------------------------------------------------------ input

  var lastTyping = 0;

  function refreshSendState() {
    sendBtn.dataset.ready = input.value.trim() ? '1' : '0';
  }

  function sendMessage() {
    var body = input.value.trim();
    if (!body) return;
    if (!ws || ws.readyState !== 1) {
      note.textContent = 'Not connected — try again in a moment.';
      return;
    }
    ws.send(JSON.stringify({ type: 'message', body: body }));
    input.value = '';
    input.style.height = 'auto';
    refreshSendState();
  }

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  input.addEventListener('input', function () {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 110) + 'px';
    refreshSendState();
    var t = Date.now();
    if (ws && ws.readyState === 1 && t - lastTyping > 2000) {
      lastTyping = t;
      ws.send(JSON.stringify({ type: 'typing' }));
    }
  });

  root.getElementById('emoji').addEventListener('click', function (e) {
    e.stopPropagation();
    picker.dataset.open = picker.dataset.open === '1' ? '0' : '1';
  });

  picker.addEventListener('click', function (e) {
    if (e.target.tagName !== 'BUTTON') return;
    input.value += e.target.textContent;
    picker.dataset.open = '0';
    input.focus();
    refreshSendState();
  });

  document.addEventListener('click', function () {
    picker.dataset.open = '0';
  });

  window.HasakaChat = {
    open: open,
    close: close,
    identify: function (who) {
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'identify', name: who.name, email: who.email }));
      }
    },
  };

  connect();
})();
