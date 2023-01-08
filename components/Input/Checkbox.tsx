import { InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * A checkbox component with base styles.
 */
function Checkbox({ ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className="h-4 w-4 accent-cse-600 rounded-sm transition duration-150 ease-in-out focus:outline-none focus:ring focus:ring-blue-100"
      {...props}
    />
  );
}

export default Checkbox;
