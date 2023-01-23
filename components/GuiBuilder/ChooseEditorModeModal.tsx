import { ModalWithHeader } from "@/components/Modal";
import { useLayoutState } from "@/contexts/layout";
import Image from "next/image";
import Link from "next/link";
import { Alert } from "./Diagnostics";

/**
 * A modal to let user choose between "YAML Editor Mode" and "GUI Mode" when editing an assignment config.
 */
function ChooseEditorModeModal() {
  const { assignmentId, assignmentConfigId } = useLayoutState();

  const isNewConfig = assignmentConfigId === undefined;
  const baseUrl = `/assignments/${assignmentId}/configs/${isNewConfig ? "new" : assignmentConfigId}`;

  return (
    <ModalWithHeader
      title="Pick Editor Mode"
      subtitle="Choose an editor mode to edit the configuration"
      size="md"
      rootClassNames="!bg-gray-100"
    >
      <div className="px-4 space-y-4">
        <div className="flex gap-3">
          <Link href={isNewConfig ? baseUrl : `${baseUrl}/yaml`}>
            <a className="group p-4 flex-1 flex flex-col gap-5 items-center bg-white drop-shadow rounded-md hover:bg-blue-50 transition">
              <p className="font-medium text-lg group-hover:text-blue-700 transition">YAML Editor Mode</p>
              <div className="w-64 h-32 relative rounded-xl overflow-hidden">
                <Image src="/assets/yaml_editor.svg" layout="fill" alt="YAML editor mode" />
              </div>
              <p className="text-gray-500 text-sm">Write the config in YAML format with a code editor</p>
            </a>
          </Link>
          <Link href={`${baseUrl}/gui`}>
            <a className="group p-4 flex-1 flex flex-col gap-5 items-center bg-white drop-shadow rounded-md hover:bg-blue-50 transition">
              <div className="flex items-center gap-2">
                <p className="font-medium text-lg group-hover:text-blue-700 transition">GUI Mode</p>
                <p className="px-2 bg-green-500 font-medium leading-6 text-sm text-white rounded-full">New</p>
              </div>
              <div className="w-64 h-32 relative rounded-xl overflow-hidden">
                <Image src="/assets/gui_editor_preview.svg" layout="fill" alt="YAML editor mode" />
              </div>
              <p className="text-gray-500 text-sm">User-friendly GUI with a node-based editor</p>
            </a>
          </Link>
        </div>
        <Alert severity="warning">GUI Mode will discard all comments in the configuration YAML file.</Alert>
      </div>
    </ModalWithHeader>
  );
}

export default ChooseEditorModeModal;
