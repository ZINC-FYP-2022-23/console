import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab } from "@headlessui/react";
import { clsx, ScrollArea } from "@mantine/core";
import { useState } from "react";
import { StageConfigModal } from "../common";
import StdioTestSettingsContext from "./StdioTestSettingsContext";
import StdioTestStageSettings from "./StdioTestStageSettings";
import StdioTestTestCasesPanel from "./StdioTestTestCasesPanel";

function StdioTestSettings() {
  const [modalOpened, setModalOpened] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  /**
   * The view to show in "Test Cases" panel. Either:
   * - "table" = Table view
   * - `number` = Test case ID that is being edited
   */
  const [testCaseView, setTestCaseView] = useState<"table" | number>("table");

  return (
    <StdioTestSettingsContext.Provider
      value={{
        closeModal: () => setModalOpened(false),
        testCaseView,
        setTestCaseView,
      }}
    >
      <div className="h-full py-20 flex flex-col items-center gap-5">
        <p className="text-lg text-gray-500">To edit the stage settings, press the button below.</p>
        <Button
          className="bg-cse-700 text-white text-lg hover:bg-cse-500"
          icon={<FontAwesomeIcon icon={["far", "arrow-up-right-from-square"]} />}
          onClick={() => setModalOpened(true)}
        >
          Edit Stage Configuration
        </Button>
      </div>
      <StageConfigModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Standard I/O Test Configuration"
      >
        <div className="flex flex-col h-full">
          <Tab.Group defaultIndex={tabIndex} onChange={(index) => setTabIndex(index)}>
            <Tab.List className="px-6 flex font-medium border-b border-gray-200">
              <Tab
                className={({ selected }) =>
                  clsx(
                    "px-4 pt-1 pb-2 flex items-center gap-2 border-b-2 transition",
                    selected
                      ? "border-cse-500 text-cse-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  )
                }
              >
                <FontAwesomeIcon icon={["fas", "vial"]} />
                <span>Test Cases</span>
              </Tab>
              <Tab
                className={({ selected }) =>
                  clsx(
                    "px-4 pt-1 pb-2 flex items-center gap-2 border-b-2 transition",
                    selected
                      ? "border-cse-500 text-cse-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  )
                }
              >
                <FontAwesomeIcon icon={["fas", "gear"]} />
                <span>Overall Settings</span>
              </Tab>
            </Tab.List>
            <ScrollArea type="auto" className="flex-1">
              <Tab.Panels className="px-3 flex flex-col">
                <Tab.Panel>
                  <StdioTestTestCasesPanel />
                </Tab.Panel>
                <Tab.Panel className="mt-4">
                  <StdioTestStageSettings />
                </Tab.Panel>
              </Tab.Panels>
            </ScrollArea>
          </Tab.Group>
        </div>
      </StageConfigModal>
    </StdioTestSettingsContext.Provider>
  );
}

export default StdioTestSettings;
