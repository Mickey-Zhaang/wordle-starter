"""
Game state and business logic: create game, get game, submit guess.
"""

import random
import uuid
from dataclasses import dataclass, field

from app.services.wordlist import get_valid_words
from app.utils.feedback import get_feedback


@dataclass
class GameState:
    """
    In-memory state for a single Wordle game.
    """

    game_id: str
    word_length: int
    max_guesses: int
    target: str
    guess_history: list[str] = field(default_factory=list)
    status: str = "playing"  # "playing" | "won" | "lost"

    def feedback_per_row(self) -> list[list[str]]:
        """
        Return feedback for each submitted guess.
        """
        return [get_feedback(guess, self.target) for guess in self.guess_history]


def _random_target(word_length: int) -> str:
    """
    Pick a random target word of the given length from the word list.
    """
    words = get_valid_words(word_length)
    if not words:
        raise ValueError(f"No words available for length {word_length}")
    return random.choice(list(words))


_store: dict[str, GameState] = {}


def create_game(word_length: int) -> GameState:
    """
    Create a new game with a random target word of the given length (5–8).
    """
    if word_length not in (5, 6, 7, 8):
        raise ValueError("word_length must be 5, 6, 7, or 8")
    game_id = str(uuid.uuid4())
    target = _random_target(word_length)
    game = GameState(
        game_id=game_id,
        word_length=word_length,
        max_guesses=word_length + 1,
        target=target,
    )
    _store[game_id] = game
    return game


def get_game(game_id: str) -> GameState | None:
    """
    Return the game for the given id, or None if not found.
    """
    return _store.get(game_id)


def update_game(game: GameState) -> None:
    """
    Persist the given game state in the store.
    """
    _store[game.game_id] = game


def submit_guess(
    game_id: str, guess: str
) -> tuple[GameState, list[str] | None, str | None]:
    """
    Submit a guess. Returns (game, feedback_list, error_message).
    Word validity is checked in the route via word_validator.
    """
    game = get_game(game_id)
    if not game:
        return (None, None, "Game not found")
    if game.status != "playing":
        return (game, None, "Game already finished")

    # strip and uppercase for storage
    guess_upper = guess.strip().upper()
    if len(guess_upper) != game.word_length:
        return (game, None, f"Guess must be {game.word_length} letters")
    game.guess_history.append(guess_upper)
    feedback = get_feedback(guess_upper, game.target)
    if guess_upper == game.target:
        game.status = "won"
    elif len(game.guess_history) >= game.max_guesses:
        game.status = "lost"
    update_game(game)
    return (game, feedback, None)
