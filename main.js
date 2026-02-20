/* ============================================================
   PIXEL ARCADE — Ultra Edition
   main.js — All Game Logic
   ============================================================ */

'use strict';

// ============================================================
// BACKGROUND PARTICLE CANVAS
// ============================================================
(function initBg() {
  const cv  = document.getElementById('bgCanvas');
  const ctx = cv.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
  }

  function init() {
    pts = [];
    const n = Math.floor((W * H) / 16000);
    for (let i = 0; i < n; i++) {
      pts.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r:  Math.random() * 1.5 + 0.3,
        a:  Math.random() * 0.6 + 0.1,
        hue: Math.random() > 0.5 ? 150 : (Math.random() > 0.5 ? 200 : 330),
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.a * 0.3})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); init(); });
  resize(); init(); draw();
})();

// ============================================================
// GLOBAL STATE
// ============================================================
let totalScore = 0;
const scoreValueEl = document.getElementById('scoreValue');

function addScore(n) {
  totalScore += n;
  scoreValueEl.textContent = totalScore.toLocaleString();
  scoreValueEl.classList.remove('bump');
  void scoreValueEl.offsetWidth; // reflow
  scoreValueEl.classList.add('bump');
  setTimeout(() => scoreValueEl.classList.remove('bump'), 300);
}

const GAMES = [
  { id:'snake',    name:'Snake',        icon:'🐍', color:'#00ff88', badge:'CLASSIC',  desc:'Eat food, grow longer, dodge the walls. How long can you survive?' },
  { id:'memory',   name:'Memory Match', icon:'🧠', color:'#ff0066', badge:'BRAIN',    desc:'Flip cards, find 12 pairs. Train that photographic memory!' },
  { id:'reaction', name:'Reaction',     icon:'⚡', color:'#ffaa00', badge:'REFLEX',   desc:'Wait for green, click instantly. Sub-200ms is superhuman territory.' },
  { id:'number',   name:'Guesser',      icon:'🎯', color:'#00aaff', badge:'LOGIC',    desc:'Find the secret number 1–100. Use the heat bar as your guide.' },
  { id:'whack',    name:'Whack-a-Mole', icon:'🔨', color:'#aa00ff', badge:'ACTION',   desc:'Smash every mole before they vanish. Speed ramps up over 30 seconds!' },
  { id:'typing',   name:'Speed Typing', icon:'⌨️', color:'#00ffee', badge:'SKILL',    desc:'Type the phrase perfectly as fast as you can. WPM challenge!' },
  { id:'breakout', name:'Breakout',     icon:'🧱', color:'#ff6600', badge:'ARCADE',   desc:'Classic brick-breaker with mouse, arrow keys, or on-screen buttons.' },
];

const app = document.getElementById('app');
let stopFns = [];

function stopAllGames() {
  stopFns.forEach(fn => fn());
  stopFns = [];
}

// ============================================================
// RENDER MENU
// ============================================================
function renderMenu() {
  stopAllGames();
  app.innerHTML = `
    <div class="section-eyebrow">
      <span class="section-eyebrow-text">Choose Your Game</span>
      <div class="section-eyebrow-line"></div>
    </div>
    <div class="game-grid" id="gameGrid"></div>
  `;
  const grid = document.getElementById('gameGrid');
  GAMES.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.style.setProperty('--c', g.color);
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Play ${g.name}`);
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <div class="card-top">
        <div class="game-icon-wrap">${g.icon}</div>
        <span class="card-badge">${g.badge}</span>
      </div>
      <h2 class="card-name">${g.name}</h2>
      <p class="card-desc">${g.desc}</p>
      <button class="play-btn" aria-label="Play ${g.name}">Play Now →</button>
    `;
    card.querySelector('.play-btn').addEventListener('click', e => { e.stopPropagation(); loadGame(g.id); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') loadGame(g.id); });
    grid.appendChild(card);
  });
}

// ============================================================
// LOAD GAME
// ============================================================
function loadGame(id) {
  stopAllGames();
  app.innerHTML = `
    <button class="back-btn" id="backBtn" aria-label="Back to arcade menu">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Back to Arcade
    </button>
    <div id="gameMount"></div>
  `;
  document.getElementById('backBtn').addEventListener('click', renderMenu);
  const mount = document.getElementById('gameMount');
  const runners = { snake, memory, reaction, number, whack, typing, breakout };
  runners[id]?.(mount);
}

