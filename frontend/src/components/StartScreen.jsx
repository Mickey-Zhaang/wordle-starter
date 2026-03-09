import { useState } from "react";

function StartScreen({
  onStart,
  onResumeGame,
  onRemoveGame,
  unfinishedGames = [],
  error,
  loading,
}) {
  const [wordLength, setWordLength] = useState(5);

  function handleSubmit(e) {
    e.preventDefault();
    onStart(wordLength);
  }

  return (
    <div className="start-screen">
      <h1 className="wordle-title">Wordle</h1>
      {error && (
        <p className="start-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="start-form">
        <label htmlFor="word-length">Choose Word Length</label>
        <div
          className="word-length-buttons"
          role="group"
          aria-label="Word length"
        >
          {[5, 6, 7, 8].map((n) => (
            <button
              key={n}
              type="button"
              className={`word-length-btn ${wordLength === n ? "selected" : ""}`}
              onClick={() => setWordLength(n)}
              onDoubleClick={() => !loading && onStart(n)}
              disabled={loading}
            >
              {n}
            </button>
          ))}
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Starting…" : "Start game"}
        </button>
        {unfinishedGames.length > 0 && (
          <div className="start-form">
            <label>Unfinished games</label>
            <div
              className="word-length-buttons"
              role="group"
              aria-label="Unfinished games"
            >
              {unfinishedGames.map((game, index) => (
                <div key={game.game_id} className="unfinished-game-slot">
                  <button
                    type="button"
                    className="word-length-btn"
                    onClick={() => onResumeGame(game.game_id)}
                    disabled={loading}
                  >
                    {index + 1}
                  </button>
                  <button
                    type="button"
                    className="unfinished-game-slot__remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveGame?.(game.game_id);
                    }}
                    disabled={loading}
                    aria-label={`Remove game ${index + 1} from list`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default StartScreen;
