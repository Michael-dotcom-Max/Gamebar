import React, { useState, useEffect, useRef } from "react";
import { Gamepad2, Trophy, Zap, Target, Brain, Rocket } from "lucide-react";
import "./index.css";

// Snake Game Component
const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef(null);
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const directionRef = useRef({ x: 1, y: 0 });
  const foodRef = useRef({ x: 15, y: 15 });

  const gridSize = 20;
  const tileSize = 20;

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const gameLoop = () => {
      // Move snake
      const head = { ...snakeRef.current[0] };
      head.x += directionRef.current.x;
      head.y += directionRef.current.y;

      // Check collision with walls
      if (
        head.x < 0 ||
        head.x >= gridSize ||
        head.y < 0 ||
        head.y >= gridSize
      ) {
        setGameOver(true);
        return;
      }

      // Check collision with self
      if (
        snakeRef.current.some(
          (segment) => segment.x === head.x && segment.y === head.y,
        )
      ) {
        setGameOver(true);
        return;
      }

      snakeRef.current.unshift(head);

      // Check food collision
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore((s) => s + 10);
        foodRef.current = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize),
        };
      } else {
        snakeRef.current.pop();
      }

      // Draw
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = "#1a1a1a";
      for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(canvas.width, i * tileSize);
        ctx.stroke();
      }

      // Draw snake
      snakeRef.current.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#00ff88" : "#00cc66";
        ctx.fillRect(
          segment.x * tileSize,
          segment.y * tileSize,
          tileSize - 2,
          tileSize - 2,
        );
      });

      // Draw food
      ctx.fillStyle = "#ff0066";
      ctx.fillRect(
        foodRef.current.x * tileSize,
        foodRef.current.y * tileSize,
        tileSize - 2,
        tileSize - 2,
      );
    };

    gameLoopRef.current = setInterval(gameLoop, 150);

    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || gameOver) return;

      const key = e.key;
      if (key === "ArrowUp" && directionRef.current.y === 0) {
        directionRef.current = { x: 0, y: -1 };
      } else if (key === "ArrowDown" && directionRef.current.y === 0) {
        directionRef.current = { x: 0, y: 1 };
      } else if (key === "ArrowLeft" && directionRef.current.x === 0) {
        directionRef.current = { x: -1, y: 0 };
      } else if (key === "ArrowRight" && directionRef.current.x === 0) {
        directionRef.current = { x: 1, y: 0 };
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, gameOver]);

  const startGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    foodRef.current = { x: 15, y: 15 };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h3>🐍 Snake</h3>
        <div className="score">Score: {score}</div>
      </div>
      <canvas
        ref={canvasRef}
        width={gridSize * tileSize}
        height={gridSize * tileSize}
        className="game-canvas"
      />
      {!gameStarted && (
        <button onClick={startGame} className="game-btn">
          Start Game
        </button>
      )}
      {gameOver && (
        <div className="game-over">
          <h3>Game Over!</h3>
          <p>Final Score: {score}</p>
          <button onClick={startGame} className="game-btn">
            Play Again
          </button>
        </div>
      )}
      {gameStarted && !gameOver && (
        <div className="controls">Use Arrow Keys to Move</div>
      )}
    </div>
  );
};