// ============================================================
// HELPERS
// ============================================================
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// ============================================================
// GAME: SNAKE
// ============================================================
function snake(mount) {
  const GS = 20;
  const TS = clamp(Math.floor((Math.min(window.innerWidth - 52, 480)) / GS), 16, 22);
  const W = GS * TS, H = GS * TS;

  mount.innerHTML = `
    <div class="game-container">
      <div class="game-header">
        <h3 class="game-title">🐍 Snake</h3>
        <div class="score-pills">
          <span class="score-pill" id="snakeScore">SCORE: 0</span>
          <span class="score-pill" id="snakeBest">BEST: 0</span>
        </div>
      </div>
      <div class="canvas-wrap">
        <canvas id="snakeCanvas" class="game-canvas" width="${W}" height="${H}" aria-label="Snake game board"></canvas>
      </div>
      <div class="touch-controls" role="group" aria-label="Direction controls">
        <div class="touch-spacer"></div>
        <button class="touch-btn" id="tUp"   aria-label="Up">▲</button>
        <div class="touch-spacer"></div>
        <button class="touch-btn" id="tLeft" aria-label="Left">◀</button>
        <button class="touch-btn" id="tDown" aria-label="Down">▼</button>
        <button class="touch-btn" id="tRight" aria-label="Right">▶</button>
      </div>
      <div class="flex-center mt-md">
        <button class="btn btn--primary" id="snakeStart">▶ Start Game</button>
      </div>
      <p class="controls-info">Arrow keys or d-pad to move</p>
      <div id="snakeOver" style="display:none" class="game-over">
        <h3 class="game-over__title">💀 Game Over!</h3>
        <p class="game-over__sub" id="snakeOverSub"></p>
        <div class="game-over__actions">
          <button class="btn btn--primary" id="snakeRestart">Play Again</button>
        </div>
      </div>
    </div>
  `;

  const cv   = document.getElementById('snakeCanvas');
  const ctx  = cv.getContext('2d');
  let snake_body, dir, nextDir, food, score, best = 0, loop = null, running = false;

  function start() {
    document.getElementById('snakeOver').style.display = 'none';
    snake_body = [{ x: 10, y: 10 }];
    dir  = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    food  = spawnFood();
    score = 0;
    running = true;
    updateUI();
    clearInterval(loop);
    loop = setInterval(tick, 140);
  }

  function spawnFood() {
    let f;
    do { f = { x: Math.floor(Math.random() * GS), y: Math.floor(Math.random() * GS) }; }
    while (snake_body.some(s => s.x === f.x && s.y === f.y));
    return f;
  }

  function tick() {
    dir = { ...nextDir };
    const head = { x: snake_body[0].x + dir.x, y: snake_body[0].y + dir.y };

    if (head.x < 0 || head.x >= GS || head.y < 0 || head.y >= GS ||
        snake_body.some(s => s.x === head.x && s.y === head.y)) {
      clearInterval(loop);
      running = false;
      if (score > best) best = score;
      document.getElementById('snakeBest').textContent = `BEST: ${best}`;
      document.getElementById('snakeOverSub').textContent = `Final Score: ${score}`;
      document.getElementById('snakeOver').style.display = 'block';
      return;
    }

    snake_body.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10; addScore(10); food = spawnFood();
    } else {
      snake_body.pop();
    }
    updateUI(); draw();
  }

  function updateUI() {
    document.getElementById('snakeScore').textContent = `SCORE: ${score}`;
  }

  function draw() {
    // Background
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GS; i++) {
      ctx.beginPath(); ctx.moveTo(i * TS, 0);    ctx.lineTo(i * TS, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * TS);    ctx.lineTo(W, i * TS); ctx.stroke();
    }

    // Food glow
    ctx.shadowColor = '#ff0066'; ctx.shadowBlur = 14;
    ctx.fillStyle = '#ff0066';
    ctx.fillRect(food.x * TS + 2, food.y * TS + 2, TS - 4, TS - 4);
    ctx.shadowBlur = 0;

    // Snake
    snake_body.forEach((s, i) => {
      const t = 1 - (i / snake_body.length) * 0.55;
      if (i === 0) { ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 10; }
      ctx.fillStyle = i === 0 ? `rgba(0,255,136,${t})` : `rgba(0,200,100,${t})`;
      ctx.fillRect(s.x * TS + 1, s.y * TS + 1, TS - 2, TS - 2);
      ctx.shadowBlur = 0;
    });
  }

  function setDir(d) {
    if (!running) return;
    if (d.x !== 0 && dir.x !== 0) return;
    if (d.y !== 0 && dir.y !== 0) return;
    nextDir = d;
  }

  const dirMap = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0} };
  const onKey = e => { if (dirMap[e.key]) { e.preventDefault(); setDir(dirMap[e.key]); } };

  window.addEventListener('keydown', onKey);
  document.getElementById('tUp').addEventListener('click',    () => setDir({ x: 0, y: -1 }));
  document.getElementById('tDown').addEventListener('click',  () => setDir({ x: 0, y:  1 }));
  document.getElementById('tLeft').addEventListener('click',  () => setDir({ x:-1, y:  0 }));
  document.getElementById('tRight').addEventListener('click', () => setDir({ x: 1, y:  0 }));
  document.getElementById('snakeStart').addEventListener('click', start);
  document.getElementById('snakeRestart').addEventListener('click', start);

  // Initial draw
  ctx.fillStyle = '#020408'; ctx.fillRect(0, 0, W, H);

  stopFns.push(() => { clearInterval(loop); window.removeEventListener('keydown', onKey); running = false; });
}

