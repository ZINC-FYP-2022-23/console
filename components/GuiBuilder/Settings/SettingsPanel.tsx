import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "components/Button";
import GeneralSettings from "./GeneralSettings";
import Policy from "./Policy";
import Scheduling from "./Scheduling";
import SettingsAccordion from "./SettingsAccordion";

/**
 * The settings panel at the right of the page.
 */
function SettingsSidebar() {
  return (
    <div className="flex flex-col">
      <div className="px-3 py-4 flex flex-col gap-3 sticky top-0 z-10 bg-white border-b border-gray-300">
        <Button
          className="w-full py-2 text-cse-700 font-medium text-sm bg-blue-100 hover:bg-blue-50 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-blue-200"
          icon={<FontAwesomeIcon icon={["fad", "folder-open"]} />}
          onClick={() => {
            // TODO
          }}
        >
          Complementary Files
        </Button>
        <Button
          className="w-full py-2 text-cse-700 font-medium text-sm bg-blue-100 hover:bg-blue-50 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-blue-200"
          icon={<FontAwesomeIcon icon={["fad", "sitemap"]} />}
          onClick={() => {
            // TODO
          }}
        >
          Assigned Students
        </Button>
      </div>
      <div className="mb-4">
        <SettingsAccordion title="General Settings">
          <GeneralSettings />
        </SettingsAccordion>
        <SettingsAccordion title="Policy">
          <Policy />
        </SettingsAccordion>
        <SettingsAccordion title="Scheduling">
          <Scheduling />
        </SettingsAccordion>
      </div>
    </div>
  );
}

export default SettingsSidebar;
