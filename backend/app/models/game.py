"""
Pydantic schemas for game API.
"""

from pydantic import BaseModel, Field


class CreateGameRequest(BaseModel):
    word_length: int = Field(..., ge=5, le=8, description="Number of letters (5-8)")


class CreateGameResponse(BaseModel):
    game_id: str
    word_length: int
    max_guesses: int


class GuessRequest(BaseModel):
    guess: str
