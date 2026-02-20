# 🎮 PIXEL ARCADE — Ultra Edition

> **A free, browser-based gaming website with 7 classic games — playable on any phone, tablet, or computer. No downloads, no accounts, no cost.**

---

## 🕹️ The Games

### The Home Screen

When you open the website, you'll see a beautiful dark arcade-style menu with **7 game cards**. Each card glows in its own colour and tells you what the game is about. Just tap or click **"Play Now"** on any card to jump straight in.

> 💡 **Notice the glowing dots in the background, the colour shimmer across the top, and the animated pixel logo** — these are all visual effects built into the site to give it that retro arcade feel.

---

### Playing Snake

The classic Snake game — your green snake moves around the grid and you guide it to eat the red food dot. Every time it eats, it grows longer. If it hits a wall or itself, game over!

- **On a computer:** Use the arrow keys on your keyboard (← → ↑ ↓)
- **On a phone or tablet:** Use the on-screen arrow buttons (▲ ▼ ◀ ▶) that appear automatically
- Your current score and best score are shown at the top right
- Press **"Back to Arcade"** at the top left to return to the menu

---

### Memory Match

A grid of 24 face-down cards (12 matching pairs). Flip two cards at a time — if they match, they stay revealed in green. If they don't match, they flip back. Your goal is to find all 12 pairs in as few moves as possible!

