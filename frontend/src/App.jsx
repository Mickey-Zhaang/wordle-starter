import { useState, useEffect, useCallback } from "react";
import "./App.css";

// Components
import { StartScreen } from "./components/StartScreen";
import { GameScreenContainer } from "./components/GameScreenContainer";

// Infrastructure
import * as Storage from "./storage";
import { fetchUnfinishedGames } from "./api/games";
import { createGame, getGame } from "./api/client";

export const App = () => {
  const [gameState, setGameState] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  const [unfinishedGames, setUnfinishedGames] = useState([]);

  // --- 1. DATA SYNCING ---

  const refreshLobby = useCallback(async () => {
    try {
      const { games, notFoundIds } = await fetchUnfinishedGames();

      // Cleanup any dead references found by the API
      notFoundIds.forEach((id) => {
        Storage.removeStoredGameId(id);
        Storage.clearSessionIfGame(id);
      });

      setUnfinishedGames(games);
    } catch (e) {
      console.error("Failed to sync unfinished games", e);
    }
  }, []);

  useEffect(() => {
    // Initial sync: Ensure session and storage are aligned
    const savedId = sessionStorage.getItem(Storage.SESSION_GAME_ID);
    if (savedId && Storage.getStoredGameIds().length === 0) {
      Storage.appendStoredGameId(savedId);
    }
    refreshLobby();
  }, [refreshLobby]);

  // --- 2. GAME ACTIONS ---

  const handleGameResolution = useCallback((data) => {
    Storage.setSessionGame(data.game_id);
    setGameState({
      gameId: data.game_id,
      wordLength: data.word_length,
      maxGuesses: data.max_guesses,
      guessHistory: data.guess_history || [],
      feedbackPerRow: data.feedback || [],
      currentRow: "",
      status: data.status ?? "playing",
      target: data.target ?? null,
    });
  }, []);

  const onResumeGame = useCallback(
    async (gameId) => {
      setStartError(null);
      try {
        const data = await getGame(gameId);
        handleGameResolution(data);
      } catch (e) {
        setStartError(e.detail || e.message || "Failed to load game");
      }
    },
    [handleGameResolution],
  );

  const onStartNewGame = useCallback(
    async (wordLength) => {
      setStartError(null);
      setIsStarting(true);
      try {
        const data = await createGame(wordLength);
        Storage.appendStoredGameId(data.game_id);
        handleGameResolution(data);
      } catch (e) {
        setStartError(e.detail || e.message || "Failed to start game");
      } finally {
        setIsStarting(false);
      }
    },
    [handleGameResolution],
  );

  const onRemoveGame = useCallback((gameId) => {
    Storage.removeStoredGameId(gameId);
    Storage.clearSessionIfGame(gameId);
    setUnfinishedGames((prev) => prev.filter((g) => g.game_id !== gameId));
  }, []);

  // --- 3. NAVIGATION ---

  const exitToMenu = useCallback(
    (errorDetail = null) => {
      setGameState(null);
      setStartError(errorDetail ?? null);
      refreshLobby();
    },
    [refreshLobby],
  );

  // --- 4. RENDER ---

  return (
    <main className="wordle-container">
      {!gameState ? (
        <StartScreen
          onStart={onStartNewGame}
          onResumeGame={onResumeGame}
          onRemoveGame={onRemoveGame}
          unfinishedGames={unfinishedGames}
          error={startError}
          loading={isStarting}
        />
      ) : (
        <GameScreenContainer
          key={gameState.gameId}
          initialGameState={gameState}
          onGameNotFound={(id, detail) => {
            if (id) onRemoveGame(id);
            exitToMenu(detail || "Game not found");
          }}
          onGameWonOrLost={() => Storage.removeStoredGameId(gameState.gameId)}
          onBackToStart={() => exitToMenu()}
          onNewGame={() => {
            onRemoveGame(gameState.gameId);
            exitToMenu();
          }}
        />
      )}
    </main>
  );
};
