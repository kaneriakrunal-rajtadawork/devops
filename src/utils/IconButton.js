// components/IconButton.tsx
import React from "react";

const IconButton = ({
  icon,
  label,
  onClick,
  disabled = false,
  showCheckbox = false,
  checked = false,
  onCheckboxChange = () => { },
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer flex items-center gap-2 text-sm font-medium px-3 py-2 rounded hover:bg-gray-100 hover:text-gray-600 transition ${disabled ? "opacity-50 cursor-not-allowed" : "text-gray-700"
        }`}
    >
      {showCheckbox && (
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheckboxChange}
          onClick={(e) => e.stopPropagation()} // prevent checkbox click from triggering parent button
          className="accent-blue-500"
        />
      )}
      {icon && <span className="text-gray-500">{icon}</span>}
      {label && <span>{label}</span>}
    </button>
  );
};

export default IconButton;
