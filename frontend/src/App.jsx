import { useState, useEffect, useCallback } from "react";
import "./App.css";
import StartScreen from "./components/StartScreen";
import GameBoard from "./components/GameBoard";
import Keyboard from "./components/Keyboard";
import { getFeedback, getLetterFeedback } from "./utils/feedback";

// Mock target words per length (no API in this phase)
const MOCK_TARGETS = {
  5: "CRANE",
  6: "GARDEN",
  7: "PICTURE",
  8: "SOMETHING",
};

function App() {
  const [gameState, setGameState] = useState(null);

  const startGame = useCallback((wordLength) => {
    const target = MOCK_TARGETS[wordLength] ?? MOCK_TARGETS[5];
    setGameState({
      wordLength,
      maxGuesses: wordLength + 1,
      target: target.toUpperCase(),
      guessHistory: [],
      currentRow: "",
      status: "playing",
    });
  }, []);

  const feedbackPerRow = gameState
    ? gameState.guessHistory.map((guess) =>
        getFeedback(guess, gameState.target),
      )
    : [];
  const letterFeedback = gameState
    ? getLetterFeedback(gameState.guessHistory, feedbackPerRow)
    : {};

  const handleKey = useCallback((key) => {
    if (key === "Backspace") {
      setGameState((prev) => {
        if (!prev || prev.status !== "playing") return prev;
        return { ...prev, currentRow: prev.currentRow.slice(0, -1) };
      });
      return;
    }

    if (key === "Enter") {
      setGameState((prev) => {
        if (!prev || prev.status !== "playing") return prev;
        const guess = prev.currentRow.trim().toUpperCase();
        if (guess.length !== prev.wordLength) return prev;
        const newHistory = [...prev.guessHistory, guess];
        const won = guess === prev.target;
        const lost = !won && newHistory.length >= prev.maxGuesses;
        return {
          ...prev,
          guessHistory: newHistory,
          currentRow: "",
          status: won ? "won" : lost ? "lost" : "playing",
        };
      });
      return;
    }

    if (key.length === 1 && /[A-Za-z]/.test(key)) {
      setGameState((prev) => {
        if (!prev || prev.status !== "playing") return prev;
        if (prev.currentRow.length >= prev.wordLength) return prev;
        return { ...prev, currentRow: prev.currentRow + key.toUpperCase() };
      });
    }
  }, []);

  // Physical keyboard: only re-subscribe when entering or leaving "playing"
  const isPlaying = gameState?.status === "playing";
  useEffect(() => {
    if (!isPlaying) return;
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") {
        e.preventDefault();
        handleKey("Enter");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleKey("Backspace");
      } else if (e.key.length === 1 && /[A-Za-z]/i.test(e.key)) {
        e.preventDefault();
        handleKey(e.key.toUpperCase());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPlaying, handleKey]);

  if (!gameState) {
    return <StartScreen onStart={startGame} />;
  }

  const rows = [
    ...gameState.guessHistory,
    ...(gameState.status === "playing" ? [gameState.currentRow] : []),
  ];

  return (
    <div className="app game-screen">
      <h1 className="wordle-title small">Wordle</h1>
      <GameBoard
        rows={rows}
        feedbackPerRow={feedbackPerRow}
        wordLength={gameState.wordLength}
        maxRows={gameState.maxGuesses}
      />
      {(gameState.status === "won" || gameState.status === "lost") && (
        <div className={`game-over ${gameState.status}`}>
          <p>
            {gameState.status === "won"
              ? "You won!"
              : <>You lost. The word was <strong>{gameState.target}</strong>.</>}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setGameState(null)}
          >
            New game
          </button>
        </div>
      )}
      {gameState.status === "playing" && (
        <Keyboard letterFeedback={letterFeedback} onKey={handleKey} />
      )}
    </div>
  );
}

export default App;