// ============================================================
// GAME: MEMORY MATCH
// ============================================================
function memory(mount) {
  const EMOJIS = ['🎮','🎯','🎲','🎪','🎨','🎭','🚀','🌟','💎','🔥','⚡','🎸'];

  mount.innerHTML = `
    <div class="game-container">
      <div class="game-header">
        <h3 class="game-title">🧠 Memory Match</h3>
        <div class="score-pills">
          <span class="score-pill" id="memMoves">MOVES: 0</span>
          <span class="score-pill" id="memPairs">PAIRS: 0/12</span>
        </div>
      </div>
      <div class="memory-grid" id="memGrid" role="grid" aria-label="Memory card grid"></div>
      <div class="flex-center mt-md">
        <button class="btn btn--primary" id="memStart">▶ New Game</button>
      </div>
      <div id="memOver" style="display:none" class="game-over">
        <h3 class="game-over__title">🎉 Brilliant!</h3>
        <p class="game-over__sub" id="memOverSub"></p>
        <div class="game-over__actions">
          <button class="btn btn--primary" id="memRestart">Play Again</button>
        </div>
      </div>
    </div>
  `;

  let cards = [], flipped = [], matched = [], moves = 0, locked = false;

  function init() {
    cards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    flipped = []; matched = []; moves = 0; locked = false;
    document.getElementById('memOver').style.display = 'none';
    renderGrid(); updateUI();
  }

  function renderGrid() {
    const grid = document.getElementById('memGrid');
    grid.innerHTML = '';
    cards.forEach((c, i) => {
      const div = document.createElement('div');
      div.className = `memory-card${c.flipped || c.matched ? ' flipped' : ''}${c.matched ? ' matched' : ''}`;
      div.textContent = c.flipped || c.matched ? c.emoji : '';
      div.setAttribute('role', 'button');
      div.setAttribute('aria-label', c.flipped || c.matched ? c.emoji : 'Hidden card');
      div.setAttribute('tabindex', '0');
      div.addEventListener('click', () => flip(i));
      div.addEventListener('keydown', e => { if (e.key === 'Enter') flip(i); });
      grid.appendChild(div);
    });
  }

  function flip(i) {
    if (locked || cards[i].flipped || cards[i].matched || flipped.length === 2) return;
    cards[i].flipped = true;
    flipped.push(i);
    renderGrid();

    if (flipped.length === 2) {
      moves++; updateUI(); locked = true;
      const [a, b] = flipped;
      if (cards[a].emoji === cards[b].emoji) {
        cards[a].matched = cards[b].matched = true;
        matched.push(a, b); flipped = []; locked = false;
        addScore(50); renderGrid(); updateUI();
        if (matched.length === cards.length) {
          document.getElementById('memOverSub').textContent = `Finished in ${moves} moves!`;
          document.getElementById('memOver').style.display = 'block';
        }
      } else {
        // Flash wrong
        const gridEl = document.getElementById('memGrid');
        [a, b].forEach(idx => gridEl.children[idx]?.classList.add('wrong'));
        setTimeout(() => {
          cards[a].flipped = cards[b].flipped = false;
          flipped = []; locked = false;
          renderGrid();
        }, 950);
      }
    }
  }

  function updateUI() {
    document.getElementById('memMoves').textContent = `MOVES: ${moves}`;
    document.getElementById('memPairs').textContent = `PAIRS: ${matched.length / 2}/12`;
  }

  document.getElementById('memStart').addEventListener('click', init);
  mount.addEventListener('click', e => { if (e.target.id === 'memRestart') init(); });
  init();
}

