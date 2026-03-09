import { useWordle } from "../hooks/useWordle";
import { GameScreen } from "./GameScreen";

export const GameScreenContainer = ({
  initialGameState,
  onGameNotFound,
  onGameWonOrLost,
  onBackToStart,
  onNewGame,
}) => {
  const { gameState, handleKey, shakeRowIndex, letterFeedback } = useWordle(
    initialGameState,
    {
      onGameNotFound,
      onGameWonOrLost,
    },
  );

  if (!gameState) {
    return <div className="app loading-screen">Loading game...</div>;
  }

  return (
    <GameScreen
      gameState={gameState}
      handleKey={handleKey}
      shakeRowIndex={shakeRowIndex}
      letterFeedback={letterFeedback}
      onBackToStart={onBackToStart}
      onNewGame={onNewGame}
    />
  );
};
