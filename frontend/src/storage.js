export const SESSION_GAME_ID = "wordle-game-id";
export const WORDLE_GAME_IDS = "wordle-game-ids";

const setStorage = (key, value) => {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    console.warn("Storage write failed!", e);
  }
};

const removeStorage = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.warn("Storage removal failed!", e);
  }
};

const getStorage = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    console.warn("Storage retrieval failed!", e);
  }
};

export function getStoredGameIds() {
  try {
    const raw = getStorage(WORDLE_GAME_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendStoredGameId(gameId) {
  const ids = getStoredGameIds();
  if (!ids.includes(gameId)) {
    ids.push(gameId);
    setStorage(WORDLE_GAME_IDS, JSON.stringify(ids));
  }
}

export function removeStoredGameId(gameId) {
  const ids = getStoredGameIds().filter((id) => id !== gameId);
  setStorage(WORDLE_GAME_IDS, JSON.stringify(ids));
}

export function setSessionGame(gameId) {
  setStorage(SESSION_GAME_ID, gameId);
}

export function clearSessionIfGame(gameId) {
  if (sessionStorage.getItem(SESSION_GAME_ID) === gameId) {
    removeStorage(SESSION_GAME_ID);
  }
}
