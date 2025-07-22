import React from "react";
import { inputStyles, textStyles } from "../../constants/styles";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={textStyles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          ${inputStyles.base}
          ${error ? inputStyles.error : inputStyles.normal}
          ${props.readOnly ? inputStyles.readOnly : ""}
          ${inputStyles.text}
          ${inputStyles.placeholder}
          ${className}
        `}
        {...props}
      />
      {error && <p className={textStyles.error}>{error}</p>}
    </div>
  );
};

export default Input;
