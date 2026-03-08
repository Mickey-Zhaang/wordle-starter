"""
testing suite for the get_feedback function from app.utils.feedback
"""

from app.utils.feedback import get_feedback


def test_get_feedback():
    """
    Runs mutliple test with the get_feedback function from app.utils.feedback
    """

    # === TEST 1: 1 correct, and 1 present, 3 absent ===
    guess = "crane"
    target = "plain"
    result = get_feedback(guess=guess, target=target)
    assert result == ["absent", "absent", "correct", "present", "absent"]

    # === TEST 2: all correct ===
    guess = target = "crane"
    result = get_feedback(guess=guess, target=target)
    assert result == ["correct"] * len(guess)

    # === TEST 3: all absent ===
    guess = "XXXXX"
    target = "YYYYY"
    result = get_feedback(guess=guess, target=target)
    assert result == ["absent"] * len(guess)

    # === TEST 4: duplicate letters? ===
    guess = "PPPPP"
    target = "apples"
    result = get_feedback(guess=guess, target=target)
    assert result == ["absent", "correct", "correct", "absent", "absent"]

    # === TEST 5: input normalization ===
    guess = "crane"
    target = "CRANE"
    result = get_feedback(guess=guess, target=target)
    assert result == ["correct"] * len(guess)
