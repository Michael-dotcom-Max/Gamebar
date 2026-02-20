import { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";

// ─────────────────────────────────────────────
// BACKGROUND PARTICLES
// ─────────────────────────────────────────────
const BgScene = () => {
  const cvRef = useRef(null);
  useEffect(() => {
    const cv = cvRef.current;
    const ctx = cv.getContext("2d");
    let W, H, pts = [], raf;
    const resize = () => {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
      pts = Array.from({ length: Math.floor((W * H) / 15000) }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
        r: Math.random() * 1.4 + .3, a: Math.random() * .5 + .1,
        hue: [150, 200, 330][Math.floor(Math.random() * 3)],
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,65%,${p.a * .28})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    window.addEventListener("resize", resize);
    resize(); draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <div className="bg-scene" aria-hidden="true">
      <canvas ref={cvRef} id="bgCanvas" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-dots" />
      <div className="bg-vignette" />
      <div className="scanlines" />
    </div>
  );
};

// ─────────────────────────────────────────────
// GLOBAL SCORE HOOK
// ─────────────────────────────────────────────
let _addScore = () => {};
const useGlobalScore = () => {
  const [score, setScore] = useState(0);
  const add = useCallback((n) => setScore(s => s + n), []);
  _addScore = add;
  return score;
};

// ─────────────────────────────────────────────
// GAMES METADATA
// ─────────────────────────────────────────────
const GAMES = [
  { id:"snake",    name:"Snake",        icon:"🐍", color:"#00ff88", badge:"CLASSIC", desc:"Eat food, grow longer, avoid walls. How long can you last?" },
  { id:"memory",   name:"Memory Match", icon:"🧠", color:"#ff0066", badge:"BRAIN",   desc:"Flip cards and find all 12 pairs. Pure memory skill!" },
  { id:"reaction", name:"Reaction",     icon:"⚡", color:"#ffaa00", badge:"REFLEX",  desc:"Wait for green then click instantly. Sub-200ms is superhuman." },
  { id:"number",   name:"Guesser",      icon:"🎯", color:"#00aaff", badge:"LOGIC",   desc:"Find the secret number 1–100. Use the heat bar as your guide." },
  { id:"whack",    name:"Whack-a-Mole", icon:"🔨", color:"#aa00ff", badge:"ACTION",  desc:"Smash every mole before it vanishes! Speed ramps every second." },
  { id:"typing",   name:"Speed Typing", icon:"⌨️", color:"#00ffee", badge:"SKILL",   desc:"Type the phrase perfectly as fast as you can. WPM challenge!" },
  { id:"breakout", name:"Breakout",     icon:"🧱", color:"#ff6600", badge:"ARCADE",  desc:"Classic brick-breaker. Mouse, arrow keys, or on-screen buttons." },
];

// ─────────────────────────────────────────────
// SNAKE GAME
// ─────────────────────────────────────────────
const SnakeGame = ({ onScore }) => {
  const cvRef   = useRef(null);
  const state   = useRef({ snake:[], dir:{x:1,y:0}, next:{x:1,y:0}, food:{x:15,y:15}, score:0, loop:null, running:false });
  const [score, setScore]       = useState(0);
  const [best,  setBest]        = useState(0);
  const [started, setStarted]   = useState(false);
  const [over,  setOver]        = useState(false);

  const GS = 20;
  const TS = Math.min(Math.floor((Math.min(typeof window !== "undefined" ? window.innerWidth - 52 : 480, 480)) / GS), 22);
  const W  = GS * TS, H = GS * TS;

  const spawnFood = () => {
    const s = state.current.snake;
    let f;
    do { f = { x: Math.floor(Math.random()*GS), y: Math.floor(Math.random()*GS) }; }
    while (s.some(p => p.x===f.x && p.y===f.y));
    return f;
  };

  const draw = useCallback(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const { snake, food } = state.current;
    ctx.fillStyle="#020408"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(255,255,255,.025)"; ctx.lineWidth=.5;
    for (let i=0;i<=GS;i++){
      ctx.beginPath();ctx.moveTo(i*TS,0);ctx.lineTo(i*TS,H);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,i*TS);ctx.lineTo(W,i*TS);ctx.stroke();
    }
    ctx.shadowColor="#ff0066"; ctx.shadowBlur=14;
    ctx.fillStyle="#ff0066";
    ctx.fillRect(food.x*TS+2,food.y*TS+2,TS-4,TS-4);
    ctx.shadowBlur=0;
    snake.forEach((s,i)=>{
      const a=1-(i/snake.length)*.55;
      if(i===0){ctx.shadowColor="#00ff88";ctx.shadowBlur=10;}
      ctx.fillStyle=i===0?`rgba(0,255,136,${a})`:`rgba(0,200,100,${a})`;
      ctx.fillRect(s.x*TS+1,s.y*TS+1,TS-2,TS-2);
      ctx.shadowBlur=0;
    });
  }, [W, H, GS, TS]);

  const startGame = useCallback(() => {
    const s = state.current;
    clearInterval(s.loop);
    s.snake=[{x:10,y:10}]; s.dir={x:1,y:0}; s.next={x:1,y:0};
    s.food=spawnFood(); s.score=0; s.running=true;
    setScore(0); setOver(false); setStarted(true);
    s.loop = setInterval(()=>{
      const {snake,dir,next,food} = s;
      s.dir={...next};
      const head={x:snake[0].x+s.dir.x, y:snake[0].y+s.dir.y};
      if(head.x<0||head.x>=GS||head.y<0||head.y>=GS||snake.some(p=>p.x===head.x&&p.y===head.y)){
        clearInterval(s.loop); s.running=false;
        setBest(b=>{ const nb=Math.max(b,s.score); return nb; });
        setOver(true); return;
      }
      snake.unshift(head);
      if(head.x===food.x&&head.y===food.y){
        s.score+=10; s.food=spawnFood();
        setScore(sc=>sc+10); onScore(10);
      } else { snake.pop(); }
      draw();
    }, 140);
  // eslint-disable-next-line
  }, [draw, onScore]);

  const setDir = useCallback((d) => {
    const s = state.current;
    if (!s.running) return;
    if (d.x!==0&&s.dir.x!==0) return;
    if (d.y!==0&&s.dir.y!==0) return;
    s.next=d;
  }, []);

  useEffect(()=>{
    const map={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}};
    const h=e=>{ if(map[e.key]){e.preventDefault();setDir(map[e.key]);} };
    window.addEventListener("keydown",h);
    const cv=cvRef.current; if(cv){const ctx=cv.getContext("2d");ctx.fillStyle="#020408";ctx.fillRect(0,0,W,H);}
    return ()=>{ window.removeEventListener("keydown",h); clearInterval(state.current.loop); };
  }, [setDir, W, H]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h3 className="game-title">🐍 Snake</h3>
        <div className="pills">
          <span className="pill">SCORE: {score}</span>
          <span className="pill">BEST: {best}</span>
        </div>
      </div>
      <div className="canvas-wrap">
        <canvas ref={cvRef} className="snake-canvas" width={W} height={H} />
      </div>
      <div className="dpad">
        <div className="dpad-blank dpad-btn"/>
        <button className="dpad-btn" onClick={()=>setDir({x:0,y:-1})}>▲</button>
        <div className="dpad-blank dpad-btn"/>
        <button className="dpad-btn" onClick={()=>setDir({x:-1,y:0})}>◀</button>
        <button className="dpad-btn" onClick={()=>setDir({x:0,y:1})}>▼</button>
        <button className="dpad-btn" onClick={()=>setDir({x:1,y:0})}>▶</button>
      </div>
      {!started && <div className="row" style={{marginTop:"1rem"}}><button className="btn btn-primary" onClick={startGame}>▶ Start Game</button></div>}
      {over && (
        <div className="game-over">
          <h3 className="go-title">💀 Game Over!</h3>
          <p className="go-sub">Final Score: {score}</p>
          <div className="go-btns"><button className="btn btn-primary" onClick={startGame}>Play Again</button></div>
        </div>
      )}
      <p className="ctrl-info">Arrow keys or d-pad to move</p>
    </div>
  );
};