// ============================================================
// GAME: REACTION TIME
// ============================================================
function reaction(mount) {
  mount.innerHTML = `
    <div class="game-container">
      <div class="game-header">
        <h3 class="game-title">⚡ Reaction Time</h3>
        <div class="score-pills">
          <span class="score-pill" id="reacBest">BEST: —</span>
          <span class="score-pill" id="reacAvg">AVG: —</span>
        </div>
      </div>
      <div class="reaction-box waiting" id="reacBox" role="button" tabindex="0" aria-live="polite">
        <p>Tap to Start</p>
      </div>
      <p class="controls-info">Click / tap when the box turns GREEN</p>
    </div>
  `;

  let state = 'idle', t0 = 0, best = null, times = [], timer = null;
  const box = document.getElementById('reacBox');

  function setState(s) {
    state = s;
    box.className = `reaction-box ${s}`;
    if (s === 'idle')   box.innerHTML = '<p>Tap to Start</p>';
    if (s === 'ready')  box.innerHTML = '<p>Wait for green…</p>';
    if (s === 'go')     { box.innerHTML = '<p>CLICK NOW!</p>'; t0 = Date.now(); }
    if (s === 'early')  box.innerHTML = '<p style="color:var(--neon-pink);font-family:var(--font-display);">Too Early! 😵</p>';
  }

  function handleClick() {
    if (state === 'idle' || state === 'result' || state === 'early') {
      clearTimeout(timer);
      setState('ready');
      timer = setTimeout(() => setState('go'), 1500 + Math.random() * 3500);
    } else if (state === 'ready') {
      clearTimeout(timer);
      setState('early');
      setTimeout(() => setState('idle'), 1200);
    } else if (state === 'go') {
      const rt = Date.now() - t0;
      times.push(rt);
      if (!best || rt < best) best = rt;
      const avg = Math.round(times.reduce((a, b) => a + b) / times.length);
      document.getElementById('reacBest').textContent = `BEST: ${best}ms`;
      document.getElementById('reacAvg').textContent  = `AVG: ${avg}ms`;
      const grade =
        rt < 150 ? '🏆 Superhuman!'  :
        rt < 200 ? '⚡ Elite!'       :
        rt < 250 ? '💪 Great!'       :
        rt < 350 ? '👍 Good'         :
        rt < 500 ? '😐 Average'      : '🐢 Slow…';
      box.className = 'reaction-box result';
      box.innerHTML = `
        <span class="reaction-result">${rt}ms</span>
        <span class="reaction-grade">${grade}</span>
        <span class="reaction-sub">Tap to play again</span>
      `;
      state = 'result';
      addScore(Math.max(0, 500 - rt));
    }
  }

  box.addEventListener('click', handleClick);
  box.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handleClick(); });
  stopFns.push(() => clearTimeout(timer));
}

// ============================================================
// GAME: NUMBER GUESSER
// ============================================================
function number(mount) {
  const MAX_ATTEMPTS = 10;

  mount.innerHTML = `
    <div class="game-container">
      <div class="game-header">
        <h3 class="game-title">🎯 Number Guesser</h3>
        <div class="score-pills">
          <span class="score-pill" id="numAttempts">ATTEMPTS: 0/${MAX_ATTEMPTS}</span>
        </div>
      </div>
      <div class="number-game">
        <div class="hint-bar-wrap" aria-label="Guess position indicator">
          <div class="hint-bar" id="hintBar" style="width:50%"></div>
        </div>
        <div class="attempt-track" id="attemptTrack" aria-label="Attempt history"></div>
        <p class="game-message" id="numMsg">Press Start to begin!</p>
        <div class="input-group" id="numInputGroup" style="display:none">
          <input type="number" class="game-input" id="numInput" min="1" max="100" placeholder="1 – 100" aria-label="Number guess">
          <button class="btn btn--primary" id="numGuess">Guess →</button>
        </div>
        <div class="flex-center mt-md">
          <button class="btn btn--primary" id="numStart">▶ New Game</button>
        </div>
      </div>
      <div id="numOver" style="display:none" class="game-over">
        <h3 class="game-over__title" id="numOverTitle">🎉 Correct!</h3>
        <p class="game-over__sub"  id="numOverSub"></p>
        <div class="game-over__actions">
          <button class="btn btn--primary" id="numRestart">Play Again</button>
        </div>
      </div>
    </div>
  `;

  let target, attempts;

  function renderAttemptTrack() {
    const track = document.getElementById('attemptTrack');
    track.innerHTML = '';
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const dot = document.createElement('div');
      dot.className = 'attempt-dot' + (i < attempts ? ' used' : '');
      track.appendChild(dot);
    }
  }

  function startGame() {
    target   = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    document.getElementById('numOver').style.display        = 'none';
    document.getElementById('numInputGroup').style.display  = 'flex';
    document.getElementById('numMsg').textContent           = 'Guess a number between 1 and 100!';
    document.getElementById('numMsg').style.color           = 'var(--neon-green)';
    document.getElementById('numInput').value               = '';
    document.getElementById('hintBar').style.width          = '50%';
    document.getElementById('hintBar').style.background     = 'var(--neon-green)';
    updateUI(); renderAttemptTrack();
  }

  function updateUI() {
    document.getElementById('numAttempts').textContent = `ATTEMPTS: ${attempts}/${MAX_ATTEMPTS}`;
  }

  function doGuess() {
    const n = parseInt(document.getElementById('numInput').value);
    const msg = document.getElementById('numMsg');
    if (isNaN(n) || n < 1 || n > 100) { msg.textContent = 'Enter a number between 1 and 100!'; return; }
    attempts++;
    document.getElementById('numInput').value = '';
    updateUI(); renderAttemptTrack();

    const bar = document.getElementById('hintBar');
    bar.style.width = (n / 100 * 100) + '%';

    if (n === target) {
      const pts = Math.max(10, (MAX_ATTEMPTS - attempts + 1) * 20);
      addScore(pts);
      document.getElementById('numOver').style.display = 'block';
      document.getElementById('numInputGroup').style.display = 'none';
      document.getElementById('numOverTitle').textContent = attempts === 1 ? '🔥 FIRST TRY!' : '🎉 Correct!';
      document.getElementById('numOverSub').textContent   = `Found ${target} in ${attempts} attempt${attempts > 1 ? 's' : ''}! +${pts} pts`;
      // Mark last dot as win
      const dots = document.querySelectorAll('.attempt-dot');
      dots[attempts - 1]?.classList.add('win');
    } else if (attempts >= MAX_ATTEMPTS) {
      document.getElementById('numOver').style.display = 'block';
      document.getElementById('numInputGroup').style.display = 'none';
      document.getElementById('numOverTitle').textContent = '💀 Out of Tries!';
      document.getElementById('numOverSub').textContent   = `The number was ${target}. Better luck next time!`;
    } else if (n < target) {
      msg.textContent   = '📈 Higher! Guess bigger.';
      msg.style.color   = 'var(--neon-blue)';
      bar.style.background = 'var(--neon-blue)';
    } else {
      msg.textContent   = '📉 Lower! Guess smaller.';
      msg.style.color   = 'var(--neon-pink)';
      bar.style.background = 'var(--neon-pink)';
    }
  }

  document.getElementById('numStart').addEventListener('click', startGame);
  document.getElementById('numGuess').addEventListener('click', doGuess);
  document.getElementById('numInput').addEventListener('keydown', e => { if (e.key === 'Enter') doGuess(); });
  mount.addEventListener('click', e => { if (e.target.id === 'numRestart') startGame(); });
  renderAttemptTrack();
}

