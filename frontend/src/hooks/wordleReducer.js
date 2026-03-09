export const TYPE_LETTER = "TYPE_LETTER";
export const BACKSPACE = "BACKSPACE";
export const SUBMIT_START = "SUBMIT_START";
export const SUBMIT_SUCCESS = "SUBMIT_SUCCESS";
export const SUBMIT_ERROR = "SUBMIT_ERROR";
export const SUBMIT_END = "SUBMIT_END";

export function gameReducer(state, action) {
  if (!state) return state;

  switch (action.type) {
    case TYPE_LETTER: {
      if (
        state.status !== "playing" ||
        state.currentRow.length >= state.wordLength
      ) {
        return state;
      }
      return {
        ...state,
        currentRow: state.currentRow + (action.payload ?? "").toUpperCase(),
      };
    }
    case BACKSPACE: {
      if (state.status !== "playing" || state.currentRow.length == 0)
        return state;
      return {
        ...state,
        currentRow: state.currentRow.slice(0, -1),
      };
    }
    case SUBMIT_START:
      if (state.isSubmitting || state.status != "playing") return state;
      return { ...state, isSubmitting: true };
    case SUBMIT_SUCCESS: {
      const { guess_history, feedback, status, target } = action.payload;
      return {
        ...state,
        guessHistory: guess_history,
        feedbackPerRow: [...(state.feedbackPerRow || []), feedback],
        status: status,
        currentRow: "",
        target: target ?? state.target,
        isSubmitting: false,
      };
    }
    case SUBMIT_ERROR:
      return { ...state, isSubmitting: false };
    case SUBMIT_END:
      return { ...state, isSubmitting: false };
    default:
      return state;
  }
}
