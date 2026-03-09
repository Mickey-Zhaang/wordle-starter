import { useState } from "react";
import { UnfinishedGamesList } from "./UnfinishedGamesList";
import { WordLengthChoice } from "./WordLengthChoice";

export const StartScreen = ({
  onStart,
  onResumeGame,
  onRemoveGame,
  unfinishedGames = [],
  error,
  loading,
}) => {
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
        <fieldset className="start-form__fieldset">
          <legend className="start-form__legend">Choose Word Length</legend>
          <div
            className="word-length-buttons"
            role="group"
            aria-label="Word length"
          >
            {[5, 6, 7, 8].map((n) => (
              <WordLengthChoice
                key={n}
                value={n}
                selected={wordLength === n}
                onClick={setWordLength}
                disabled={loading}
              />
            ))}
          </div>
        </fieldset>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Starting…" : "Start game"}
        </button>
      </form>
      <UnfinishedGamesList
        games={unfinishedGames}
        onResumeGame={onResumeGame}
        onRemoveGame={onRemoveGame}
        loading={loading}
      />
    </div>
  );
};
