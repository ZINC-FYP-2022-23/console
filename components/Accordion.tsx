import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Disclosure, Transition } from "@headlessui/react";
import { MouseEventHandler } from "react";

interface SettingsAccordionProps {
  title: string;
  children: React.ReactNode;
  /** Whether the accordion is opened by default. */
  defaultOpen?: boolean;
  /** Handler for clicking the accordion button. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Location of the caret icon. */
  iconLocation?: "left" | "right";
  /** Classes to apply extra styling. */
  extraClassNames?: {
    buttonRoot?: string;
    title?: string;
  };
}

/**
 * An animated accordion component to hold expandible content.
 */
function Accordion({
  title,
  children,
  defaultOpen = false,
  onClick = () => {},
  iconLocation = "right",
  extraClassNames,
}: SettingsAccordionProps) {
  return (
    <div className="border-b border-gray-300">
      <Disclosure defaultOpen={defaultOpen}>
        {({ open }) => (
          <>
            <Disclosure.Button as="div">
              <button
                onClick={onClick} // We don't put this prop on the Disclosure.Button because it's not working
                className={`w-full px-3 py-2 flex items-center ${
                  iconLocation === "left" ? "flex-row-reverse justify-end gap-2" : "flex justify-between"
                } ${extraClassNames?.buttonRoot ?? ""}`}
              >
                <span className={`font-semibold ${extraClassNames?.title ?? ""}`}>{title}</span>
                <FontAwesomeIcon
                  icon={["fas", "caret-down"]}
                  className={`${open ? "rotate-180 transform" : ""} mr-2 text-black transition-transform duration-200`}
                />
              </button>
            </Disclosure.Button>
            <Transition
              className="overflow-hidden"
              enter="transition transition-[max-height] duration-200 ease-in"
              enterFrom="transform max-h-0"
              enterTo="transform max-h-screen"
              leave="transition transition-[max-height] duration-200 ease-out"
              leaveFrom="transform max-h-screen"
              leaveTo="transform max-h-0"
            >
              <Disclosure.Panel className="px-3 bg-white">{children}</Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
}

export default Accordion;
