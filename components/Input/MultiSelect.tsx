import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Listbox, Transition } from "@headlessui/react";
import { clsx } from "@mantine/core";
import { Fragment } from "react";

export interface MultiSelectData<TValue extends string> {
  value: TValue;
  label: string;
  description?: string;
}

interface MultiSelectProps<TValue extends string> {
  /** Data for each select option. */
  data: MultiSelectData<TValue>[];
  /** The selected value. */
  value: TValue[];
  /** Callback when a new option is selected. */
  onChange: (value: TValue[]) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Whether to show the pop-up menu above the button. */
  showAbove?: boolean;
  id?: string;
}

/**
 * A multi-select input that lets users pick 0 or more options.
 */
function MultiSelect<TValue extends string>({
  data,
  value,
  onChange,
  disabled = false,
  placeholder,
  showAbove = false,
  id,
}: MultiSelectProps<TValue>) {
  return (
    <Listbox value={value} onChange={onChange} multiple disabled={disabled}>
      <div className="relative">
        <Listbox.Button
          id={id}
          className={clsx(
            "w-full py-2 pl-3 pr-8 border border-gray-300 text-left cursor-default text-sm rounded-md shadow-sm",
            disabled ? "cursor-not-allowed opacity-70 bg-gray-100 text-gray-400" : "bg-white",
          )}
        >
          {value.length ? (
            <span className="block">
              {value.map((v) => data.find((item) => item.value === v)?.label ?? "").join(", ")}
            </span>
          ) : (
            <span className="block text-gray-400">{placeholder ?? "Select items..."}</span>
          )}
          <span className="pr-2 absolute inset-y-0 right-0 flex items-center">
            <FontAwesomeIcon icon={["fas", "chevron-down"]} className="h-5 w-5 text-gray-400" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options
            className={clsx(
              "w-full py-1 absolute bg-white text-sm overflow-auto rounded-md drop-shadow-lg z-10 focus:outline-none",
              showAbove ? "mb-1 bottom-full" : "mt-1 top-full",
            )}
          >
            {data.map((dataItem, index) => {
              return (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    clsx(
                      " relative cursor-pointer select-none py-2 pl-10 pr-4",
                      active ? "bg-blue-100 text-blue-900" : "text-gray-900",
                    )
                  }
                  value={dataItem.value}
                >
                  {({ selected }) => (
                    <>
                      <div>
                        <p className={clsx("block", selected ? "font-medium text-blue-700" : "font-normal")}>
                          {dataItem.label}
                        </p>
                        {dataItem.description && <p className="text-xs text-gray-500">{dataItem.description}</p>}
                      </div>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-blue-700">
                          <FontAwesomeIcon icon={["fas", "check"]} className="h-6 w-6" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

export default MultiSelect;