// ─────────────────────────────────────────────
// MEMORY MATCH
// ─────────────────────────────────────────────
const EMOJIS = ["🎮","🎯","🎲","🎪","🎨","🎭","🚀","🌟","💎","🔥","⚡","🎸"];

const MemoryGame = ({ onScore }) => {
  const [cards,   setCards]   = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves,   setMoves]   = useState(0);
  const [wrong,   setWrong]   = useState([]);
  const [started, setStarted] = useState(false);
  const [won,     setWon]     = useState(false);
  const lockRef = useRef(false);

  const initGame = () => {
    const deck = [...EMOJIS,...EMOJIS].sort(()=>Math.random()-.5).map((e,i)=>({id:i,emoji:e}));
    setCards(deck); setFlipped([]); setMatched([]); setMoves(0); setWrong([]); setWon(false); setStarted(true);
    lockRef.current=false;
  };

  const flip = (i) => {
    if (lockRef.current || flipped.includes(i) || matched.includes(i) || flipped.length===2) return;
    const nf=[...flipped,i];
    setFlipped(nf);
    if(nf.length===2){
      setMoves(m=>m+1);
      lockRef.current=true;
      const [a,b]=nf;
      if(cards[a].emoji===cards[b].emoji){
        const nm=[...matched,a,b];
        setMatched(nm); setFlipped([]); lockRef.current=false;
        onScore(50);
        if(nm.length===cards.length) setWon(true);
      } else {
        setWrong([a,b]);
        setTimeout(()=>{ setFlipped([]); setWrong([]); lockRef.current=false; }, 950);
      }
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h3 className="game-title">🧠 Memory Match</h3>
        <div className="pills">
          <span className="pill">MOVES: {moves}</span>
          <span className="pill">PAIRS: {matched.length/2}/12</span>
        </div>
      </div>
      {started ? (
        <div className="mem-grid">
          {cards.map((c,i)=>{
            const isFlipped = flipped.includes(i)||matched.includes(i);
            const cls = ["mem-card",
              isFlipped?"flipped":"",
              matched.includes(i)?"matched":"",
              wrong.includes(i)?"wrong":"",
            ].filter(Boolean).join(" ");
            return (
              <div key={c.id} className={cls} onClick={()=>flip(i)} role="button" aria-label={isFlipped?c.emoji:"Hidden card"}>
                {isFlipped ? c.emoji : ""}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="row" style={{marginTop:"1rem"}}><button className="btn btn-primary" onClick={initGame}>▶ New Game</button></div>
      )}
      {started && !won && <div className="row"><button className="btn btn-ghost" onClick={initGame}>New Game</button></div>}
      {won && (
        <div className="game-over">
          <h3 className="go-title">🎉 Brilliant!</h3>
          <p className="go-sub">Finished in {moves} moves!</p>
          <div className="go-btns"><button className="btn btn-primary" onClick={initGame}>Play Again</button></div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// REACTION TIME
// ─────────────────────────────────────────────
const ReactionGame = ({ onScore }) => {
  const [state, setState_]  = useState("idle");
  const [rt,    setRt]      = useState(null);
  const [best,  setBest]    = useState(null);
  const [avg,   setAvg]     = useState(null);
  const t0Ref    = useRef(0);
  const timerRef = useRef(null);
  const timesRef = useRef([]);

  const grade = (ms) =>
    ms<150?"🏆 Superhuman!":ms<200?"⚡ Elite!":ms<250?"💪 Great!":ms<350?"👍 Good":ms<500?"😐 Average":"🐢 Slow…";

  const handle = () => {
    if (state==="idle"||state==="result"||state==="early") {
      clearTimeout(timerRef.current);
      setState_("ready");
      timerRef.current=setTimeout(()=>{ setState_("go"); t0Ref.current=Date.now(); }, 1500+Math.random()*3500);
    } else if (state==="ready") {
      clearTimeout(timerRef.current);
      setState_("early");
      setTimeout(()=>setState_("idle"),1200);
    } else if (state==="go") {
      const ms=Date.now()-t0Ref.current;
      timesRef.current.push(ms);
      const b=Math.min(...timesRef.current);
      const a=Math.round(timesRef.current.reduce((s,v)=>s+v)/timesRef.current.length);
      setBest(b); setAvg(a); setRt(ms); setState_("result");
      onScore(Math.max(0,500-ms));
    }
  };

  useEffect(()=>()=>clearTimeout(timerRef.current),[]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h3 className="game-title">⚡ Reaction Time</h3>
        <div className="pills">
          <span className="pill">BEST: {best!=null?`${best}ms`:"—"}</span>
          <span className="pill">AVG:  {avg!=null?`${avg}ms`:"—"}</span>
        </div>
      </div>
      <div className={`reaction-box ${state}`} onClick={handle} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter")handle();}}>
        {state==="idle"  && <p className="r-label">Tap to Start</p>}
        {state==="ready" && <p className="r-label">Wait for green…</p>}
        {state==="go"    && <p className="r-label" style={{fontFamily:"var(--ff-display)",color:"var(--green)",fontSize:"clamp(1rem,4vw,1.5rem)"}}>CLICK NOW!</p>}
        {state==="early" && <p className="r-label" style={{color:"var(--pink)"}}>Too Early! 😵</p>}
        {state==="result" && <>
          <span className="r-time">{rt}ms</span>
          <span className="r-grade">{grade(rt)}</span>
          <span className="r-again">Tap to play again</span>
        </>}
      </div>
      <p className="ctrl-info">Click / tap when the box turns green</p>
    </div>
  );
};

// ─────────────────────────────────────────────
// NUMBER GUESSER
// ─────────────────────────────────────────────
const MAX_AT = 10;
const NumberGame = ({ onScore }) => {
  const [target,   setTarget]   = useState(0);
  const [guess,    setGuess]    = useState("");
  const [attempts, setAttempts] = useState(0);
  const [msg,      setMsg]      = useState({ text:"Press Start to begin!", color:"var(--green)" });
  const [hintPos,  setHintPos]  = useState(50);
  const [hintClr,  setHintClr]  = useState("var(--green)");
  const [started,  setStarted]  = useState(false);
  const [won,      setWon]      = useState(false);
  const [lost,     setLost]     = useState(false);
  const [usedDots, setUsedDots] = useState([]);

  const startGame = () => {
    setTarget(Math.floor(Math.random()*100)+1);
    setAttempts(0); setGuess(""); setWon(false); setLost(false);
    setUsedDots([]); setHintPos(50); setHintClr("var(--green)");
    setMsg({ text:"Guess a number between 1 and 100!", color:"var(--green)" });
    setStarted(true);
  };

  const doGuess = () => {
    const n=parseInt(guess);
    if(isNaN(n)||n<1||n>100){ setMsg({text:"Enter a number 1–100!",color:"var(--pink)"}); return; }
    const na=attempts+1; setAttempts(na); setGuess("");
    setUsedDots(d=>[...d,na-1]);
    setHintPos(n/100*100);
    if(n===target){
      const pts=Math.max(10,(MAX_AT-na+1)*20); onScore(pts);
      setMsg({text:`🎉 Correct! +${pts} pts`,color:"var(--green)"}); setWon(true);
      setUsedDots(d=>d.map((_,i)=>i===na-1?"win":_));
    } else if(na>=MAX_AT){
      setMsg({text:`💀 The number was ${target}`,color:"var(--pink)"}); setLost(true);
    } else if(n<target){
      setMsg({text:"📈 Higher! Guess bigger.",color:"var(--blue)"}); setHintClr("var(--blue)");
    } else {
      setMsg({text:"📉 Lower! Guess smaller.",color:"var(--pink)"}); setHintClr("var(--pink)");
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h3 className="game-title">🎯 Number Guesser</h3>
        <div className="pills"><span className="pill">ATTEMPTS: {attempts}/{MAX_AT}</span></div>
      </div>
      <div className="num-game">
        <div className="hint-wrap">
          <div className="hint-bar" style={{width:`${hintPos}%`,background:hintClr}}/>
        </div>
        <div className="attempt-dots">
          {Array.from({length:MAX_AT},(_,i)=>(
            <div key={i} className={`dot${i<attempts?" used":""}${usedDots[i]==="win"?" win":""}`}/>
          ))}
        </div>
        <p className="num-msg" style={{color:msg.color}}>{msg.text}</p>
        {started && !won && !lost && (
          <div className="input-row">
            <input type="number" className="game-input" value={guess} min={1} max={100}
              placeholder="1 – 100" onChange={e=>setGuess(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&doGuess()} />
            <button className="btn btn-primary" onClick={doGuess}>Guess →</button>
          </div>
        )}
        {!started && <div className="row" style={{marginTop:"1rem"}}><button className="btn btn-primary" onClick={startGame}>▶ New Game</button></div>}
        {(won||lost) && (
          <div className="game-over">
            <h3 className="go-title">{won?(attempts===1?"🔥 FIRST TRY!":"🎉 Correct!"):"💀 Out of Tries!"}</h3>
            <p className="go-sub">{won?`Found ${target} in ${attempts} attempt${attempts>1?"s":""}!`:`The answer was ${target}.`}</p>
            <div className="go-btns"><button className="btn btn-primary" onClick={startGame}>Play Again</button></div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// WHACK-A-MOLE
// ─────────────────────────────────────────────
const MOLES = ["🐭","🦔","🐿️","🐹","🦊"];
const WhackGame = ({ onScore }) => {
  const [holes,    setHoles]    = useState(Array(9).fill(false));
  const [score,    setScore]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [running,  setRunning]  = useState(false);
  const [over,     setOver]     = useState(false);
  const [hitIdx,   setHitIdx]   = useState(null);
  const timersRef  = useRef([]);
  const gameTimRef = useRef(null);
  const holesRef   = useRef(Array(9).fill(false));
  const scoreRef   = useRef(0);
  const timeRef    = useRef(30);
  const runRef     = useRef(false);

  const hit = (i) => {
    if (!holesRef.current[i]||!runRef.current) return;
    holesRef.current[i]=false;
    setHoles([...holesRef.current]);
    scoreRef.current+=10; setScore(s=>s+10); onScore(10);
    setHitIdx(i); setTimeout(()=>setHitIdx(null),300);
  };

  const popMole = useCallback(() => {
    const free=holesRef.current.reduce((a,h,i)=>(!h?[...a,i]:a),[]);
    if(!free.length||!runRef.current) return;
    const idx=free[Math.floor(Math.random()*free.length)];
    holesRef.current[idx]=true; setHoles([...holesRef.current]);
    const dur=Math.max(320,920-Math.floor((30-timeRef.current)*19));
    const t=setTimeout(()=>{ if(holesRef.current[idx]){holesRef.current[idx]=false;setHoles([...holesRef.current]);} },dur);
    timersRef.current.push(t);
  },[]);

  const startGame = useCallback(()=>{
    holesRef.current=Array(9).fill(false); scoreRef.current=0; timeRef.current=30; runRef.current=true;
    setHoles(Array(9).fill(false)); setScore(0); setTimeLeft(30); setRunning(true); setOver(false);
    timersRef.current.forEach(clearTimeout); timersRef.current=[];
    clearInterval(gameTimRef.current);
    const schedulePop=()=>{
      const delay=Math.max(170,660-Math.floor((30-timeRef.current)*17));
      const t=setTimeout(()=>{ popMole(); schedulePop(); },delay);
      timersRef.current.push(t);
    };
    schedulePop();
    gameTimRef.current=setInterval(()=>{
      timeRef.current--; setTimeLeft(t=>t-1);
      if(timeRef.current<=0){
        clearInterval(gameTimRef.current); timersRef.current.forEach(clearTimeout);
        runRef.current=false; setRunning(false); setOver(true);
        holesRef.current=Array(9).fill(false); setHoles(Array(9).fill(false));
      }
    },1000);
  },[popMole]);

  useEffect(()=>()=>{ clearInterval(gameTimRef.current); timersRef.current.forEach(clearTimeout); },[]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h3 className="game-title">🔨 Whack-a-Mole</h3>
        <div className="pills">
          <span className="pill">SCORE: {score}</span>
          <span className="pill" style={{color:timeLeft<=5?"var(--pink)":undefined}}>TIME: {timeLeft}s</span>
        </div>
      </div>
      <div className="mole-timer-wrap">
        <div className="mole-timer-bar" style={{width:`${(timeLeft/30)*100}%`,background:timeLeft<=5?"var(--pink)":undefined}}/>
      </div>
      <div className="mole-grid">
        {holes.map((active,i)=>(
          <div key={i} className={`mole-hole${active?" active":""}${hitIdx===i?" hit":""}`}
            onClick={()=>hit(i)}
            onTouchStart={e=>{e.preventDefault();hit(i);}}
            role={active?"button":"presentation"}>
            <span className="mole-emoji">{MOLES[i%MOLES.length]}</span>
          </div>
        ))}
      </div>
      {!running && !over && <div className="row"><button className="btn btn-primary" onClick={startGame}>▶ Start Game</button></div>}
      {over && (
        <div className="game-over">
          <h3 className="go-title">⏰ Time's Up!</h3>
          <p className="go-sub">Final Score: {score} points!</p>
          <div className="go-btns"><button className="btn btn-primary" onClick={startGame}>Play Again</button></div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// SPEED TYPING
// ─────────────────────────────────────────────
const PHRASES = [
  "the quick brown fox jumps over the lazy dog",
  "pack my box with five dozen liquor jugs",
  "how vexingly quick daft zebras jump",
  "sphinx of black quartz judge my vow",
  "pixel arcade is the ultimate gaming destination",
  "practice makes perfect every single day",
  "the five boxing wizards jump quickly",
  "a journey of a thousand miles begins with a single step",
  "gaming is not just a hobby it is a lifestyle",
];

const TypingGame = ({ onScore }) => {
  const [phrase,  setPhrase]  = useState("");
  const [typed,   setTyped]   = useState("");
  const [wpm,     setWpm]     = useState(0);
  const [acc,     setAcc]     = useState(100);
  const [elapsed, setElapsed] = useState(0);
  const [won,     setWon]     = useState(false);
  const [started, setStarted] = useState(false);
  const t0Ref    = useRef(null);
  const tickRef  = useRef(null);
  const inputRef = useRef(null);

  const calcStats = (t, p) => {
    let correct=0;
    for(let i=0;i<Math.min(t.length,p.length);i++) if(t[i]===p[i]) correct++;
    const a=t.length>0?Math.round((correct/t.length)*100):100;
    const w=p.trim().split(" ").length;
    const el=(t0Ref.current?(Date.now()-t0Ref.current)/1000:0);
    return { acc:a, wpm:el>0?Math.round(w/(el/60)):0, elapsed:el };
  };

  const startGame = (newPhrase=true) => {
    const p=newPhrase?PHRASES[Math.floor(Math.random()*PHRASES.length)]:phrase;
    setPhrase(p); setTyped(""); setWpm(0); setAcc(100); setElapsed(0); setWon(false);
    t0Ref.current=null; clearInterval(tickRef.current); setStarted(true);
    setTimeout(()=>inputRef.current?.focus(),60);
  };

  const handleInput = (e) => {
    const t=e.target.value;
    if(!t) return;
    if(!t0Ref.current){ t0Ref.current=Date.now();
      tickRef.current=setInterval(()=>{
        const el=(Date.now()-t0Ref.current)/1000;
        setElapsed(Math.round(el));
        const {wpm:w,acc:a}=calcStats(inputRef.current?.value||"",phrase);
        setWpm(w); setAcc(a);
      },250);
    }
    setTyped(t);
    if(t===phrase){
      clearInterval(tickRef.current);
      const {wpm:w,acc:a,elapsed:el}=calcStats(t,phrase);
      const pts=Math.round(w*(a/100)*2); onScore(pts);
      setWpm(w); setAcc(a); setElapsed(parseFloat(el.toFixed(1))); setWon(true);
    }
  };

  useEffect(()=>()=>clearInterval(tickRef.current),[]);

  const progress=phrase?Math.round((typed.length/phrase.length)*100):0;

  const renderPrompt=()=>{
    if(!phrase) return null;
    return phrase.split("").map((ch,i)=>{
      let cls="";
      if(i<typed.length) cls=typed[i]===ch?"ch-correct":"ch-wrong";
      else if(i===typed.length) cls="ch-cursor";
      return <span key={i} className={cls}>{ch}</span>;
    });
  };

  const grade=(w)=>w>100?"🔥 INSANE!":w>80?"⚡ Lightning!":w>60?"💪 Great!":w>40?"👍 Good":"🐢 Keep at it!";

  return (
    <div className="game-container">
      <div className="game-header">
        <h3 className="game-title">⌨️ Speed Typing</h3>
        <div className="pills">
          <span className="pill">WPM: {wpm}</span>
          <span className="pill">ACC: {acc}%</span>
          <span className="pill">TIME: {elapsed}s</span>
        </div>
      </div>
      {!started ? (
        <div className="row" style={{marginTop:"1rem"}}><button className="btn btn-primary" onClick={()=>startGame(true)}>▶ New Game</button></div>
      ) : (
        <div className="type-area">
          <div className="type-progress-wrap">
            <div className="type-progress-bar" style={{width:`${progress}%`}}/>
          </div>
          <div className="type-prompt">{renderPrompt()}</div>
          <textarea ref={inputRef} className="type-input" rows={2}
            placeholder="Click here and start typing…"
            value={typed} onChange={handleInput} disabled={won}
            aria-label="Typing input" />
          {won && (
            <div className="type-stats">
              <span className="type-stat">{wpm} WPM</span>
              <span className="type-stat">{acc}% ACC</span>
              <span className="type-stat">{elapsed}s</span>
              <span className="type-stat">{grade(wpm)}</span>
            </div>
          )}
        </div>
      )}
      {started && (
        <div className="row" style={{marginTop:"1rem"}}>
          <button className="btn btn-primary" onClick={()=>startGame(true)}>New Phrase</button>
          {won && <button className="btn btn-ghost" onClick={()=>startGame(false)}>Try Again</button>}
        </div>
      )}
      {won && (
        <div className="game-over">
          <h3 className="go-title">🏆 Done!</h3>
          <p className="go-sub">{wpm} WPM · {acc}% accuracy · {elapsed}s · {grade(wpm)}</p>
          <div className="go-btns">
            <button className="btn btn-primary" onClick={()=>startGame(true)}>New Phrase</button>
            <button className="btn btn-ghost"   onClick={()=>startGame(false)}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// BREAKOUT
// ─────────────────────────────────────────────
const BreakoutGame = ({ onScore }) => {
  const cvRef   = useRef(null);
  const stRef   = useRef({});
  const rafRef  = useRef(null);
  const keysRef = useRef({});
  const leftRef = useRef(false);
  const rightRef= useRef(false);
  const [score, setScore]   = useState(0);
  const [lives, setLives]   = useState(3);
  const [level, setLevel]   = useState(1);
  const [over,  setOver]    = useState(false);
  const [won,   setWon]     = useState(false);
  const [going, setGoing]   = useState(false);

  const COLS=8, ROWS=5;
  const ROW_COLORS=["#ff0066","#ff6600","#ffaa00","#00ff88","#00aaff"];

  const getDims = () => {
    const cw=Math.min(typeof window!=="undefined"?window.innerWidth-52:520,520);
    const ch=Math.round(cw*.68);
    const bw=Math.floor((cw-20)/COLS)-2;
    const bh=Math.floor(ch*.055);
    const pw=Math.floor(cw*.18), ph=9;
    const br=Math.max(5,Math.floor(cw*.013));
    return {cw,ch,bw,bh,pw,ph,br};
  };

  const makeBricks=(dims)=>{
    const bs=[];
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++)
      bs.push({x:10+c*(dims.bw+2),y:28+r*(dims.bh+4),alive:true,color:ROW_COLORS[r]});
    return bs;
  };

  const initLevel=(dims,lvl)=>{
    const {cw,ch,pw,ph,br}=dims;
    const spd=(Math.min(cw,ch)*.0038+lvl*.0005)*60;
    const a=(Math.random()*60+60)*(Math.PI/180);
    stRef.current={
      ...stRef.current,
      px:(cw-pw)/2, py:ch-ph-12,
      bx:cw/2, by:ch/2,
      vx:spd*Math.cos(a)*(Math.random()>.5?1:-1),
      vy:-spd*Math.sin(a)*.85,
      bricks:makeBricks(dims),
    };
  };

  const startGame=useCallback(()=>{
    const dims=getDims();
    const cv=cvRef.current; if(!cv) return;
    cv.width=dims.cw; cv.height=dims.ch;
    stRef.current={score:0,lives:3,level:1,dims,running:true};
    initLevel(dims,1);
    setScore(0);setLives(3);setLevel(1);setOver(false);setWon(false);setGoing(true);
    cancelAnimationFrame(rafRef.current);
    const tick=()=>{
      if(!stRef.current.running) return;
      const {cw,ch,pw,ph,br,bw,bh}=stRef.current.dims;
      const spd=Math.max(4,cw*.012);
      if(keysRef.current.ArrowLeft ||leftRef.current)  stRef.current.px=Math.max(0,stRef.current.px-spd);
      if(keysRef.current.ArrowRight||rightRef.current) stRef.current.px=Math.min(cw-pw,stRef.current.px+spd);
      stRef.current.bx+=stRef.current.vx;
      stRef.current.by+=stRef.current.vy;
      const {bx,by,vx:vxv,vy:vyv}=stRef.current;
      if(bx-br<0){stRef.current.bx=br;stRef.current.vx=Math.abs(vxv);}
      if(bx+br>cw){stRef.current.bx=cw-br;stRef.current.vx=-Math.abs(vxv);}
      if(by-br<0){stRef.current.by=br;stRef.current.vy=Math.abs(vyv);}
      const {px,py:py2}=stRef.current;
      if(stRef.current.by+br>=py2&&stRef.current.by-br<=py2+ph&&stRef.current.bx>=px&&stRef.current.bx<=px+pw){
        stRef.current.vy=-Math.abs(stRef.current.vy);
        const off=(stRef.current.bx-(px+pw/2))/(pw/2);
        stRef.current.vx=off*Math.abs(stRef.current.vy)*1.5;
      }
      let broken=0;
      stRef.current.bricks.forEach(b=>{
        if(!b.alive)return;
        if(stRef.current.bx+br>b.x&&stRef.current.bx-br<b.x+bw&&stRef.current.by+br>b.y&&stRef.current.by-br<b.y+bh){
          b.alive=false;stRef.current.vy=-stRef.current.vy;stRef.current.score+=10;broken++;
        }
      });
      if(broken){onScore(broken*10);setScore(stRef.current.score);}
      if(stRef.current.bricks.every(b=>!b.alive)){
        stRef.current.level++;stRef.current.score+=100;onScore(100);
        setLevel(stRef.current.level);setScore(stRef.current.score);
        initLevel(stRef.current.dims,stRef.current.level);
      }
      if(stRef.current.by-br>ch){
        stRef.current.lives--;setLives(stRef.current.lives);
        if(stRef.current.lives<=0){stRef.current.running=false;setGoing(false);setOver(true);return;}
        const d=stRef.current.dims;
        const s2=(Math.min(d.cw,d.ch)*.004+stRef.current.level*.0005)*60;
        const a2=(Math.random()*60+60)*(Math.PI/180);
        stRef.current.bx=d.cw/2;stRef.current.by=d.ch/2;
        stRef.current.vx=s2*Math.cos(a2)*(Math.random()>.5?1:-1);
        stRef.current.vy=-s2*Math.sin(a2);
      }
      // Draw
      const cv2=cvRef.current; if(!cv2) return;
      const ctx=cv2.getContext("2d");
      ctx.fillStyle="#020408";ctx.fillRect(0,0,cw,ch);
      stRef.current.bricks.forEach(b=>{
        if(!b.alive)return;
        ctx.fillStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=6;
        ctx.beginPath();
        if(ctx.roundRect)ctx.roundRect(b.x,b.y,bw,bh,3);else ctx.rect(b.x,b.y,bw,bh);
        ctx.fill();ctx.shadowBlur=0;
      });
      ctx.fillStyle="#00aaff";ctx.shadowColor="#00aaff";ctx.shadowBlur=14;
      ctx.beginPath();
      if(ctx.roundRect)ctx.roundRect(stRef.current.px,py2,pw,ph,4);else ctx.rect(stRef.current.px,py2,pw,ph);
      ctx.fill();ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(stRef.current.bx,stRef.current.by,br,0,Math.PI*2);
      ctx.fillStyle="#fff";ctx.shadowColor="#fff";ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;
      rafRef.current=requestAnimationFrame(tick);
    };
    rafRef.current=requestAnimationFrame(tick);
  // eslint-disable-next-line
  },[onScore]);

  useEffect(()=>{
    const onK=e=>{keysRef.current[e.key]=e.type==="keydown";if(["ArrowLeft","ArrowRight"].includes(e.key))e.preventDefault();};
    window.addEventListener("keydown",onK);window.addEventListener("keyup",onK);
    const dims=getDims();
    const cv=cvRef.current;
    if(cv){cv.width=dims.cw;cv.height=dims.ch;const ctx=cv.getContext("2d");ctx.fillStyle="#020408";ctx.fillRect(0,0,dims.cw,dims.ch);}
    return ()=>{
      window.removeEventListener("keydown",onK);window.removeEventListener("keyup",onK);
      cancelAnimationFrame(rafRef.current);if(stRef.current)stRef.current.running=false;
    };
  // eslint-disable-next-line
  },[]);

  const onMouseMove=(e)=>{
    const dims=getDims();
    const r=cvRef.current?.getBoundingClientRect();
    if(r&&stRef.current.dims) stRef.current.px=Math.max(0,Math.min(stRef.current.dims.cw-stRef.current.dims.pw,e.clientX-r.left-stRef.current.dims.pw/2));
  };
  const onTouchMove=(e)=>{
    e.preventDefault();
    const r=cvRef.current?.getBoundingClientRect();
    if(r&&stRef.current.dims) stRef.current.px=Math.max(0,Math.min(stRef.current.dims.cw-stRef.current.dims.pw,e.touches[0].clientX-r.left-stRef.current.dims.pw/2));
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h3 className="game-title">🧱 Breakout</h3>
        <div className="pills">
          <span className="pill">SCORE: {score}</span>
          <span className="pill">LIVES: {"♥".repeat(lives)}{"♡".repeat(3-lives)}</span>
          <span className="pill">LVL: {level}</span>
        </div>
      </div>
      <div className="canvas-wrap">
        <canvas ref={cvRef} className="breakout-canvas" onMouseMove={onMouseMove} onTouchMove={onTouchMove} style={{touchAction:"none"}} />
      </div>
      <div className="paddle-row">
        <button className="dpad-btn" onPointerDown={()=>leftRef.current=true} onPointerUp={()=>leftRef.current=false}>◀</button>
        <div/>
        <button className="dpad-btn" onPointerDown={()=>rightRef.current=true} onPointerUp={()=>rightRef.current=false}>▶</button>
      </div>
      {!going && !over && <div className="row" style={{marginTop:"1rem"}}><button className="btn btn-primary" onClick={startGame}>▶ Start Game</button></div>}
      <p className="ctrl-info">Mouse · arrow keys · on-screen buttons</p>
      {(over||won) && (
        <div className="game-over">
          <h3 className="go-title">{over?"💀 Game Over!":"🏆 You Win!"}</h3>
          <p className="go-sub">Final Score: {score}</p>
          <div className="go-btns"><button className="btn btn-primary" onClick={startGame}>Play Again</button></div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// GAME MAP
// ─────────────────────────────────────────────
const GAME_MAP = { snake:SnakeGame, memory:MemoryGame, reaction:ReactionGame, number:NumberGame, whack:WhackGame, typing:TypingGame, breakout:BreakoutGame };

// ─────────────────────────────────────────────
// SCORE BUMP HOOK
// ─────────────────────────────────────────────
const useScoreBump = (score) => {
  const [bump, setBump] = useState(false);
  const prevRef = useRef(score);
  useEffect(()=>{
    if(score!==prevRef.current){ prevRef.current=score; setBump(true); setTimeout(()=>setBump(false),300); }
  },[score]);
  return bump;
};

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function GamingWebsite() {
  const [activeId, setActiveId] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const addScore = useCallback((n) => setTotalScore(s => s + n), []);
  const bump = useScoreBump(totalScore);

  const ActiveGame = activeId ? GAME_MAP[activeId] : null;
  const activeMeta = GAMES.find(g => g.id === activeId);

  return (
    <>
      <BgScene />
      <div className="app">
        {/* HEADER */}
        <header className="site-header">
          <div className="header-inner">
            <div className="logo-group">
              <div className="logo-pixels" aria-hidden="true">
                <div className="logo-px"/><div className="logo-px"/>
                <div className="logo-px"/><div className="logo-px"/>
              </div>
              <div className="logo-texts">
                <h1 className="logo-name">Pixel Arcade</h1>
                <p className="logo-sub">Ultra Edition — 7 Games</p>
              </div>
            </div>
            <div className="global-score" aria-live="polite">
              <span className="gs-label">Total Score</span>
              <span className={`gs-val${bump?" bump":""}`}>{totalScore.toLocaleString()}</span>
            </div>
          </div>
          <div className="header-line" />
        </header>

        {/* MAIN */}
        <main className="main">
          {activeId && (
            <button className="back-btn" onClick={() => setActiveId(null)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back to Arcade
            </button>
          )}

          {!activeId ? (
            <>
              <div className="eyebrow">
                <span className="eyebrow-text">Choose Your Game</span>
                <div className="eyebrow-line"/>
              </div>
              <div className="game-grid">
                {GAMES.map(g => (
                  <div key={g.id} className="game-card" style={{"--c":g.color}} onClick={()=>setActiveId(g.id)} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter")setActiveId(g.id);}}>
                    <div className="card-top">
                      <div className="card-icon">{g.icon}</div>
                      <span className="card-badge">{g.badge}</span>
                    </div>
                    <h2 className="card-name">{g.name}</h2>
                    <p className="card-desc">{g.desc}</p>
                    <button className="card-play" onClick={e=>{e.stopPropagation();setActiveId(g.id);}}>Play Now →</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            ActiveGame && <ActiveGame onScore={addScore} />
          )}
        </main>

        {/* FOOTER */}
        <footer className="site-footer">
          <span>Pixel Arcade</span>
          <span className="footer-dot" aria-hidden="true"/>
          <span>Ultra Edition</span>
          <span className="footer-dot" aria-hidden="true"/>
          <span>7 Games</span>
        </footer>
      </div>
    </>
  );
}
