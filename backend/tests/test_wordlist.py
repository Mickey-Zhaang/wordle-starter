"""
testing suite for app.services.wordlist
"""

import random
from app.services.wordlist import get_valid_words


def test_get_valid_words_length_5_returns_uppercase_set():
    """
    Runs mutliple test with the get_valid_words function from app.services.wordlist
    """

    # === TEST 1: valid result on random length of word ===
    random_number = random.randint(5, 8)
    result = get_valid_words(random_number)
    assert isinstance(result, set)
    assert len(result) > 0
    assert all(len(w) == random_number and w.isupper() for w in result)

    # === TEST 2: invalid length should return empty set ===
    result = get_valid_words(100)
    assert result == set()
