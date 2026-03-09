import { useReducer, useState, useCallback, useEffect, useRef } from "react";
import { submitGuess } from "../api/client";
import { getLetterFeedback } from "../utils/feedback";
import {
  gameReducer,
  TYPE_LETTER,
  BACKSPACE,
  SUBMIT_START,
  SUBMIT_SUCCESS,
  SUBMIT_ERROR,
  SUBMIT_END,
} from "./wordleReducer";

const SHAKE_DURATION_MS = 600;

/**
 * @param {object} initialGameState - { gameId, wordLength, maxGuesses, guessHistory, feedbackPerRow, currentRow, status, target }
 * @param {{ onGameNotFound?: (detail?: string) => void, onGameWonOrLost?: () => void }} callbacks
 */
export function useWordle(initialGameState, callbacks = {}) {
  const { onGameNotFound, onGameWonOrLost } = callbacks;
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [shakeRowIndex, setShakeRowIndex] = useState(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const runSubmit = useCallback(async () => {
    const s = stateRef.current;
    if (!s || s.status !== "playing" || s.isSubmitting) return;
    const guess = (s.currentRow ?? "").trim().toUpperCase();
    if (guess.length !== s.wordLength) return;

    dispatch({ type: SUBMIT_START });
    try {
      const data = await submitGuess(s.gameId, guess);
      dispatch({ type: SUBMIT_SUCCESS, payload: data });
      if (data.status === "won" || data.status === "lost") {
        onGameWonOrLost?.();
      }
    } catch (e) {
      if (e.status === 404) {
        onGameNotFound?.(stateRef.current.gameId, e.detail);
      } else {
        const rowIndex = stateRef.current.guessHistory?.length ?? 0;
        dispatch({
          type: SUBMIT_ERROR,
          payload: { kind: "invalid_word", rowIndex },
        });
        setShakeRowIndex(rowIndex);
        setTimeout(() => setShakeRowIndex(null), SHAKE_DURATION_MS);
      }
    } finally {
      dispatch({ type: SUBMIT_END });
    }
  }, [onGameNotFound, onGameWonOrLost]);

  const handleKey = useCallback(
    (key) => {
      if (key === "Backspace") {
        dispatch({ type: BACKSPACE });
        return;
      }
      if (key === "Enter") {
        runSubmit();
        return;
      }
      if (key.length === 1 && /[A-Za-z]/.test(key)) {
        dispatch({ type: TYPE_LETTER, payload: key });
      }
    },
    [runSubmit],
  );

  const isPlaying = state?.status === "playing";
  useEffect(() => {
    if (!isPlaying) return;
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") {
        e.preventDefault();
        handleKey("Enter");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleKey("Backspace");
      } else if (e.key.length === 1 && /[A-Za-z]/i.test(e.key)) {
        e.preventDefault();
        handleKey(e.key.toUpperCase());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPlaying, handleKey]);

  const feedbackPerRow = state?.feedbackPerRow ?? [];
  const letterFeedback =
    state && state.guessHistory
      ? getLetterFeedback(state.guessHistory, feedbackPerRow)
      : {};

  return {
    gameState: state,
    handleKey,
    shakeRowIndex,
    letterFeedback,
  };
}
