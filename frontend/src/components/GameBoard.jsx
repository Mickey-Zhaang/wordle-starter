function GameBoard({ rows, feedbackPerRow, wordLength, maxRows }) {
  const paddedRows = Array.from({ length: maxRows }, (_, r) => {
    const rowLetters = rows[r] != null ? rows[r].toUpperCase().split("") : [];
    const feedback = feedbackPerRow[r] || [];
    return (
      <div key={r} className="game-row">
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
