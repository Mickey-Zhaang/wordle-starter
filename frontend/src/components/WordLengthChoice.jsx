export const WordLengthChoice = ({ value, selected, onClick, disabled }) => (
  <button
    type="button"
    className={`word-length-btn ${selected ? "selected" : ""}`}
    onClick={() => onClick(value)}
    disabled={disabled}
  >
    {value}
  </button>
);
