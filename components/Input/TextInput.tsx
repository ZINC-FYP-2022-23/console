import { clsx } from "@mantine/core";
import { forwardRef, InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Type of the input.
   *
   * For number input, use `NumberInput` instead.
   */
  type?: "text" | "email" | "password";
  /**
   * Alert stylings to apply.
   */
  alertLevel?: "error" | "warning";
  /**
   * Alert message below the input.
   */
  alertText?: React.ReactNode;
  /**
   * Classes to apply extra styling.
   */
  classNames?: {
    /** The root container. */
    root?: string;
    /** The input element. */
    input?: string;
  };
}

/**
 * Generic input text box component.
 */
const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ type = "text", alertLevel, alertText, classNames, ...props }, ref) => (
    <div className={clsx("flex flex-col", classNames?.root)}>
      <input
        ref={ref}
        type={type}
        className={clsx(
          "py-2 px-3 text-sm leading-5 rounded-md shadow-sm placeholder:text-gray-400 border border-gray-300 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300 transition ease-in-out",
          "disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-gray-100 disabled:text-gray-400",
          alertLevel === "error" && "border-red-500 focus:border-red-500 focus:ring-red-100",
          alertLevel === "warning" && "border-orange-500 focus:border-orange-500 focus:ring-orange-100",
          classNames?.input,
        )}
        {...props}
      />
      {alertText && (
        <div
          className={clsx(
            "mt-1 text-xs",
            alertLevel === "error" && "text-red-500",
            alertLevel === "warning" && "text-orange-500",
          )}
        >
          {alertText}
        </div>
      )}
    </div>
  ),
);
TextInput.displayName = "TextInput";

export default TextInput;
