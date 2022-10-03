import { Disclosure, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SettingsAccordionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Accordion component for the settings panel.
 */
function SettingsAccordion({ title, children }: SettingsAccordionProps) {
  return (
    <div className="border-b border-gray-300">
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="w-full px-3 py-2 flex justify-between items-center bg-blue-50">
              <span className="font-semibold text-xl">{title}</span>
              <FontAwesomeIcon
                icon={["fas", "caret-down"]}
                className={`${open ? "rotate-180 transform" : ""} mr-2 transition-transform duration-200`}
              />
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
              <Disclosure.Panel className="px-3 pt-2 pb-4 bg-white">{children}</Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
}

export default SettingsAccordion;
