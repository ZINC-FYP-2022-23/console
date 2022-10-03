import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Additional class names to apply extra styles. */
  className?: string;
  /** Leading icon, if any. */
  icon?: React.ReactNode;
};

/**
 * Button with base styles.
 */
function Button({ children, onClick, className = "", icon, disabled = false, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-4 py-1 flex items-center justify-center border border-transparent font-medium text-md rounded-md focus:outline-none transition ease-in-out duration-150 " +
        className
      }
      {...props}
    >
      {icon && <span className="mr-3">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default Button;
