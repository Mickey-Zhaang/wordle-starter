"""
Word validation: uses Free Dictionary API (via dictionary_api) for guess validation.
"""

from app.services.dictionary_api import is_word_in_dictionary


async def is_valid_word(word: str, word_length: int) -> bool:
    """
    Return True if word has the right length and is in the dictionary (Free Dictionary API).
    """
    if not word or len(word) != word_length:
        return False
    return await is_word_in_dictionary(word.strip())
