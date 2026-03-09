"""
Tests for API routes (functional/HTTP tests).
Use the `client` fixture from conftest for requests.
"""

from unittest.mock import AsyncMock, patch


def test_get_root(client):
    """
    Test GET /
        Returns 200 and welcome message
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "API IS UP AND RUNNING"}


def test_get_health(client):
    """
    Test GET /health
        Returns 200 and healthy status
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_post_games_creates_game(client):
    """
    Test POST /games with valid word_length
        Returns 201 or 200 with game_id, word_length, max_guesses
    """
    response = client.post("/games", json={"word_length": 5})
    assert response.status_code == 200
    data = response.json()
    assert "game_id" in data
    assert data["word_length"] == 5
    assert data["max_guesses"] == 6


def test_post_games_invalid_length_returns_422(client):
    """
    Test POST /games with word_length outside 5–8 (validation)
        Returns 422 Unprocessable Entity
    """
    response = client.post("/games", json={"word_length": 99})
    assert response.status_code == 422


def test_get_games_game_id_returns_game(client):
    """
    Test GET /games/{game_id} for existing game
        Returns 200 with game state
    """
    create_response = client.post("/games", json={"word_length": 5})
    assert create_response.status_code == 200
    game_id = create_response.json()["game_id"]
    response = client.get(f"/games/{game_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["game_id"] == game_id
    assert "guess_history" in data
    assert "feedback" in data
    assert data["status"] == "playing"


def test_get_games_game_id_404(client):
    """
    Test GET /games/{game_id} for missing game
        Returns 404
    """
    response = client.get("/games/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@patch("app.api.routes.is_valid_word", new_callable=AsyncMock, return_value=False)
def test_post_guess_invalid_word_returns_400(_, client):
    """
    Test POST /games/{id}/guess with invalid word
        Returns 400
    """
    create_response = client.post("/games", json={"word_length": 5})
    game_id = create_response.json()["game_id"]
    response = client.post(f"/games/{game_id}/guess", json={"guess": "XXXXX"})
    assert response.status_code == 400


@patch("app.api.routes.is_valid_word", new_callable=AsyncMock, return_value=True)
def test_post_guess_valid_returns_feedback(_, client):
    """
    Test POST /games/{id}/guess with valid word
        Returns 200 with feedback and updated state
    """
    create_response = client.post("/games", json={"word_length": 5})
    game_id = create_response.json()["game_id"]
    response = client.post(f"/games/{game_id}/guess", json={"guess": "think"})
    assert response.status_code == 200
    data = response.json()
    assert "feedback" in data
    assert len(data["feedback"]) == 5
    assert "guess_history" in data
    assert data["status"] in ("playing", "won", "lost")