// ============================================================
// GAME: WHACK-A-MOLE
// ============================================================
function whack(mount) {
  const MOLES = ['🐭','🦔','🐿️','🐹','🦊'];

  mount.innerHTML = `
    <div class="game-container">
      <div class="game-header">
        <h3 class="game-title">🔨 Whack-a-Mole</h3>
        <div class="score-pills">
          <span class="score-pill" id="whackScore">SCORE: 0</span>
          <span class="score-pill" id="whackTime">TIME: 30</span>
        </div>
      </div>
      <div class="mole-timer-wrap"><div class="mole-timer-bar" id="moleTimerBar" style="width:100%"></div></div>
      <div class="mole-grid" id="moleGrid" role="grid" aria-label="Whack-a-mole grid"></div>
      <div class="flex-center mt-md">
        <button class="btn btn--primary" id="whackStart">▶ Start Game</button>
      </div>
      <div id="whackOver" style="display:none" class="game-over">
        <h3 class="game-over__title">⏰ Time's Up!</h3>
        <p class="game-over__sub" id="whackOverSub"></p>
        <div class="game-over__actions">
          <button class="btn btn--primary" id="whackRestart">Play Again</button>
        </div>
      </div>
    </div>
  `;

  let holes, score, timeLeft, gameTimer, moleTimers, running = false;

  function renderHoles() {
    const grid = document.getElementById('moleGrid');
    grid.innerHTML = '';
    holes.forEach((active, i) => {
      const h = document.createElement('div');
      h.className = `mole-hole${active ? ' active' : ''}`;
      h.setAttribute('role', active ? 'button' : 'presentation');
      h.setAttribute('aria-label', active ? `Whack mole ${i + 1}` : '');
      h.innerHTML = `<span class="mole-emoji">${MOLES[i % MOLES.length]}</span>`;
      if (active) {
        h.addEventListener('click', () => hit(i));
        h.addEventListener('touchstart', e => { e.preventDefault(); hit(i); }, { passive: false });
      }
      grid.appendChild(h);
    });
  }

  function hit(i) {
    if (!holes[i] || !running) return;
    holes[i] = false;
    score += 10; addScore(10);
    document.getElementById('whackScore').textContent = `SCORE: ${score}`;
    // Visual feedback
    const grid = document.getElementById('moleGrid');
    grid.children[i]?.classList.add('hit');
    renderHoles();
  }

  function popMole() {
    const free = holes.reduce((acc, h, i) => { if (!h) acc.push(i); return acc; }, []);
    if (!free.length || !running) return;
    const idx = free[Math.floor(Math.random() * free.length)];
    holes[idx] = true; renderHoles();
    const duration = Math.max(350, 900 - Math.floor((30 - timeLeft) * 18));
    const t = setTimeout(() => { if (holes[idx]) { holes[idx] = false; renderHoles(); } }, duration);
    moleTimers.push(t);
  }

  function startGame() {
    holes = Array(9).fill(false);
    score = 0; timeLeft = 30; running = true;
    document.getElementById('whackScore').textContent = 'SCORE: 0';
    document.getElementById('whackOver').style.display = 'none';
    clearInterval(gameTimer);
    moleTimers?.forEach(clearTimeout);
    moleTimers = [];
    renderHoles();

    // Scheduling moles
    let popDelay;
    function schedulePop() {
      const delay = Math.max(180, 650 - Math.floor((30 - timeLeft) * 16));
      popDelay = setTimeout(() => { popMole(); schedulePop(); }, delay);
      moleTimers.push(popDelay);
    }
    schedulePop();

    gameTimer = setInterval(() => {
      timeLeft--;
      document.getElementById('whackTime').textContent = `TIME: ${timeLeft}`;
      const bar = document.getElementById('moleTimerBar');
      if (bar) bar.style.width = (timeLeft / 30 * 100) + '%';
      if (timeLeft <= 5 && bar) bar.style.background = 'var(--neon-pink)';

      if (timeLeft <= 0) {
        clearInterval(gameTimer);
        moleTimers.forEach(clearTimeout);
        running = false;
        holes.fill(false); renderHoles();
        document.getElementById('whackOverSub').textContent = `Final Score: ${score} points!`;
        document.getElementById('whackOver').style.display = 'block';
      }
    }, 1000);
  }

  document.getElementById('whackStart').addEventListener('click', startGame);
  mount.addEventListener('click', e => { if (e.target.id === 'whackRestart') startGame(); });
  renderHoles();
  stopFns.push(() => { clearInterval(gameTimer); moleTimers?.forEach(clearTimeout); running = false; });
}

