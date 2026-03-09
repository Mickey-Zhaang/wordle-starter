import { useWordle } from "../hooks/useWordle";
import { GameScreen } from "./GameScreen";

export const GameScreenContainer = ({
  initialGameState,
  onExitToStart,
  onGameWonOrLost,
  onBackToStart,
  onNewGame,
}) => {
  const { gameState, handleKey, shakeRowIndex, letterFeedback } = useWordle(
    initialGameState,
    {
      onGameNotFound: onExitToStart,
      onGameWonOrLost,
    },
  );

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
