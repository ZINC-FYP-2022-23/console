import { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Type of the input.
   */
  type?: "text" | "number" | "email" | "password";
  /**
   * Classes to apply extra styling.
   */
  extraClassNames?: string;
}

/**
 * Generic input text box component.
 */
function TextInput({ type = "text", extraClassNames = "", ...props }: TextInputProps) {
  return (
    <input
      type={type}
      className={`form-input block py-2 px-3 mt-1 rounded-md shadow-sm
      border border-gray-300 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300
      transition duration-150 ease-in-out sm:text-sm sm:leading-5 ${extraClassNames}`}
      {...props}
    />
  );
}

export default TextInput;
