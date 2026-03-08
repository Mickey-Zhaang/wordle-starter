"""
testing suite for app.services.wordlist
"""

import random
from app.services.wordlist import get_valid_words


def test_get_valid_words_length_5_returns_uppercase_set():
    """
    Test valid input of random length of word
        Returns appropriate set
    """
    random_number = random.randint(5, 8)
    result = get_valid_words(random_number)
    assert isinstance(result, set)
    assert len(result) > 0
    assert all(len(w) == random_number and w.isupper() for w in result)


def test_get_valid_words_length_100_returns_nothing():
    """
    Test invalid word lenght
        Returns empty set
    """
    # === TEST 2: invalid length should return empty set ===
    result = get_valid_words(100)
    assert result == set()
