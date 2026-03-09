"""
Tests the game_service module
"""

from unittest.mock import patch

import pytest

from app.services.game_service import (
    GameState,
    _random_target,
    create_game,
    get_game,
    submit_guess,
    update_game,
)

# Default game used across submit_guess and feedback_per_row tests; override with kwargs.
DEFAULT_GAME = dict(
    game_id="test-id",
    word_length=5,
    max_guesses=6,
    target="CRANE",
    guess_history=[],
    status="playing",
)


def make_game(**kwargs):
    """Build a GameState with DEFAULT_GAME defaults, overriding with kwargs."""
    data = {**DEFAULT_GAME, **kwargs}
    # Copy list so mutating game.guess_history doesn't mutate DEFAULT_GAME
    data["guess_history"] = list(data["guess_history"])
    return GameState(**data)


def test_gamestate_class():
    """
    Tests the GameState Class
    """
    test_game_state = make_game(target="crane")
    assert test_game_state.status == "playing"  # defaulted value


@patch("app.services.game_service.get_feedback")
def test_feedback_per_row_returns_list_per_guess_without_calling_real_get_feedback(
    mock_get_feedback,
):
    """
    Test feedback_per_row returns List[List[str]] without calling real get_feedback
        Returns one list of feedback per guess, using patched get_feedback
    """
    mock_get_feedback.side_effect = [
        ["absent", "absent", "absent", "absent", "absent"],
        ["correct", "correct", "correct", "correct", "correct"],
    ]
    game = make_game(guess_history=["THINK", "CRANE"])
    result = game.feedback_per_row()
    assert result == [
        ["absent", "absent", "absent", "absent", "absent"],
        ["correct", "correct", "correct", "correct", "correct"],
    ]
    assert mock_get_feedback.call_count == 2
    mock_get_feedback.assert_any_call("THINK", "CRANE")
    mock_get_feedback.assert_any_call("CRANE", "CRANE")


def test_random_target_invalid_length_raises_value_error():
    """
    Test _random_target with invalid length (no words in list)
        Raises ValueError
    """
    with pytest.raises(ValueError, match="No words available for length 100"):
        _random_target(100)


@patch("app.services.game_service.get_valid_words", return_value={"TESTING"})
def test_random_target_valid_length(_):
    """
    Test _random_target with valid length
        Returns one word from the set returned by get_valid_words
    """
    result = _random_target(5)
    assert result == "TESTING"


def test_create_game_invalid_word_length_raises_value_error():
    """
    Test create_game with invalid word length (not 5–8)
        Raises ValueError
    """
    with pytest.raises(ValueError, match="word_length must be 5, 6, 7, or 8"):
        create_game(4)
    with pytest.raises(ValueError, match="word_length must be 5, 6, 7, or 8"):
        create_game(9)


@patch("app.services.game_service._random_target", return_value="CRANE")
def test_create_game_returns_game_with_correct_fields(mock_random_target):
    """
    Test create_game with valid length
        Returns GameState with correct:
        game_id, word_length, max_guesses, target, empty history, playing
    """
    game = create_game(5)
    assert game.game_id != ""
    assert len(game.game_id) == 36  # uuid4 string
    assert game.word_length == 5
    assert game.max_guesses == 6
    assert game.target == "CRANE"
    assert game.guess_history == []
    assert game.status == "playing"
    mock_random_target.assert_called_once_with(5)


@patch("app.services.game_service._random_target", return_value="GARDEN")
def test_create_game_stores_game(_):
    """
    Test create_game persists game so get_game returns it
        Same game is retrievable by game_id
    """
    game = create_game(6)
    retrieved = get_game(game.game_id)
    assert retrieved is not None
    assert retrieved.game_id == game.game_id
    assert retrieved.target == game.target


@patch("app.services.game_service._random_target", return_value="CRANE")
def test_update_game_persists_changed_state(_):
    """
    Test update_game overwrites store so get_game returns updated state
        Mutations to game then update_game are visible via get_game
    """
    game = create_game(5)
    game.status = "won"
    game.guess_history.append("CRANE")
    update_game(game)
    retrieved = get_game(game.game_id)
    assert retrieved is not None
    assert retrieved.status == "won"
    assert retrieved.guess_history == ["CRANE"]


@patch("app.services.game_service.get_game", return_value=None)
def test_submit_guess_not_game(_):
    """
    Tests submit guess, specifically when game is None
        Should expect (None, None, "Game not found")
    """
    test_game, test_feedback, test_state = submit_guess("test", "CRANE")
    assert not test_game
    assert not test_feedback
    assert test_state == "Game not found"


@patch("app.services.game_service.get_game")
def test_submit_guess_finished_game(mock_get_game):
    """
    Test submit_guess when game status is not "playing"
        Returns (game, None, "Game already finished")
    """
    game = make_game(guess_history=["THINK", "CRANE"], status="won")
    mock_get_game.return_value = game
    test_game, test_feedback, test_state = submit_guess("test", "CRANE")
    assert test_game == game
    assert test_feedback is None
    assert test_state == "Game already finished"


@patch("app.services.game_service.get_game")
def test_submit_guess_wrong_length_returns_error(mock_get_game):
    """
    Test submit_guess when guess length does not match word_length
        Returns (game, None, "Guess must be {n} letters")
    """
    game = make_game()
    mock_get_game.return_value = game
    test_game, test_feedback, test_state = submit_guess("test-id", "AB")
    assert test_game == game
    assert test_feedback is None
    assert test_state == "Guess must be 5 letters"


@patch("app.services.game_service.get_feedback", return_value=["correct"] * 5)
@patch("app.services.game_service.get_game")
def test_submit_guess_winning_guess_updates_game(mock_get_game, mock_get_feedback):
    """
    Test submit_guess when guess equals target
        Appends guess to history, sets status "won", returns (game, feedback, None)
    """
    game = make_game()
    mock_get_game.return_value = game
    test_game, test_feedback, test_state = submit_guess("test-id", "crane")
    assert test_state is None
    assert test_feedback == ["correct"] * 5
    assert test_game.guess_history == ["CRANE"]
    assert test_game.status == "won"


@patch("app.services.game_service.get_feedback", return_value=["absent"] * 5)
@patch("app.services.game_service.get_game")
def test_submit_guess_wrong_guess_continues_playing(mock_get_game, _):
    """
    Test submit_guess when guess is wrong and guesses remain
        Appends guess to history, status stays "playing", returns (game, feedback, None)
    """
    game = make_game()
    mock_get_game.return_value = game
    test_game, test_feedback, test_state = submit_guess("test-id", "  think  ")
    assert test_state is None
    assert test_feedback == ["absent"] * 5
    assert test_game.guess_history == ["THINK"]
    assert test_game.status == "playing"


@patch("app.services.game_service.get_feedback", return_value=["absent"] * 5)
@patch("app.services.game_service.get_game")
def test_submit_guess_last_wrong_guess_sets_lost(mock_get_game, _):
    """
    Test submit_guess when guess is wrong and no guesses remain
        Appends guess, sets status "lost", returns (game, feedback, None)
    """
    game = make_game(
        guess_history=["AAAAA", "BBBBB", "CCCCC", "DDDDD", "EEEEE"],
    )
    mock_get_game.return_value = game
    test_game, test_feedback, test_state = submit_guess("test-id", "ZZZZZ")
    assert test_state is None
    assert test_game.guess_history[-1] == "ZZZZZ"
    assert test_game.status == "lost"
