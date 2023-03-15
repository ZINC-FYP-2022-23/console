import { clsx } from "@mantine/core";
import { useState } from "react";

type SwitchProps = {
  value: boolean;
  className?: string;
  /** Tailwind color (e.g. `blue`, `orange`). */
  variant: string;
  onChange?(isOn: boolean): void;
  size?: string;
};

function Switch({ variant, onChange, className, size = "lg", value = false }: SwitchProps) {
  const [isOn, toggleSwitch] = useState(value);

  return (
    <span
      onClick={() => {
        toggleSwitch(!isOn);
        if (onChange) {
          onChange(isOn);
        }
      }}
      role="checkbox"
      tabIndex={0}
      aria-checked={isOn}
      className={clsx(
        "relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:shadow-outline",
        isOn ? `bg-${variant}-500` : "bg-gray-200",
        size === "sm" ? "h-5 w-10" : "h-6 w-11",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "relative inline-block rounded-full bg-white shadow transform transition ease-in-out duration-200",
          isOn ? "translate-x-5" : "translate-x-0",
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
        )}
      >
        <span
          className={clsx(
            "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity",
            isOn ? "opacity-0 ease-out duration-100" : "opacity-100 ease-in duration-200",
          )}
        >
          <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={clsx(
            "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity",
            isOn ? "opacity-100 ease-in duration-200" : "opacity-0 ease-out duration-100",
          )}
        >
          <svg className={`h-3 w-3 text-${variant}-600`} fill="currentColor" viewBox="0 0 12 12">
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
    </span>
  );
}

export default Switch;
