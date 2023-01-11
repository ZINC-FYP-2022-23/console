import { ControlledEditor } from "@monaco-editor/react";
import { useSelectedStageConfig } from "@state/GuiBuilder/Hooks";
import { Alert } from "../Diagnostics";

/**
 * For stages that are not yet supported by the GUI Assignment Builder.
 */
function UnsupportedStage() {
  const [config, setConfig] = useSelectedStageConfig<string>();

  return (
    <div className="p-3 h-full flex flex-col gap-3 overflow-y-hidden">
      <Alert severity="warning">
        This stage does not have a GUI yet. Edit this stage&apos;s raw YAML config at your own risk!
      </Alert>
      <div className="flex-1 p-3 bg-gray-100 rounded-md">
        <ControlledEditor
          value={config}
          onChange={(_, val) => {
            if (val === undefined) return;
            setConfig(val);
          }}
          options={{ fontSize: 12.5 }}
          language="yaml"
          theme="light"
        />
      </div>
    </div>
  );
}

export default UnsupportedStage;
