/**
 * Returns feedback for each letter in guess compared to target.
 * "correct" = green, "present" = yellow, "absent" = gray.
 * Handles duplicates: each target letter is "used" at most once for correct, then present.
 */
export function getFeedback(guess, target) {
  const result = [];
  const targetUpper = target.toUpperCase();
  const guessUpper = guess.toUpperCase();
  const targetCount = {};
  for (const c of targetUpper) {
    targetCount[c] = (targetCount[c] || 0) + 1;
  }
  const used = {};
  for (const c of targetUpper) {
    used[c] = 0;
  }

  // First pass: mark correct (green)
  for (let i = 0; i < guessUpper.length; i++) {
    if (guessUpper[i] === targetUpper[i]) {
      result[i] = "correct";
      used[guessUpper[i]]++;
    } else {
      result[i] = null;
    }
  }

  // Second pass: mark present (yellow) or absent (gray)
  for (let i = 0; i < guessUpper.length; i++) {
    if (result[i] !== null) continue;
    const c = guessUpper[i];
    if (targetCount[c] != null && used[c] < targetCount[c]) {
      result[i] = "present";
      used[c]++;
    } else {
      result[i] = "absent";
    }
  }

  return result;
}

/**
 * Build a map of letter -> best status for keyboard coloring.
 * correct > present > absent.
 */
export function getLetterFeedback(guessHistory, feedbackPerRow) {
  const best = {};
  const order = { absent: 0, present: 1, correct: 2 };
  for (let r = 0; r < guessHistory.length; r++) {
    const word = guessHistory[r].toUpperCase();
    const row = feedbackPerRow[r] || [];
    for (let i = 0; i < word.length; i++) {
      const status = row[i];
      const letter = word[i];
      if (!status) continue;
      const current = order[best[letter]];
      const next = order[status];
      if (current == null || next > current) {
        best[letter] = status;
      }
    }
  }
  return best;
}
