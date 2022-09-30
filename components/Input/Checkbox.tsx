import { InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * A checkbox component with base styles.
 */
function Checkbox({ ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className="form-checkbox h-4 w-4 text-cse-600 border-gray-300 rounded-sm focus:outline-none focus:ring focus:ring-blue-100 transition duration-150 ease-in-out"
      {...props}
    />
  );
}

export default Checkbox;
