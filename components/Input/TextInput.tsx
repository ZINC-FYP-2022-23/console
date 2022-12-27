import { clsx } from "@mantine/core";
import { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Type of the input.
   */
  type?: "text" | "number" | "email" | "password";
  /**
   * Alert stylings to apply.
   */
  alertLevel?: "error" | "warning";
  /**
   * Classes to apply extra styling.
   */
  extraClassNames?: string;
}

/**
 * Generic input text box component.
 */
function TextInput({ type = "text", alertLevel, extraClassNames = "", ...props }: TextInputProps) {
  return (
    <input
      type={type}
      className={clsx(
        "py-2 px-3 text-sm leading-4 rounded-md shadow-sm placeholder:text-gray-400 border border-gray-300 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300 transition ease-in-out",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-gray-100",
        alertLevel === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
        alertLevel === "warning" && "border-orange-500 focus:border-orange-500 focus:ring-orange-100",
        extraClassNames,
      )}
      {...props}
    />
  );
}

export default TextInput;
