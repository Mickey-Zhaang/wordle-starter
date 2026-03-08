"""
testing suite for app.utils.feedback
"""

from app.utils.feedback import get_feedback


def test_get_feedback_mix_correct_present_absent():
    """
    Test mix of correct, present, and absent
        Returns one correct, one present, rest absent
    """
    guess = "crane"
    target = "plain"
    result = get_feedback(guess=guess, target=target)
    assert result == ["absent", "absent", "correct", "present", "absent"]


def test_get_feedback_all_correct():
    """
    Test guess equals target
        Returns all correct
    """
    guess = target = "crane"
    result = get_feedback(guess=guess, target=target)
    assert result == ["correct"] * len(guess)


def test_get_feedback_all_absent():
    """
    Test no letters match
        Returns all absent
    """
    guess = "XXXXX"
    target = "YYYYY"
    result = get_feedback(guess=guess, target=target)
    assert result == ["absent"] * len(guess)


def test_get_feedback_duplicate_letters_in_guess():
    """
    Test duplicate letters in guess (Wordle rule: each target letter used at most once)
        Returns correct mix of correct, present, absent
    """
    guess = "PPPPP"
    target = "apples"
    result = get_feedback(guess=guess, target=target)
    assert result == ["absent", "correct", "correct", "absent", "absent"]


def test_get_feedback_normalizes_input():
    """
    Test input normalization (strip/upper)
        Returns same as if inputs were already normalized
    """
    guess = "crane"
    target = "CRANE"
    result = get_feedback(guess=guess, target=target)
    assert result == ["correct"] * len(guess)
