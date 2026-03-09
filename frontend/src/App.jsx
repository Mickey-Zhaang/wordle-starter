import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import StartScreen from "./components/StartScreen";
import GameBoard from "./components/GameBoard";
import Keyboard from "./components/Keyboard";
import { getLetterFeedback } from "./utils/feedback";
import { createGame, submitGuess, getGame } from "./api/client";

const SESSION_GAME_ID = "wordle-game-id";

function App() {
  const [gameState, setGameState] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guessError, setGuessError] = useState(null);
  const [resumeChecked, setResumeChecked] = useState(false);

  const stateRef = useRef(gameState);
  const submittingRef = useRef(isSubmitting);
  stateRef.current = gameState;
  submittingRef.current = isSubmitting;

  // Optional: resume game from sessionStorage on mount
  useEffect(() => {
    if (resumeChecked) return;
    setResumeChecked(true);
    const savedId = sessionStorage.getItem(SESSION_GAME_ID);
    if (!savedId) return;
    getGame(savedId)
      .then((data) => {
        setGameState({
          gameId: data.game_id,
          wordLength: data.word_length,
          maxGuesses: data.max_guesses,
          guessHistory: data.guess_history || [],
          feedbackPerRow: data.feedback || [],
          currentRow: "",
          status: data.status,
          target: data.target ?? null,
        });
      })
      .catch(() => {
        sessionStorage.removeItem(SESSION_GAME_ID);
      });
  }, [resumeChecked]);

  const startGame = useCallback(async (wordLength) => {
    setStartError(null);
    setIsStarting(true);
    try {
      const data = await createGame(wordLength);
      sessionStorage.setItem(SESSION_GAME_ID, data.game_id);
      setGameState({
        gameId: data.game_id,
        wordLength: data.word_length,
        maxGuesses: data.max_guesses,
        guessHistory: [],
        feedbackPerRow: [],
        currentRow: "",
        status: "playing",
        target: null,
      });
    } catch (e) {
      setStartError(e.detail || e.message || "Failed to start game");
    } finally {
      setIsStarting(false);
    }
  }, []);

  const feedbackPerRow = gameState?.feedbackPerRow ?? [];
  const letterFeedback = gameState
    ? getLetterFeedback(gameState.guessHistory, feedbackPerRow)
    : {};

  const handleSubmitGuess = useCallback(async (gameId, guess) => {
    setGuessError(null);
    setIsSubmitting(true);
    try {
      const data = await submitGuess(gameId, guess);
      setGameState((prev) => ({
        ...prev,
        guessHistory: data.guess_history,
        feedbackPerRow: [...(prev.feedbackPerRow || []), data.feedback],
        status: data.status,
        currentRow: "",
        target: data.target ?? prev.target,
      }));
    } catch (e) {
      if (e.status === 404) {
        sessionStorage.removeItem(SESSION_GAME_ID);
        setGameState(null);
        setStartError(e.detail || "Game not found");
      } else {
        setGuessError(e.detail || e.message || "Invalid guess");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleKey = useCallback(
    (key) => {
      if (key === "Backspace") {
        setGameState((prev) => {
          if (!prev || prev.status !== "playing") return prev;
          return { ...prev, currentRow: prev.currentRow.slice(0, -1) };
        });
        return;
      }

      if (key === "Enter") {
        const prev = stateRef.current;
        if (!prev || prev.status !== "playing") return;
        if (submittingRef.current) return;
        const guess = prev.currentRow.trim().toUpperCase();
        if (guess.length !== prev.wordLength) return;
        handleSubmitGuess(prev.gameId, guess);
        return;
      }

      if (key.length === 1 && /[A-Za-z]/.test(key)) {
        setGameState((prev) => {
          if (!prev || prev.status !== "playing") return prev;
          if (prev.currentRow.length >= prev.wordLength) return prev;
          return { ...prev, currentRow: prev.currentRow + key.toUpperCase() };
        });
      }
    },
    [handleSubmitGuess],
  );

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
    return (
      <StartScreen
        onStart={startGame}
        error={startError}
        loading={isStarting}
      />
    );
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
      {guessError && (
        <p className="guess-error" role="alert">
          {guessError}
        </p>
      )}
      {(gameState.status === "won" || gameState.status === "lost") && (
        <div className={`game-over ${gameState.status}`}>
          <p>
            {gameState.status === "won" ? (
              "You won!"
            ) : (
              <>
                You lost. The word was <strong>{gameState.target}</strong>.
              </>
            )}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              sessionStorage.removeItem(SESSION_GAME_ID);
              setGameState(null);
            }}
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
