import Button from "@/components/Button";
import ListInput from "@/components/Input/ListInput";
import { useQueryParameters, useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Alert } from "../Diagnostics";
import { InfoAccordion } from "./common";
import { Settings } from "@/types/GuiBuilder";

function FileStructureValidationSettings() {
  const [config, setConfig] = useSelectedStageConfig("FileStructureValidation");
  const { updateStep } = useQueryParameters();

  const useTemplate = useStoreState((state) => state.config.editingConfig._settings.use_template);
  const setElementToHighlight = useStoreActions((actions) => actions.layout.setElementToHighlight);

  const [ignoredFiles, setIgnoredFiles] = useState<{ id: string; name: string }[]>(
    config?.ignore_in_submission?.map((name) => ({ id: uuidv4(), name })) ?? [],
  );

  if (!config) return null;

  const updateIgnoredFiles = (files: { id: string; name: string }[]) => {
    setIgnoredFiles(files);
    setConfig({ ...config, ignore_in_submission: files.map((file) => file.name) });
  };

  return (
    <div className="p-3">
      {useTemplate === undefined && (
        <div className="mb-4">
          <UseTemplateOffWarning />
        </div>
      )}
      <p className="mb-2">
        Files/directories to <span className="font-semibold">ignore</span> checking:
      </p>
      <ListInput>
        {ignoredFiles.map((file, index) => (
          <ListInput.Item
            key={file.id}
            index={index}
            placeholder="e.g. '*.out' or './examples/*'"
            value={file.name}
            onChange={(event) => {
              const newFiles = [...ignoredFiles];
              newFiles[index].name = event.target.value;
              updateIgnoredFiles(newFiles);
            }}
            onNewItemKeyPressed={() => {
              const newFiles = [...ignoredFiles];
              newFiles.splice(index + 1, 0, { id: uuidv4(), name: "" });
              updateIgnoredFiles(newFiles);
            }}
            onDelete={() => {
              const newFiles = ignoredFiles.filter((f) => f.id !== file.id);
              updateIgnoredFiles(newFiles);
            }}
          />
        ))}
        <ListInput.AddButton
          onClick={() => {
            const newFiles = [...ignoredFiles, { id: uuidv4(), name: "" }];
            updateIgnoredFiles(newFiles);
          }}
        />
      </ListInput>
      <div className="mt-8 border-b border-gray-300" />
      <InfoAccordion title="How to specify what files/directories to ignore checking?">
        <div className="space-y-2">
          <p className="font-semibold">1. File/Directory Names</p>
          <div className="ml-1 space-y-1">
            <ul className="ml-6 list-disc">
              <li>
                All files/directories matching the name,{" "}
                <span className="font-semibold">regardless of its location</span>, will be ignored from checking.
              </li>
              <li>
                Glob expressions (<code>*</code>) are accepted.
              </li>
              <li>
                No need to add leading or trailing slash (<code>/</code>).
              </li>
            </ul>
            <p>For example:</p>
            <ul className="ml-6 list-disc">
              <li>
                <code>main.cpp</code>: Matches any file/directory with the name <code>main.cpp</code>.
              </li>
              <li>
                <code>*.cpp</code>: Matches any file/directory ending in <code>.cpp</code>.
              </li>
            </ul>
          </div>
          <p className="font-semibold">2. Shell Pattern</p>
          <div className="ml-1 space-y-1">
            <ul className="ml-6 list-disc">
              <li>
                Use this to ignore files <span className="font-semibold">under a specific directory</span>.
              </li>
              <li>
                Refer{" "}
                <a
                  href="https://www.gnu.org/software/findutils/manual/html_node/find_html/Shell-Pattern-Matching.html"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-blue-500"
                >
                  this page
                </a>{" "}
                for more details on shell pattern matching.
              </li>
              <li>
                To reference a path relative to the submission root, you must prepend <code>./</code> to the path.
              </li>
            </ul>
            <p>For example:</p>
            <ul className="ml-6 list-disc">
              <li>
                <code>./src/*</code>: Matches any files under <code>src</code> relative to the root of submission.
              </li>
              <li>
                <code>./src/main/*.java</code>: Matches all files starting with any path, containing{" "}
                <code>src/main</code> in its path component, and ending with <code>.java</code>.
              </li>
            </ul>
          </div>
        </div>
      </InfoAccordion>
      <InfoAccordion title="Default ignore list">
        <p>
          The Grader will <span className="font-semibold">always exclude</span> the following files/directories during
          file structure validation (no need to re-specify them in the above):
        </p>
        <ul className="ml-6 mt-1 list-disc font-mono">
          <li>*~</li>
          <li>.directory</li>
          <li>.DS_Store</li>
          <li>._*</li>
          <li>Thumbs.db</li>
          <li>Desktop.ini</li>
          <li>desktop.ini</li>
        </ul>
      </InfoAccordion>
      <InfoAccordion title="How to specify what files should students submit?">
        <div className="space-y-2">
          <p>This can be done in the General Settings step:</p>
          <Button
            icon={<FontAwesomeIcon icon={["fas", "compass"]} />}
            onClick={() => {
              updateStep("settings");
              setElementToHighlight("useTemplate");
            }}
            className="border border-cse-600 text-cse-600 hover:bg-blue-100 active:bg-blue-200"
          >
            Show me the location
          </Button>
        </div>
      </InfoAccordion>
    </div>
  );
}

/**
 * Alert to show when {@link Settings.use_template} is undefined. This is because this value must
 * not be undefined when the user wants to use the FileStructureValidation stage.
 */
function UseTemplateOffWarning() {
  const { updateStep } = useQueryParameters();
  const setElementToHighlight = useStoreActions((actions) => actions.layout.setElementToHighlight);

  return (
    <Alert severity="warning">
      <div>
        <p>
          Please set &quot;Specify files that students should submit&quot; to another value other than &quot;None&quot;
          in the Pipeline Settings.
        </p>
        <Button
          icon={<FontAwesomeIcon icon={["fas", "edit"]} />}
          onClick={() => {
            updateStep("settings");
            setElementToHighlight("useTemplate");
          }}
          className="mt-1 bg-cse-600 text-sm text-white hover:bg-cse-500 active:bg-cse-400"
        >
          Fix this field
        </Button>
      </div>
    </Alert>
  );
}

export default FileStructureValidationSettings;
