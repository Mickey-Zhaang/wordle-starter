import React, { memo } from "react";

const GameCell = memo(({ letter, status }) => (
  <div className={`game-cell ${status ? `cell-${status}` : ""}`}>{letter}</div>
));

const GameRow = memo(({ rowData, feedback, wordLength, isShaking }) => {
  const letters = (rowData ?? "").toUpperCase().split("");
  return (
    <div className={`game-row ${isShaking ? "game-row--shake" : ""}`}>
      {Array.from({ length: wordLength }, (_, i) => (
        <GameCell
          key={i}
          letter={letters[i] ?? ""}
          status={feedback ? feedback[i] : null}
        />
      ))}
    </div>
  );
});

export const GameBoard = ({
  rows,
  feedbackPerRow,
  wordLength,
  maxRows,
  shakeRowIndex,
}) => {
  return (
    <div className="game-board">
      {Array.from({ length: maxRows }, (_, r) => (
        <GameRow
          key={r}
          wordLength={wordLength}
          rowData={rows[r]}
          feedback={feedbackPerRow[r]}
          isShaking={shakeRowIndex === r}
        />
      ))}
    </div>
  );
};