// ============================================================
// GAME: SPEED TYPING
// ============================================================
function typing(mount) {
  const PHRASES = [
    'the quick brown fox jumps over the lazy dog',
    'pack my box with five dozen liquor jugs',
    'how vexingly quick daft zebras jump',
    'sphinx of black quartz judge my vow',
    'the five boxing wizards jump quickly',
    'pixel arcade is the ultimate gaming destination',
    'practice makes perfect every single day',
    'gaming is not just a hobby it is a lifestyle',
    'a journey of a thousand miles begins with a single step',
    'the best way to predict the future is to create it',
  ];

  mount.innerHTML = `
    <div class="game-container">
      <div class="game-header">
        <h3 class="game-title">⌨️ Speed Typing</h3>
        <div class="score-pills">
          <span class="score-pill" id="typeWPM">WPM: 0</span>
          <span class="score-pill" id="typeAcc">ACC: 100%</span>
          <span class="score-pill" id="typeTime">TIME: 0s</span>
        </div>
      </div>
      <div class="typing-area">
        <div class="typing-progress-wrap"><div class="typing-progress-bar" id="typeProgress" style="width:0%"></div></div>
        <div class="typing-prompt" id="typePrompt" aria-live="polite"></div>
        <textarea class="typing-input-field" id="typeInput" rows="2" placeholder="Click here and start typing…" aria-label="Type the text above" disabled></textarea>
      </div>
      <div class="typing-stats" id="typeStats" style="display:none">
        <span class="typing-stat" id="statWPM"></span>
        <span class="typing-stat" id="statAcc"></span>
        <span class="typing-stat" id="statTime"></span>
      </div>
      <div class="flex-center mt-md">
        <button class="btn btn--primary" id="typeStart">▶ New Game</button>
      </div>
      <div id="typeOver" style="display:none" class="game-over">
        <h3 class="game-over__title">🏆 Done!</h3>
        <p class="game-over__sub" id="typeOverSub"></p>
        <div class="game-over__actions">
          <button class="btn btn--primary" id="typeRestart">Try Again</button>
          <button class="btn btn--ghost"   id="typeNewPhrase">New Phrase</button>
        </div>
      </div>
    </div>
  `;

  let phrase, startTime, elapsed, typingTimer;

  function renderPrompt(typed) {
    const el = document.getElementById('typePrompt');
    let html = '';
    for (let i = 0; i < phrase.length; i++) {
      if (i < typed.length) {
        const cls = typed[i] === phrase[i] ? 'char-correct' : 'char-wrong';
        html += `<span class="${cls}">${phrase[i]}</span>`;
      } else if (i === typed.length) {
        html += `<span class="char-current">${phrase[i]}</span>`;
      } else {
        html += `<span>${phrase[i]}</span>`;
      }
    }
    el.innerHTML = html;

    // Progress
    const pct = Math.round((typed.length / phrase.length) * 100);
    document.getElementById('typeProgress').style.width = pct + '%';
  }

  function calcStats(typed) {
    let correct = 0;
    for (let i = 0; i < Math.min(typed.length, phrase.length); i++)
      if (typed[i] === phrase[i]) correct++;
    const acc  = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
    const words = phrase.trim().split(' ').length;
    const wpm  = elapsed > 0 ? Math.round(words / (elapsed / 60)) : 0;
    return { acc, wpm };
  }

  function startGame(newPhrase = true) {
    if (newPhrase) phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    startTime = null; elapsed = 0;
    clearInterval(typingTimer);
    const input = document.getElementById('typeInput');
    input.value = ''; input.disabled = false;
    document.getElementById('typeOver').style.display  = 'none';
    document.getElementById('typeStats').style.display = 'none';
    document.getElementById('typeWPM').textContent  = 'WPM: 0';
    document.getElementById('typeAcc').textContent  = 'ACC: 100%';
    document.getElementById('typeTime').textContent = 'TIME: 0s';
    document.getElementById('typeProgress').style.width = '0%';
    renderPrompt('');
    setTimeout(() => input.focus(), 50);
  }

  document.getElementById('typeInput').addEventListener('input', e => {
    const typed = e.target.value;
    if (!startTime && typed.length > 0) {
      startTime = Date.now();
      typingTimer = setInterval(() => {
        elapsed = (Date.now() - startTime) / 1000;
        document.getElementById('typeTime').textContent = `TIME: ${Math.round(elapsed)}s`;
        const { wpm, acc } = calcStats(document.getElementById('typeInput').value);
        document.getElementById('typeWPM').textContent = `WPM: ${wpm}`;
        document.getElementById('typeAcc').textContent = `ACC: ${acc}%`;
      }, 250);
    }
    renderPrompt(typed);

    if (typed === phrase) {
      clearInterval(typingTimer);
      elapsed = (Date.now() - startTime) / 1000;
      const { wpm, acc } = calcStats(typed);
      const pts = Math.round(wpm * (acc / 100) * 2);
      addScore(pts);
      e.target.disabled = true;
      const grade =
        wpm > 100 ? '🔥 INSANE speed!'  :
        wpm > 80  ? '⚡ Lightning fast!' :
        wpm > 60  ? '💪 Great typing!'   :
        wpm > 40  ? '👍 Good pace!'      : '🐢 Keep practising!';
      document.getElementById('typeOverSub').textContent =
        `${wpm} WPM · ${acc}% accuracy · ${elapsed.toFixed(1)}s · ${grade}`;
      document.getElementById('typeOver').style.display = 'block';
    }
  });

  document.getElementById('typeStart').addEventListener('click', () => startGame(true));
  mount.addEventListener('click', e => {
    if (e.target.id === 'typeRestart')   startGame(false);
    if (e.target.id === 'typeNewPhrase') startGame(true);
  });

  startGame(true);
  stopFns.push(() => clearInterval(typingTimer));
}

