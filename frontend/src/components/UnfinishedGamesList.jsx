function UnfinishedGamesList({ games, onResumeGame, onRemoveGame, loading }) {
  if (games.length === 0) return null;

  return (
    <div className="start-form">
      <h3 className="start-form__heading">Unfinished games</h3>
      <ul className="unfinished-games-list" aria-label="Unfinished games">
        {games.map((game) => {
          const guessCount = game.guess_history?.length ?? 0;
          const meta = `${game.word_length} letters · ${guessCount}/${game.max_guesses} guesses`;
          return (
            <li key={game.game_id} className="unfinished-game-slot">
              <button
                type="button"
                className="unfinished-game-slot__resume"
                onClick={() => onResumeGame(game.game_id)}
                disabled={loading}
                aria-label={`Resume game: ${meta}`}
              >
                {meta}
              </button>
              <button
                type="button"
                className="unfinished-game-slot__remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveGame?.(game.game_id);
                }}
                disabled={loading}
                aria-label={`Remove this game from list (${meta})`}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default UnfinishedGamesList;
