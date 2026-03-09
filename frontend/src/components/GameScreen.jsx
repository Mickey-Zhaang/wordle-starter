import { GameBoard } from "./GameBoard";
import { Keyboard } from "./Keyboard";

export const GameScreen = ({
  gameState,
  handleKey,
  shakeRowIndex,
  letterFeedback,
  onBackToStart,
  onNewGame,
}) => {
  const rows = [
    ...(gameState.guessHistory || []),
    ...(gameState.status === "playing" ? [gameState.currentRow ?? ""] : []),
  ];
  const feedbackPerRow = gameState?.feedbackPerRow ?? [];

  return (
    <div className="app game-screen">
      <button
        type="button"
        className="wordle-title wordle-title-link small"
        onClick={onBackToStart}
        aria-label="Back to start"
      >
        Wordle
      </button>
      <GameBoard
        rows={rows}
        feedbackPerRow={feedbackPerRow}
        wordLength={gameState.wordLength}
        maxRows={gameState.maxGuesses}
        shakeRowIndex={shakeRowIndex}
      />
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
          <button type="button" className="btn-primary" onClick={onNewGame}>
            New game
          </button>
        </div>
      )}
      {gameState.status === "playing" && (
        <Keyboard letterFeedback={letterFeedback} onKey={handleKey} />
      )}
    </div>
  );
};
