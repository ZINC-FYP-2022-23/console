import { Switch } from "@headlessui/react";
import { clsx } from "@mantine/core";

interface SwitchGroupProps {
  label: string | React.ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
  description?: string | React.ReactNode;
  disabled?: boolean;
}

/**
 * A switch group that contains a switch, label, and description (optional).
 */
function SwitchGroup({ label, checked, onChange, description, disabled = false }: SwitchGroupProps) {
  return (
    <div className="flex gap-5 items-center">
      <Switch.Group>
        <Switch
          checked={checked}
          onChange={onChange}
          className={clsx(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus:outline-none focus:ring focus:ring-blue-100",
            checked ? "bg-cse-700" : "bg-gray-300",
            disabled && "cursor-not-allowed opacity-50 !bg-gray-300",
          )}
          disabled={disabled}
        >
          <span
            className={clsx(
              "inline-block h-4 w-4 transform rounded-full transition",
              checked ? "translate-x-6" : "translate-x-1",
              disabled ? "bg-gray-100" : "bg-white",
            )}
          />
        </Switch>
        <div className="flex flex-col">
          <Switch.Label className={clsx(disabled && "text-gray-400")}>{label}</Switch.Label>
          {description && typeof description === "string" ? (
            <p className={clsx("mt-1 text-xs leading-3", disabled ? "text-gray-300" : "text-gray-500")}>
              {description}
            </p>
          ) : (
            description
          )}
        </div>
      </Switch.Group>
    </div>
  );
}

export default SwitchGroup;
