"""
API routes for the Wordle backend.
"""

from fastapi import APIRouter, HTTPException

from app.models.game import CreateGameRequest, CreateGameResponse, GuessRequest
from app.services.game_service import create_game, get_game, submit_guess
from app.services.word_validator import is_valid_word

router = APIRouter()


@router.get("/")
def read_root():
    """Reads the root."""
    return {"message": "API IS UP AND RUNNING"}


@router.get("/health")
def health_check():
    """Health check."""
    return {"status": "healthy"}


@router.post("/games", response_model=CreateGameResponse)
def post_games(body: CreateGameRequest):
    """Create a new game with the given word length."""
    try:
        game = create_game(body.word_length)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return CreateGameResponse(
        game_id=game.game_id,
        word_length=game.word_length,
        max_guesses=game.max_guesses,
    )


@router.get("/games/{game_id}")
def get_games_game_id(game_id: str):
    """Return current game state."""
    game = get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    response = {
        "game_id": game.game_id,
        "word_length": game.word_length,
        "max_guesses": game.max_guesses,
        "guess_history": game.guess_history,
        "feedback": game.feedback_per_row(),
        "status": game.status,
    }
    if game.status == "lost":
        response["target"] = game.target
    return response


@router.post("/games/{game_id}/guess")
async def post_games_guess(game_id: str, body: GuessRequest):
    """Submit a guess and return feedback and updated state."""
    game = get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.status != "playing":
        raise HTTPException(status_code=400, detail="Game already finished")
    guess_upper = body.guess.strip().upper()
    if len(guess_upper) != game.word_length:
        raise HTTPException(
            status_code=400, detail=f"Guess must be {game.word_length} letters"
        )
    try:
        valid = await is_valid_word(guess_upper, game.word_length)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    if not valid:
        raise HTTPException(status_code=400, detail="Not a valid word")
    game, feedback, error = submit_guess(game_id, body.guess)
    if error:
        if "not found" in error.lower():
            raise HTTPException(status_code=404, detail=error)
        raise HTTPException(status_code=400, detail=error)
    response = {
        "feedback": feedback,
        "guess_history": game.guess_history,
        "status": game.status,
    }
    if game.status == "won":
        response["target"] = game.target
    if game.status == "lost":
        response["target"] = game.target
    return response
