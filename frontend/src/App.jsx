import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { StartScreen } from "./components/StartScreen";
import { GameScreenContainer } from "./components/GameScreenContainer";
import {
  SESSION_GAME_ID,
  WORDLE_GAME_IDS,
  getStoredGameIds,
  appendStoredGameId,
  removeStoredGameId,
  clearSessionIfGame,
} from "./storage";
import { fetchUnfinishedGames } from "./api/games";
import { createGame, getGame } from "./api/client";

export const App = () => {
  const [gameState, setGameState] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  const [unfinishedGames, setUnfinishedGames] = useState([]);

  const loadUnfinishedGames = useCallback(() => {
    fetchUnfinishedGames().then(({ games, notFoundIds }) => {
      notFoundIds.forEach((id) => {
        removeStoredGameId(id);
        clearSessionIfGame(id);
      });
      setUnfinishedGames(games);
    });
  }, []);

  useEffect(() => {
    const savedId = sessionStorage.getItem(SESSION_GAME_ID);
    const ids = getStoredGameIds();
    if (savedId && ids.length === 0) {
      sessionStorage.setItem(WORDLE_GAME_IDS, JSON.stringify([savedId]));
    }
    loadUnfinishedGames();
  }, [loadUnfinishedGames]);

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
    clearSessionIfGame(gameId);
    setUnfinishedGames((prev) => prev.filter((g) => g.game_id !== gameId));
  }, []);

  const goToStartScreen = useCallback(() => {
    setGameState(null);
    loadUnfinishedGames();
  }, [loadUnfinishedGames]);

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

  const handleExitToStart = useCallback(
    (gameId, detail) => {
      if (gameId) {
        removeStoredGameId(gameId);
        clearSessionIfGame(gameId);
      }
      setGameState(null);
      setStartError(detail || "Game not found");
      loadUnfinishedGames();
    },
    [loadUnfinishedGames],
  );

  if (gameState == null) {
    return (
      <main className="wordle-container">
        <StartScreen
          onStart={startGame}
          onResumeGame={onResumeGame}
          onRemoveGame={onRemoveGame}
          unfinishedGames={unfinishedGames}
          error={startError}
          loading={isStarting}
        />
      </main>
    );
  }

  return (
    <main className="wordle-container">
      <GameScreenContainer
        key={gameState.gameId}
        initialGameState={gameState}
        onGameNotFound={handleExitToStart}
        onGameWonOrLost={() => removeStoredGameId(gameState.gameId)}
        onBackToStart={goToStartScreen}
        onNewGame={() => {
          removeStoredGameId(gameState.gameId);
          clearSessionIfGame(gameState.gameId);
          setGameState(null);
          loadUnfinishedGames();
        }}
      />
    </main>
  );
};
