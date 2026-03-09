import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import StartScreen from "./components/StartScreen";
import GameBoard from "./components/GameBoard";
import Keyboard from "./components/Keyboard";
import { getLetterFeedback } from "./utils/feedback";
import { createGame, submitGuess, getGame } from "./api/client";

const SESSION_GAME_ID = "wordle-game-id";
const WORDLE_GAME_IDS = "wordle-game-ids";

function getStoredGameIds() {
  try {
    const raw = sessionStorage.getItem(WORDLE_GAME_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function appendStoredGameId(gameId) {
  const ids = getStoredGameIds();
  if (!ids.includes(gameId)) ids.push(gameId);
  sessionStorage.setItem(WORDLE_GAME_IDS, JSON.stringify(ids));
}

function removeStoredGameId(gameId) {
  const ids = getStoredGameIds().filter((id) => id !== gameId);
  sessionStorage.setItem(WORDLE_GAME_IDS, JSON.stringify(ids));
}

function App() {
  const [gameState, setGameState] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guessError, setGuessError] = useState(null);
  const [resumeChecked, setResumeChecked] = useState(false);
  const [unfinishedGames, setUnfinishedGames] = useState([]);

  const stateRef = useRef(gameState);
  const submittingRef = useRef(isSubmitting);
  stateRef.current = gameState;
  submittingRef.current = isSubmitting;

  useEffect(() => {
    if (resumeChecked) return;
    setResumeChecked(true);
    const savedId = sessionStorage.getItem(SESSION_GAME_ID);
    const ids = getStoredGameIds();
    if (savedId && ids.length === 0) {
      sessionStorage.setItem(WORDLE_GAME_IDS, JSON.stringify([savedId]));
    }
  }, [resumeChecked]);

  // When on start screen, fetch stored game ids and filter to playing
  useEffect(() => {
    if (gameState !== null) return;
    const ids = getStoredGameIds();
    if (ids.length === 0) {
      setUnfinishedGames([]);
      return;
    }
    Promise.all(ids.map((id) => getGame(id).catch(() => null)))
      .then((results) =>
        results.filter((data) => data && data.status === "playing"),
      )
      .then(setUnfinishedGames);
  }, [gameState]);

  const onResumeGame = useCallback(async (gameId) => {
    setStartError(null);
    try {
      const data = await getGame(gameId);
      sessionStorage.setItem(SESSION_GAME_ID, gameId);
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
    } catch (e) {
      setStartError(e.detail || e.message || "Failed to load game");
    }
  }, []);

  const onRemoveGame = useCallback((gameId) => {
    removeStoredGameId(gameId);
    setUnfinishedGames((prev) => prev.filter((g) => g.game_id !== gameId));
  }, []);

  const goToStartScreen = useCallback(() => {
    setGameState(null);
  }, []);

  const startGame = useCallback(async (wordLength) => {
    setStartError(null);
    setIsStarting(true);
    try {
      const data = await createGame(wordLength);
      sessionStorage.setItem(SESSION_GAME_ID, data.game_id);
      appendStoredGameId(data.game_id);
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
      if (data.status === "won" || data.status === "lost") {
        removeStoredGameId(gameId);
      }
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
        removeStoredGameId(gameId);
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
        onResumeGame={onResumeGame}
        onRemoveGame={onRemoveGame}
        unfinishedGames={unfinishedGames}
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
      <button
        type="button"
        className="wordle-title wordle-title-link small"
        onClick={goToStartScreen}
        aria-label="Back to start"
      >
        Wordle
      </button>
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
              removeStoredGameId(gameState.gameId);
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
