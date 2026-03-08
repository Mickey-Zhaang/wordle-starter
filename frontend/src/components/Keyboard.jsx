const KEYBOARD_ROWS = [
  { keys: "QWERTYUIOP".split("") },
  { keys: "ASDFGHJKL".split("") },
  {
    keys: "ZXCVBNM".split(""),
    leftSpecial: "Enter",
    rightSpecial: "Backspace",
  },
];

function Keyboard({ letterFeedback, onKey }) {
  function keyClass(letter) {
    const status = letterFeedback[letter];
    if (status) return `key-${status}`;
    return "";
  }

  return (
    <div className="keyboard">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.leftSpecial && (
            <button
              type="button"
              className="key-btn key-special"
              onClick={() => onKey(row.leftSpecial)}
            >
              {row.leftSpecial}
            </button>
          )}
          {row.keys.map((k) => (
            <button
              key={k}
              type="button"
              className={`key-btn ${keyClass(k)}`}
              onClick={() => onKey(k)}
            >
              {k}
            </button>
          ))}
          {row.rightSpecial && (
            <button
              type="button"
              className="key-btn key-special"
              onClick={() => onKey(row.rightSpecial)}
            >
              {row.rightSpecial === "Backspace" ? "⌫" : row.rightSpecial}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;