- The game tracks your **moves** (how many pairs you've flipped) and **pairs found** at the top
- Matched pairs glow green  
- Wrong guesses briefly flash pink to show the mismatch  
- The game ends with a congratulations screen showing your final move count

---

### Reaction Time

A pure reflex test. The box starts dark grey — wait for it to flash **bright green**, then click or tap as fast as you can!

- **Click too early** (before it turns green) = penalty and a "Too Early!" message
- Your reaction time is shown in **milliseconds** (ms) — lower is better
- You get a grade: 🏆 Superhuman (under 150ms) → ⚡ Elite → 💪 Great → 👍 Good → 😐 Average → 🐢 Slow
- Your **best time** and **average time** are tracked across multiple rounds
- Most people react in 200–300ms. Under 200ms is excellent!

---

### Breakout

The classic brick-breaking arcade game. A ball bounces around the screen — use your paddle at the bottom to keep it in play and smash all the bricks!

- **On a computer:** Move your mouse left and right over the game, or use ← → arrow keys
- **On a phone:** Touch and drag across the screen, or use the on-screen ◀ ▶ buttons
- Different coloured rows of bricks are worth the same points — clear them all to advance to the next level
- You have **3 lives** (shown as ♥♥♥) — each time the ball falls off the bottom, you lose one
- The game gets faster as you reach higher levels!

---

### On Mobile (Phone / Tablet)

The website is **fully optimised for phones and tablets**. On a touchscreen:

- Cards stack into a single column so they're easy to read and tap
- Touch controls (arrow buttons, paddle buttons) appear automatically — you never need a keyboard
- Everything resizes to fit your screen perfectly, from a small phone to a large tablet

---

## 🕹️ All 7 Games Explained

| Game | Icon | What You Do | Difficulty |
|------|------|-------------|------------|
| **Snake** | 🐍 | Guide the snake to eat food without hitting walls or yourself | ⭐⭐ Medium |
| **Memory Match** | 🧠 | Flip cards to find 12 matching pairs | ⭐⭐ Medium |
| **Reaction Time** | ⚡ | Click the moment the box turns green | ⭐ Easy |
| **Number Guesser** | 🎯 | Guess a hidden number between 1 and 100 (you get 10 tries) | ⭐ Easy |
| **Whack-a-Mole** | 🔨 | Tap the moles before they disappear — 30 seconds on the clock! | ⭐⭐⭐ Hard |
| **Speed Typing** | ⌨️ | Type a phrase as fast and accurately as possible | ⭐⭐ Medium |
| **Breakout** | 🧱 | Keep the ball alive with your paddle and smash all the bricks | ⭐⭐⭐ Hard |

---

## 🌍 How to Open the Website

You have **two files** that make up this website:

```
App.jsx       ← the games and interactive parts
index.css     ← the visual design and styling
```

> **Not a developer?** Share these files with whoever is hosting the website for you. If you're already using a hosted version, just open it in any web browser — Chrome, Safari, Firefox, or Edge all work perfectly.

### What devices does it work on?

| Device | Works? | Controls |
|--------|--------|----------|
| 💻 Laptop / Desktop | ✅ Yes | Keyboard + Mouse |
| 📱 iPhone / Android | ✅ Yes | Touch buttons auto-appear |
| 📟 iPad / Tablet | ✅ Yes | Touch buttons auto-appear |
| 📺 Smart TV browser | ✅ Yes | Remote or keyboard |

---

## ✨ Visual Features (What Makes It Look So Good)

The website has several special visual effects running at all times:

| Effect | What It Does |
|--------|--------------|
| **Floating particles** | Tiny glowing dots drift slowly across the background — like stars |
| **Ambient orbs** | Soft green, blue, and pink glows pulse gently behind everything |
| **Dot grid** | A subtle grid of dots gives depth, like classic arcade hardware |
| **CRT scanlines** | Very faint horizontal lines mimic the look of old arcade monitors |
| **Header shimmer** | The rainbow line under the logo slowly animates left to right |
| **Card glow** | Each game card glows in its signature colour when you hover over it |
| **Shimmer sweep** | A light sheen sweeps across a card when your cursor passes over it |
| **Score bump** | The total score number bounces slightly every time you earn points |
| **Neon glow** | Buttons and game elements glow with soft coloured light |

---

## 🏆 Scoring System

Every game earns you points that add up in the **Total Score** pill at the top right of the screen. Here's how points are earned:

| Game | How You Earn Points |
|------|---------------------|
| 🐍 Snake | +10 points per food eaten |
| 🧠 Memory Match | +50 points per matching pair found |
| ⚡ Reaction | Up to +500 points — faster = more points |
| 🎯 Number Guesser | Up to +200 points — fewer guesses = more points |
| 🔨 Whack-a-Mole | +10 points per mole hit |
| ⌨️ Speed Typing | Points based on WPM × accuracy |
| 🧱 Breakout | +10 per brick broken, +100 per level cleared |

Your total carries across all games in a single session — try to beat your own high score!

---

## 🎨 Colour Guide

Each game has its own signature colour throughout the interface:

- 🟢 **Green** `#00ff88` — Snake
- 🔴 **Pink** `#ff0066` — Memory Match
- 🟡 **Amber** `#ffaa00` — Reaction Time
- 🔵 **Blue** `#00aaff` — Number Guesser
- 🟣 **Purple** `#aa00ff` — Whack-a-Mole
- 🩵 **Cyan** `#00ffee` — Speed Typing
- 🟠 **Orange** `#ff6600` — Breakout

---

## ❓ Common Questions

**Q: Do I need to create an account?**  
A: No. Just open the website and play immediately.

**Q: Does it work offline?**  
A: Once the page is loaded, all 7 games work completely offline — no internet needed.

**Q: Can I play on my phone?**  
A: Yes! Touch controls appear automatically on phones and tablets. No keyboard or mouse needed.

**Q: Why does the page look dark?**  
A: The dark theme is intentional — it's styled like a classic arcade machine and is much easier on the eyes for gaming.

**Q: The score resets when I refresh the page — is that normal?**  
A: Yes, your score is only kept for the current session. Refreshing the page starts fresh.

**Q: Can multiple people play at the same time?**  
A: Each person needs to open the website on their own device. It's a single-player experience.

---

## 🛠️ For Developers

If you're setting this up, the project uses:

- **React** (the JavaScript framework that powers the interactive games)
- **CSS Custom Properties** (design tokens for the colour system)
- **HTML5 Canvas** (for Snake and Breakout rendering)
- **No external game libraries** — everything is built from scratch

The two files go together:
- `App.jsx` → place in your `src/` folder (or equivalent)
- `index.css` → imported automatically via the `import "./index.css"` line in App.jsx

Fonts are loaded from Google Fonts (Orbitron + Exo 2) — requires internet on first load.

---

*Built with React · Styled with pure CSS · Playable everywhere*
