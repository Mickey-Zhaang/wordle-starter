"""
Compute per-letter feedback (correct / present / absent) for a guess vs target.
Matches frontend logic: duplicate letters handled so each target letter used at most once.
"""

from typing import Literal

FeedbackStatus = Literal["correct", "present", "absent"]


def get_feedback(guess: str, target: str) -> list[FeedbackStatus]:
    """
    Return feedback for each letter in guess compared to target.
    correct = green, present = yellow, absent = gray.
    """
    guess_upper = guess.strip().upper()
    target_upper = target.strip().upper()
    target_count: dict[str, int] = {}
    for letter in target_upper:
        target_count[letter] = 1 + target_count.get(letter, 0)
    used = {letter: 0 for letter in target_upper}

    result: list[FeedbackStatus | None] = [None] * len(guess_upper)

    # First pass: correct (green)
    for i, letter in enumerate(guess_upper):
        target_letter = target_upper[i]
        if letter == target_letter:
            result[i] = "correct"
            used[letter] += 1

    # Second pass: present (yellow) or absent (gray)
    for i, letter in enumerate(guess_upper):
        if result[i] == "correct":
            continue
        # letter is in target -> but not correct
        if target_count.get(letter, 0) > used.get(letter, 0):
            result[i] = "present"
            used[letter] = 1 + used.get(letter, 0)
        # letter not in target
        else:
            result[i] = "absent"

    return result
