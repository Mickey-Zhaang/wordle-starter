import React, { memo } from "react";

const KEYBOARD_ROWS = [
  { keys: "QWERTYUIOP".split("") },
  { keys: "ASDFGHJKL".split("") },
  {
    keys: "ZXCVBNM".split(""),
    leftSpecial: "Enter",
    rightSpecial: "Backspace",
  },
];

const KeyButton = memo(({ value, display, className, onClick }) => (
  <button
    type="button"
    className={`key-btn ${className}`}
    onClick={() => onClick(value)}
    aria-label={value}
  >
    {display || value}
  </button>
));

export const Keyboard = memo(({ letterFeedback, onKey }) => {
  function getKeyClass(letter) {
    const status = letterFeedback[letter];
    return status ? `key-${status}` : "";
  }

  return (
    <div className="keyboard">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {/* Left Special (Enter) */}
          {row.leftSpecial && (
            <KeyButton
              value={row.leftSpecial}
              className="key-special"
              onClick={onKey}
            />
          )}

          {/* Regular Letter Keys */}
          {row.keys.map((k) => (
            <KeyButton
              key={k}
              value={k}
              className={getKeyClass(k)}
              onClick={onKey}
            />
          ))}

          {/* Right Special (Backspace) */}
          {row.rightSpecial && (
            <KeyButton
              value={row.rightSpecial}
              display="⌫"
              className="key-special"
              onClick={onKey}
            />
          )}
        </div>
      ))}
    </div>
  );
});

Keyboard.displayName = "Keybaord";