// ============================================================
// GAME: BREAKOUT
// ============================================================
function breakout(mount) {
  const maxW = clamp(window.innerWidth - 52, 280, 520);
  const CW = maxW;
  const CH = Math.round(maxW * 0.68);

  const COLS = 8, ROWS = 5;
  const BW   = Math.floor((CW - 20) / COLS) - 2;
  const BH   = Math.floor(CH * 0.055);
  const PW   = Math.floor(CW * 0.18);
  const PH   = 9;
  const BR   = clamp(Math.floor(CW * 0.013), 5, 9);
  const ROW_COLORS = ['#ff0066','#ff6600','#ffaa00','#00ff88','#00aaff'];

  mount.innerHTML = `
    <div class="game-container">
      <div class="game-header">
        <h3 class="game-title">🧱 Breakout</h3>
        <div class="score-pills">
          <span class="score-pill" id="bkScore">SCORE: 0</span>
          <span class="score-pill" id="bkLives">LIVES: ♥♥♥</span>
          <span class="score-pill" id="bkLevel">LVL: 1</span>
        </div>
      </div>
      <div class="canvas-wrap">
        <canvas id="bkCanvas" class="breakout-canvas" width="${CW}" height="${CH}" aria-label="Breakout game"></canvas>
      </div>
      <div class="paddle-controls" role="group" aria-label="Paddle controls">
        <button class="touch-btn" id="bkLeft"  aria-label="Move paddle left">◀</button>
        <div class="touch-spacer"></div>
        <button class="touch-btn" id="bkRight" aria-label="Move paddle right">▶</button>
      </div>
      <div class="flex-center mt-md">
        <button class="btn btn--primary" id="bkStart">▶ Start Game</button>
      </div>
      <p class="controls-info">Mouse · Arrow keys · On-screen buttons</p>
      <div id="bkOver" style="display:none" class="game-over">
        <h3 class="game-over__title" id="bkOverTitle">💀 Game Over!</h3>
        <p class="game-over__sub"   id="bkOverSub"></p>
        <div class="game-over__actions">
          <button class="btn btn--primary" id="bkRestart">Play Again</button>
        </div>
      </div>
    </div>
  `;

  const cv  = document.getElementById('bkCanvas');
  const ctx = cv.getContext('2d');
  let px, py, bx, by, vx, vy, bricks, score, lives, level, running = false, rAF = null;
  let keys = {}, leftHeld = false, rightHeld = false;

  function makeBricks() {
    const bs = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        bs.push({ x: 10 + c * (BW + 2), y: 28 + r * (BH + 4), alive: true, color: ROW_COLORS[r] });
    return bs;
  }

  function initLevel() {
    px = (CW - PW) / 2;
    py = CH - PH - 12;
    bx = CW / 2;
    by = CH / 2;
    const spd  = (Math.min(CW, CH) * 0.0038 + level * 0.0005) * 60;
    const angle = (Math.random() * 60 + 60) * (Math.PI / 180);
    vx = spd * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
    vy = -spd * Math.sin(angle) * 0.85;
    bricks = makeBricks();
  }

  function init() {
    score = 0; lives = 3; level = 1;
    document.getElementById('bkOver').style.display = 'none';
    initLevel(); updateUI();
  }

  function updateUI() {
    document.getElementById('bkScore').textContent = `SCORE: ${score}`;
    document.getElementById('bkLives').textContent = `LIVES: ${'♥'.repeat(lives)}${'♡'.repeat(3 - lives)}`;
    document.getElementById('bkLevel').textContent = `LVL: ${level}`;
  }

  function tick() {
    if (!running) return;

    // Paddle
    const padSpd = clamp(CW * 0.012, 4, 14);
    if (keys.ArrowLeft  || leftHeld)  px = Math.max(0, px - padSpd);
    if (keys.ArrowRight || rightHeld) px = Math.min(CW - PW, px + padSpd);

    // Ball
    bx += vx; by += vy;

    // Wall collisions
    if (bx - BR < 0)  { bx = BR;      vx =  Math.abs(vx); }
    if (bx + BR > CW) { bx = CW - BR; vx = -Math.abs(vx); }
    if (by - BR < 0)  { by = BR;      vy =  Math.abs(vy); }

    // Paddle collision
    if (by + BR >= py && by - BR <= py + PH && bx >= px && bx <= px + PW) {
      vy = -Math.abs(vy);
      const offset = (bx - (px + PW / 2)) / (PW / 2);
      vx = offset * Math.abs(vy) * 1.5;
    }

    // Brick collisions
    let bricksBroken = 0;
    bricks.forEach(b => {
      if (!b.alive) return;
      if (bx + BR > b.x && bx - BR < b.x + BW && by + BR > b.y && by - BR < b.y + BH) {
        b.alive = false; vy = -vy; score += 10; bricksBroken++;
      }
    });
    if (bricksBroken) { addScore(bricksBroken * 10); updateUI(); }

    // Level clear
    if (bricks.every(b => !b.alive)) {
      level++;
      score += 100; addScore(100);
      updateUI();
      initLevel();
    }

    // Ball lost
    if (by - BR > CH) {
      lives--; updateUI();
      if (lives <= 0) {
        cancelAnimationFrame(rAF); running = false;
        document.getElementById('bkOverTitle').textContent = '💀 Game Over!';
        document.getElementById('bkOverSub').textContent   = `Final Score: ${score}`;
        document.getElementById('bkOver').style.display = 'block';
        return;
      }
      // Reset ball
      bx = CW / 2; by = CH / 2;
      const spd  = (Math.min(CW, CH) * 0.004 + level * 0.0005) * 60;
      const angle = (Math.random() * 60 + 60) * (Math.PI / 180);
      vx = spd * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
      vy = -spd * Math.sin(angle);
    }

    draw();
    rAF = requestAnimationFrame(tick);
  }

  function draw() {
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, CW, CH);

    // Bricks
    bricks.forEach(b => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color; ctx.shadowBlur = 6;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(b.x, b.y, BW, BH, 3);
      else ctx.rect(b.x, b.y, BW, BH);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Paddle
    ctx.fillStyle = '#00aaff';
    ctx.shadowColor = '#00aaff'; ctx.shadowBlur = 14;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, PW, PH, 4);
    else ctx.rect(px, py, PW, PH);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ball
    ctx.beginPath(); ctx.arc(bx, by, BR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function startGame() {
    init(); running = true;
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(tick);
  }

  const onKey = e => {
    keys[e.key] = e.type === 'keydown';
    if (['ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
  };

  cv.addEventListener('mousemove', e => {
    const r = cv.getBoundingClientRect();
    px = clamp(e.clientX - r.left - PW / 2, 0, CW - PW);
  });
  cv.addEventListener('touchmove', e => {
    e.preventDefault();
    const r = cv.getBoundingClientRect();
    px = clamp(e.touches[0].clientX - r.left - PW / 2, 0, CW - PW);
  }, { passive: false });

  document.getElementById('bkLeft').addEventListener('pointerdown',  () => leftHeld = true);
  document.getElementById('bkRight').addEventListener('pointerdown', () => rightHeld = true);
  document.addEventListener('pointerup', () => { leftHeld = false; rightHeld = false; });

  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup',   onKey);
  document.getElementById('bkStart').addEventListener('click', startGame);
  mount.addEventListener('click', e => { if (e.target.id === 'bkRestart') startGame(); });

  // Draw initial static frame
  init(); draw();

  stopFns.push(() => {
    cancelAnimationFrame(rAF);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('keyup',   onKey);
    running = false;
  });
}

// ============================================================
// BOOT
// ============================================================
renderMenu();
