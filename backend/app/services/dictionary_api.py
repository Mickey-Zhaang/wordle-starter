"""
Validate words using the Free Dictionary API.
Uses an in-memory cache to avoid repeated requests.
"""

import httpx
import logging

from app.services.wordlist import get_valid_words

_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en"
_TIMEOUT = 5.0

client = httpx.AsyncClient(timeout=_TIMEOUT)


async def is_word_in_dictionary(word: str) -> bool:
    """
    Return True if the word exists in the dictionary (API returns 200).
    Return False any other case
    """

    if not word or not word.isalpha():
        return False

    key = word.upper().strip()
    target_words = get_valid_words(len(key))

    # immediate check
    if key in target_words:
        return True

    try:
        response = await client.get(f"{_BASE}/{key}")
        if response.status_code == 200:
            return True
        return False
    except (httpx.HTTPError, httpx.TimeoutException):
        logging.error("Dictionary API unreachable.")
        return False