// Memory Match Game Component
const MemoryGame = () => {
  const emojis = ["🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎺", "🎸"];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const initGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameStarted(true);
  };

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id))
      return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const isGameWon = matched.length === cards.length && cards.length > 0;

  return (
    <div className="game-container">
      <div className="game-header">
        <h3>🧠 Memory Match</h3>
        <div className="score">Moves: {moves}</div>
      </div>
      {!gameStarted ? (
        <button onClick={initGame} className="game-btn">
          Start Game
        </button>
      ) : (
        <>
          <div className="memory-grid">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`memory-card ${flipped.includes(index) || matched.includes(index) ? "flipped" : ""}`}
                onClick={() => handleCardClick(index)}
              >
                {flipped.includes(index) || matched.includes(index)
                  ? card.emoji
                  : "?"}
              </div>
            ))}
          </div>
          {isGameWon && (
            <div className="game-over">
              <h3>🎉 You Won!</h3>
              <p>Completed in {moves} moves</p>
              <button onClick={initGame} className="game-btn">
                Play Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Reaction Time Game Component
const ReactionGame = () => {
  const [state, setState] = useState("waiting"); // waiting, ready, go, result
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);

  const startGame = () => {
    setState("ready");
    const delay = Math.random() * 3000 + 2000;
    setTimeout(() => {
      setState("go");
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (state === "go") {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setState("result");
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
    } else if (state === "ready") {
      setState("waiting");
      alert("Too early! Wait for green.");
    } else if (state === "waiting" || state === "result") {
      startGame();
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h3>⚡ Reaction Time</h3>
        {bestTime && <div className="score">Best: {bestTime}ms</div>}
      </div>
      <div className={`reaction-box ${state}`} onClick={handleClick}>
        {state === "waiting" && <p>Click to Start</p>}
        {state === "ready" && <p>Wait for Green...</p>}
        {state === "go" && <p>CLICK NOW!</p>}
        {state === "result" && (
          <>
            <p className="reaction-result">{reactionTime}ms</p>
            <p className="reaction-label">Click to Play Again</p>
          </>
        )}
      </div>
    </div>
  );
};

// Number Guesser Game Component
const NumberGuesser = () => {
  const [target, setTarget] = useState(0);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const startGame = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setAttempts(0);
    setMessage("Guess a number between 1 and 100!");
    setGameStarted(true);
    setGameWon(false);
  };

  const handleGuess = () => {
    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > 100) {
      setMessage("Please enter a number between 1 and 100");
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (num === target) {
      setMessage(`🎉 Correct! You won in ${newAttempts} attempts!`);
      setGameWon(true);
    } else if (num < target) {
      setMessage("📈 Higher! Try again.");
    } else {
      setMessage("📉 Lower! Try again.");
    }
    setGuess("");
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h3>🎯 Number Guesser</h3>
        <div className="score">Attempts: {attempts}</div>
      </div>
      {!gameStarted ? (
        <button onClick={startGame} className="game-btn">
          Start Game
        </button>
      ) : (
        <div className="number-game">
          <p className="game-message">{message}</p>
          {!gameWon && (
            <div className="input-group">
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleGuess()}
                placeholder="Enter your guess"
                className="game-input"
                min="1"
                max="100"
              />
              <button onClick={handleGuess} className="game-btn">
                Guess
              </button>
            </div>
          )}
          {gameWon && (
            <button onClick={startGame} className="game-btn">
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Main App Component
export default function GamingWebsite() {
  const [activeGame, setActiveGame] = useState(null);

  const games = [
    {
      id: "snake",
      name: "Snake",
      icon: Gamepad2,
      color: "#00ff88",
      component: SnakeGame,
    },
    {
      id: "memory",
      name: "Memory Match",
      icon: Brain,
      color: "#ff0066",
      component: MemoryGame,
    },
    {
      id: "reaction",
      name: "Reaction Time",
      icon: Zap,
      color: "#ffaa00",
      component: ReactionGame,
    },
    {
      id: "number",
      name: "Number Guesser",
      icon: Target,
      color: "#00aaff",
      component: NumberGuesser,
    },
  ];

  const ActiveGameComponent = games.find((g) => g.id === activeGame)?.component;

  return (
    <div className="app">
      <header>
        <h1 className="logo">PIXEL ARCADE</h1>
        <p className="tagline">Classic Games. Modern Vibes.</p>
      </header>

      <div className="container">
        {activeGame && (
          <button className="back-btn" onClick={() => setActiveGame(null)}>
            ← Back
          </button>
        )}

        {!activeGame ? (
          <div className="game-grid">
            {games.map((game) => (
              <div
                key={game.id}
                className="game-card"
                style={{ "--game-color": game.color }}
              >
                <game.icon className="game-icon" />
                <h3>{game.name}</h3>
                <p>
                  {game.id === "snake" &&
                    "Classic snake game. Eat food, grow longer, avoid walls!"}
                  {game.id === "memory" &&
                    "Match pairs of emojis. Test your memory skills!"}
                  {game.id === "reaction" &&
                    "How fast can you react? Test your reflexes!"}
                  {game.id === "number" &&
                    "Guess the secret number between 1 and 100!"}
                </p>
                <button
                  className="play-btn"
                  onClick={() => setActiveGame(game.id)}
                >
                  Play Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          ActiveGameComponent && <ActiveGameComponent />
        )}
      </div>
    </div>
  );
}
