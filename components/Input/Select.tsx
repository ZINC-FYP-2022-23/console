import { clsx } from "@mantine/core";
import React, { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  /** Classes to apply extra styling. */
  extraClassNames?: string;
}

/**
 * A styled `<select>` element to create a drop-down list.
 */
function Select({ children, extraClassNames = "", ...props }: SelectProps) {
  return (
    <select
      className={clsx(
        "form-input mt-1 pr-8 rounded-md shadow-sm text-sm leading-4 border border-gray-300 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300 transition duration-150 ease-in-out",
        extraClassNames,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export default Select;
