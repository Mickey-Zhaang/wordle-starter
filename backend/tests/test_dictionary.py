"""
Tests the word_validator and dictionary_api modules
"""

from unittest.mock import AsyncMock, patch
import pytest

from app.services.word_validator import is_valid_word
from app.services.dictionary_api import is_word_in_dictionary


@pytest.mark.asyncio
async def test_is_valid_word_wrong_length():
    """
    Return false if word is not of right length
    """
    result = await is_valid_word("ab", 5)
    assert result is False


@pytest.mark.asyncio
async def test_is_valid_word_empty():
    """
    Return false if word is empty
    """
    result = await is_valid_word("", 5)
    assert result is False


@pytest.mark.asyncio
async def test_is_valid_word_not_word():
    """
    Return false if word isn't alphanumeric
    """
    result = await is_valid_word("-----", 5)
    assert result is False


@patch("app.services.word_validator.is_word_in_dictionary", new_callable=AsyncMock)
@pytest.mark.asyncio
async def test_is_valid_word_delegates_to_api(mock_api):
    """
    Mock API response to ensure our code runs as intended
        True if our word should be valid
        False if our word shouln't be valid
    """
    mock_api.return_value = True
    result = await is_valid_word("think", 5)
    assert result is True
    mock_api.assert_awaited_once_with("think")
    mock_api.return_value = False
    result = await is_valid_word("xyzab", 5)
    assert result is False


@patch("app.services.dictionary_api.httpx.AsyncClient")
@pytest.mark.asyncio
async def test_is_word_in_dictionary_200(mock_client_class):
    """
    Mock a response from dictioanry API in the case we get a status code of 200
        Result should be True
    """
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_client_class.return_value.__aenter__.return_value.get = AsyncMock(
        return_value=mock_response
    )
    result = await is_word_in_dictionary("think")
    assert result is True


@patch("app.services.dictionary_api.httpx.AsyncClient")
@pytest.mark.asyncio
async def test_is_word_in_dictionary_404(mock_client_class):
    """
    Mock a response from dictioanry API in the case we get a status code of 404
        Result should be False
    """
    mock_response = AsyncMock()
    mock_response.status_code = 404
    mock_client_class.return_value.__aenter__.return_value.get = AsyncMock(
        return_value=mock_response
    )
    result = await is_word_in_dictionary("xyzab")
    assert result is False
