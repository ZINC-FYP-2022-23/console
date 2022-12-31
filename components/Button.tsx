import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Additional class names to apply extra styles. */
  className?: string;
  /** Leading icon, if any. */
  icon?: React.ReactNode;
  /** Disabled when `disabled` prop is true. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

/**
 * Button with base styles.
 */
function Button({ children, onClick, className = "", icon, disabled = false, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={disabled ? () => {} : onClick}
      className={
        "px-4 py-1 flex items-center justify-center border border-transparent font-medium rounded-md transition ease-in-out duration-150 " +
        className
      }
      disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-3">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default Button;
