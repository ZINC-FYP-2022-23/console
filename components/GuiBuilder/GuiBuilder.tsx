import Button from "components/Button";
import { Layout } from "layout";
import { useEffect } from "react";
import { useStoreActions } from "state/Config/Hooks";
import { Config } from "types";

interface GUIAssignmentBuilderProps {
  config: Config;
  /** The `assignmentConfigId`. If it's `null`, it means we're creating a new assignment. */
  configId: number | null;
}

function GUIAssignmentBuilder({ config, configId }: GUIAssignmentBuilderProps) {
  const isNewAssignment = configId === null;
  const initializeConfig = useStoreActions((actions) => actions.initializeConfig);

  useEffect(() => {
    initializeConfig(config);
  }, [config, initializeConfig]);

  return (
    <Layout title="Assignment Configs">
      <div className="p-4 w-full flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-bold text-gray-900 text-xl sm:text-2xl">
            {isNewAssignment ? "New Assignment Config" : "Editing Config"}
          </h1>
          <div className="flex gap-2">
            <Button
              title="Create"
              className="px-3 py-1 bg-green-500 text-white hover:bg-green-600"
              onClick={() => {
                // TODO
              }}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-row gap-3">
          <div className="w-4/6 flex flex-col gap-3">
            <div className="h-1/2 bg-white rounded-md shadow">Pipeline editor</div>
            <div className="h-1/2 bg-white rounded-md shadow">Stage settings</div>
          </div>
          <div className="w-2/6 bg-white rounded-md shadow">General settings</div>
        </div>
      </div>
    </Layout>
  );
}

export default GUIAssignmentBuilder;
