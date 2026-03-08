import { useState } from "react";

function StartScreen({ onStart }) {
  const [wordLength, setWordLength] = useState(5);

  function handleSubmit(e) {
    e.preventDefault();
    onStart(wordLength);
  }

  return (
    <div className="start-screen">
      <h1 className="wordle-title">Wordle</h1>
      <form onSubmit={handleSubmit} className="start-form">
        <label htmlFor="word-length">Word length</label>
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
            >
              {n}
            </button>
          ))}
        </div>
        <button type="submit" className="btn-primary">
          Start game
        </button>
      </form>
    </div>
  );
}

export default StartScreen;
