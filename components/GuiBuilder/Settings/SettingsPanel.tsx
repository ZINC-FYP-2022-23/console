import Accordion from "@components/Accordion";
import Button from "@components/Button";
import { useLayoutDispatch } from "@contexts/layout";
import { useZinc } from "@contexts/zinc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import Link from "next/link";
import { memo } from "react";
import GeneralSettings from "./GeneralSettings";
import Policy from "./Policy";
import Scheduling from "./Scheduling";

/**
 * The settings panel at the right of the page.
 */
function SettingsPanel() {
  const { user } = useZinc();
  const dispatch = useLayoutDispatch();
  const configId = useStoreState((state) => state.configId);
  const courseId = useStoreState((state) => state.courseId);
  const accordion = useStoreState((state) => state.layout.accordion.settingsPanel);
  const setAccordion = useStoreActions((action) => action.setAccordion);

  const isNewAssignment = configId === null;

  return (
    <div className="flex flex-col">
      {/* The following section is visible only if the assignment is created because they rely on
       * the config ID as the input.
       */}
      {!isNewAssignment && (
        <div className="px-3 py-4 flex flex-col gap-3 sticky top-0 z-10 bg-white border-b border-gray-300">
          <Link href={`/courses/${courseId}/assignments/${configId}/submissions?userId=${user}`}>
            <a className="px-4 py-1 flex items-center justify-center border border-transparent text-cse-700 font-medium text-sm bg-blue-100 hover:bg-blue-50 rounded-md focus:outline-none focus:border-blue-300 active:bg-blue-200 transition ease-in-out duration-150">
              <FontAwesomeIcon className="mr-3" icon={["fad", "flask"]} />
              Test My Submission
            </a>
          </Link>
          <Button
            className="py-2 text-cse-700 text-sm bg-blue-100 hover:bg-blue-50 focus:border-blue-300 active:bg-blue-200"
            icon={<FontAwesomeIcon icon={["fad", "folder-open"]} />}
            onClick={() => {
              // TODO
            }}
          >
            Complementary Files
          </Button>
          <Button
            className="py-2 text-cse-700 text-sm bg-blue-100 hover:bg-blue-50 focus:border-blue-300 active:bg-blue-200"
            icon={<FontAwesomeIcon icon={["fad", "sitemap"]} />}
            onClick={() => dispatch({ type: "manageAssignedUsers" })}
          >
            Assigned Students
          </Button>
        </div>
      )}
      <div className="mb-4">
        <Accordion
          title="General Settings"
          defaultOpen={accordion.generalSettings}
          onClick={() => {
            setAccordion({
              path: "settingsPanel.generalSettings",
              value: !accordion.generalSettings,
            });
          }}
          extraClassNames={{ title: "text-xl" }}
        >
          <GeneralSettings />
        </Accordion>
        <Accordion
          title="Policy"
          defaultOpen={accordion.policy}
          onClick={() => {
            setAccordion({
              path: "settingsPanel.policy",
              value: !accordion.policy,
            });
          }}
          extraClassNames={{ title: "text-xl" }}
        >
          <Policy />
        </Accordion>
        <Accordion
          title="Scheduling"
          defaultOpen={accordion.scheduling}
          onClick={() => {
            setAccordion({
              path: "settingsPanel.scheduling",
              value: !accordion.scheduling,
            });
          }}
          extraClassNames={{ title: "text-xl" }}
        >
          <Scheduling />
        </Accordion>
      </div>
    </div>
  );
}

export default memo(SettingsPanel);
