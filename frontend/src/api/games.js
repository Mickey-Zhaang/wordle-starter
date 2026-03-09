import { getGame } from "./client";
import { getStoredGameIds } from "../storage";

/**
 * Fetch stored game ids, load each game from the API, and return playing games
 * plus any ids that were not found (404)
 *
 * @returns {Promise<{ games: Array<{ game_id: string, word_length: number, max_guesses: number, guess_history: string[], feedback: string[][], status: string }>, notFoundIds: string[] }>}
 */
export async function fetchUnfinishedGames() {
  const ids = getStoredGameIds();
  if (ids.length === 0) return { games: [], notFoundIds: [] };

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const data = await getGame(id);
        return { id, data, status: "success" };
      } catch (e) {
        if (e.status === 404) return { id, data: null, status: "notFound" };
        throw e;
      }
    }),
  );

  return results.reduce(
    (acc, result) => {
      if (result.status == "notFound") {
        acc.notFoundIds.push(result.id);
      } else if (result.data?.status == "playing") {
        acc.games.push(result.data);
      }
      return acc;
    },
    { games: [], notFoundIds: [] },
  );
}
