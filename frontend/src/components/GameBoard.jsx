function GameBoard({ rows, feedbackPerRow, wordLength, maxRows, shakeRowIndex }) {
  const paddedRows = Array.from({ length: maxRows }, (_, r) => {
    const rowLetters = rows[r] != null ? rows[r].toUpperCase().split("") : [];
    const feedback = feedbackPerRow[r] || [];
    const isShaking = shakeRowIndex === r;
    return (
      <div key={r} className={`game-row ${isShaking ? "game-row--shake" : ""}`}>
        {Array.from({ length: wordLength }, (_, c) => {
          const letter = rowLetters[c] ?? "";
          const status = feedback[c] ?? null;
          return (
            <div
              key={c}
              className={`game-cell ${status != null ? `cell-${status}` : ""}`}
            >
              {letter}
            </div>
          );
        })}
      </div>
    );
  });

  return <div className="game-board">{paddedRows}</div>;
}

export default GameBoard;
