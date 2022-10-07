import { Switch } from "@headlessui/react";

interface SwitchGroupProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

/**
 * A switch group that contains a switch, label, and description (optional).
 */
function SwitchGroup({ label, checked, onChange, description }: SwitchGroupProps) {
  return (
    <div className="flex gap-5 items-center">
      <Switch.Group>
        <Switch
          checked={checked}
          onChange={onChange}
          className={`${
            checked ? "bg-cse-700" : "bg-gray-300"
          } relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus:outline-none focus:ring focus:ring-blue-100`}
        >
          <span
            className={`${
              checked ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
        <div className="flex flex-col">
          <Switch.Label>{label}</Switch.Label>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      </Switch.Group>
    </div>
  );
}

export default SwitchGroup;
