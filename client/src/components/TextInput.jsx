import React from "react";

export const TextInput = React.forwardRef(
  (
    { type, placeholder, styles, label, labelStyles, register, name, error },
    ref
  ) => {
    return (
      <div className="w-full flex flex-col mt-2 ">
        {label && (
          <p className={`text-accent-2 text-sm mb-2 ${labelStyles}`}>{label}</p>
        )}
        <div>
          <input></input>
        </div>
      </div>
    );
  }
);
