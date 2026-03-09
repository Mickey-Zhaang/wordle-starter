const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Create a new game. Returns { game_id, word_length, max_guesses } or throws.
 * @param {number} wordLength - 5, 6, 7, or 8
 * @returns {Promise<{ game_id: string, word_length: number, max_guesses: number }>}
 */
export async function createGame(wordLength) {
  const res = await fetch(`${API_URL}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word_length: wordLength }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      data.detail || res.statusText || "Failed to create game",
    );
    err.status = res.status;
    err.detail = data.detail;
    throw err;
  }
  return data;
}

/**
 * Submit a guess. Returns { feedback, guess_history, status, target? } or throws.
 * @param {string} gameId
 * @param {string} guess
 * @returns {Promise<{ feedback: string[], guess_history: string[], status: string, target?: string }>}
 */
export async function submitGuess(gameId, guess) {
  const res = await fetch(`${API_URL}/games/${gameId}/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guess }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      data.detail || res.statusText || "Failed to submit guess",
    );
    err.status = res.status;
    err.detail = data.detail;
    throw err;
  }
  return data;
}

/**
 * Get current game state (for resume). Returns full state or throws.
 * @param {string} gameId
 * @returns {Promise<{ game_id: string, word_length: number, max_guesses: number, guess_history: string[], feedback: string[][], status: string, target?: string }>}
 */
export async function getGame(gameId) {
  const res = await fetch(`${API_URL}/games/${gameId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.detail || res.statusText || "Game not found");
    err.status = res.status;
    err.detail = data.detail;
    throw err;
  }
  return data;
}
