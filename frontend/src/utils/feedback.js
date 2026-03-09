const CORRECT = "correct";
const PRESENT = "present";
const ABSENT = "absent";

const STATUS_RANK = { [ABSENT]: 0, [PRESENT]: 1, [CORRECT]: 2 };

function countLetterFrequencies(word) {
  const count = {};
  for (const letter of word.toUpperCase()) {
    count[letter] = (count[letter] ?? 0) + 1;
  }
  return count;
}

export function getFeedback(guess, target) {
  const targetWord = target.toUpperCase();
  const guessWord = guess.toUpperCase();
  const totalInTarget = countLetterFrequencies(targetWord);
  const matchedSoFar = {};

  const result = new Array(guessWord.length);

  // 1. Mark exact matches (green)
  for (let i = 0; i < guessWord.length; i++) {
    const letter = guessWord[i];
    if (letter === targetWord[i]) {
      result[i] = CORRECT;
      matchedSoFar[letter] = (matchedSoFar[letter] ?? 0) + 1;
    } else {
      result[i] = null;
    }
  }

  // 2. Mark misplaced (yellow) or not in word (gray)
  for (let i = 0; i < guessWord.length; i++) {
    if (result[i] !== null) continue;
    const letter = guessWord[i];
    const totalAllowed = totalInTarget[letter] ?? 0;
    const alreadyMatched = matchedSoFar[letter] ?? 0;
    if (totalAllowed > 0 && alreadyMatched < totalAllowed) {
      result[i] = PRESENT;
      matchedSoFar[letter] = alreadyMatched + 1;
    } else {
      result[i] = ABSENT;
    }
  }

  return result;
}

function isBetterStatus(newStatus, currentStatus) {
  if (currentStatus == null) return true;
  return STATUS_RANK[newStatus] > STATUS_RANK[currentStatus];
}

/**
 * Best feedback per letter across all guesses (for keyboard coloring).
 * correct > present > absent.
 */
export function getLetterFeedback(guessHistory, feedbackPerRow) {
  const bestByLetter = {};
  for (let r = 0; r < guessHistory.length; r++) {
    const word = guessHistory[r].toUpperCase();
    const rowFeedback = feedbackPerRow[r] ?? [];
    for (let i = 0; i < word.length; i++) {
      const status = rowFeedback[i];
      const letter = word[i];
      if (!status) continue;
      if (isBetterStatus(status, bestByLetter[letter])) {
        bestByLetter[letter] = status;
      }
    }
  }
  return bestByLetter;
}
